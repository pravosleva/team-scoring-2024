const t0 = performance.now()
const tsT0 = new Date().getTime()
const _perfInfo = {
  tsList: [
    {
      descr: '[w]: Dedicated Worker init',
      p: t0,
      ts: tsT0,
      name: 'Начало загрузки Dedicated Worker',
      // NOTE: Optional
      // data?: { input: { opsEventType: NEvents.EMetrixClientOutgoing.SP_MX_EV; stateValue: string; } } | any;
    },
  ]
}

// NOTE: Socket (1/2)
importScripts('../utils/clsx.js')
importScripts('../utils/gu.js')

importScripts('../utils/string-ops/getRandomString.js')
importScripts('../utils/events/types.js')
importScripts('../utils/events/eValidator.js')
importScripts('../utils/debug/config.js')
importScripts('../utils/debug/log.js')

// NOTE: Socket (2/2)
importScripts('../utils/socket/rootSubscribers.js')
importScripts('../utils/socket/mws/withCustomEmitters.js')
importScripts('../utils/socket/utils/isNewNativeEvent.js')
importScripts('../utils/socket/socket.io-client@4.7.2.min.js')

importScripts('./middlewares/withRootMW.js')

var window = self
// const _isAnyDebugEnabled = Object.values(debugConfig).some((v) => v.isEnabled)
window.io = io

const socket = io.connect(gu(), {
  withCredentials: true,
  extraHeaders: { 'my-custom-header': 'value' },
})

let connectionsCounter = 0
let port // TODO? var ports = new Map()

