/* eslint-disable @typescript-eslint/no-explicit-any */
import { getAllKeys, getIndexedDbSize, getUniqueKey } from '~/shared/utils/indexed-db-ops'
import { debugFactory } from '~/shared/utils'

/* eslint-disable @typescript-eslint/ban-ts-comment */
let db
const logger = debugFactory<any, string | null>({
  label: '👉 IDB instance',
})

type TProps = {
  DB_NAME: string;
  STORE_NAME: string;
}

class IDBSingleton {
  private static instance: IDBSingleton
  db: unknown; // IDBObjectStore | undefined;
  error: unknown;
  DB_NAME: string;
  STORE_NAME: string;
  DB_VERSION: number;

  private constructor({ DB_NAME, STORE_NAME }: TProps) {
    this.DB_NAME = DB_NAME
    this.STORE_NAME = STORE_NAME
    this.DB_VERSION = 1
    this.#openDB()
      .then((db) => this.db = db)
      .catch((err) => this.error = err)
  }

  public static getInstance({ DB_NAME, STORE_NAME }: TProps): IDBSingleton {
    if (!IDBSingleton.instance) IDBSingleton.instance = new IDBSingleton({ DB_NAME, STORE_NAME })
    return IDBSingleton.instance
  }

  public getAsyncSizeInfo() {
    return getIndexedDbSize()
  }

  public async getAllKeys() {
    if (!!this.db) {
      // @ts-ignore
      return getAllKeys({ db: this.db, storeName: this.STORE_NAME })
    } else {
      return await this.#openDB()
        .then((_db) => getAllKeys({
          // @ts-ignore
          db: this.db,
          storeName: this.STORE_NAME
        }))
        .catch(() => null)
    }
  }

