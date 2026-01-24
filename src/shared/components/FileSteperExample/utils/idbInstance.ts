/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
let db

type TProps = {
  DB_NAME: string;
  STORE_NAME: string;
}

class IDBSingleton {
  private static instance: IDBSingleton
  db: unknown;
  error: unknown;
  DB_NAME: string;
  STORE_NAME: string;

  private constructor({ DB_NAME, STORE_NAME }: TProps) {
    this.DB_NAME = DB_NAME
    this.STORE_NAME = STORE_NAME
    this.#openDB()
      .then((db) => this.db = db)
      .catch((err) => this.error = err)
  }

  public static getInstance({ DB_NAME, STORE_NAME }: TProps): IDBSingleton {
    if (!IDBSingleton.instance) IDBSingleton.instance = new IDBSingleton({ DB_NAME, STORE_NAME })
    return IDBSingleton.instance
  }

  #openDB() {
    const self = window
    return new Promise((resolve, reject) => {
      const request = self.indexedDB.open(this.DB_NAME, 1)

      request.onupgradeneeded = (event) => {
        // @ts-ignore
        const db = event.target?.result
        // NOTE: This event is fired if the database did not exist or the version number was higher
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          // NOTE: Create an object store to hold information about images
          const objectStore = db.createObjectStore([this.STORE_NAME], { keyPath: 'id' })

          // NOTE: Create an index to search by item name
          objectStore.createIndex(
            'data',
            'data',
            { unique: false }
          )

          // NOTE: After successfully opening a connection,
          // you interact with the database using the resulting IDBDatabase object
          // within the context of transactions
        }
      }

      request.onsuccess = (event) => {
        // @ts-ignore
        db = event.target?.result
        // NOTE: Database connection is open and ready for transactions
        resolve(db)
      }

      request.onerror = (event) => {
        // @ts-ignore
        reject('Database error: ' + event.target?.error);
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
