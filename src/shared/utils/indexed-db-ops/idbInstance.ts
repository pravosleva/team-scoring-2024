/* eslint-disable @typescript-eslint/no-explicit-any */
import { debugFactory } from '~/shared/utils'
// ВАЖНО: Импортируем строго из файлов, чтобы не ломать типы круговой зависимостью!
import { getAllKeys } from './getAllKeys'
import { getIndexedDbSize } from './getIndexedDbSize'
import { getUniqueKey, parseOldKey } from './getUniqueKey'

const logger = debugFactory<any, string | null>({
  label: '👉 IDB instance',
})

type TProps = {
  DB_NAME: string;
  STORE_NAME: string;
  DB_VERSION: number;
}

export class IDBSingleton {
  private static instance: IDBSingleton
  public db: IDBDatabase | null = null; // Строгий тип вместо unknown
  public error: unknown = null;
  public DB_NAME: string;
  public STORE_NAME: string;
  public DB_VERSION: number;

  private constructor({ DB_NAME, STORE_NAME, DB_VERSION }: TProps) {
    this.DB_NAME = DB_NAME
    this.STORE_NAME = STORE_NAME
    this.DB_VERSION = DB_VERSION
    this.#openDB()
      .then((db) => { this.db = db })
      .catch((err) => { this.error = err })
  }

  public static getInstance({ DB_NAME, STORE_NAME, DB_VERSION }: TProps): IDBSingleton {
    if (!IDBSingleton.instance) {
      IDBSingleton.instance = new IDBSingleton({ DB_NAME, STORE_NAME, DB_VERSION })
    }
    return IDBSingleton.instance
  }

  public getAsyncSizeInfo() {
    return getIndexedDbSize()
  }

  public async getAllKeys(): Promise<any> {
    if (this.db) {
      return getAllKeys({ db: this.db as any, storeName: this.STORE_NAME })
    } else {
      return await this.#openDB()
        .then((_db) => getAllKeys({
          db: _db as any,
          storeName: this.STORE_NAME
        }))
        .catch(() => null)
    }
  }

  async #openDB(): Promise<IDBDatabase> {
    const self = window
    async function checkStorage() {
      if (!!navigator.storage && !!navigator.storage.persist) {
        await navigator.storage.persist()
          .then(async (granted) => {
            if (granted) {
              const isPersisted = await navigator.storage.persisted()
              console.log(`Хранилище защищено от автоматического удаления: ${isPersisted}`)
              if (!isPersisted) {
                await navigator.storage.persist()
              }
            }
          })
          .catch((err) => {
            console.error(`Storage error: ${err?.message}`)
          })
      }
    }
    
    await checkStorage()
    
