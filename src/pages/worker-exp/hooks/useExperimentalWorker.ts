import { useLayoutEffect, useCallback } from 'react'
import { groupLog, wws } from '~/shared/utils'
import { NWService } from '~/shared/utils/wws/types'
import pkg from '../../../../package.json'

// const BASE_API_URL = import.meta.env.VITE_BASE_API_URL

type TWorkerDeps = {
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
}

export const useExperimentalWorker = <TTargetResult, TWorkerServiceReport>({ isEnabled, isDebugEnabled, deps, cb }: TProps<TTargetResult>) => {
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

      wName: 'experimental',

      // --

      cb: (e) => {
        switch (true) {
          default:
            switch (e.data.__eType) {
              case NWService.EWorkerToClientEvent.EXPERIMENTAL_PONG_OK:
                if (isDebugEnabled) groupLog({

                  // -- ATTENTION! 2/6

                  namespace: `[useExperimentalWorker] by experimental (on data #1) [${e.data.__eType}]`,

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
              case NWService.EWorkerToClientEvent.EXPERIMENTAL_PONG_ERR:
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

                  namespace: `[useExperimentalWorker] by experimental ⚠️ (on data) UNHANDLED! [${e.data.__eType}`,

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
    //   wName: 'experimental',
    //   cb: (e: any) => { groupLog({ namespace: e.type, items: [ e.data ] }) },
    // })
    // --

    wws.subscribeOnErr<{
      message?: string;
    }>({

      // -- ATTENTION! 4/6

      wName: 'experimental',
      cb: (e: MessageEvent<{
        message?: string;
      }>) => {
        if (isDebugEnabled) groupLog({
          namespace: '[useExperimentalWorker] by experimental 🚫 OnErr e:',
          items: [e],
        })
      },

      // --

    })

    // return () => {
    //   const wList = ['experimental']
    //   for (const wName of wList) {
    //     wws.terminate({
    //       wName,
    //       cb: () => {
    //         if (isDebugEnabled) groupLog({ namespace: `[useExperimentalWorker] by experimental 🚫 die [${wName}]`, items: [] })
    //       },
    //     })
    //   }
    // }
  }, [
    isDebugEnabled,
    cb,
    deps.counter,
  ])

  const sendSignalToWorker = useCallback(({ input }: {
    input: {
      opsEventType: NWService.EClientToWorkerEvent;
      counter: number;
    };
  }) => {
    wws.post<{
      input: {
        appVersion: string;
        opsEventType: string;
        counter: number;
      };
    }>({

      // -- ATTENTION! 5/6

      wName: 'experimental',

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
  }, [])

  // -- ATTENTION! 6/6

  // NOTE: 2. Send event for each change of deps
  useLayoutEffect(() => {
    if (isEnabled)
      sendSignalToWorker({
        input: {
          opsEventType: NWService.EClientToWorkerEvent.EXPERIMENTAL_PING,
          // counter: deps.counter,
          counter: deps.counter,
        }
      })
    else if (isDebugEnabled)
      groupLog({
        namespace: '[useExperimentalWorker] by experimental 🚫 DISABLED',
        items: [
          `isEnabled= ${String(isEnabled)}`
        ],
      })
  }, [
    isEnabled,
    isDebugEnabled,
    sendSignalToWorker,
    deps.counter,
  ])

  // --

}
