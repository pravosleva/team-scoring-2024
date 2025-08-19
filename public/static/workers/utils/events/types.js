const NES = {
  // NOTE: Should be sync with NEvents.ECustom in ~/types/NEvents.ts
  Common: {
    WorkerService: {
      CLIENT_TO_WORKER_RESET_HISTORY: 'c-w:reset-worker-history',
      WORKER_TO_CLIENT_RESET_HISTORY_OK: 'w-c:reset-history-ok',
      CLIENT_TO_WORKER_MESSAGE: 'c-w:message',
    },
    ClientService: {
      // -- NOTE: [EVENTS 1/x] Should be sync with NWService in ~/shared/utils/wws/types.ts
      News: {
        EClientToWorkerEvent: {
          GET_WORST_CALC: 'c-w:taro-worst-calc:sorted-speeds:get',
        },
        EWorkerToClientEvent: {
          WORST_CALC_OK: 'w-c:taro-worst-calc:sorted-speeds:ok',
          WORST_CALC_ERR: 'w-c:taro-worst-calc:sorted-speeds:err',
        },
      },
      ProjectsTreeCalc: {
        EClientToWorkerEvent: {
          GET_PROJECTS_TREE_CALC: 'c-w:projects-tree-calc:get',
        },
        EWorkerToClientEvent: {
          PROJECTS_TREE_CALC_OK: 'w-c:projects-tree-calc:ok',
          PROJECTS_TREE_CALC_ERR: 'w-c:projects-tree-calc:err',
        },
      },
      Experimental: {
        EClientToWorkerEvent: {
          PING: 'c-w:experimental:ping',
        },
        EWorkerToClientEvent: {
          PONG_OK: 'w-c:experimental:pong:ok',
          PONG_ERR: 'w-c:experimental:pong:err',
        },
      },
      // ONLINE_EXP: {
      //   EClientToWorkerEvent: {
      //     PING: 'from-client:mx:experimental-metrix:ping',
      //   },
      //   EWorkerToClientEvent: {
      //     PONG_OK: 'w-c:experimental-metrix:pong-ok',
      //     PONG_ERR: 'w-c:experimental-metrix:pong-err',
      //   },
      // },
      JobsPager: {
        EClientToWorkerEvent: {
          PING_GET: 'c-w:jobs-pager:ping:get',
        },
        EWorkerToClientEvent: {
          PONG_OK: 'w-c:jobs-pager:pong:ok',
          PONG_ERR: 'w-c:jobs-pager:pong:err',
        },
      },
      SortedJobsPager: {
        EClientToWorkerEvent: {
          PING_GET: 'c-w:sorted-jobs-pager:ping:get',
        },
        EWorkerToClientEvent: {
          PONG_OK: 'w-c:sorted-jobs-pager:pong:ok',
          PONG_ERR: 'w-c:sorted-jobs-pager:pong:err',
        },
      },
      SortedLogsPager: {
        EClientToWorkerEvent: {
          PING_GET: 'c-w:sorted-logs-pager:ping:get',
        },
        EWorkerToClientEvent: {
          PONG_OK: 'w-c:sorted-logs-pager:pong:ok',
          PONG_ERR: 'w-c:sorted-logs-pager:pong:err',
        },
      },
      // Others...
      // --
    }
  },
  SharedWorker: {
    Native: {
      ESelf: {
        CONNECT: 'connect',
        ERROR: 'error',
      },
      EPort: {
        MESSAGE: 'message',
      },
    },
    Custom: {
      // NOTE: Should be sync with NEvents.ESharedWorkerCustom in ~/types/NEvents.ts
      EType: {
        CLIENT_TO_WORKER_DIE: 'c-w:die-worker',
      },
    },
  },
  Worker: {
    ENative: {
      MESSAGE: 'message',
    },
    Custom: {
      // NOTE: Should be sync with NEvents.EWorkerCustom in ~/types/NEvents.ts
      EType: {
        CLIENT_TO_WORKER_DIE: 'c-w:die-worker',
      },
    },
  },
  Socket: {
    ENative: {
      CONNECT: 'connect',
      RECONNECT: 'reconnect',
      CONNECT_ERROR: 'connect_error',
      RECONNECT_ATTEMPT: 'reconnect_attempt',
      DISCONNECT: 'disconnect',
    },
    ECustom: {
      DONT_RECONNECT: 'custom:dont-reconnect',

      CLIENT_TO_WORKER_RESET_HISTORY: 'c-w:reset-history',
      WORKER_TO_CLIENT_RESET_HISTORY_OK: 'w-c:reset-history-ok',
      // CLIENT_TO_WORKER_MESSAGE: 'c-w:message',
      // WORKER_TO_CLIENT_REMOTE_DATA: 'w-c:socket-data',
      // WORKER_TO_CLIENT_CONN: 'w-c:socket-conn-ok',
      // WORKER_TO_CLIENT_CONNN_ERR: 'w-c:socket-conn-err',
      // WORKER_TO_CLIENT_RECONN: 'w-c:socket-reconn',
      // WORKER_TO_CLIENT_DISCONN: 'w-c:socket-disconn',
      // WORKER_TO_CLIENT_TRY_TO_RECONN: 'w-c:socket-trying-to-reconn',
      // WORKER_TO_CLIENT_FULL_HISTORY_REPORT_ANSWER_OK: 'w-c:history-report-ok',
      // WORKER_TO_CLIENT_FULL_HISTORY_REPORT_ANSWER_ERR: 'w-c:history-report-err',

      ONLINE_INCOMING_DATA: 'w-c:online-data',
      UI_NOTIF: 'ui_notif',
      ONLINE_CONN_OK: 'w-c:online-conn-ok',
      ONLINE_CONN_ERR: 'w-c:online-conn-err',
      ONLINE_RECONN: 'w-c:online-reconn',
      ONLINE_DISCONN: 'w-c:online-disconn',
      ONLINE_TRY_TO_RECONN: 'w-c:online-trying-to-reconn',
      ONLINE_FULL_HISTORY_REPORT_ANSWER_OK: 'w-c:online-history-report-ok',
      ONLINE_FULL_HISTORY_REPORT_ANSWER_ERR: 'w-c:online-history-report-err',
    },
    Metrix: {
      // NOTE: Should be sync with NEvents.EMetrixClientOutgoing in ~/types/NEvents.ts
      EClientOutgoing: {
        PING: 'from-client:mx:experimental-metrix:ping',
        // SP_MX_EV: 'sp-mx:offline-tradein:c:event',
        // SP_HISTORY_REPORT_EV: 'sp-history:offline-tradein:c:report',
        // _SP_HISTORY_REPORT_EV_DEPRECATED: 'sp-xhr-history:offline-tradein:c:report',
      },
      EClientIncoming: {
        PONG_OK: 'w-c:experimental-metrix:pong-ok',
        PONG_ERR: 'w-c:experimental-metrix:pong-ok',
        // SP_MX_EV: 'sp-mx:offline-tradein:s:event',
        // SP_MX_SERVER_ON_HISTORY_REPORT_ANSWER_OK: 'sp-mx:history-report:s:ok',
        // SP_MX_SERVER_ON_HISTORY_REPORT_ANSWER_ERR: 'sp-mx:history-report:s:err',
      },
    },
  },
}
