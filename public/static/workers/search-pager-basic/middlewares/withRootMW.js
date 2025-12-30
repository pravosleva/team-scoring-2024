// importScripts('./middlewares/for-ts-tree-lib/calc.v4.js')

console.log('[LOADED] search-pager-basic/middlewares/withRootMW')

// NOTE: External deps: compose, delay

let controller = new AbortController()
// NOTE: THROTTLE 1/4 Сброс ожидания
let isWaiting = false
const resetWaiting = () => isWaiting = false

/**
 * @typedef {Object} TJob Работа
 * @property {Number} id ID
 * @property {String} title Title
 */

const withRootMW = (arg) => compose([
  // NOTE: You can add your middlewares below...

  /**
   * Middleware
   *
   * @async
   * @param {Object} arg Middleware argument 
   * @param {Object} arg.eventData Middleware event data
   * @param {Object} arg.eventData.__eType Event type
   * @param {Object} arg.eventData.input Event input data
   * @param {Object} arg.eventData.input.activeFilters Input filters config
   * @param {TJob[]} arg.eventData.input.jobs Joblist
   * @param {Object} arg.eventData.input.searchQuery Input search query config
   * @param {Object} arg.eventData.input.searchQuery.basic Input search query (basic)
   * @param {Object} arg.eventData.input.searchQuery.enhanced Input search query (enhanced)
   * @param {Object} arg.eventData.input.activeJobId Active job id (if necessary)
   * @param {Object} arg.cb Middleware callback
   * @returns {Object} Result
   * @source
   */
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
              // NOTE: THROTTLE 2/4 Сброс ожидания запланированной операции при каждом запросе
              if (isWaiting && !controller.signal.aborted) {
                controller.abort()
                controller = new AbortController()
              } else isWaiting = true

              const targetAction = () => {
                let isFiltersRequired = !!eventData?.input?._activeFilters && eventData.input._activeFilters.isAnyFilterActive

                // -- NOTE: (v0) Внешний функционал не готов, поэтому донастроим конфиг
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
                    activeFilters: mutableDefaultFiltersConfig,
                  })
                  : { items: (eventData?.input?.jobs || []) }
                const sortedJobs = getSortedArray({
                  arr: filteredJobs.items.map((job) => ({ ...job, tsUpdate: job.ts.update })),
                  keys: ['tsUpdate'],
                  order: -1,
                })
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
              // NOTE: THROTTLE 3/4 Sync delay (revertable)
              const res = await delay({
                ms: 3000,
                signal: controller.signal,
                customAbortMessage: '[SPECIAL_ERRROR=Just a moment, plz...]'
              })
                .then(targetAction)
                .then(() => ({ ok: true }))
                .catch((err) => ({ ok: false, reason: err?.message || 'No err?.message' }))

              if (!res.ok)
                throw new Error(res.reason)
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
              // NOTE: THROTTLE 4/4
              resetWaiting()
            }
            break
          }
          default:
            // NOTE: Whatever
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
], arg)
