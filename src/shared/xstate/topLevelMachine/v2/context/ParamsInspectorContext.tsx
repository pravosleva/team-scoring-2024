/* eslint-disable react-refresh/only-export-components */
import { useEffect } from 'react'
import { useSearchParams, useLocation, useParams } from 'react-router-dom'
import { EJobsStatusFilter, TJob, TopLevelContext } from '~/shared/xstate'
import { createFastContext } from '~/shared/utils'

type TCountersPack = {
  estimateReached: number;
  estimateNotReached: number;
  allActive: number;
  allCompleted: number;
  allProjects: number;
};
type TPICCounters = {
  main: TCountersPack;
  employees: {
    [key: string]: TCountersPack;
  };
};
type TPICFilters = {
  isAnyFilterActive: boolean;
  jobStatusFilter: boolean;
  assignedTo: boolean;
  estimateReached: boolean;
  isProject: boolean;
  values: {
    jobStatusFilter: null | EJobsStatusFilter;
    assignedTo: null | number;
    estimateReached: null | 0 | 1;
    isProject: null | 0 | 1;
  },
};
type TPICStore = {
  activeFilters: TPICFilters;
  filteredJobs: TJob[];
  counters: TPICCounters;
}
const initialState: TPICStore = {
  activeFilters: {
    isAnyFilterActive: false,
    jobStatusFilter: false,
    assignedTo: false,
    estimateReached: false,
    isProject: false,
    values: {
      jobStatusFilter: null,
      assignedTo: null,
      estimateReached: null,
      isProject: null,
    },
  },
  filteredJobs: [],
  counters: {
    main: {
      allProjects: 0,
      estimateReached: 0,
      estimateNotReached: 0,
      allActive: 0,
      allCompleted: 0,
    },
    employees: {},
  },
}
export const ParamsInspectoreContext = createFastContext<TPICStore>(initialState)

const { Provider, useStore } = ParamsInspectoreContext

type TProps = {
  children: React.ReactNode;
}

const getIsJobAssigned = ({ job }: { job: TJob }): boolean =>
  !!job.forecast.assignedTo

const getIsJobProject = ({ job }: { job: TJob }): boolean =>
  Array.isArray(job.relations?.children) && job.relations.children.length > 0

