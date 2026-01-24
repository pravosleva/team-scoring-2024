/* eslint-disable @typescript-eslint/ban-ts-comment */
export function getAllKeys({ db, storeName }: { db: IDBObjectStore, storeName: string }) {
  return new Promise((resolve, reject) => {
    // @ts-ignore
    const transaction = db.transaction([storeName], 'readonly');
    const objectStore = transaction.objectStore(storeName);
    const request = objectStore.getAllKeys();

    // @ts-ignore
    request.onsuccess = (event) => {
      const keys = event.target.result;
      resolve(keys);
    };

    // @ts-ignore
    request.onerror = (event) => {
      reject('Error getting all keys: ' + event.target.error);
    };
  });
}
