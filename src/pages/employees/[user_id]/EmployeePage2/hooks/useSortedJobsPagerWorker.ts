import { useLayoutEffect, useRef } from 'react'
import { groupLog, wws } from '~/shared/utils'
import { NWService } from '~/shared/utils/wws/types'
import pkg from '../../../../../../package.json'
import { TJob } from '~/shared/xstate'
import { TPICFilters } from '~/shared/xstate/topLevelMachine/v2/context/ParamsInspectorContext'

// const BASE_API_URL = import.meta.env.VITE_BASE_API_URL

type TWorkerDeps = {
  counter: number;
  jobs: TJob[];
  activeJobId: number | null;
  requiredPage?: number;
  activeFilters?: TPICFilters;
}

type TProps<TTargetResult> = {
  isEnabled: boolean;
  isDebugEnabled?: boolean;
  deps: TWorkerDeps;
  cb?: {
    beforeSubscribe?: () => void;
    beforeEachPostMessage?: () => void;
    onEachSuccessItemData: (data: NWService.TDataResult<TTargetResult>) => void;
    onFinalError: (ps: { reason: string }) => void;
  };
}

export const useSortedJobsPagerWorker = <TTargetResult, TWorkerServiceReport>({ isEnabled, isDebugEnabled, deps, cb }: TProps<TTargetResult>) => {
  // NOTE: 1.1 Use wws.subscribeOnData once only!
  useLayoutEffect(() => {
    if (typeof cb?.beforeSubscribe === 'function') cb.beforeSubscribe()
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

      wName: 'sorted-jobs-pager',

      // --

      cb: (e) => {
        switch (true) {
          default:
            switch (e.data.__eType) {
              case NWService.EWorkerToClientEvent.SORTED_JOBS_PAGER_OK:
                if (isDebugEnabled) groupLog({

                  // -- ATTENTION! 2/6

                  namespace: `[useSortedJobsPagerWorker] by sorted-jobs-pager (on data #1) [${e.data.__eType}]`,

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
              case NWService.EWorkerToClientEvent.SORTED_JOBS_PAGER_ERR:
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

                  namespace: `[useSortedJobsPagerWorker] by sorted-jobs-pager ⚠️ (on data) UNHANDLED! [${e.data.__eType}`,

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
    //   wName: 'sorted-jobs-pager',
    //   cb: (e: any) => { groupLog({ namespace: e.type, items: [ e.data ] }) },
    // })
    // --

    wws.subscribeOnErr<{
      message?: string;
    }>({

      // -- ATTENTION! 4/6

      wName: 'sorted-jobs-pager',
      cb: (e: MessageEvent<{
        message?: string;
      }>) => {
        if (isDebugEnabled) groupLog({
          namespace: '[useSortedJobsPagerWorker] by sorted-jobs-pager 🚫 OnErr e:',
          items: [e],
        })
      },

      // --

    })

    // return () => {
    //   const wList = ['sorted-jobs-pager']
    //   for (const wName of wList) {
    //     wws.terminate({
    //       wName,
    //       cb: () => {
    //         if (isDebugEnabled) groupLog({ namespace: `[useSortedJobsPagerWorker] by sorted-jobs-pager 🚫 die [${wName}]`, items: [] })
    //       },
    //     })
    //   }
    // }
  }, [
    isDebugEnabled,
    cb,
    // deps.counter,
    // deps.jobs,
    // deps.activeJobId,
  ])

  const sendSignalToWorkerFnRef = useRef(({ input }: {
    input: {
      opsEventType: NWService.EClientToWorkerEvent;
      counter: number;
      jobs: TJob[];
      activeJobId: number | null;
      requiredPage?: number;
      _activeFilters?: TPICFilters;
    };
  }) => {
    if (typeof cb?.beforeEachPostMessage === 'function') cb.beforeEachPostMessage()
    wws.post<{
      input: {
        appVersion: string;
        opsEventType: string;
        counter: number;
        jobs: TJob[];
        activeJobId: number | null;
        requiredPage?: number;
        _activeFilters?: TPICFilters;
      };
    }>({

      // -- ATTENTION! 5/6

      wName: 'sorted-jobs-pager',

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
    if (isEnabled) {
      sendSignalToWorkerFnRef.current({
        input: {
          opsEventType: NWService.EClientToWorkerEvent.GET_SORTED_JOBS_PAGER,
          // counter: deps.counter,
          counter: deps.counter,
          jobs: deps.jobs,
          activeJobId: deps.activeJobId,
          requiredPage: deps.requiredPage,
          _activeFilters: deps.activeFilters,
        }
      })
    }
    else if (isDebugEnabled)
      groupLog({
        namespace: '[useSortedJobsPagerWorker] by sorted-jobs-pager 🚫 DISABLED',
        items: [
          `isEnabled= ${String(isEnabled)}`
        ],
      })
  }, [
    isEnabled,
    isDebugEnabled,
    deps.counter,
    deps.jobs,
    deps.activeJobId,
    deps.requiredPage,
    deps.activeFilters,
  ])

  // --

}