    return new Promise((resolve, reject) => {
      const request = self.indexedDB.open(this.DB_NAME, this.DB_VERSION)

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const storeName = this.STORE_NAME
        const dbTarget = event.target as IDBOpenDBRequest
        const dbInstanceObj = dbTarget.result
        const transaction = dbTarget.transaction

        if (!transaction) return;

        logger.log({
          err: null,
          evt: { event, storeName, objectStoreNames: dbInstanceObj.objectStoreNames },
          label: 'onupgradeneeded',
        })

        if (!dbInstanceObj.objectStoreNames.contains(this.STORE_NAME)) {
          dbInstanceObj.createObjectStore(this.STORE_NAME, { keyPath: 'id' })
          return;
        }

        if (event.oldVersion === 1) {
          console.log('🚀 Запуск миграции на версию 2...');
          const objectStore = transaction.objectStore(storeName)
          
          objectStore.openCursor().onsuccess = (__event: any) => {
            const cursor = __event.target.result
            if (cursor) {
              const oldRecord = cursor.value
              const oldKey = oldRecord.id
              const parsedInfo = parseOldKey(oldKey)

              if (parsedInfo) {
                const newKey = getUniqueKey(parsedInfo)
                const newRecord = { ...oldRecord, id: newKey }
                objectStore.put(newRecord)
                objectStore.delete(oldKey)
                console.log(`🔄 Перенесен ключ: ${oldKey} ➡️ ${newKey}`)
              } else {
                objectStore.delete(oldKey)
                console.log(`🗑️ Удален мусор: ${oldKey}`)
              }
              cursor.continue()
            }
          }
        }
      }

      request.onsuccess = (event: any) => {
        logger.log({
          err: null,
          evt: { event, storeName: this.STORE_NAME },
          label: 'onsuccess',
        })
        resolve(event.target.result)
      }

      request.onerror = (event: any) => {
        const error = event.target.error;
        if (error.name === "SecurityError" || error.name === "UnknownError") {
          alert("База данных повреждена. Перезагрузка...");
          indexedDB.deleteDatabase(this.DB_NAME);
          reject(error)
          setTimeout(() => location.reload(), 500);
        } else {
          reject(error)
        }
      }
    })
  }

  // --- ЯВНО ОБЪЯВЛЯЕМ ПУБЛИЧНЫЕ МЕТОДЫ ДЛЯ TYPESCRIPT ---

  public loadImages({ key, cb }: {
    key: string;
    cb: {
      onSuccess: (_ps: { ok: boolean; data?: { items: Blob[]; ts: number }; message?: string; }) => void;
      onFuckup: (_ps: { ok: boolean; message?: string; }) => void;
    }
  }): void {
    const __getTargetActionResult = (): void => {
      if (!this.db) return;
      const transaction = this.db.transaction([this.STORE_NAME], 'readonly')
      const store = transaction.objectStore(this.STORE_NAME)
      const request = store.get(key)

      request.onsuccess = (event: any) => {
        const record = event.target.result
        if (record && record.data) {
          cb.onSuccess({ ok: true, data: record.data })
        } else {
          cb.onFuckup({ ok: false, message: 'Image not found' })
        }
      }
      request.onerror = (event: any) => {
        cb.onFuckup({ ok: false, message: event.target?.error?.message || 'Error' })
      }
    }

    if (!this.db) {
      this.#openDB()
        .then((db) => {
          this.db = db
          __getTargetActionResult()
        })
        .catch((err) => {
          this.error = err
          cb.onFuckup({ ok: false, message: 'DB init error' })
        });
    } else {
      __getTargetActionResult()
    }
  }

  public setImagesPack({ key, cb, items }: {
    key: string;
    cb: {
      onSuccess: (_ps: { ok: boolean; message?: string; ts: number; }) => void;
      onFuckup: (_ps: { ok: boolean; message?: string; ts: number; }) => void;
    };
    items: Blob[];
  }): void {
    const __getTargetActionResult = () => {
      if (!this.db) return;
      const tsUpdate = new Date().getTime()
      const transaction = this.db.transaction(this.STORE_NAME, 'readwrite')
      const store = transaction.objectStore(this.STORE_NAME)
      const request = store.put({ id: key, data: { items, ts: tsUpdate } })

      request.onsuccess = () => {
        cb.onSuccess({ ok: true, message: 'Saved successfully', ts: tsUpdate })
      }
      request.onerror = (event: any) => {
        cb.onFuckup({ ok: false, message: event.target?.error?.message || 'Error', ts: tsUpdate })
      }
    }

    if (!this.db) {
      this.#openDB()
        .then((db) => {
          this.db = db
          __getTargetActionResult()
        })
        .catch((err) => {
          this.error = err
        })
    } else {
      __getTargetActionResult()
    }
  }

  public removeImagesPack({ key, cb }: {
    key: string;
    cb: {
      onSuccess: (_ps: { ok: boolean; message?: string; }) => void;
      onFuckup: (_ps: { ok: boolean; message?: string; }) => void;
    };
  }): void {
    const __getTargetActionResult = () => {
      if (!this.db) return;
      const transaction = this.db.transaction(this.STORE_NAME, 'readwrite')
      const store = transaction.objectStore(this.STORE_NAME)
      const request = store.delete(key)

      request.onsuccess = () => {
        cb.onSuccess({ ok: true, message: 'Removed successfully' })
      }
      request.onerror = (event: any) => {
        cb.onFuckup({ ok: false, message: event.target?.error?.message || 'Error' })
      }
    }

    if (!this.db) {
      this.#openDB()
        .then((db) => {
          this.db = db
          __getTargetActionResult()
        })
        .catch((err) => {
          this.error = err
        })
    } else {
      __getTargetActionResult()
    }
  }
}

export const idbInstance = IDBSingleton.getInstance({ 
  DB_NAME: 'LocalImageDB', 
  STORE_NAME: 'images', 
  DB_VERSION: 2 
})
