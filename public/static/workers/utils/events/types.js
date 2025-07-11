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
      JobsPager: {
        EClientToWorkerEvent: {
          PING_GET: 'c-w:jobs-pager:ping:get',
        },
        EWorkerToClientEvent: {
          PONG_OK: 'w-c:jobs-pager:pong:ok',
          PONG_ERR: 'w-c:jobs-pager:pong:err',
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
}
