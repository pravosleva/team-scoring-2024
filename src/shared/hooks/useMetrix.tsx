/* eslint-disable @typescript-eslint/no-explicit-any */


import { useLayoutEffect, useCallback } from 'react'
// import { groupLog, EReportType } from '~/utils'
import { wws, NWService } from '~/shared/utils/wws'
// import { NEvents } from '~/types'
import { vi } from '~/shared/utils/vi'
import { subscribeKey } from 'valtio/utils'
// import { EStep } from '../xstate/stepMachine'
// import { useSnapshot } from 'valtio'
import { useProxy } from 'valtio/utils'
// import structuredClone from '@ungap/structured-clone'
import { debugFactory } from '~/shared/utils'
import {
  useSnackbar,
  SnackbarMessage as TSnackbarMessage,
  OptionsObject as IOptionsObject,
  // SharedProps as ISharedProps,
  // closeSnackbar,
} from 'notistack'

type TProps = {
  isDebugEnabled?: boolean;
}

// const isDev = process.env.NODE_ENV === 'development'
// const isLocalProd = import.meta.env.VITE_LOCAL_PROD === '1'
// const isStaging = isDev || isLocalProd
const VITE_GIT_SHA1 = import.meta.env.VITE_GIT_SHA1

type TIncomingData = {
  output?: any;
  // type?: NEvents.ESharedWorkerNative;
  yourData?: { [key: string]: any; };
  code?: NWService.EUIMessage;
  __eType: string;
  message?: string;
  _message?: string;
  result?: {
    isOk: boolean;
    message?: string;
    response: {
      ok: boolean;
      id?: number;
      gRes?: any;
    };
  };
};

const logger = debugFactory<NWService.TDataResult<TIncomingData> | null, { reason: string; } | null>({
  label: 'useMetrix exp',
})