  async #openDB() {
    const self = window
    async function checkStorage() {
      if (!!navigator.storage && !!navigator.storage.persist) {
        await navigator.storage.persist()
          .then(async (granted) => {
            if (granted) {
              // alert("Хранилище защищено. Chrome свяжет IndexedDB с доменом, а не с WebAPK.")

              // NOTE: Проверяем, затребовано ли устойчивое хранилище
              const isPersisted = await navigator.storage.persisted()
              console.log(`Хранилище защищено от автоматического удаления: ${isPersisted}`)
              // NOTE: Это вынуждает Android Chrome регистрировать базу данных не как временный кэш WebAPK-пакета,
              // а как постоянное дисковое хранилище домена, которое корректно подхватывается при переустановках

              // NOTE: Запрашиваем персистентность (помогает Chrome правильно связать права)
              if (!isPersisted) {
                const requested = await navigator.storage.persist()
                console.log(`Права на постоянное хранение предоставлены: ${requested}`)
              }
            } else throw new Error("В устойчивом хранилище отказано. Возможны проблемы при переустановке PWA.")
          })
          .catch((err) => {
            alert(`ERR: ${err?.message || 'No err?.message'}`)
          })
      }
    }
    await checkStorage()
    return new Promise((resolve, reject) => {
      const request = self.indexedDB.open(this.DB_NAME, this.DB_VERSION)

      request.onupgradeneeded = (event) => {
        const storeName = this.STORE_NAME

        // @ts-ignore
        const { result: db, transaction } = event.target

        logger.log({
          err: null,
          evt: { event, storeName, objectStoreNames: db.objectStoreNames },
          label: 'onupgradeneeded',
        })

        // NOTE: This event is fired if the database did not exist or the version number was higher
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          // NOTE: Create an object store to hold information about images
          db.createObjectStore(this.STORE_NAME, { keyPath: 'id' })

          // NOTE: Create an index to search by item name
          // objectStore.createIndex(
          //   'data',
          //   'data',
          //   { unique: false }
          // )

          // NOTE: After successfully opening a connection,
          // you interact with the database using the resulting IDBDatabase object
          // within the context of transactions
        }

        const objectStore = transaction.objectStore(storeName)
        // NOTE: Iterate through all existing object to remove keys
        // @ts-ignore
        objectStore.openCursor().onsucces = (__event) => {
          const cursor = __event.target.result
          if (!!cursor) {
            console.log('case 1. !!cursor')
            // switch (event.oldVersion) {
            //   case 2: {
            //     switch (event.newVersion) {
            //       case 3: {
            //         break
            //       }
            //       default:
            //         break
            //     }

            //     break;
            //   }
            //   default:
            //     break
            // }

            // -- NOTE: Migration
            const makeMigration = () => {
              const oldObject = cursor.value
              // NOTE: Create new obj with the desired key names
              const __splittedName = oldObject.oldKeyName.split('--')
              const jobIdInfo = __splittedName[0] || undefined
              const jobId: number | undefined = !!jobIdInfo
                ? Number(jobIdInfo.split('-')?.[1])
                : undefined
              if (typeof jobId === 'number') {
                console.log('case 1.1.1 jobId is number')
                const logTsInfo = __splittedName[1] || undefined
                const logTs: number | undefined = !!logTsInfo
                  ? Number(logTsInfo.split('-')?.[1])
                  : undefined
                const checklistItemIdInfo = __splittedName[3] || undefined
                const checklistItemId: number | undefined = !!checklistItemIdInfo
                  ? Number(checklistItemIdInfo.split('-')?.[1])
                  : undefined
                const newKeyName = getUniqueKey({ jobId, logTs, checklistItemId })
                console.log(`case 1.1.2 newKeyName -> ${newKeyName}`)
                const newObject = { ...oldObject, newKeyName }
                // NOTE: Delete old key
                console.log(`case 1.1.3 oldKeyName will be removed: ${newObject.oldKeyName}`)
                delete newObject.oldKeyName
                // NOTE: Put the new object back into the store.
                // Since the id (keyPath) remains the same, it overwrites the old entry.
                cursor.update(newObject)
                cursor.continue()
              } else {
                console.log(`case 1.2 Object not modified: ${oldObject.oldKeyName}`)
              }
            }
            makeMigration()
            // --
          } else {
            console.log('case 2. !cursor - All objects renamed')
          }
        }
      }

      request.onsuccess = (event) => {
        logger.log({
          err: null,
          evt: { event, storeName: this.STORE_NAME },
          label: 'onsuccess',
        })
        // @ts-ignore
        db = event.target?.result
        // NOTE: Database connection is open and ready for transactions

        // alert(`Количество объектов: ${db.objectStoreNames.length}`)

        resolve(db)
      }

      // request.onerror = (event) => {
      //   // @ts-ignore
      //   reject('Database error: ' + event.target?.error);
      // }
      request.onerror = (event) => {
        // @ts-ignore
        const error = event.target.error;

        // Если права нарушены из-за переустановки, Chrome вернет SecurityError или UnknownError
        if (error.name === "SecurityError" || error.name === "UnknownError") {
          alert("База данных повреждена после переустановки. Сброс...");

          // Принудительно удаляем старый заблокированный контейнер
          indexedDB.deleteDatabase(this.DB_NAME);
          // @ts-ignore
          reject('Database error: ' + event.target?.error || 'No event.target?.error')

          // Перезапускаем приложение для чистой инициализации
          setTimeout(() => location.reload(), 500);
        }
      }
    })
  }

  public loadImages({ key, cb }: {
    key: string;
    cb: {
      onSuccess: (_ps: { ok: boolean; data?: { items: Blob[]; ts: number }; message?: string; }) => void;
      onFuckup: (_ps: { ok: boolean; message?: string; }) => void;
    }
  }): void {
    const __getTargetActionResult = (): void => {
      const transaction = (this.db as any).transaction([this.STORE_NAME], 'readonly')
      const store = transaction.objectStore(this.STORE_NAME)
      const request = store.get(key)

      // @ts-ignore
      request.onsuccess = (event) => {
        const record = event.target.result
        if (record && record.data) {
          // self.postMessage({ type: 'IMAGE_LOADED', imageData: record.data })
          cb.onSuccess({ ok: true, data: record.data })
        } else {
          // self.postMessage({ type: 'ERROR', message: 'Image not found' })
          cb.onFuckup({ ok: false, message: 'Image not found' })
        }
      }
      // @ts-ignore
      request.onerror = (event) => {
        // self.postMessage({ type: 'ERROR', message: event.target.error.message });
        cb.onFuckup({ ok: false, message: event.target?.error?.message || 'Error' })
      }
    }
    if (!this.db) this.#openDB()
      .then((db) => {
        this.db = db
        __getTargetActionResult()
      })
      .catch((err) => {
        this.error = err
        __getTargetActionResult()
      });
    else __getTargetActionResult()
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
      // TODO: Should firstly remove key from IndexedDB?

      const tsUpdate = new Date().getTime()
      const transaction = (this.db as any).transaction(this.STORE_NAME, 'readwrite')
      const store = transaction.objectStore(this.STORE_NAME)
      const request = store.put({ id: key, data: { items, ts: tsUpdate } })

      request.onsuccess = () => {
        // self.postMessage({ type: 'SAVED_SUCCESS' });
        cb.onSuccess({ ok: true, message: 'Saved successfully', ts: tsUpdate })
      }
      // @ts-ignore
      request.onerror = (event) => {
        // self.postMessage({ type: 'ERROR', message: event.target.error.message })
        cb.onSuccess({ ok: false, message: event.target?.error?.message || 'No error.message', ts: tsUpdate })
      }
    }
    if (!this.db) this.#openDB()
      .then((db) => {
        this.db = db
        return __getTargetActionResult()
      })
      .catch((err) => {
        this.error = err
        return __getTargetActionResult()
      })
    else return __getTargetActionResult()
  }

  public removeImagesPack({ key, cb }: {
    key: string;
    cb: {
      onSuccess: (_ps: { ok: boolean; message?: string; }) => void;
      onFuckup: (_ps: { ok: boolean; message?: string; }) => void;
    };
  }): void {
    const __getTargetActionResult = () => {
      const transaction = (this.db as any).transaction(this.STORE_NAME, 'readwrite')
      const store = transaction.objectStore(this.STORE_NAME)
      const request = store.delete(key)

      request.onsuccess = () => {
        // self.postMessage({ type: 'SAVED_SUCCESS' });
        cb.onSuccess({ ok: true, message: 'Removed successfully' })
      }
      // @ts-ignore
      request.onerror = (event) => {
        // self.postMessage({ type: 'ERROR', message: event.target.error.message })
        cb.onSuccess({ ok: false, message: event.target?.error?.message || 'No error.message' })
      }
    }
    if (!this.db) this.#openDB()
      .then((db) => {
        this.db = db
        return __getTargetActionResult()
      })
      .catch((err) => {
        this.error = err
        return __getTargetActionResult()
      })
    else return __getTargetActionResult()
  }
}

export const idbInstance = IDBSingleton.getInstance({ DB_NAME: 'LocalImageDB', STORE_NAME: 'images' })
