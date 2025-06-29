const NES = {
  // NOTE: Should be sync with NEvents.ECustom in ~/types/NEvents.ts
  Common: {
    WorkerService: {
      CLIENT_TO_WORKER_RESET_HISTORY: 'c-w:reset-worker-history',
      WORKER_TO_CLIENT_RESET_HISTORY_OK: 'w-c:reset-history-ok',
      CLIENT_TO_WORKER_MESSAGE: 'c-w:message',
    },
    ClientService: {
      // -- NOTE: Should be sync with NWService in ~/shared/utils/wws/types.ts
      News: {
        EClientToWorkerEvent: {
          GET_WORST_CALC: 'c-w:news:get-sorted-speeds-calc',
        },
        EWorkerToClientEvent: {
          WORST_CALC_OK: 'w-c:news:sorted-speeds-calc-ok',
          WORST_CALC_ERR: 'w-c:news:sorted-speeds-calc-err',
        },
      },
      ProjectsTreeCalc: {
        EClientToWorkerEvent: {
          GET_PROJECTS_TREE_CALC: 'c-w:news:get-projects-tree-calc',
        },
        EWorkerToClientEvent: {
          PROJECTS_TREE_CALC_OK: 'w-c:news:projects-tree-calc-ok',
          PROJECTS_TREE_CALC_ERR: 'w-c:news:projects-tree-calc-err',
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
