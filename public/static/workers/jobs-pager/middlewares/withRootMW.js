// importScripts('./middlewares/for-ts-tree-lib/calc.v4.js')

console.log('[LOADED] jobs-pager/middlewares/withRootMW')

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
      label: 'jobs-pager/middlewares/withRootMW [MW] exp',
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
              // const getMinimalData = (job) => ({
              //   id: job.id,
              //   ts: job.ts,
              // })
              // const modifiedJobs = eventData?.input?.jobs?.map(getMinimalData) || []
              // console.log(eventData?.input?._activeFilters)
              // console.log(eventData?.input?.jobs)
              const isFiltersRequired = !!eventData?.input?._activeFilters && eventData.input._activeFilters.isAnyFilterActive
              // console.log(`isFiltersRequired=${isFiltersRequired}`)
              const filteredJobs = isFiltersRequired
                ? getFilteredJobs({ jobs: eventData?.input?.jobs || [], activeFilters: eventData?.input?._activeFilters })
                : (eventData?.input?.jobs || [])
              // console.log(filteredJobs)
              const targetJobIndex = getBinarySearchedIndexByDotNotation({
                items: filteredJobs,
                sorted: 'DESC',
                target: {
                  value: eventData?.input?.activeJobId,
                  propPath: 'ts.create',
                },
              })
              const _pagerCalc = getSplittedArrayAsPager({
                pageLimit: 10,
                list: filteredJobs,
                options: {
                  // NOTE: One of two options (requiredPage in main priority)
                  requiredPageIndex: eventData?.input?.requiredPage >= 1 ? eventData?.input?.requiredPage - 1 : undefined,
                  requiredCurrentIndex: targetJobIndex === -1 ? 0 : targetJobIndex,
                  // First page by default
                },
              })
              const pagerData = _pagerCalc.result

              const calc = {
                binarySearchedIndex: targetJobIndex,
                // splitTest: pagerData.pager,
                pagination: pagerData.pagination,
                currentPage: pagerData.currentPage,
                nextPage: pagerData.nextPage,
                prevPage: pagerData.prevPage,
                message: [
                  _pagerCalc.message,
                  _pagerCalc.logs.join('\n')
                ].join('\n'),
                _partialInput: {
                  _activeFilters: eventData?.input?._activeFilters,
                  /* NOTE: Example
                    {
                      "isAnyFilterActive": false,
                      "jobStatusFilter": false,
                      "assignedTo": false,
                      "estimateReached": false,
                      "isProject": false,
                      "values": {
                        "isProject": null,
                        "jobStatusFilter": null,
                        "assignedTo": null,
                        "estimateReached": null,
                        "isNew": null
                      }
                    }
                  */

                  // requiredPage: eventData?.input?.requiredPage,
                  // jobsLen: eventData?.input?.jobs?.length,
                  // jobsMinimalData: eventData?.input?.jobs?.map(getMinimalData),
                  // targetJobId: eventData?.input?.activeJobId
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
              output.message = `Worker error: ${err?.message || 'No message'}; jobs-pager/middlewares/withRootMW`

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
