// NOTE: For example

export { };

declare global {
  interface Window {
    ym: (counter: number, action: 'hit', event: string) => void;
  }

  interface LocalStorageChangeDetail {
    key: string;
    newValue: string;
    oldValue: string | null;
    storageArea: Storage;
  }

  interface WindowEventMap {
    'localStorageChange': CustomEvent<LocalStorageChangeDetail>;
    'storage': StorageEvent; // Standard storage event
  }
}
