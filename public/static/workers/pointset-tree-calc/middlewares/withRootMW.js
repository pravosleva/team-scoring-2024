importScripts('./middlewares/utils/calc.v1.js')

console.log('[LOADED] pointset-tree-calc/middlewares/withRootMW')

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
  withTsTreeLibCalcService,

  // NOTE: You can add your middlewares below...

  /*
  // -- NOTE: For example
  ({ eventData, cb }) => {
    const { __eType, input } = eventData

    if (debugConfig.workerEvs.mwsInternalLogs.isEnabled) log({
      label: 'pointset-tree-calc/middlewares/withRootMW [MW] exp',
      msgs: [
        'eventData:',
        eventData,
      ],
    })

    switch (__eType) {
      case NES.Common.WorkerService.CLIENT_TO_WORKER_MESSAGE: {

        // -- NOTE: Level 2: Different app event types
        switch (eventData?.input.opsEventType) {
          case NES.Common.ClientService.ProjectsTreeCalc.EClientToWorkerEvent.GET_PROJECTS_TREE_CALC: {
            const output = {
              ok: false,
              message: 'Output data not modified',
            }

            try {
              const calc = {}
              output.ok = false
              output.message = 'WIP'
              output.originalResponse = calc

              if (typeof cb[eventData?.input?.opsEventType] === 'function') {
                // console.log(eventData?.input?.opsEventType) // NOTE: c-w:news:get-items
                if (debugConfig.workerEvs.mwsInternalLogs.isEnabled) log({
                  label: `c->(worker):port:listener:opsEventType:${eventData?.input?.opsEventType}->[cb]`,
                  msgs: ['input', input, 'output', output],
                })
    
                cb[eventData.input.opsEventType]({
                  output,
                  input,
                  // _service,
                })
              }
            } catch (err) {
              if (debugConfig.workerEvs.mwsInternalLogs.isEnabled) log({
                label: `c->(worker):port:listener:opsEventType:${eventData?.input?.opsEventType}->[cb]`,
                msgs: ['input', input, 'err', err],
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
          label: `[DBG] UNKNOWN CASE! Проверте __eType! c->(worker):port:listener:opsEventType:${eventData?.input?.opsEventType}->[switch (__eType)]`,
          msgs: [
            `__eType: ${__eType}`,
            'eventData?.input.opsEventType',
            eventData?.input?.opsEventType
          ],
        })
        break
    }
  },
  // --
  */
], arg)
