/* eslint-disable @typescript-eslint/no-namespace */
export namespace NWService {
  export enum EClientToWorkerEvent {
    DIE_WORKER = 'c-w:die-worker',
    RESET_WORKER_HISTORY = 'c-w:reset-worker-history',
    MESSAGE = 'c-w:message',

    // GET_NEWS = 'c-w:news:get-items',
    GET_WORST_CALC = 'c-w:news:get-sorted-speeds-calc',
    GET_PROJECTS_TREE_CALC = 'c-w:news:get-projects-tree-calc',
    // NOTE: 1/2 Others...
  }
  export enum EWorkerToClientEvent {
    MESSAGE = 'w-c:message',

    WORST_CALC_OK = 'w-c:news:sorted-speeds-calc-ok',
    WORST_CALC_ERR = 'w-c:news:sorted-speeds-calc-err',

    PROJECTS_TREE_CALC_OK = 'w-c:news:projects-tree-calc-ok',
    PROJECTS_TREE_CALC_ERR = 'w-c:news:projects-tree-calc-err',
    // NOTE: 2/2 Others...
  }
  export type TDataResult<T> = {
    ok: boolean;
    message?: string;
    originalResponse?: T;
  }
}
