import { useLayoutEffect, useCallback } from 'react'
import { groupLog, wws } from '~/shared/utils'
import { NWService } from '~/shared/utils/wws/types'
// import { TNewsItemDetails } from '~/common/store/reducers/newsSlice'
// import { NSWorstCalc } from '~/shared/utils/team-scoring'
// import { TJob } from '~/shared/xstate'
import { TPointsetItem } from '~/shared/xstate'
import { TreeNode } from 'ts-tree-lib'
import { TLocalSettingsStatusOption } from '~/pages/local-settings/types';
import pkg from '../../../../../package.json'

// const BASE_API_URL = import.meta.env.VITE_BASE_API_URL

type TDeps = {
  rootPoint?: TPointsetItem;
  pointset: TPointsetItem[];
  jobTsUpdate?: number;
  statusPack?: {
    [key: string]: TLocalSettingsStatusOption;
  };
}
type TProps = {
  isEnabled: boolean;
  isDebugEnabled?: boolean;
  deps: TDeps;
  cb?: {
    beforeStart?: () => void;
    onEachSuccessItemData: (data: NWService.TDataResult<{ calc: TreeNode<TPointsetItem>; report: { targetTree: string; } }>) => void;
    onFinalError: (ps: { id: number; reason: string }) => void;
  };
}

export const usePoinsetTreeCalcWorker = ({ isEnabled, isDebugEnabled, deps, cb }: TProps) => {
  // NOTE: 1.1 Use wws.subscribeOnData once only!
  useLayoutEffect(() => {
    if (typeof cb?.beforeStart === 'function') cb.beforeStart()

    // wws.reInitWorker({ wName: 'pointset-tree-calc', ifNecessaryOnly: true })
    wws.subscribeOnData<{
      __eType: NWService.EWorkerToClientEvent;
      data: {
        type: NWService.EWorkerToClientEvent;
        output: NWService.TDataResult<{ calc: TreeNode<TPointsetItem>; report: { targetTree: string; } }>;
        // NOTE: Input data could be compared
        input: {
          opsEventType: NWService.EClientToWorkerEvent;
        } & TDeps;
        _service: {
          id: number;
          // counters: {
          //   current: number;
          //   total: number;
          // };
        };
      };
    }>({
      wName: 'pointset-tree-calc',
      cb: (e) => {
        switch (true) {
          // case wws.activeIncomingChannels.pointset-tree-calc !== e.data.data.input.dataPackKey:
          //   if (isDebugEnabled) groupLog({
          //     namespace: `[usePointsetTreeCalcWorker] Ignore dataPackKey: ${e.data.data.input.dataPackKey}, current: ${wws.activeIncomingChannels.pointset-tree-calc} [${e.data.__eType}]`,
          //     items: ['e.data.data.input', e.data.data.input, 'e.data.data.output', e.data.data.output],
          //   })
          //   return
          default:
            switch (e.data.__eType) {
              case NWService.EWorkerToClientEvent.POINTSET_TREE_CALC_OK:
                if (isDebugEnabled) groupLog({
                  namespace: `[usePointsetTreeCalcWorker] by pointset-tree-calc (on data #1) [${e.data.__eType}]`,
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
              case NWService.EWorkerToClientEvent.POINTSET_TREE_CALC_ERR:
                if (
                  typeof cb?.onFinalError === 'function'
                  // && !!e.data.data.output.originalResponse
                ) cb?.onFinalError({ id: e.data.data._service.id, reason: e.data.data.output.message || 'No output.message' })
                break
              default: {
                if (isDebugEnabled) groupLog({
                  namespace: `[usePointsetTreeCalcWorker] by pointset-tree-calc ⚠️ (on data) UNHANDLED! [${e.data.__eType}]`,
                  items: ['e.data', e.data],
                })
                break
              }
            }
            break
        }
      },
    })

    // -- NOTE: 1.2 Additional subscribe? ⛔ Dont use this! Cuz callbacks above will be replaced
    // wws.subscribeOnData<{
    //   data: {
    //     output: any;
    //     type: NEvents.ESharedWorkerNative;
    //     yourData: { [key: string]: any; };
    //   };
    // }>({
    //   wName: 'pointset-tree-calc',
    //   cb: (e: any) => { groupLog({ namespace: e.type, items: [ e.data ] }) },
    // })
    // --

    wws.subscribeOnErr<{
      message?: string;
    }>({
      wName: 'pointset-tree-calc',
      cb: (e: MessageEvent<{
        message?: string;
      }>) => {
        if (isDebugEnabled) groupLog({
          namespace: '[usePointsetTreeCalcWorker] by pointset-tree-calc 🚫 OnErr e:',
          items: [e],
        })
      },
    })

    // return () => {
    //   const wList = ['pointset-tree-calc']
    //   for (const wName of wList) {
    //     wws.terminate({
    //       wName,
    //       cb: () => {
    //         if (isDebugEnabled) groupLog({ namespace: `[usePointsetTreeCalcWorker] by pointset-tree-calc 🚫 die [${wName}]`, items: [] })
    //       },
    //     })
    //   }
    // }
  }, [isDebugEnabled, deps.rootPoint, cb, deps.pointset])

  const sendSignalToNewsWorker = useCallback(({ input }: {
    input: {
      opsEventType: NWService.EClientToWorkerEvent;
    } & TDeps;
  }) => {
    wws.post<{
      input: {
        appVersion: string;

        opsEventType: string;
      } & TDeps;
    }>({
      wName: 'pointset-tree-calc',
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

  // NOTE: 2. Send event for each change of deps
  useLayoutEffect(() => {
    if (isEnabled)
      sendSignalToNewsWorker({
        input: {
          opsEventType: NWService.EClientToWorkerEvent.GET_POINTSET_TREE_CALC,
          rootPoint: deps.rootPoint,
          pointset: deps.pointset,
          statusPack: deps.statusPack,
        }
      })
    else if (isDebugEnabled)
      groupLog({
        namespace: '[usePointsetTreeCalcWorker] by pointset-tree-calc 🚫 DISABLED',
        items: [
          `isEnabled= ${String(isEnabled)}`
        ],
      })
  }, [
    isEnabled,
    isDebugEnabled,
    sendSignalToNewsWorker,
    deps.rootPoint,
    deps.pointset,
    deps.jobTsUpdate,
    deps.statusPack,
  ])
}
