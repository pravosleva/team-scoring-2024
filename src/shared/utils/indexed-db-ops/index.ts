// src/shared/utils/indexed-db-ops/index.ts
export * from './getUniqueKey';
export * from './getAllKeys';
export * from './getIndexedDbSize';
export { idbInstance, IDBSingleton } from './idbInstance'; // Экспортируем инстанс и сам класс наружу