export const useMetrix = ({ isDebugEnabled }: TProps) => {
  // const smViSnap = useSnapshot(vi.smState)
  // const viCommonSnap = useSnapshot(vi.common)
  const devtoolsViProxy = useProxy(vi.common.devtools)
  const { enqueueSnackbar } = useSnackbar()
  const showNotif = useCallback((opts?: IOptionsObject) => (msg: TSnackbarMessage) => {
    if (!document.hidden) enqueueSnackbar(msg, opts)
  }, [enqueueSnackbar])

  const showDefault = useCallback(({ message }: { message: string }) => {
    showNotif({ variant: 'default' })(message)
  }, [showNotif])
  const showError = useCallback(({ message }: { message: string }) => {
    showNotif({ variant: 'error' })(message)
  }, [showNotif])
  const showSuccess = useCallback(({ message }: { message: string }) => {
    showNotif({ variant: 'success' })(message)
  }, [showNotif])
  const showInfo = useCallback(({ message }: { message: string }) => {
    showNotif({ variant: 'info' })(message)
  }, [showNotif])
  const showWarning = useCallback(({ message }: { message: string }) => {
    showNotif({ variant: 'warning' })(message)
  }, [showNotif])

  // NOTE: 1.1 Use wws.subscribeOnData once only!
  useLayoutEffect(() => {
    wws.subscribeOnData<TIncomingData>({
      wName: 'online-metrix',
      cb: (e) => {
        // console.log(e.data?.message)
        if (isDebugEnabled) logger.log({
          label: 'new data (high level subscriber)',
          event: {
            ok: true,
            originalResponse: e.data,
          },
          err: null,
        })

        // groupLog({ namespace: 'new data (high level)', items: [e] })
        switch (e.data.__eType) {
          case NWService.EWorkerToClientEvent.UI_NOTIF:
            // NOTE: Will be handled below
            break
          case NWService.EWorkerToClientEvent.ONLINE_INCOMING_DATA: // NEvents.ECustom.WORKER_TO_CLIENT_REMOTE_DATA:
            if (isDebugEnabled) logger.log({
              label: `✅ (on data) [${e.data.__eType}] e.data:`,
              event: {
                ok: true,
                originalResponse: e.data,
              },
              err: null,
            })

            break
          case NWService.EWorkerToClientEvent.ONLINE_CONN_OK: // NEvents.ECustom.WORKER_TO_CLIENT_CONN:
            devtoolsViProxy.network.socket.__wasThereAFirstConnection = true
            if (!devtoolsViProxy.network.socket.__isConnectionIgnoredForUI) devtoolsViProxy.network.socket.isConnected = true

            if (isDebugEnabled) {
              logger.log({
                label: `🟢 [${e.data.__eType}] e.data:`,
                event: {
                  ok: true,
                  originalResponse: e.data,
                },
                err: null,
              })
              // logger.log({
              //   label: [
              //     `__isConnectionIgnoredForUI: ${String(devtoolsViProxy.network.socket.__isConnectionIgnoredForUI)}`,
              //     devtoolsViProxy.network.socket.__isConnectionIgnoredForUI
              //       ? 'So, this event does not affect the user interface'
              //       : 'So, this event will affect the user interface',
              //   ].join(' '),
              //   event: {
              //     ok: true,
              //     originalResponse: e.data,
              //   },
              //   err: null,
              // })
            }
            break
          case NWService.EWorkerToClientEvent.ONLINE_CONN_ERR: // NEvents.ECustom.WORKER_TO_CLIENT_CONNN_ERR:
          case NWService.EWorkerToClientEvent.ONLINE_DISCONN: // NEvents.ECustom.WORKER_TO_CLIENT_DISCONN:
            if (!devtoolsViProxy.network.socket.__isConnectionIgnoredForUI) devtoolsViProxy.network.socket.isConnected = false

            if (isDebugEnabled) {
              logger.log({
                label: `🔴 [${e.data.__eType}] e.data:`,
                event: {
                  ok: true,
                  originalResponse: e.data,
                },
                err: null,
              })
              logger.log({
                label: [
                  e.data,
                  `__isConnectionIgnoredForUI: ${String(devtoolsViProxy.network.socket.__isConnectionIgnoredForUI)}`,
                  devtoolsViProxy.network.socket.__isConnectionIgnoredForUI
                    ? 'So, this event does not affect the user interface'
                    : 'So, this event will affect the user interface',
                ].join(' '),
                event: {
                  ok: true,
                  originalResponse: e.data,
                },
                err: null,
              })
            }
            break
          default: {
            if (isDebugEnabled) {
              logger.log({
                label: `⚠️ (on data) Необработанное событие! [${e.data.__eType}] e.data:`,
                event: {
                  ok: true,
                  originalResponse: e.data,
                },
                err: null,
              })
            }
            break
          }
        }

        // -- NOTE: App logic exp
        switch (true) {
          case e.data?.code === NWService.EUIMessage.DEFAULT: // NEvents.EWorkerToClientEventCode.UI_MESSAGE_DANGER:
            showDefault({ message: (isDebugEnabled ? (e.data?._message || e.data?.message) : e.data?.message) || 'UI Message event code: default (no message)' })
            break
          case e.data?.code === NWService.EUIMessage.DANGER: // NEvents.EWorkerToClientEventCode.UI_MESSAGE_DANGER:
            showError({ message: (isDebugEnabled ? (e.data?._message || e.data?.message) : e.data?.message) || 'UI Message event code: danger (no message)' })
            break
          case e.data?.code === NWService.EUIMessage.SUCCESS: // NEvents.EWorkerToClientEventCode.UI_MESSAGE_SUCCESS:
            // console.log(e.data?.message)
            showSuccess({ message: (isDebugEnabled ? (e.data?._message || e.data?.message) : e.data?.message) || 'UI Message event code: success (no message)' })
            break
          case e.data?.code === NWService.EUIMessage.INFO: // NEvents.EWorkerToClientEventCode.UI_MESSAGE_INFO:
            showInfo({ message: (isDebugEnabled ? (e.data?._message || e.data?.message) : e.data?.message) || 'UI message event code: info (no message)' })
            break
          case e.data?.code === NWService.EUIMessage.WARNING: // NEvents.EWorkerToClientEventCode.UI_MESSAGE_INFO:
            showWarning({ message: (isDebugEnabled ? (e.data?._message || e.data?.message) : e.data?.message) || 'UI message event code: info (no message)' })
            break
          case e.data?.code === NWService.EUIMessage.SOCKET_MUST_DIE: // NEvents.EWorkerToClientEventCode.SOCKET_MUST_DIE:
            devtoolsViProxy.network.isReportsByUserDisabled = true
            if (isDebugEnabled) showInfo({ message: (isDebugEnabled ? (e.data?._message || e.data?.message) : e.data?.message) || 'UI message event code: socket_must_die (no message)' })
            break
          default:
            console.log('UNKNOWN_')
            break
        }
        // --
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
    //   wName: 'online-metrix',
    //   cb: (e: any) => { groupLog({ namespace: e.type, items: [ e.data ] }) },
    // })
    // --

    wws.subscribeOnErr({
      wName: 'online-metrix',
      cb: (e: any) => {
        if (isDebugEnabled) {
          logger.log({
            label: `🚫 OnErr event:`,
            event: {
              ok: true,
              originalResponse: e,
            },
            err: null,
          })
        }
      },
    })

    return () => {
      const wList = ['online-metrix']
      for (const wName of wList) {
        wws.terminate({
          wName,
          cb: (e: any) => {
            if (isDebugEnabled) {
              logger.log({
                label: `🚫 die [${wName}]`,
                event: {
                  ok: true,
                  originalResponse: e,
                },
                err: null,
              })
            }
          },
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDebugEnabled])

  const sendSnapshotToWorker = useCallback(({
    input,
  }: {
    input: {
      opsEventType: NWService.EClientToWorkerEvent,
      metrixEventType: any;
      stateValue: string;
      // tradeinId: number | null;
      uniquePageLoadKey: string;
      uniqueUserDataLoadKey: string;
      gitSHA1: string;
    }
  }) => {
    // - TODO: Custom input data for the particular stateValue
    const customData: {
      // imei?: string;
      stepDetails?: any;
      reportType?: NWService.EReportType;
    } = {
      // imei: smViSnap.imei.value,
    }
    customData.stepDetails = {
      dataSample: {
        x: 1
      },
    }
    customData.reportType = NWService.EReportType.ERROR
    // -
    wws.post<{
      input: {
        ts: number;
        room: string;
        metrixEventType: NWService.EMetrixClientOutgoing, // NEvents.EMetrixClientOutgoing;
        reportType: NWService.EReportType;
        stateValue: string;
        app: {
          name: string;
          version: string;
        };
        stepDetails?: {
          [key: string]: any;
        };
      }
    }>({
      wName: 'online-metrix',
      eType: NWService.EClientToWorkerEvent.MESSAGE, // NEvents.ECustom.CLIENT_TO_WORKER_MESSAGE,
      data: {
        input: {
          ts: new Date().getTime(),
          room: 'FOR_EXAMPLE',
          reportType: NWService.EReportType.DEFAULT,
          app: {
            name: vi.common.app.name,
            version: vi.common.app.version,
          },
          ...input,
          ...customData,
        },
      },
    })
  }, [
    // viCommonSnap.stateValue,
    // smViSnap.initApp.response,
    // smViSnap.initApp.result,
    // smViSnap.appMode.currentMode,
    // smViSnap.appMode2.currentMode,
    // smViSnap.imei.response,
    // smViSnap.imei.result,
    // smViSnap.imei.value,
    // smViSnap.checkPhone.response,
    // smViSnap.checkByEmployee.form.state,
    // smViSnap.checkDeviceCharge.form.state,
    // smViSnap.checkFMIP.response,
    // smViSnap.checkFMIP.result,
    // devtoolsViProxy.network,
  ])

  // NOTE: 2. Send event for each change
  useLayoutEffect(() => {
    // NOTE: See also https://valtio.pmnd.rs/docs/api/utils/subscribeKey
    // Subscribe to all changes to the state proxy (and its child proxies)
    const unsubscribe = subscribeKey(vi.common, 'stateValue', (val) => {
      if (typeof val === 'string') {
        sendSnapshotToWorker({
          input: {
            opsEventType: NWService.EClientToWorkerEvent.EXPERIMENTAL_PING,
            metrixEventType: NWService.EMetrixClientOutgoing.EXPERIMENTAL_METRIX_PING, // NEvents.EMetrixClientOutgoing.SP_MX_EV,

            stateValue: val,
            // tradeinId: vi.smState.imei.response?.id || 0,
            uniquePageLoadKey: vi.uniquePageLoadKey,
            uniqueUserDataLoadKey: vi.uniqueUserDataLoadKey,
            gitSHA1: VITE_GIT_SHA1,
          }
        })
      }
    })
    return () => {
      // Unsubscribe by calling the result
      unsubscribe()
    }
  }, [isDebugEnabled, sendSnapshotToWorker])
}
