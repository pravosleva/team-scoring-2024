const EJobsStatusFilter = {
  ALL: 'all',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  NEW: 'new',
}
const getIsJobAssigned = ({ job }) => !!job.forecast.assignedTo
const getIsJobProject = ({ job }) =>
  Array.isArray(job.relations?.children) && job.relations.children.length > 0
const getIsJobNew = ({ job }) => !job.forecast.estimate

/* NOTE: activeFilters example
  {
    "isAnyFilterActive": false,
    "jobStatusFilter": false,
    "assignedTo": false,
    "estimateReached": false,
    "isProject": false,

    isBasicSearchRequired: boolean;

    "values": {
      "isProject": null,
      "jobStatusFilter": null,
      "assignedTo": null,
      "estimateReached": null,
      "isNew": null,

      basicSearchText: string | null,
      enhancedSearchText: string | null,
    }
  }
*/

const getFilteredJobs = ({ jobs: allJobs, activeFilters }) => {
  const result = {
    items: [],
    _service: {
      logsMapping: {},
      // NOTE: { [key: String(job.id)]: { original: TLog, _service: { commonMessage?: string; logLocalLinks: { relativeUrl: string; ui: string }[] } }[] }
    },
  }
  const jobStatusFilterValue = activeFilters.values.jobStatusFilter
  const hasJobStatusFilter = !!jobStatusFilterValue
    && Object.values(EJobsStatusFilter).includes(jobStatusFilterValue)
  const assignedToFilterValue = activeFilters.values.assignedTo
  const hasAssignedToFilter =
    (!!assignedToFilterValue && !Number.isNaN(Number(assignedToFilterValue)))

  const estimateReachedFilterValue = activeFilters.values.estimateReached
  const hasEstimateReachedFilter = typeof activeFilters.values.estimateReached === 'number' && !Number.isNaN(Number(estimateReachedFilterValue))
  // const hasEstimateNotReachedFilter = !Number.isNaN(Number(estimateReachedFilterValue)) && estimateReachedFilterValue === 0

  const isProjectFilterValue = activeFilters.values.isProject
  const hasIsProjectFilterValue = !!isProjectFilterValue && !Number.isNaN(Number(isProjectFilterValue))
  const isNewFilterValue = activeFilters.values.isNew
  const hasIsNewFilterValue = !!isNewFilterValue && !Number.isNaN(Number(isNewFilterValue))

  const isTargetJobsRequested = activeFilters.isTargetJobsRequested
  const targetJobsRequested = isTargetJobsRequested ? activeFilters.values.targetJobsRequested : []

  const preFilteredJobs = isTargetJobsRequested && targetJobsRequested.length > 0
    ? allJobs.filter((job) => targetJobsRequested.includes(job.id))
    : allJobs

  const isBasicSearchRequired = activeFilters.isBasicSearchRequired
  const basicSearchText = activeFilters.values?.basicSearchText

  const isEnhancedSearchRequired = activeFilters.isEnhancedSearchRequired
  const enhancedSearchText = activeFilters.values?.enhancedSearchText

  const nowDate = new Date().getTime()

  for (const job of preFilteredJobs) {
    // console.log(job.title)
    // const isCompleted = job.completed
    const isJobNew = getIsJobNew({ job })
    // const isAssigned = getIsJobAssigned({ job })
    // const isStartedAndEstimated = !!job.forecast.start && !!job.forecast.estimate
    const isJobProject = getIsJobProject({ job })

    switch (true) {
      case (activeFilters.isAnyFilterActive): {
        const jobIsReady = [] // boolean[]

        // NOTE: 1.1. Job status filter
        if (hasJobStatusFilter) {
          switch (jobStatusFilterValue) {
            case EJobsStatusFilter.ACTIVE:
              activeFilters.values.jobStatusFilter = jobStatusFilterValue
              if (!job.completed && !isJobNew)
                jobIsReady.push(true)
              else
                jobIsReady.push(false)
              break
            case EJobsStatusFilter.COMPLETED:
              activeFilters.values.jobStatusFilter = jobStatusFilterValue
              if (job.completed) jobIsReady.push(true)
              else jobIsReady.push(false)
              break
            case EJobsStatusFilter.NEW:
              activeFilters.values.jobStatusFilter = jobStatusFilterValue
              if (isJobNew) jobIsReady.push(true)
              else jobIsReady.push(false)
              break
            default:
              jobIsReady.push(true)
              break
          }
        }

        // NOTE: 1.2. assignedTo filter
        if (hasAssignedToFilter) {
          const normalizedValue = Number(assignedToFilterValue)
          activeFilters.values.assignedTo = normalizedValue
          if (job.forecast.assignedTo === normalizedValue)
            jobIsReady.push(true)
          else
            jobIsReady.push(false)
        }

        // NOTE: 1.3. estimateReached filter
        if (hasEstimateReachedFilter) {
          if (!!job.forecast.start && !!job.forecast.estimate) {
            const isReached = nowDate > job.forecast.estimate
            const normalizedValue = Number(estimateReachedFilterValue)
            switch (normalizedValue) {
              case 1:
                activeFilters.values.estimateReached = normalizedValue
                if (isReached) jobIsReady.push(true)
                else
                  jobIsReady.push(false)
                break
              case 0:
                activeFilters.values.estimateReached = normalizedValue
                if (!isReached)
                  jobIsReady.push(true)
                else
                  jobIsReady.push(false)
                break
              default:
                break
            }
          } else
            jobIsReady.push(false)
        } else
          jobIsReady.push(true)

        // NOTE: 1.4. isProject filter
        if (
          hasIsProjectFilterValue
          && (Number(isProjectFilterValue) === 0 || Number(isProjectFilterValue) === 1)
        ) {
          const normalizedValue = Number(isProjectFilterValue)
          switch (normalizedValue) {
            case 1:
              activeFilters.values.isProject = normalizedValue
              if (isJobProject) jobIsReady.push(true)
              else jobIsReady.push(false)
              break
            case 0:
              activeFilters.values.isProject = normalizedValue
              if (isJobProject) jobIsReady.push(false)
              else jobIsReady.push(true)
              break
            default:
              break
          }
        }

        // NOTE: 1.5. isNew filter
        if (
          hasIsNewFilterValue
          && (Number(isNewFilterValue) === 0 || Number(isNewFilterValue) === 1)
        ) {
          const normalizedValue = Number(isNewFilterValue)
          switch (normalizedValue) {
            case 1:
              activeFilters.values.isNew = normalizedValue
              if (isJobNew) jobIsReady.push(true)
              else jobIsReady.push(false)
              break
            case 0:
              activeFilters.values.isNew = normalizedValue
              if (isJobNew) jobIsReady.push(false)
              else jobIsReady.push(true)
              break
            default:
              break
          }
        }

        // NOTE: 1.6. isBasicSearchRequired
        let searchCriteryBasic = false
        if (isBasicSearchRequired && !!basicSearchText) {
          const isMatched = getMatchedByAllStrings({
            tested: clsx(job.title, job.descr, ...(job.pointset?.map(p => clsx(p.title, p.descr)) || [])),
            expected: basicSearchText.split(' '),
          })

          if (isMatched) {
            searchCriteryBasic = true
            jobIsReady.push(true)
          } else jobIsReady.push(false)
        }

        // -- NOTE: 1.7. isEnhancedSearchRequired
        if (isEnhancedSearchRequired && !!enhancedSearchText) {
          // NOTE: Logs should be analyzed
          const getIsLogRequired = ({ log, jobId }) => {
            const analyzed = { ok: false, reason: 'Not modified', __logLocalLinks: [], __logExternalLinks: [] }
            const msgs = new Set()

            // 1.7.1 Log text
            const isMatchedText = getMatchedByAllStrings({
              tested: clsx(log.text),
              expected: enhancedSearchText.split(' '),
            })
            if (isMatchedText) {
              analyzed.ok = true
              msgs.add('Matched with log text')
            }

            // 1.7.2 Log links item url, title, descr
            if (log.links?.length > 0) {
              for (const { id: _id, url, title, descr } of log.links) {
                const isMatched = getMatchedByAllStrings({
                  tested: clsx(title, descr, url),
                  expected: enhancedSearchText.split(' '),
                })
                if (isMatched) {
                  analyzed.ok = true
                  msgs.add('Matched with link props (title, descr, url)')
                  analyzed.__logExternalLinks.push({
                    url,
                    ui: title,
                    descr,
                    logTs: log.ts,
                    jobId,
                  })
                }
              }
            }

            // 1.7.3 Log checklist item title, descr
            if (log.checklist?.length > 0) {
              analyzed.__logLocalLinks = log.checklist
                .reduce((acc, cur) => {
                  const { title, descr, ts, isDone, id, isDisabled, links, order } = cur
                  /* NOTE: TLogChecklistItem
                    order?: number;
                    title: string;
                    descr: string;
                    isDone: boolean;
                    isDisabled: boolean;
                    links?: TLogLink[];
                    id: number;
                    ts: {
                      createdAt: number;
                      updatedAt: number;
                    };
                  */
                  const isCheckListItemOk = getMatchedByAllStrings({
                    tested: clsx(title, descr),
                    expected: enhancedSearchText.split(' '),
                  })
                  if (isCheckListItemOk) {
                    analyzed.ok = true
                    msgs.add('Matched with checklist item (title, descr)')
                    acc.push({
                      id,
                      relativeUrl: `/jobs/${jobId}/logs/${log.ts}?lastSeenLogKey=job-${jobId}-log-${log.ts}`,
                      ui: `${isDisabled
                        ? isDone
                          ? '⬛'
                          : '💀'
                        : isDone
                          ? '🟩'
                          : '🟥'
                        } ${title}`,
                      descr,
                      updatedAgo: getTimeAgo({ dateInput: ts.updatedAt }),
                      links,
                      order,
                    })
                  }
                  return acc
                }, [])
                .sort((e1, e2) => ((e2.order || 0) - (e1.order || 0)))
            }

            if (analyzed.ok) {
              analyzed.reason = [...msgs].join(', ')
            }

            return analyzed
          }
          let searchCriteryEnhanced = false
          for (const log of job.logs.items) {
            const matchAnalysis = getIsLogRequired({ log, jobId: job.id })
            if (matchAnalysis.ok) {
              searchCriteryEnhanced = true

              // NOTE: { [key: String(job.id)]: { original: TLog[]; _service?: { commonMessage: string; logLocalLinks: { id; relativUrl, descr, ui, updatedAgo }[] } } }
              if (!result._service.logsMapping[String(job.id)] || !Array.isArray(result._service.logsMapping[String(job.id)]))
                result._service.logsMapping[String(job.id)] = [
                  {
                    original: log,
                    _service: {
                      commonMessage: matchAnalysis.reason,
                      logLocalLinks: matchAnalysis.__logLocalLinks,
                      logExternalLinks: matchAnalysis.__logExternalLinks,
                    },
                  }
                ]
              else
                result._service.logsMapping[String(job.id)]
                  .push({
                    original: log,
                    _service: {
                      commonMessage: matchAnalysis.reason,
                      logLocalLinks: matchAnalysis.__logLocalLinks,
                      logExternalLinks: matchAnalysis.__logExternalLinks,
                    }
                  })
            }
          }

          if (searchCriteryEnhanced || searchCriteryBasic) jobIsReady.push(true)
          else jobIsReady.push(false)
        }
        // --

        if (jobIsReady.every(v => v === true))
          result.items.push(job)
        break
      }
      default:
        result.items.push(job)
        break
    }
  }
  return result
}