const Logic = ({ children }: TProps) => {
  const todosActorRef = TopLevelContext.useActorRef()
  // const { send } = todosActorRef
  const location = useLocation()
  const params = useParams() // NOTE: { id: string }
  // console.log(location)
  const [urlSearchParams] = useSearchParams()
  const users = TopLevelContext.useSelector((s) => s.context.users.items)
  const allJobs = TopLevelContext.useSelector((s) => s.context.jobs.items)
  const [, setStore] = useStore((s) => s.filteredJobs)

  useEffect(() => {
    const isUserPage = location.pathname === `/employees/${params.id}`
    const jobStatusFilterValue = urlSearchParams.get('jobStatusFilter')
    const hasJobStatusFilter = !!jobStatusFilterValue
      && Object.values(EJobsStatusFilter).includes(jobStatusFilterValue as EJobsStatusFilter)
    const assignedToFilterValue =
      isUserPage
      ? params?.id
      : urlSearchParams.get('assignedTo')
    const hasAssignedToFilter =
      (!!assignedToFilterValue && !Number.isNaN(Number(assignedToFilterValue)))
    const estimateReachedFilterValue = urlSearchParams.get('estimateReached')
    const hasEstimateReachedFilter = !!estimateReachedFilterValue && !Number.isNaN(Number(estimateReachedFilterValue))
    
    const isProjectFilterValue = urlSearchParams.get('isProject')
    const hasIsProjectFilterValue = !!isProjectFilterValue && !Number.isNaN(Number(isProjectFilterValue))

    // console.log(`hasIsProjectFilterValue= ${hasIsProjectFilterValue}`)
    // console.log(`Number(isProjectFilterValue)= ${Number(isProjectFilterValue)}`)

    let filteredJobs: TJob[] = []
    const activeFilters: TPICFilters = {
      isAnyFilterActive: hasJobStatusFilter || hasAssignedToFilter || hasEstimateReachedFilter || hasIsProjectFilterValue,
      jobStatusFilter: hasJobStatusFilter,
      assignedTo: hasAssignedToFilter,
      estimateReached: hasEstimateReachedFilter,
      isProject: hasIsProjectFilterValue,
      values: {
        isProject: null,
        jobStatusFilter: null,
        assignedTo: null,
        estimateReached: null,
      },
    }
    const counters: TPICCounters = {
      main: {
        allProjects: 0,
        estimateReached: 0,
        estimateNotReached: 0,
        allActive: 0,
        allCompleted: 0,
      },
      employees: {},
    }
    const nowDate = new Date().getTime()

    for (const job of allJobs) {
      if (!!job.forecast.assignedTo && !counters.employees[String(job.forecast.assignedTo)])
        counters.employees[String(job.forecast.assignedTo)] = {
          allProjects: 0,
          estimateReached: 0,
          estimateNotReached: 0,
          allActive: 0,
          allCompleted: 0,
        }

      const isCompleted = job.completed
      const isAssigned = getIsJobAssigned({ job })
      if (isCompleted) {
        counters.main.allCompleted += 1
        if (isAssigned)
          counters.employees[String(job.forecast.assignedTo)].allCompleted += 1
      } else {
        counters.main.allActive += 1
        if (isAssigned)
          counters.employees[String(job.forecast.assignedTo)].allActive += 1
      }

      const isStartedAndEstimated = !!job.forecast.start && !!job.forecast.estimate
      if (isStartedAndEstimated && !isCompleted) {
        const isEstimateReached = nowDate > (job.forecast.estimate as number)
        if (isEstimateReached) {
          counters.main.estimateReached += 1
          if (isAssigned)
            counters.employees[String(job.forecast.assignedTo)].estimateReached += 1
        } else {
          counters.main.estimateNotReached += 1
          if (isAssigned)
            counters.employees[String(job.forecast.assignedTo)].estimateNotReached += 1
        }
      }

      const isJobProject = getIsJobProject({ job })
      // console.log(`isJobProject= ${isJobProject}`)
      if (isJobProject) {
        counters.main.allProjects += 1
        if (isAssigned)
          counters.employees[String(job.forecast.assignedTo)].allProjects += 1
      }

      switch (true) {
        case (activeFilters.isAnyFilterActive): {
          const jobIsReady: boolean[] = []

          // NOTE: 1. Job status filter
          if (hasJobStatusFilter) {
            switch (jobStatusFilterValue) {
              case EJobsStatusFilter.ACTIVE:
                activeFilters.values.jobStatusFilter = jobStatusFilterValue
                if (!job.completed) jobIsReady.push(true)
                else jobIsReady.push(false)
                break
              case EJobsStatusFilter.COMPLETED:
                activeFilters.values.jobStatusFilter = jobStatusFilterValue
                if (job.completed) jobIsReady.push(true)
                else jobIsReady.push(false)
                break
              default:
                jobIsReady.push(true)
                break
            }
          }

          // NOTE: 2. assignedTo filter
          if (hasAssignedToFilter) {
            const normalizedValue = Number(assignedToFilterValue)
            activeFilters.values.assignedTo = normalizedValue
            if (job.forecast.assignedTo === normalizedValue) jobIsReady.push(true)
            else jobIsReady.push(false)
          }

          // NOTE: 3. estimateReached filter
          if (hasEstimateReachedFilter) {
            if (!!job.forecast.start && !!job.forecast.estimate) {
              const isReached = nowDate > job.forecast.estimate
              const normalizedValue = Number(estimateReachedFilterValue)
              switch (normalizedValue) {
                case 1:
                  activeFilters.values.estimateReached = normalizedValue
                  if (isReached) jobIsReady.push(true)
                  else jobIsReady.push(false)
                  break
                case 0:
                  activeFilters.values.estimateReached = normalizedValue
                  if (!isReached) jobIsReady.push(true)
                    else jobIsReady.push(false)
                  break
                default:
                  break
              }
            } else jobIsReady.push(false)
          }

          // NOTE: 4. isProject filter
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

          if (jobIsReady.every(v => v === true)) filteredJobs.push(job)
          break
        }
        default:
          // filteredJobs = allJobs
          break
      }
    }
    if (!activeFilters.isAnyFilterActive) filteredJobs = allJobs
    setStore({ filteredJobs, activeFilters, counters })
    
    // if () send({ type: 'filter.jobStatus.change', filter: jobStatusFilterValue as EJobsStatusFilter })
  }, [urlSearchParams, location, users, allJobs, setStore, params.id])

  // Persist todos
  useEffect(() => {
    todosActorRef.subscribe(() => {
      localStorage.setItem(
        'teamScoring2024:topLevel',
        JSON.stringify(todosActorRef.getPersistedSnapshot?.())
      )
    })
  }, [todosActorRef])

  return (
    <>
      {children}
    </>
  )
}

export const ParamsInspectorContextWrapper = ({ children }: TProps) => {
  return (
    <Provider>
      <Logic>
        {children}
      </Logic>
    </Provider>
  )
}

export const useParamsInspectorContextStore = useStore
