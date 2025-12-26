// importScripts('./middlewares/for-ts-tree-lib/calc.v4.js')

console.log('[LOADED] search-pager-basic/middlewares/withRootMW')

// NOTE: compose fn should be imported already
// NOTE: delay fn should be imported already

let controller = new AbortController()
// let finalOutputErrorController = new AbortController()

const withRootMW = (arg) => compose([
  // NOTE: You can add your middlewares below...

  // - NOTE: For example
  async ({ eventData, cb }) => {
    const { __eType, input } = eventData

    if (debugConfig.workerEvs.mwsInternalLogs.isEnabled) log({
      label: 'search-pager-basic/middlewares/withRootMW [MW] exp',
      msgs: [
        'eventData:',
        eventData,
      ],
    })

    switch (__eType) {
      case NES.Common.WorkerService.CLIENT_TO_WORKER_MESSAGE: {

        // -- NOTE: Level 2: Different app event types
        switch (eventData?.input.opsEventType) {
          case NES.Common.ClientService.SarchPagerBasic.EClientToWorkerEvent.PING_GET: {
            const output = {
              ok: false,
              message: 'initial',
            }

            try {
              if (!!controller) {
                controller.abort()
                controller = new AbortController()
              }
              const targetAction = () => {
                // console.log(eventData.input.xxx.sa)
                let isFiltersRequired = !!eventData?.input?._activeFilters && eventData.input._activeFilters.isAnyFilterActive

                // -- TODO: getMatchedByAllStrings
                // input.activeFilters
                // input.jobs
                // input.searchQuery.basic
                // input.searchQuery.enhanced
                // input.activeJobId

                const mutableDefaultFiltersConfig = {
                  isAnyFilterActive: false,
                  jobStatusFilter: false,
                  assignedTo: false,
                  estimateReached: false,
                  isProject: false,
                  isTargetJobsRequested: false,
                  isBasicSearchRequired: false,
                  isEnhancedSearchRequired: false,
                  values: {
                    targetJobsRequested: [],
                    jobStatusFilter: null,
                    assignedTo: null,
                    estimateReached: null,
                    isProject: null,
                    isNew: null,
                    basicSearchText: null,
                    enhancedSearchText: null,
                  },
                }
                if (isFiltersRequired) {
                  mutateObject({
                    target: mutableDefaultFiltersConfig,
                    source: eventData?.input?._activeFilters,
                    removeIfUndefined: false,
                  })
                }
                if (typeof eventData?.input?.searchQuery?.basic === 'string' && !!eventData?.input?.searchQuery?.basic) {
                  isFiltersRequired = true
                  mutateObject({
                    target: mutableDefaultFiltersConfig,
                    source: {
                      isAnyFilterActive: true,
                      isBasicSearchRequired: true,
                      values: {
                        basicSearchText: eventData.input.searchQuery.basic,
                      },
                    },
                    removeIfUndefined: false,
                  })
                }
                if (typeof eventData?.input?.searchQuery?.enhanced === 'string' && !!eventData?.input?.searchQuery?.enhanced) {
                  isFiltersRequired = true
                  mutateObject({
                    target: mutableDefaultFiltersConfig,
                    source: {
                      isAnyFilterActive: true,
                      isEnhancedSearchRequired: true,
                      values: {
                        enhancedSearchText: eventData.input.searchQuery.enhanced,
                      },
                    },
                    removeIfUndefined: false,
                  })
                }
                // --

                const filteredJobs = isFiltersRequired
                  ? getFilteredJobs({
                    jobs: eventData?.input?.jobs || [],
                    activeFilters: mutableDefaultFiltersConfig, // eventData?.input?._activeFilters,
                  })
                  : { items: (eventData?.input?.jobs || []) }
                const sortedJobs = getSortedArray({
                  arr: filteredJobs.items.map((job) => ({ ...job, tsUpdate: job.ts.update })),
                  keys: ['tsUpdate'],
                  order: -1,
                })
                // console.log(sortedJobs)
                const targetJob = !!eventData?.input?.activeJobId
                  ? filteredJobs.items.find(({ id }) => id === eventData?.input?.activeJobId)
                  : undefined
                const targetJobIndex = getBinarySearchedIndexByDotNotation({
                  items: sortedJobs,
                  sorted: 'DESC', // ASC - по возр; DESC - по убыв
                  target: {
                    value: targetJob?.ts?.update || 0,
                    propPath: 'ts.update',
                  },
                })
                const _pagerCalc = getSplittedArrayAsPager({
                  pageLimit: 10,
                  list: sortedJobs,
                  options: {
                    // NOTE: One of two options (requiredPage in main priority)
                    requiredPageIndex: eventData?.input?.requiredPage >= 1 ? eventData?.input?.requiredPage - 1 : undefined,
                    requiredCurrentIndex: targetJobIndex === -1 ? 0 : targetJobIndex,
                    // NOTE: First page will be taken by default
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
                    activeJobId: eventData?.input?.activeJobId,
                    // targetJobIndex,
                    searchQuery: input.searchQuery,
                    mutableDefaultFiltersConfig,
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
                    // targetJobId: eventData?.input?.activeJobId,
                  },

                  filteredJobsLogsMapping: filteredJobs._service.logsMapping,
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
              }
              const res = await delay({
                ms: 1500,
                signal: controller.signal,
                customAbortMessage: '[SPECIAL_ERRROR=Just a moment, plz]'
              })
                .then(targetAction)
                .then(() => ({ ok: true }))
                .catch((err) => ({ ok: false, reason: err?.message || 'No err?.message' }))

              if (!res.ok) {
                // NOTE: v1
                throw new Error(res.reason)

                // NOTE: v2 Поставим задержку чтоб не спамить фронт
                // finalOutputErrorController.abort()
                // finalOutputErrorController = new AbortController()
                // const finalThrowConfirmed = await delay({ ms: 2000, signal: finalOutputErrorController.signal })
                //   .then(() => ({ ok: true }))
                //   .catch((err) => ({ ok: false, reason: err?.message || 'No err?.message' }))

                // if (finalThrowConfirmed.ok) throw new Error(res.reason)
                // else return
              }
            } catch (err) {
              output.ok = false
              output.message = `Worker error: ${err?.message || 'No message'}; search-pager-basic/middlewares/withRootMW`

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
