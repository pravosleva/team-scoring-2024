// importScripts('./middlewares/for-ts-tree-lib/calc.v4.js')

console.log('[LOADED] online-metrix/middlewares/withRootMW')

const compose = (fns, arg) => {
  return fns.reduce(
    (acc, fn) => {
      fn(arg)
      acc += 1
      return acc
    },
    0
  )
}

const withRootMW = (arg) => compose([
  // NOTE: You can add your middlewares below...

  // - NOTE: For example
  ({ eventData, cb }) => {
    const { __eType, input } = eventData

    if (debugConfig.workerEvs.mwsInternalLogs.isEnabled) log({
      label: 'online-metrix/middlewares/withRootMW [MW] exp',
      msgs: [
        'eventData:',
        eventData,
      ],
    })

    switch (__eType) {
      case NES.Common.WorkerService.CLIENT_TO_WORKER_MESSAGE: {

        // -- NOTE: Level 2: Different app event types
        switch (eventData?.input.opsEventType) {
          case NES.Common.ClientService.JobsPager.EClientToWorkerEvent.PING_GET: {
            const output = {
              ok: false,
              message: 'Output data not modified',
            }

            try {
              // --- NOTE: Your code here

              const calc = {
                _partialInput: {
                  full: eventData?.input,
                },
              }

              // ---
              output.ok = true
              output.message = calc.message // `Random string: ${getRandomString(5)}`
              output.originalResponse = calc

              if (typeof cb[eventData?.input?.opsEventType] === 'function') {
                // console.log(eventData?.input?.opsEventType) // NOTE: c-w:news:get-items
                if (debugConfig.workerEvs.mwsInternalLogs.isEnabled) log({
                  label: `c->(worker):port:listener:opsEventType:${eventData?.input?.opsEventType}->[cb]`,
                  msgs: ['input', input, 'output', output],
                })
              }
            } catch (err) {
              output.ok = false
              output.message = `Worker error: ${err?.message || 'No message'}; online/middlewares/withRootMW`

              if (debugConfig.workerEvs.mwsInternalLogs.isEnabled) log({
                label: `c->(worker):port:listener:opsEventType:${eventData?.input?.opsEventType}->[cb]`,
                msgs: ['input', input, 'err', err],
              })
            } finally {
              cb[eventData.input.opsEventType]({
                output,
                input,
                // _service,
              })
            }

            break
          }
          default:
            console.log('[DEBUG] Default case')
            break
        }
        // --

        break
      }
      default:
        if (debugConfig.workerEvs.mwsInternalLogs.isEnabled) log({
          label: `[DBG] UNKNOWN CASE! Проверьте __eType! c->(worker):port:listener:opsEventType:${eventData?.input?.opsEventType}->[switch (__eType)]`,
          msgs: [
            `__eType: ${__eType}`,
            'eventData?.input.opsEventType',
            eventData?.input?.opsEventType
          ],
        })
        break
    }
  },
  // -
], arg)
