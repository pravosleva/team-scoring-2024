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

importScripts('../utils/events/types.js')
importScripts('../utils/events/eValidator.js')
importScripts('../utils/debug/config.js')
importScripts('../utils/debug/log.js')
// importScripts('../utils/fetchRetry.js')
importScripts('./middlewares/withRootMW.js')

var window = self
let connectionsCounter = 0
let port // TODO? var ports = new Map()

(async function selfListenersInit({ self }) {
  const t1 = performance.now()
  const tsT1 = new Date().getTime()
  _perfInfo.tsList.push({ descr: '[sw]: selfListenersInit', p: t1, ts: tsT1, label: 'Инициализация обработчиков Shared Worker' })

  if (debugConfig.swState.isEnabled) log({ label: '⚪ Shared Worker loaded...' })

  self.addEventListener(NES.SharedWorker.Native.ESelf.CONNECT, function(e) {
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
  
    port.addEventListener(NES.SharedWorker.Native.EPort.MESSAGE, function(e) {
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
                  || !Object.values(NES.Common.ClientService.ProjectsTreeCalc.EClientToWorkerEvent).includes(val)
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
        if (debugConfig.workerEvs.fromClient.isEnabled) log({
          label: `⛔ Event ${e.__eType} blocked | ${validationResult.reason || 'No reason'}`,
          msgs: [e.input, validationResult],
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
            withRootMW({
              eventData: e.data,
              cb: {
                [NES.Common.ClientService.ProjectsTreeCalc.EClientToWorkerEvent.GET_PROJECTS_TREE_CALC]: ({
                  output,
                  input,
                  _service,
                }) => {
                  // console.log('Shared Worker -> withRootMW -> cb', NES.Common.ClientService.ProjectsTreeCalc.EClientToWorkerEvent.GET_NEWS)
                  _perfInfo.tsList.push({
                    descr: `c->sw:listener:opsEventType->[cb]->client: ${input.opsEventType}`,
                    p: performance.now(),
                    ts: new Date().getTime(),
                    data: e.data,
                    name: 'Shared Worker получил результат от своего сервиса',
                  })

                  const sendError = () => {
                    port.postMessage({
                      __eType: NES.Common.ClientService.ProjectsTreeCalc.EWorkerToClientEvent.PROJECTS_TREE_CALC_ERR,
                      data: {
                        output,
                        input,
                        _service: {
                          tsList: _perfInfo.tsList,
                          ..._service,
                        },
                      },
                    })
                  }
                  const sendData = () => {
                    port.postMessage({
                      __eType: NES.Common.ClientService.ProjectsTreeCalc.EWorkerToClientEvent.PROJECTS_TREE_CALC_OK,
                      data: {
                        output,
                        input,
                        _service: {
                          tsList: _perfInfo.tsList,
                          ..._service,
                        },
                      },
                    })
                  }

                  switch (true) {
                    case output.ok === true:
                      sendData()
                      break
                    default:
                      sendError()
                      break
                  }
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
  self.addEventListener(NES.SharedWorker.Native.ESelf.ERROR, function(e) {
    _perfInfo.tsList.push({
      descr: `[sw:err]: ${e?.data?.message || 'No e.data.message'}`,
      p: performance.now(),
      ts: new Date().getTime(),
      data: { ...e },
      name: `Shared Worker отхватил ошибку: ${e?.data?.message || 'No e.data.message'}`,
    })
    log({ label: 'error in Shared Worker', msgs: [e.data] })
  })
})({ self })
