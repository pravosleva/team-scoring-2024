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
    "values": {
      "isProject": null,
      "jobStatusFilter": null,
      "assignedTo": null,
      "estimateReached": null,
      "isNew": null
    }
  }
*/

const getFilteredJobs = ({ jobs: allJobs, activeFilters }) => {
  let filteredJobs = []
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

  const nowDate = new Date().getTime()

  for (const job of allJobs) {
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
              // console.log('-- ACTIVE')
              activeFilters.values.jobStatusFilter = jobStatusFilterValue
              if (!job.completed && !isJobNew) {
                // console.log(`JOB+OK: ${job.title}`)
                jobIsReady.push(true)
              }
              else {
                // console.log(`JOB!OK: ${job.title}`)
                jobIsReady.push(false)
              }
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
          else {
            // console.log(`JOB!OK: ${job.title}`)
            jobIsReady.push(false)
          }
        }

        // NOTE: 1.3. estimateReached filter
        if (hasEstimateReachedFilter) {
          console.log(`!!! REACHED FILTER: ${job.title}`)
          if (!!job.forecast.start && !!job.forecast.estimate) {
            const isReached = nowDate > job.forecast.estimate
            const normalizedValue = Number(estimateReachedFilterValue)
            switch (normalizedValue) {
              case 1:
                activeFilters.values.estimateReached = normalizedValue
                if (isReached) jobIsReady.push(true)
                else {
                  // console.log(`JOB!OK: ${job.title}`)
                  jobIsReady.push(false)
                }
                break
              case 0:
                activeFilters.values.estimateReached = normalizedValue
                if (!isReached) jobIsReady.push(true)
                else jobIsReady.push(false)
                break
              default:
                break
            }
          } else {
            // console.log(`JOB!OK: ${job.title}`)
            jobIsReady.push(false)
          }
        } else {
          // console.log(`JOB+OK: ${job.title}`)
          console.log(`NO REACHED FILTER: ${job.title}`)
          jobIsReady.push(true)
        }

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
        } else {
          console.log(`NO PROJECT FILTER: ${job.title}`)
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
        } else {
          console.log(`NO NEW FILTER: ${job.title}`)
        }

        if (jobIsReady.every(v => v === true))
          filteredJobs.push(job)
        else console.log(`--- NO PUSHED: ${job.title}`)
        console.log(jobIsReady)
        break
      }
      default:
        // console.log(`DEFAULT CASE: NO FILTERS: ${job.title}`)
        filteredJobs.push(job)
        break
    }
  }
  return filteredJobs
}
