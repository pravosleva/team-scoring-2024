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

importScripts('../utils/string-ops/getRandomString.js')
importScripts('../utils/events/types.js')
importScripts('../utils/events/eValidator.js')
importScripts('../utils/debug/config.js')
importScripts('../utils/debug/log.js')
// importScripts('../utils/fetchRetry.js')
importScripts('./middlewares/withRootMW.js')

var window = self;

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
                || !Object.values(NES.Common.ClientService.Experimental.EClientToWorkerEvent).includes(val)
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
          withRootMW({
            eventData: e.data,
            cb: {
              [NES.Common.ClientService.Experimental.EClientToWorkerEvent.PING]: ({
                output,
                input,
                _service,
              }) => {
                if (debugConfig.workerEvs.fromClient.isEnabled) log({
                  label: [
                    'Dedicated Worker: Вызван обработчик withRootMW',
                    `cb[${NES.Common.ClientService.Experimental.EClientToWorkerEvent.PING}]`,
                  ].join(' -> '),
                  msgs: [input, output, _service],
                })

                _perfInfo.tsList.push({
                  descr: `c->w:listener:opsEventType->[cb]->client: ${input.opsEventType}`,
                  p: performance.now(),
                  ts: new Date().getTime(),
                  data: e.data,
                  name: 'Dedicated Worker получил результат от своего сервиса',
                })

                const sendError = () => {
                  self.postMessage({
                    __eType: NES.Common.ClientService.Experimental.EWorkerToClientEvent.PONG_ERR,
                    data: {
                      _service: {
                        tsList: _perfInfo.tsList,
                        ..._service,
                      },
                      output,
                      input,
                    },
                  })
                }
                const sendData = () => {
                  self.postMessage({
                    __eType: NES.Common.ClientService.Experimental.EWorkerToClientEvent.PONG_OK,
                    data: {
                      _service: {
                        tsList: _perfInfo.tsList,
                        ..._service,
                      },
                      output,
                      input,
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

    // const t1 = performance.now()

    // self.postMessage({ output, perf: t1 - t0, type: e.data.type })
  }

})({ self })