(async function selfListenersInit({ self }) {
  const t1 = performance.now()
  const tsT1 = new Date().getTime()
  _perfInfo.tsList.push({ descr: '[w]: selfListenersInit', p: t1, ts: tsT1, label: 'Инициализация обработчиков Dedicated Worker' })

  if (debugConfig.swState.isEnabled) log({ label: '⚪ Dedicated Worker loaded...' })

  self.onmessage = (e) => {
    if (!e) return;

    _perfInfo.tsList.push({
      descr: `c->[w:listener]: ${NES.Worker.ENative.MESSAGE}`,
      p: performance.now(),
      ts: new Date().getTime(),
      data: e.data,
      name: 'Dedicated Worker отловил сообщение от клиента',
    })

    // -- NOTE: We can validate all events from client to worker...
    const validationResult = eValidator({
      event: e.data,
      rules: {
        __eType: {
          type: 'string',
          descr: 'Action type',
          isRequired: true,
          validate: (val) => {
            const result = { ok: true }
            switch (true) {
              case typeof val !== 'string':
                result.ok = false
                result.reason = 'Value type should be a string'
                break
              case !val:
                result.ok = false
                result.reason = 'Value type should not be empty'
                break
              case (
                !Object.values(NES.Common.WorkerService).includes(val)
                || !Object.values(NES.Common.ClientService.JobsPager.EClientToWorkerEvent).includes(val)
              ):
                result.ok = false
                result.reason = `Double check the unknown __eType prop of your event. Received value: "${val}" (${typeof val})`
                break
              default:
                break
            }
            return result
          },
        }
      },
    })
    if (!validationResult.ok) {
      if (debugConfig.workerEvs.fromClient.isEnabled) {
        log({
          label: `⛔ Event ${e.__eType} blocked | ${validationResult.reason || 'No reason'}`,
          msgs: [e.input, validationResult],
        })
        self.postMessage({
          __eType: NES.Socket.ECustom.UI_NOTIF,
          message: [
            `[DEBUG] Worker incoming event validate is not Ok`,
            `Reason: ${validationResult?.reason || 'No reason'}`,
            `e.data.input.metrixEventType: ${e.data.input.metrixEventType}`,
            `e.data.input.stateValue: ${e.data.input.stateValue}`,
          ].join('\n'),
          code: 'ui_message_danger',
        })
      }
      return
    } else if (debugConfig.workerEvs.fromClient.isEnabled) {
      self.postMessage({
        __eType: NES.Socket.ECustom.UI_NOTIF,
        message: [
          '[DEBUG] Worker validated',
          `e.data.__eType: ${e.data.__eType}`,
          `e.data.input.metrixEventType: ${e.data.input.metrixEventType}`,
          `e.data.input.stateValue: ${e.data.input.stateValue}`,
        ].join('\n'),
        code: 'ui_message_success',
      })
    }
    // --

    if (debugConfig.workerEvs.fromClient.isEnabled) log({
      label: 'Dedicated Worker received event by client',
      msgs: [e.data],
    })

    switch (e.data.__eType) {
      case NES.Worker.Custom.EType.CLIENT_TO_WORKER_DIE:
        self.close() // NOTE: terminates ...
        break
      case NES.Common.WorkerService.CLIENT_TO_WORKER_RESET_HISTORY:
        const [loadReport] = _perfInfo.tsList
        _perfInfo.tsList = [
          loadReport, {
            descr: 'c->[w]: Dedicated Worker history reset now',
            p: performance.now(),
            ts: new Date().getTime(),
            name: 'Сброс истории Dedicated Worker',
          },
        ]
        self.postMessage({
          __eType: NES.Common.WorkerService.WORKER_TO_CLIENT_RESET_HISTORY_OK,
          data: { tsList: _perfInfo.tsList },
        })
        break
      default: {
        // console.log('[DEBUG] Dedicated Worker: Default case')
        const {
          data: {
            // __eType,
            input,
          }
        } = e

        // console.log(input?.opsEventType)

        if (!!input?.opsEventType) {
          _perfInfo.tsList.push({
            descr: `c->[w:listener:opsEventType]->cb->client: ${input.opsEventType}`,
            p: performance.now(),
            ts: new Date().getTime(),
            data: e.data,
            name: 'Dedicated Worker получил ивент для использования одного из сервисов',
          })

          // -- NOTE: Middlewares section
          // withRootMW({
          //   eventData: e.data,
          //   cb: {
          //     [NES.Common.ClientService.JobsPager.EClientToWorkerEvent.PING_GET]: ({
          //       output,
          //       input,
          //       _service,
          //     }) => {
          //       if (debugConfig.workerEvs.fromClient.isEnabled) log({
          //         label: [
          //           'Dedicated Worker: Вызван обработчик withRootMW',
          //           `cb[${NES.Common.ClientService.JobsPager.EClientToWorkerEvent.PING_GET}]`,
          //         ].join(' -> '),
          //         msgs: [input, output, _service],
          //       })

          //       _perfInfo.tsList.push({
          //         descr: `c->w:listener:opsEventType->[cb]->client: ${input.opsEventType}`,
          //         p: performance.now(),
          //         ts: new Date().getTime(),
          //         data: e.data,
          //         name: 'Dedicated Worker получил результат от своего сервиса',
          //       })

          //       const sendError = () => {
          //         self.postMessage({
          //           __eType: NES.Common.ClientService.JobsPager.EWorkerToClientEvent.PONG_ERR,
          //           data: {
          //             _service: {
          //               tsList: _perfInfo.tsList,
          //               ..._service,
          //             },
          //             output,
          //             input,
          //           },
          //         })
          //       }
          //       const sendData = () => {
          //         self.postMessage({
          //           __eType: NES.Common.ClientService.JobsPager.EWorkerToClientEvent.PONG_OK,
          //           data: {
          //             _service: {
          //               tsList: _perfInfo.tsList,
          //               ..._service,
          //             },
          //             output,
          //             input,
          //           },
          //         })
          //       }

          //       switch (true) {
          //         case output.ok === true:
          //           sendData()
          //           break
          //         default:
          //           sendError()
          //           break
          //       }
          //     }
          //   },
          // })
          // --
          // -- NOTE: Middlewares section
          if (debugConfig.workerEvs.fromClient.isEnabled) {
            self.postMessage({
              __eType: NES.Socket.ECustom.UI_NOTIF,
              message: [
                '[DEBUG] Before withCustomEmitters',
                `Socket state: ${socket.connected ? 'connected' : 'disconnected'}`,
              ].join('\n'),
              code: socket.connected
                ? 'ui_message_default'
                : 'ui_message_warning',
            })
          }
          withCustomEmitters({
            eventData: {
              ...(e.data || {}),
              // specialClientKey: fingerprint.uniqueClientKey,
            },
            socket,
            _cb: ({ eventData, _message }) => {
              const { __eType, ...restData } = eventData
              if (debugConfig.workerEvs.fromClient.isEnabled) {
                self.postMessage({
                  __eType: NES.Socket.ECustom.ONLINE_INCOMING_DATA,
                  message: `[DEBUG] OK: withCustomEmitters _cb: ${_message || 'No _message'} | ${restData.input.metrixEventType} | ${restData.input.stateValue}`,
                  code: 'ui_message_info',
                })
              }
            },
          })
          // --
        } else {
          // console.log('NO !!input?.opsEventType')
          // console.log(input)
          if (debugConfig.workerEvs.fromClient.isEnabled) {
            self.postMessage({
              __eType: NES.Socket.ECustom.UI_NOTIF,
              message: [
                `[DEBUG] Emmiter not called`,
                'NO !!input?.opsEventType',
                // `restData.input.metrixEventType: ${restData.input.metrixEventType}`,
                // `restData.input.stateValue: ${restData.input.stateValue}`,
              ].join('\n'),
              code: 'ui_message_danger',
            })
          }
        }
        break
      }
    }

    // const t1 = performance.now()

    // self.postMessage({ output, perf: t1 - t0, type: e.data.type })
  }

  rootSubscribers({
    socket,
    options: {
      [NES.Socket.ENative.CONNECT]: function () {
        if (isNewNativeEvent({
          newCode: `[sock-nat]: ${NES.Socket.ENative.CONNECT}`,
          prevCode: !!_perfInfo.tsList.length > 1 ? _perfInfo.tsList[_perfInfo.tsList.length - 1].descr : undefined,
        })) _perfInfo.tsList.push({ descr: `[sock-nat]: ${NES.Socket.ENative.CONNECT}`, p: performance.now(), ts: new Date().getTime(), name: 'Socket подключен' })
        if (debugConfig.socketState.isEnabled) log({ label: '🟢 Socket connected', msgs: ['no event'] })
        self.postMessage({ __eType: NES.Socket.ECustom.ONLINE_CONN_OK })
      },
      [NES.Socket.ENative.CONNECT_ERROR]: function (e) {
        if (isNewNativeEvent({
          newCode: `[sock-nat]: ${NES.Socket.ENative.CONNECT_ERROR}`,
          prevCode: !!_perfInfo.tsList.length > 1 ? _perfInfo.tsList[_perfInfo.tsList.length - 1].descr : undefined,
        })) _perfInfo.tsList.push({ descr: `[sock-nat]: ${NES.Socket.ENative.CONNECT_ERROR}`, p: performance.now(), ts: new Date().getTime(), name: 'Socket в ошибке' })
        if (debugConfig.socketState.isEnabled) log({ label: '🔴 Socket connection errored', msgs: [e] })
        self.postMessage({
          __eType: NES.Socket.ECustom.ONLINE_CONN_ERR,

          message: 'Connection error',
          // code: 'ui_message_danger'
        })
      },
      [NES.Socket.ENative.RECONNECT]: function (e) {
        if (isNewNativeEvent({
          newCode: `[sock-nat]: ${NES.Socket.ENative.RECONNECT}`,
          prevCode: !!_perfInfo.tsList.length > 1 ? _perfInfo.tsList[_perfInfo.tsList.length - 1].descr : undefined,
        })) _perfInfo.tsList.push({ descr: `[sock-nat]: ${NES.Socket.ENative.RECONNECT}`, p: performance.now(), ts: new Date().getTime(), name: 'Socket переподключен' })
        if (debugConfig.socketState.isEnabled) log({ label: '🔵 Socket reconnected', msgs: [e] })
        self.postMessage({
          __eType: NES.Socket.ECustom.ONLINE_RECONN,

          // message: 'Reconnect...',
          // code: 'ui_message_danger'
        })
      },
      [NES.Socket.ENative.RECONNECT_ATTEMPT]: function (e) {
        if (isNewNativeEvent({
          newCode: `[sock-nat]: ${NES.Socket.ENative.RECONNECT_ATTEMPT}`,
          prevCode: !!_perfInfo.tsList.length > 1 ? _perfInfo.tsList[_perfInfo.tsList.length - 1].descr : undefined,
        })) _perfInfo.tsList.push({ descr: `[sock-nat]: ${NES.Socket.ENative.RECONNECT_ATTEMPT}`, p: performance.now(), ts: new Date().getTime(), name: 'Socket пытается переподключиться' })
        if (debugConfig.socketState.isEnabled) log({ label: '🟡 Socket trying to reconnect...', msgs: [e] })
        self.postMessage({
          __eType: NES.Socket.ECustom.ONLINE_RECONN,

          message: 'Reconnect...',
          code: 'ui_message_warning'
        })
      },
      [NES.Socket.ENative.DISCONNECT]: function (e) {
        if (isNewNativeEvent({
          newCode: `[sock-nat]: ${NES.Socket.ENative.DISCONNECT}`,
          prevCode: !!_perfInfo.tsList.length > 1 ? _perfInfo.tsList[_perfInfo.tsList.length - 1].descr : undefined,
        })) _perfInfo.tsList.push({
          descr: `[sock-nat]: ${NES.Socket.ENative.DISCONNECT}`,
          p: performance.now(),
          ts: new Date().getTime(),
          name: 'Socket отключен',
        })
        if (debugConfig.socketState.isEnabled) log({ label: '🔴 Socket disconnected', msgs: [e] })
        self.postMessage({ __eType: NES.Socket.ECustom.ONLINE_DISCONN, ...e })
      },
      [NES.Socket.Metrix.EClientIncoming.SP_MX_EV]: function (e) {
        const {
          yourData: {
            _wService,
            ...restYourData
          },
          ...rest
        } = e
        const dataForMemory = {
          yourData: {
            ...restYourData
          },
          ...rest
        }
        _perfInfo.tsList.push({
          descr: `[sock-cus:sp-mx-ev]<-s: ${NES.Socket.Metrix.EClientIncoming.SP_MX_EV}`,
          p: performance.now(),
          ts: new Date().getTime(),
          data: dataForMemory,
          name: 'Socket получил данные',
        })
        if (debugConfig.workerEvs.fromServer.isEnabled) log({ label: '⚡ Socket received response from server', msgs: [e] })
        self.postMessage({ __eType: NES.Socket.ECustom.ONLINE_INCOMING_DATA, ...e })
      },
      // -- NOTE: New report exp
      [NES.Socket.Metrix.EClientIncoming.SP_MX_SERVER_ON_HISTORY_REPORT_ANSWER_OK]: function (e) {
        // const { message, result, yourData } = e
        const dataForMemory = e
        _perfInfo.tsList.push({
          descr: `[sock-cus:sp-rep-res]<-s:ok: ${NES.Socket.Metrix.EClientIncoming.SP_MX_SERVER_ON_HISTORY_REPORT_ANSWER_OK}`,
          p: performance.now(),
          ts: new Date().getTime(),
          data: dataForMemory,
          name: 'Socket получил данные (ok)',
        })
        if (debugConfig.workerEvs.fromServer.isEnabled) log({ label: '⚡ Socket received response from server', msgs: [e] })
        self.postMessage({ __eType: NES.Socket.ECustom.ONLINE_INCOMING_DATA, ...e, code: 'ui_message_success' })
      },
      [NES.Socket.Metrix.EClientIncoming.SP_MX_SERVER_ON_HISTORY_REPORT_ANSWER_ERR]: function (e) {
        // const { message, result, yourData } = e
        const dataForMemory = e
        _perfInfo.tsList.push({
          descr: `[sock-cus:sp-rep-res]<-s:err: ${NES.Socket.Metrix.EClientIncoming.SP_MX_SERVER_ON_HISTORY_REPORT_ANSWER_ERR}`,
          p: performance.now(),
          ts: new Date().getTime(),
          data: dataForMemory,
          name: 'Socket получил данные (err)',
        })
        if (debugConfig.workerEvs.fromServer.isEnabled) log({ label: '⚡ Socket received response from server', msgs: [e] })
        self.postMessage({ __eType: NES.Socket.ECustom.ONLINE_INCOMING_DATA, ...e, code: 'ui_message_danger' })
      },
      // --
      [NES.Socket.ECustom.DONT_RECONNECT]: function (e) {
        const { yourData: { _wService, ...restYourData }, ...rest } = e
        const dataForMemory = { yourData: restYourData, ...rest }
        _perfInfo.tsList.push({
          descr: `[sock-cus:dont-reconn]<-s: ${NES.Socket.ECustom.DONT_RECONNECT}`,
          p: performance.now(),
          ts: new Date().getTime(),
          data: dataForMemory,
          name: 'Socket will not be reconnected',
        })
        if (debugConfig.workerEvs.fromServer.isEnabled) log({ label: '🚫 Socket receive custom decline event from server', msgs: [e] })
        self.postMessage({ __eType: NES.Socket.ECustom.ONLINE_INCOMING_DATA, ...e, code: 'socket_must_die' })
        socket.io.reconnectionAttempts(0)
      },
    },
  })

})({ self })
