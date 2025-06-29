// importScripts('../middlewares/withSortedSpeedsCalcService/getWorstCalc.js')
importScripts('./middlewares/withSortedSpeedsCalcService/getWorstCalc.js')

// const delay = (ms = 1000) => new Promise((res, _rej) => {
//   setTimeout(res, ms)
// })
// const isTsActual = ({ limit, ts }) => {
//   const nowTs = new Date().getTime()
//   return nowTs - ts <= limit
// }
// const cache = new Map() // NOTE: nNewsItemId => { ts, data }
// const getNewsItemFromCache = ({ nNewsItemId, tsLimit = 1 * 1000 }) => {
//   const res = {
//     ok: false,
//     data: null,
//   }
//   const personInfo = cache.get(nNewsItemId)
//   if (!!personInfo && !!personInfo.ts && isTsActual({ limit: tsLimit, ts: personInfo.ts })) {
//     res.ok = true
//     res.data = personInfo.data
//   }
//   return res
// }

const withSortedSpeedsCalcService = async ({
  eventData,
  cb,
}) => {
  const {
    __eType,
    input,
  } = eventData

  // if (debugConfig.workerEvs.mwsInternalLogs.isEnabled) log({
  //   label: `[DBG] c->(worker):port:listener:opsEventType:${eventData?.input?.opsEventType}->[before switch (__eType)]`,
  //   msgs: [
  //     `__eType -> ${__eType}`,
  //     `eventData?.input.opsEventType -> ${eventData?.input.opsEventType}`,
  //     `NES.Common.WorkerService.CLIENT_TO_WORKER_MESSAGE -> ${NES.Common.WorkerService.CLIENT_TO_WORKER_MESSAGE}`,
  //   ],
  // })

  // - NOTE: Level 1: Client-Worker events
  switch (__eType) {
    case NES.Common.WorkerService.CLIENT_TO_WORKER_MESSAGE: {
      // -- NOTE: Level 2: Different app event types
      switch (eventData?.input.opsEventType) {
        case NES.Common.ClientService.News.EClientToWorkerEvent.GET_WORST_CALC: {
          // TODO: getCalc
          // console.log(eventData)

          const output = {
            ok: false,
            message: 'Output data not modified',
          }

          try {
            const calc = getWorstCalc({
              theJobList: eventData.input.otherUserJobsForAnalysis,
              ts: {
                testStart: eventData.input.job.forecast.start,
                testDiff: eventData.input.job.forecast.estimate - eventData.input.job.forecast.start,
              },
            })
            output.ok = true
            output.message = 'Calculated'
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
        default: break
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
  // -
}
