import { useLayoutEffect, useRef } from 'react'
import { groupLog, wws } from '~/shared/utils'
import { NWService } from '~/shared/utils/wws/types'
import pkg from '../../../../../package.json'
import { TJob } from '~/shared/xstate'
import { TPICFilters } from '~/shared/xstate/topLevelMachine/v2/context/ParamsInspectorContextWrapper'

// const BASE_API_URL = import.meta.env.VITE_BASE_API_URL

type TWorkerDeps = {
  // counter: number;
  searchQuery: {
    basic: string;
    enhanced: string;
  };
  jobs: TJob[];
  activeJobId: number | null;
  // requiredPage?: number;
  activeFilters?: TPICFilters;
  requiredPage: null | number;
  counter: number;
}

type TProps<TTargetResult> = {
  isEnabled: boolean;
  isDebugEnabled?: boolean;
  deps: TWorkerDeps;
  cb?: {
    beforeStart?: () => void;
    onEachSuccessItemData: (data: NWService.TDataResult<TTargetResult>) => void;
    onFinalError: (ps: { reason: string }) => void;
  };
  debugName: string;
  workerName: 'search-pager-basic';
}

export const useSearchBasicWorker = <TTargetResult, TWorkerServiceReport>({
  debugName, isEnabled, isDebugEnabled, deps, cb,
  workerName,
}: TProps<TTargetResult>) => {
  // NOTE: 1.1 Use wws.subscribeOnData once only!
  useLayoutEffect(() => {
    if (typeof cb?.beforeStart === 'function') cb.beforeStart()
    wws.subscribeOnData<{
      __eType: NWService.EWorkerToClientEvent;
      data: {
        type: NWService.EWorkerToClientEvent;
        output: NWService.TDataResult<TTargetResult>;
        // NOTE: Input data could be compared
        input: {
          opsEventType: NWService.EClientToWorkerEvent;
        } & TWorkerDeps;
        _service: TWorkerServiceReport; // Your type
      };
    }>({

      // -- ATTENTION! 1/6

      wName: workerName,

      // --

      cb: (e) => {
        switch (true) {
          default:
            switch (e.data.__eType) {
              case NWService.EWorkerToClientEvent.SEARCH_BASIC_REPORT_PAGER_OK:
                if (isDebugEnabled) groupLog({

                  // -- ATTENTION! 2/6

                  namespace: `[${debugName}] by ${workerName} (on data #1) [${e.data.__eType}]`,

                  // --

                  items: [
                    'e.data.data.output',
                    e.data.data.output,
                    `typeof cb?.onEachSuccessItemData -> ${typeof cb?.onEachSuccessItemData}`,
                  ],
                })
                if (
                  typeof cb?.onEachSuccessItemData === 'function'
                  && !!e.data.data.output.originalResponse
                ) cb?.onEachSuccessItemData(e.data.data.output)
                break
              case NWService.EWorkerToClientEvent.SEARCH_BASIC_PAGER_ERR:
                if (
                  typeof cb?.onFinalError === 'function'
                  // && !!e.data.data.output.originalResponse
                ) cb?.onFinalError({
                  reason: e.data.data.output.message || 'No output.message',
                })
                break
              default: {
                if (isDebugEnabled) groupLog({

                  // -- Attention! 3/6

                  namespace: `[${debugName}] by ${workerName} ⚠️ (on data) UNHANDLED! [${e.data.__eType}`,

                  // --

                  items: ['e.data', e.data],
                })
                break
              }
            }
            break
        }
      },
    })

    // -- REMEMBER: 1.2 Additional subscribe? ⛔ Dont use this! Cuz callbacks above will be replaced
    // wws.subscribeOnData<{
    //   data: {
    //     output: any;
    //     type: NEvents.ESharedWorkerNative;
    //     yourData: { [key: string]: any; };
    //   };
    // }>({
    //   wName: workerName,
    //   cb: (e: any) => { groupLog({ namespace: e.type, items: [ e.data ] }) },
    // })
    // --

    wws.subscribeOnErr<{
      message?: string;
    }>({

      // -- ATTENTION! 4/6

      wName: workerName,
      cb: (e: MessageEvent<{
        message?: string;
      }>) => {
        if (isDebugEnabled) groupLog({
          namespace: `[${debugName}] by ${workerName} 🚫 OnErr e:`,
          items: [e],
        })
      },

      // --

    })

    // return () => {
    //   const wList = [workerName]
    //   for (const wName of wList) {
    //     wws.terminate({
    //       wName,
    //       cb: () => {
    //         if (isDebugEnabled) groupLog({ namespace: `[${debugName}] by ${workerName} 🚫 die [${wName}]`, items: [] })
    //       },
    //     })
    //   }
    // }
  }, [
    isDebugEnabled,
    cb,
    // deps.counter,
    deps.jobs,
    deps.searchQuery.basic,
    deps.searchQuery.enhanced,
    deps.requiredPage,
    debugName,
    workerName,
  ])

  const sendSignalToWorkerFnRef = useRef(({ input }: {
    input: {
      opsEventType: NWService.EClientToWorkerEvent;
      jobs: TJob[];
      searchQuery: {
        basic: string;
        enhanced: string;
      };
      requiredPage: number | null;
      _activeFilters?: TPICFilters;
      activeJobId?: number | null;
    };
  }) => {
    wws.post<{
      input: {
        appVersion: string;
        opsEventType: string;
        jobs: TJob[];
        searchQuery: {
          basic: string;
          enhanced: string;
        };
        requiredPage: number | null;
        _activeFilters?: TPICFilters;
        activeJobId?: number | null;
      };
    }>({

      // -- ATTENTION! 5/6

      wName: workerName,

      // --

      eType: NWService.EClientToWorkerEvent.MESSAGE,
      data: {
        input: {
          // baseApiUrl: BASE_API_URL,
          appVersion: pkg.version,
          ...input,
        },
      },
    })
  })

  // -- ATTENTION! 6/6

  // NOTE: 2. Send event for each change of deps
  useLayoutEffect(() => {
    console.log(`-- EFF isEnabled -> ${isEnabled}`)
    if (isEnabled)
      sendSignalToWorkerFnRef.current({
        input: {
          opsEventType: NWService.EClientToWorkerEvent.GET_SEARCH_BASIC_PAGER,
          jobs: deps.jobs,
          searchQuery: {
            basic: deps.searchQuery.basic.trim().replace(/\s+/g, ' '),
            enhanced: deps.searchQuery.enhanced.trim().replace(/\s+/g, ' '),
          },
          _activeFilters: deps.activeFilters,
          requiredPage: deps.requiredPage,
          activeJobId: deps.activeJobId,
        }
      })
    else if (isDebugEnabled)
      groupLog({
        namespace: `[${debugName}] by ${workerName} 🚫 DISABLED`,
        items: [
          `isEnabled= ${String(isEnabled)}`
        ],
      })
  }, [
    isEnabled,
    isDebugEnabled,
    deps.searchQuery.basic,
    deps.searchQuery.enhanced,
    deps.jobs,
    deps.activeFilters,
    deps.activeJobId,
    deps.requiredPage,
    deps.counter,
    debugName,
    workerName,
  ])

  // --

}
