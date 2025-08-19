const t0 = performance.now()
const tsT0 = new Date().getTime()
const _perfInfo = {
  tsList: [
    {
      descr: '[sw]: Shared Worker init',
      p: t0,
      ts: tsT0,
      name: 'Начало загрузки Shared Worker',
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
// importScripts('../utils/object-ops/getNestedValue.js')
// importScripts('../utils/array-ops/getSplittedArrayAsPager.js')
// importScripts('../utils/array-ops/search/getBinarySearchedIndexByDotNotation.js')
// importScripts('../utils/array-ops/taro-special-tools/getFilteredJobs.js')
// importScripts('../utils/fetchRetry.js')
importScripts('./middlewares/withRootMW.js')

// NOTE: Socket (2/2)
importScripts('../utils/socket/rootSubscribers.js')
importScripts('../utils/socket/mws/withCustomEmitters.js')
importScripts('../utils/socket/utils/isNewNativeEvent.js')
importScripts('../utils/socket/socket.io-client@4.7.2.min.js')

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
  _perfInfo.tsList.push({ descr: '[sw]: selfListenersInit', p: t1, ts: tsT1, label: 'Инициализация обработчиков Shared Worker' })

  if (debugConfig.swState.isEnabled) log({ label: '⚪ Shared Worker loaded...' })

  self.addEventListener(NES.SharedWorker.Native.ESelf.CONNECT, function (e) {
    _perfInfo.tsList.push({
      descr: `[sw:listener] self listener: ${NES.SharedWorker.Native.ESelf.CONNECT}`,
      p: performance.now(),
      ts: new Date().getTime(),
      name: 'Shared Worker подключен к клиенту',
    })
    if (debugConfig.swState.isEnabled) log({ label: '🟡 Client connected to Shared Worker' })
    // port = e.ports[0] // NOTE: or port = e.source
    port = e.source
    connectionsCounter++

    port.addEventListener(NES.SharedWorker.Native.EPort.MESSAGE, function (e) {
      // const isNew = _perfInfo.tsList[_perfInfo.tsList.length - 1].descr === e.data.
      // if () 
      _perfInfo.tsList.push({
        descr: `c->[sw:listener]: ${NES.SharedWorker.Native.EPort.MESSAGE}`,
        p: performance.now(),
        ts: new Date().getTime(),
        data: e.data,
        name: 'Порт отловил сообщение от клиента',
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
          port.postMessage({
            __eType: NES.Socket.ECustom.UI_NOTIF,
            message: `[DEBUG] Shared Worker incoming event validate is not Ok: ${validationResult?.reason || 'No reason'}\ne.data.input.metrixEventType: ${e.data.input.metrixEventType}\ne.data.input.stateValue: ${e.data.input.stateValue}`,
            code: 'ui_message_danger',
          })
        } else
          if (debugConfig.workerEvs.fromClient.isEnabled) port.postMessage({
            __eType: NES.Socket.ECustom.UI_NOTIF,
            message: `[DEBUG] Shared Worker validated\n__eType event: ${e.data.__eType}\ne.data.input.metrixEventType: ${e.data.input.metrixEventType}\ne.data.input.stateValue: ${e.data.input.stateValue}`,
            code: 'ui_message_success',
          })
        return
      }
      // --

      if (debugConfig.workerEvs.fromClient.isEnabled) log({
        label: 'Shared Worker received message: evt by client',
        msgs: [e.data],
      })

      switch (e.data.__eType) {
        case NES.SharedWorker.Custom.EType.CLIENT_TO_WORKER_DIE:
          self.close() // NOTE: terminates ...
          break
        case NES.Common.WorkerService.CLIENT_TO_WORKER_RESET_HISTORY:
          const [loadReport] = _perfInfo.tsList
          _perfInfo.tsList = [
            loadReport, {
              descr: 'c->[sw]: Shared Worker history reset',
              p: performance.now(),
              ts: new Date().getTime(),
              name: 'Сброс истории Shared Worker',
            },
          ]
          port.postMessage({ __eType: NES.Common.WorkerService.WORKER_TO_CLIENT_RESET_HISTORY_OK, data: { tsList: _perfInfo.tsList } })
          break
        default: {
          const {
            data: {
              // __eType,
              input,
            }
          } = e

          if (!!input?.opsEventType) {
            _perfInfo.tsList.push({
              descr: `c->[sw:listener:opsEventType]->s: ${input.opsEventType}`,
              p: performance.now(),
              ts: new Date().getTime(),
              data: e.data,
              name: 'Shared Worker Получил ивент мертики для использования одного из сервисов',
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
            //       _perfInfo.tsList.push({
            //         descr: `c->sw:listener:opsEventType->[cb]->client: ${input.opsEventType}`,
            //         p: performance.now(),
            //         ts: new Date().getTime(),
            //         data: e.data,
            //         name: 'Shared Worker получил результат от своего сервиса',
            //       })

            //       const sendError = () => {
            //         port.postMessage({
            //           __eType: NES.Common.ClientService.JobsPager.EWorkerToClientEvent.PONG_ERR,
            //           data: {
            //             output,
            //             input,
            //             _service: {
            //               tsList: _perfInfo.tsList,
            //               ..._service,
            //             },
            //           },
            //         })
            //       }
            //       const sendData = () => {
            //         port.postMessage({
            //           __eType: NES.Common.ClientService.JobsPager.EWorkerToClientEvent.PONG_OK,
            //           data: {
            //             output,
            //             input,
            //             _service: {
            //               tsList: _perfInfo.tsList,
            //               ..._service,
            //             },
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
                  port.postMessage({
                    __eType: NES.Socket.ECustom.ONLINE_INCOMING_DATA,
                    message: `[DEBUG] OK: withCustomEmitters _cb: ${_message || 'No _message'} | ${restData.input.metrixEventType} | ${restData.input.stateValue}`,
                    code: 'ui_message_info',
                  })
                }
              },
            })
            // --
          }
          break
        }
      }
    }, false)

    port.start()
    // NOTE: https://developer.mozilla.org/ru/docs/Web/API/SharedWorker
    // необходимо при добавлении обработчиков с помощью addEventListener.
    // При использовании сеттера port.onmessage, данный метод вызывается автоматически, неявно
  }, false)
  self.addEventListener(NES.SharedWorker.Native.ESelf.ERROR, function (e) {
    _perfInfo.tsList.push({
      descr: `[sw:err]: ${e?.data?.message || 'No e.data.message'}`,
      p: performance.now(),
      ts: new Date().getTime(),
      data: { ...e },
      name: `Shared Worker отхватил ошибку: ${e?.data?.message || 'No e.data.message'}`,
    })
    log({ label: 'error in Shared Worker', msgs: [e.data] })
  })
  rootSubscribers({
    socket,
    options: {
      [NES.Socket.ENative.CONNECT]: function () {
        if (isNewNativeEvent({
          newCode: `[sock-nat]: ${NES.Socket.ENative.CONNECT}`,
          prevCode: !!_perfInfo.tsList.length > 1 ? _perfInfo.tsList[_perfInfo.tsList.length - 1].descr : undefined,
        })) _perfInfo.tsList.push({ descr: `[sock-nat]: ${NES.Socket.ENative.CONNECT}`, p: performance.now(), ts: new Date().getTime(), name: 'Socket подключен' })
        if (debugConfig.socketState.isEnabled) log({ label: '🟢 Socket connected', msgs: ['no event', debugConfig] })
        port.postMessage({ __eType: NES.Socket.ECustom.ONLINE_CONN_OK })
      },
      [NES.Socket.ENative.CONNECT_ERROR]: function (e) {
        if (isNewNativeEvent({
          newCode: `[sock-nat]: ${NES.Socket.ENative.CONNECT_ERROR}`,
          prevCode: !!_perfInfo.tsList.length > 1 ? _perfInfo.tsList[_perfInfo.tsList.length - 1].descr : undefined,
        })) _perfInfo.tsList.push({ descr: `[sock-nat]: ${NES.Socket.ENative.CONNECT_ERROR}`, p: performance.now(), ts: new Date().getTime(), name: 'Socket в ошибке' })
        if (debugConfig.socketState.isEnabled) log({ label: '🔴 Socket connection errored', msgs: [e] })
        port.postMessage({ __eType: NES.Socket.ECustom.ONLINE_CONN_ERR })
      },
      [NES.Socket.ENative.RECONNECT]: function (e) {
        if (isNewNativeEvent({
          newCode: `[sock-nat]: ${NES.Socket.ENative.RECONNECT}`,
          prevCode: !!_perfInfo.tsList.length > 1 ? _perfInfo.tsList[_perfInfo.tsList.length - 1].descr : undefined,
        })) _perfInfo.tsList.push({ descr: `[sock-nat]: ${NES.Socket.ENative.RECONNECT}`, p: performance.now(), ts: new Date().getTime(), name: 'Socket переподключен' })
        if (debugConfig.socketState.isEnabled) log({ label: '🔵 Socket reconnected', msgs: [e] })
        port.postMessage({ __eType: NES.Socket.ECustom.ONLINE_RECONN })
      },
      [NES.Socket.ENative.RECONNECT_ATTEMPT]: function (e) {
        if (isNewNativeEvent({
          newCode: `[sock-nat]: ${NES.Socket.ENative.RECONNECT_ATTEMPT}`,
          prevCode: !!_perfInfo.tsList.length > 1 ? _perfInfo.tsList[_perfInfo.tsList.length - 1].descr : undefined,
        })) _perfInfo.tsList.push({ descr: `[sock-nat]: ${NES.Socket.ENative.RECONNECT_ATTEMPT}`, p: performance.now(), ts: new Date().getTime(), name: 'Socket пытается переподключиться' })
        if (debugConfig.socketState.isEnabled) log({ label: '🟡 Socket trying to reconnect...', msgs: [e] })
        port.postMessage({ __eType: NES.Socket.ECustom.ONLINE_RECONN })
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
        port.postMessage({ __eType: NES.Socket.ECustom.ONLINE_DISCONN, ...e, })
      },
      // [NES.Socket.Metrix.EClientIncoming.LAB_TEST]: function (e) {
      //   _perfInfo.tsList.push({
      //     descr: `[sock-cus]<-s: ${NES.Socket.Metrix.EClientIncoming.LAB_TEST}`,
      //     p: performance.now(),
      //     ts: new Date().getTime(),
      //     data: { ...e },
      //     name: 'Socket получил данные',
      //   })
      //   if (debugConfig.workerEvs.fromServer.isEnabled) log({ label: '⚡ Socket received response by server', msgs: [e] })
      //   port.postMessage({ __eType: NES.Socket.ECustom.ONLINE_INCOMING_DATA, ...e })
      // },
      [NES.Socket.Metrix.EClientIncoming.SP_MX_EV]: function (e) {
        const { yourData: { _wService, ...restYourData }, ...rest } = e
        const dataForMemory = { yourData: restYourData, ...rest }
        _perfInfo.tsList.push({
          descr: `[sock-cus:sp-mx-ev]<-s: ${NES.Socket.Metrix.EClientIncoming.SP_MX_EV}`,
          p: performance.now(),
          ts: new Date().getTime(),
          data: dataForMemory,
          name: 'Socket получил данные',
        })
        if (debugConfig.workerEvs.fromServer.isEnabled) log({ label: '⚡ Socket receive sp-mx event from server', msgs: [e] })
        port.postMessage({ __eType: NES.Socket.ECustom.ONLINE_INCOMING_DATA, ...e })
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
        if (debugConfig.workerEvs.fromServer.isEnabled) log({ label: '⚡ Socket receive sp-mx event from server', msgs: [e] })
        port.postMessage({ __eType: NES.Socket.ECustom.ONLINE_INCOMING_DATA, ...e, code: 'ui_message_success' })
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
        if (debugConfig.workerEvs.fromServer.isEnabled) log({ label: '⚡ Socket receive sp-mx event from server', msgs: [e] })
        port.postMessage({ __eType: NES.Socket.ECustom.ONLINE_INCOMING_DATA, ...e, code: 'ui_message_danger' })
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
        port.postMessage({ __eType: NES.Socket.ECustom.ONLINE_INCOMING_DATA, ...e, code: 'socket_must_die' })
        socket.io.reconnectionAttempts(0)
      },
    },
  })
})({ self })
