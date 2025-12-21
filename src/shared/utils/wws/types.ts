/* eslint-disable @typescript-eslint/no-namespace */
export namespace NWService {
  export enum EClientToWorkerEvent {
    DIE_WORKER = 'c-w:die-worker',
    RESET_WORKER_HISTORY = 'c-w:reset-worker-history',
    MESSAGE = 'c-w:message',
    GET_WORST_CALC = 'c-w:taro-worst-calc:sorted-speeds:get',
    GET_PROJECTS_TREE_CALC = 'c-w:projects-tree-calc:get',
    GET_POINTSET_TREE_CALC = 'c-w:pointset-tree-calc:get',
    EXPERIMENTAL_PING = 'c-w:experimental:ping',
    GET_JOBS_PAGER = 'c-w:jobs-pager:ping:get',
    GET_SORTED_JOBS_PAGER = 'c-w:sorted-jobs-pager:ping:get',
    GET_SORTED_LOGS_PAGER = 'c-w:sorted-logs-pager:ping:get',
    GET_SORTED_REPORT_PAGER = 'c-w:sorted-report-pager:ping:get',
    GET_SEARCH_BASIC_PAGER = 'c-w:search-pager-basic:ping:get',
    // NOTE: 1/2 Others...
  }
  export enum EWorkerToClientEvent {
    MESSAGE = 'w-c:message',

    WORST_CALC_OK = 'w-c:taro-worst-calc:sorted-speeds:ok',
    WORST_CALC_ERR = 'w-c:taro-worst-calc:sorted-speeds:err',

    PROJECTS_TREE_CALC_OK = 'w-c:projects-tree-calc:ok',
    PROJECTS_TREE_CALC_ERR = 'w-c:projects-tree-calc:err',

    POINTSET_TREE_CALC_OK = 'w-c:pointset-tree-calc:ok',
    POINTSET_TREE_CALC_ERR = 'w-c:pointset-tree-calc:err',

    EXPERIMENTAL_PONG_OK = 'w-c:experimental:pong:ok',
    EXPERIMENTAL_PONG_ERR = 'w-c:experimental:pong:err',

    JOBS_PAGER_OK = 'w-c:jobs-pager:pong:ok',
    JOBS_PAGER_ERR = 'w-c:jobs-pager:pong:err',

    SORTED_JOBS_PAGER_OK = 'w-c:sorted-jobs-pager:pong:ok',
    SORTED_JOBS_PAGER_ERR = 'w-c:sorted-jobs-pager:pong:err',

    SORTED_LOGS_PAGER_OK = 'w-c:sorted-logs-pager:pong:ok',
    SORTED_LOGS_PAGER_ERR = 'w-c:sorted-logs-pager:pong:err',

    SORTED_REPORT_PAGER_OK = 'w-c:sorted-report-pager:pong:ok',
    SORTED_REPORT_PAGER_ERR = 'w-c:sorted-report-pager:pong:err',

    SEARCH_BASIC_REPORT_PAGER_OK = 'w-c:search-pager-basic:pong:ok',
    SEARCH_BASIC_PAGER_ERR = 'w-c:search-pager-basic:pong:err',

    // NOTE: 2/2 Others...

    // NOTE: Online exp
    UI_NOTIF = 'ui_notif',
    ONLINE_INCOMING_DATA = 'w-c:online-data',
    ONLINE_CONN_OK = 'w-c:online-conn-ok',
    ONLINE_CONN_ERR = 'w-c:online-conn-err',
    ONLINE_RECONN = 'w-c:online-reconn',
    ONLINE_DISCONN = 'w-c:online-disconn',
    ONLINE_TRY_TO_RECONN = 'w-c:online-trying-to-reconn',
    ONLINE_FULL_HISTORY_REPORT_ANSWER_OK = 'w-c:online-history-report-ok',
    ONLINE_FULL_HISTORY_REPORT_ANSWER_ERR = 'w-c:online-history-report-err',
  }
  export enum EUIMessage {
    SOCKET_MUST_DIE = 'socket_must_die',
    WARNING = 'ui_message_warning',
    DEFAULT = 'ui_message_default',
    DANGER = 'ui_message_danger',
    SUCCESS = 'ui_message_success',
    INFO = 'ui_message_info',
  }

  export enum EMetrixClientOutgoing {
    EXPERIMENTAL_METRIX_PING = 'from-client:mx:experimental-metrix:ping',
  }
  export enum EMetrixClientIncoming {
    EXPERIMENTAL_METRIX_PONG_OK = 'w-c:experimental-metrix:pong-ok',
    EXPERIMENTAL_METRIX_PONG_ERR = 'w-c:experimental-metrix:pong-err',
  }
  export enum EReportType {
    DEFAULT = 'default',
    INFO = 'info',
    WARNING = 'warning',
    ERROR = 'error',
    SUCCESS = 'success',
  }
  export type TDataResult<T> = {
    ok: boolean;
    message?: string;
    originalResponse?: T;
  }
}
