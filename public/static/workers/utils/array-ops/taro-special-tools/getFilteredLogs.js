// const EJobsStatusFilter = {
//   ALL: 'all',
//   ACTIVE: 'active',
//   COMPLETED: 'completed',
//   NEW: 'new',
// }
// const getIsJobAssigned = ({ job }) => !!job.forecast.assignedTo
// const getIsJobProject = ({ job }) =>
//   Array.isArray(job.relations?.children) && job.relations.children.length > 0
// const getIsJobNew = ({ job }) => !job.forecast.estimate

/* NOTE: activeFilters example
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

const getFilteredLogs = ({ jobs: filteredJobs, activeFilters }) => {
  const result = {
    items: [],
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
    ? filteredJobs.filter((job) => targetJobsRequested.includes(job.id))
    : filteredJobs

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
          if (job.forecast.assignedTo === normalizedValue) jobIsReady.push(true)
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
