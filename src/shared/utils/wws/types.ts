/* eslint-disable @typescript-eslint/no-namespace */
export namespace NWService {
  export enum EClientToWorkerEvent {
    DIE_WORKER = 'c-w:die-worker',
    RESET_WORKER_HISTORY = 'c-w:reset-worker-history',
    MESSAGE = 'c-w:message',

    GET_WORST_CALC = 'c-w:taro-worst-calc:sorted-speeds:get',
    GET_PROJECTS_TREE_CALC = 'c-w:projects-tree-calc:get',

    EXPERIMENTAL_PING = 'c-w:experimental:ping',

    // NOTE: 1/2 Others...
  }
  export enum EWorkerToClientEvent {
    MESSAGE = 'w-c:message',

    WORST_CALC_OK = 'w-c:taro-worst-calc:sorted-speeds:ok',
    WORST_CALC_ERR = 'w-c:taro-worst-calc:sorted-speeds:err',

    PROJECTS_TREE_CALC_OK = 'w-c:projects-tree-calc:ok',
    PROJECTS_TREE_CALC_ERR = 'w-c:projects-tree-calc:err',

    EXPERIMENTAL_PONG_OK = 'w-c:experimental:pong:ok',
    EXPERIMENTAL_PONG_ERR = 'w-c:experimental:pong:err',

    // NOTE: 2/2 Others...
  }
  export type TDataResult<T> = {
    ok: boolean;
    message?: string;
    originalResponse?: T;
  }
}
