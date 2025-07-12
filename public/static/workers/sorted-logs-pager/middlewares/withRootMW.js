// importScripts('./middlewares/for-ts-tree-lib/calc.v4.js')

console.log('[LOADED] sorted-logs-pager/middlewares/withRootMW')

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

    // if (debugConfig.workerEvs.mwsInternalLogs.isEnabled) log({
    //   label: 'sorted-logs-pager/middlewares/withRootMW [MW] exp',
    //   msgs: [
    //     'eventData:',
    //     eventData,
    //   ],
    // })

    switch (__eType) {
      case NES.Common.WorkerService.CLIENT_TO_WORKER_MESSAGE: {

        // -- NOTE: Level 2: Different app event types
        switch (eventData?.input.opsEventType) {
          case NES.Common.ClientService.SortedLogsPager.EClientToWorkerEvent.PING_GET: {
            const output = {
              ok: false,
              message: 'Output data not modified',
            }

            try {
              const isFiltersRequired = !!eventData?.input?._activeFilters && eventData.input._activeFilters.isAnyFilterActive
              const filteredJobs = isFiltersRequired
                ? getFilteredJobs({
                  jobs: eventData?.input?.jobs || [],
                  activeFilters: eventData?.input?._activeFilters,
                })
                : { items: (eventData?.input?.jobs || []) }
              // const sortedJobs = getSortedArray({
              //   arr: filteredJobs.items.map((job) => ({ ...job, tsUpdate: job.ts.update })),
              //   keys: ['tsUpdate'],
              //   order: -1,
              // })
              const sortedLogs = getSortedArray({
                arr: filteredJobs.items.reduce((
                  logsAcc, // (TLogsItem & { jobId: number; jobTitle: string; logBorder: TLogBorder; logBg: TLogBg; jobType: TJobType; logUniqueKey: string; jobTsUpdate: number })[],
                  curJob, // TJob
                ) => {
                  let jobType = 'default' // TJobType
                  // NOTE: 1. Job type
                  switch (true) {
                    case getMatchedByAnyString({
                      tested: curJob.title,
                      expected: ['#global'],
                    }):
                      jobType = 'globalTag'
                      break
                    default:
                      break
                  }
                  for (const log of curJob.logs.items) {
                    let logBorder = 'default' // TLogBorder
                    let logBg = 'default' // TLogBg
                    // NOTE 2: Log border
                    switch (true) {
                      case getMatchedByAnyString({
                        tested: log.text,
                        expected: ['📣'],
                      }):
                        logBorder = 'red'
                        break
                      default:
                        break
                    }
                    // NOTE 3: Log bg
                    switch (true) {
                      case getMatchedByAnyString({
                        tested: log.text,
                        expected: ['✅'],
                      }):
                        logBg = 'green'
                        break
                      case getMatchedByAnyString({
                        tested: log.text,
                        expected: ['☝️'],
                      }):
                        logBg = 'warn'
                        break
                      default:
                        break
                    }
                    logsAcc.push({ ...log, jobId: curJob.id, jobTitle: curJob.title, logBorder, logBg, jobType, logUniqueKey: `job-${curJob.id}-log-${log.ts}`, jobTsUpdate: curJob.ts.update })
                  }
                  return logsAcc
                }, []),
                keys: ['ts'],
                order: -1,
              })
              // console.log(`total logs: ${sortedLogs.length}`)
              // console.log(sortedLogs[0])
              // console.log(`eventData?.input?.activeLogTs -> ${eventData?.input?.activeLogTs} (${typeof eventData?.input?.activeLogTs})`)
              const targetLog = !!eventData.input.activeLogTs
                ? sortedLogs.find(({ ts }) => ts === eventData?.input?.activeLogTs)
                : undefined
              // console.log(`eventData.input.activeLogTs=${eventData.input.activeLogTs} // targetLog:`)
              // console.log(targetLog)
              const targetLogIndex = getBinarySearchedIndexByDotNotation({
                items: sortedLogs,
                sorted: 'DESC', // ASC - по возр; DESC - по убыв
                target: {
                  value: targetLog?.ts || 0,
                  propPath: 'ts',
                },
              })
              const _pagerCalc = getSplittedArrayAsPager({
                pageLimit: 10,
                list: sortedLogs,
                options: {
                  // NOTE: One of two options (requiredPage in main priority)
                  requiredPageIndex: eventData?.input?.requiredPage >= 1 ? eventData?.input?.requiredPage - 1 : undefined,
                  requiredCurrentIndex: targetLogIndex === -1 ? 0 : targetLogIndex,
                  // NOTE: First page will be taken by default
                },
              })
              const pagerData = _pagerCalc.result

              const calc = {
                binarySearchedIndex: targetLogIndex,
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
                  activeLogTs: eventData?.input?.activeLogTs,
                  targetLogIndex,
                  // _activeFilters: eventData?.input?._activeFilters,
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
                  // targetJobId: eventData?.input?.activeLogTs
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
              output.message = `Worker error: ${err?.message || 'No message'}; sorted-logs-pager/middlewares/withRootMW`

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
