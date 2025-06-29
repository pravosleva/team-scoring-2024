import { useLayoutEffect, useCallback } from 'react'
import { groupLog, wws } from '~/shared/utils'
import { NWService } from '~/shared/utils/wws/types'
// import { TNewsItemDetails } from '~/common/store/reducers/newsSlice'
// import { NSWorstCalc } from '~/shared/utils/team-scoring'
import { TJob } from '~/shared/xstate'
import { TreeNode } from 'ts-tree-lib'
import pkg from '../../../../../../../package.json'

// const BASE_API_URL = import.meta.env.VITE_BASE_API_URL

type TDeps = {
  job?: TJob;
  jobs: TJob[];
}
type TProps = {
  isEnabled: boolean;
  isDebugEnabled?: boolean;
  deps: TDeps;
  cb?: {
    beforeStart?: () => void;
    onEachSuccessItemData: (data: NWService.TDataResult<TreeNode<TJob>>) => void;
    onFinalError: (ps: { id: number; reason: string }) => void;
  };
}

export const useProjectsTreeCalcWorker = ({ isEnabled, isDebugEnabled, deps, cb }: TProps) => {
  // NOTE: 1.1 Use wws.subscribeOnData once only!
  useLayoutEffect(() => {
    if (typeof cb?.beforeStart === 'function') cb.beforeStart()

    // wws.reInitWorker({ wName: 'projects-tree-calc', ifNecessaryOnly: true })
    wws.subscribeOnData<{
      __eType: NWService.EWorkerToClientEvent;
      data: {
        type: NWService.EWorkerToClientEvent;
        output: NWService.TDataResult<TreeNode<TJob>>;
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
      wName: 'projects-tree-calc',
      cb: (e) => {
        switch (true) {
          // case wws.activeIncomingChannels.projects-tree-calc !== e.data.data.input.dataPackKey:
          //   if (isDebugEnabled) groupLog({
          //     namespace: `[useProjectsTreeCalcWorker] Ignore dataPackKey: ${e.data.data.input.dataPackKey}, current: ${wws.activeIncomingChannels.projects-tree-calc} [${e.data.__eType}]`,
          //     items: ['e.data.data.input', e.data.data.input, 'e.data.data.output', e.data.data.output],
          //   })
          //   return
          default:
            switch (e.data.__eType) {
              case NWService.EWorkerToClientEvent.PROJECTS_TREE_CALC_OK:
                if (isDebugEnabled) groupLog({
                  namespace: `[useProjectsTreeCalcWorker] by projects-tree-calc (on data #1) [${e.data.__eType}]`,
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
              case NWService.EWorkerToClientEvent.PROJECTS_TREE_CALC_ERR:
                if (
                  typeof cb?.onFinalError === 'function'
                  && !!e.data.data.output.originalResponse
                ) cb?.onFinalError({ id: e.data.data._service.id, reason: e.data.data.output.message || 'No output.message' })
                break
              default: {
                if (isDebugEnabled) groupLog({
                  namespace: `[useProjectsTreeCalcWorker] by projects-tree-calc ⚠️ (on data) UNHANDLED! [${e.data.__eType}]`,
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
    //   wName: 'projects-tree-calc',
    //   cb: (e: any) => { groupLog({ namespace: e.type, items: [ e.data ] }) },
    // })
    // --

    wws.subscribeOnErr<{
      message?: string;
    }>({
      wName: 'projects-tree-calc',
      cb: (e: MessageEvent<{
        message?: string;
      }>) => {
        if (isDebugEnabled) groupLog({
          namespace: '[useProjectsTreeCalcWorker] by projects-tree-calc 🚫 OnErr e:',
          items: [e],
        })
      },
    })

    // return () => {
    //   const wList = ['projects-tree-calc']
    //   for (const wName of wList) {
    //     wws.terminate({
    //       wName,
    //       cb: () => {
    //         if (isDebugEnabled) groupLog({ namespace: `[useProjectsTreeCalcWorker] by projects-tree-calc 🚫 die [${wName}]`, items: [] })
    //       },
    //     })
    //   }
    // }
  }, [isDebugEnabled, deps.job, cb, deps.jobs])

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
      wName: 'projects-tree-calc',
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
          opsEventType: NWService.EClientToWorkerEvent.GET_PROJECTS_TREE_CALC,
          job: deps.job,
          jobs: deps.jobs,
        }
      })
    else if (isDebugEnabled)
      groupLog({
        namespace: '[useProjectsTreeCalcWorker] by projects-tree-calc 🚫 DISABLED',
        items: [
          `isEnabled= ${String(isEnabled)}`
        ],
      })
  }, [
    isEnabled,
    isDebugEnabled,
    sendSignalToNewsWorker,
    deps.job,
    deps.job?.ts.update,
    deps.jobs,
  ])
}
