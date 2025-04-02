/* eslint-disable @typescript-eslint/no-namespace */
export namespace NWService {
  export enum EClientToWorkerEvent {
    DIE_WORKER = 'c-w:die-worker',
    RESET_WORKER_HISTORY = 'c-w:reset-worker-history',
    MESSAGE = 'c-w:message',

    // GET_NEWS = 'c-w:news:get-items',
    GET_WORST_CALC = 'c-w:news:get-sorted-speeds-calc',
  }
  export enum EWorkerToClientEvent {
    MESSAGE = 'w-c:message',

    // NEWS_ITEM_RECEIVED = 'w-c:news:item-received',
    // NEWS_ITEM_ERRORED = 'w-c:news:item-errored',
    WORST_CALC_OK = 'c-w:news:sorted-speeds-calc-ok',
    WORST_CALC_ERR = 'c-w:news:sorted-speeds-calc-err',
  }
  export type TDataResult<T> = {
    ok: boolean;
    message?: string;
    originalResponse?: T;
  }
}
