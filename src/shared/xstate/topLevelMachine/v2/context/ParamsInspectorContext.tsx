/* eslint-disable react-refresh/only-export-components */
import { useLayoutEffect } from 'react'
import { useSearchParams, useLocation, useParams } from 'react-router-dom'
import { EJobsStatusFilter, TJob, TopLevelContext } from '~/shared/xstate'
import { createFastContext } from '~/shared/utils'

export type TCountersPack = {
  estimateReached: number;
  estimateNotReached: number;
  allActive: number;
  allCompleted: number;
  allProjects: number;
  allNew: number;
};
type TPICCounters = {
  total: number;
  main: TCountersPack;
  employees: {
    [key: string]: TCountersPack;
  };
};
export type TPICFilters = {
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
    isNew: null | 0 | 1;
  },
};
type TUserRouteControlsItem = {
  value: string;
  uiText: string;
}
type TUserRouteControls = {
  from?: TUserRouteControlsItem;
  to?: TUserRouteControlsItem;
};
type TPICStore = {
  queryParams: { [key: string]: string };
  debug: {
    filters: {
      isEnabled: boolean;
      level: number;
    },
  },
  activeFilters: TPICFilters;
  filteredJobs: TJob[];
  counters: TPICCounters;
  userRouteControls: TUserRouteControls;
}
const initialState: TPICStore = {
  queryParams: {},
  debug: {
    filters: {
      isEnabled: false,
      level: 0,
    },
  },
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
      isNew: null,
    },
  },
  filteredJobs: [],
  counters: {
    total: 0,
    main: {
      allProjects: 0,
      estimateReached: 0,
      estimateNotReached: 0,
      allActive: 0,
      allCompleted: 0,
      allNew: 0,
    },
    employees: {},
  },
  userRouteControls: {},
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
const getIsJobNew = ({ job }: { job: TJob }): boolean =>
  !job.forecast.estimate

const debugFiltersLevels: string[] = ['1']

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

  useLayoutEffect(() => {
    const queryParams: { [key: string]: string } = {}
    for (const [key, value] of urlSearchParams.entries()) {
      queryParams[key] = value
    }

    // NOTE: 1. Filters
    const isUserPage = location.pathname === `/employees/${params.user_id}`
    const jobStatusFilterValue = urlSearchParams.get('jobStatusFilter')
    const hasJobStatusFilter = !!jobStatusFilterValue
      && Object.values(EJobsStatusFilter).includes(jobStatusFilterValue as EJobsStatusFilter)
    const assignedToFilterValue =
      isUserPage
        ? params?.user_id
        : urlSearchParams.get('assignedTo')
    const isDebugFiltersEnabled =
      typeof urlSearchParams.get('debugFiltersLevel') === 'string'
        ? debugFiltersLevels.includes(urlSearchParams.get('debugFiltersLevel') || 'impossible-case-special-for-ts')
        : false
    const debugFiltersLevel = isDebugFiltersEnabled
      ? Number(urlSearchParams.get('debugFiltersLevel'))
      : 0
    const hasAssignedToFilter =
      (!!assignedToFilterValue && !Number.isNaN(Number(assignedToFilterValue)))
    const estimateReachedFilterValue = urlSearchParams.get('estimateReached')
    const hasEstimateReachedFilter = !!estimateReachedFilterValue && !Number.isNaN(Number(estimateReachedFilterValue))

    const isProjectFilterValue = urlSearchParams.get('isProject')
    const hasIsProjectFilterValue = !!isProjectFilterValue && !Number.isNaN(Number(isProjectFilterValue))

    const isNewFilterValue = urlSearchParams.get('isNew')
    const hasIsNewFilterValue = !!isNewFilterValue && !Number.isNaN(Number(isNewFilterValue))

    const auxSettings: Pick<TPICStore, 'debug'> = {
      debug: {
        filters: {
          isEnabled: isDebugFiltersEnabled,
          level: debugFiltersLevel,
        }
      }
    }

    let filteredJobs: TJob[] = []
    const activeFilters: TPICFilters = {
      isAnyFilterActive: hasJobStatusFilter || hasAssignedToFilter || hasEstimateReachedFilter || hasIsProjectFilterValue || hasIsNewFilterValue,
      jobStatusFilter: hasJobStatusFilter,
      assignedTo: hasAssignedToFilter,
      estimateReached: hasEstimateReachedFilter,
      isProject: hasIsProjectFilterValue,
      values: {
        isProject: null,
        jobStatusFilter: null,
        assignedTo: null,
        estimateReached: null,
        isNew: null,
      },
    }
    const counters: TPICCounters = {
      total: allJobs.length,
      main: {
        allProjects: 0,
        estimateReached: 0,
        estimateNotReached: 0,
        allActive: 0,
        allCompleted: 0,
        allNew: 0,
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
          allNew: 0,
        }

      // -- NOTE: Common counters
      const isCompleted = job.completed
      const isJobNew = getIsJobNew({ job })
      const isAssigned = getIsJobAssigned({ job })
      const isStartedAndEstimated = !!job.forecast.start && !!job.forecast.estimate
      switch (true) {
        case isCompleted:
          counters.main.allCompleted += 1
          if (isAssigned)
            counters.employees[String(job.forecast.assignedTo)].allCompleted += 1
          break
        // case !isCompleted:
        default:
          switch (true) {
            case !isJobNew:
              counters.main.allActive += 1
              if (isAssigned)
                counters.employees[String(job.forecast.assignedTo)].allActive += 1
              break
            default:
              counters.main.allNew += 1
              if (isAssigned)
                counters.employees[String(job.forecast.assignedTo)].allNew += 1
              break
          }
          break
      }

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
      if (isJobProject) {
        counters.main.allProjects += 1
        if (isAssigned)
          counters.employees[String(job.forecast.assignedTo)].allProjects += 1
      }
      // --

      switch (true) {
        case (activeFilters.isAnyFilterActive): {
          const jobIsReady: boolean[] = []

          // NOTE: 1.1. Job status filter
          if (hasJobStatusFilter) {
            switch (jobStatusFilterValue) {
              case EJobsStatusFilter.ACTIVE:
                activeFilters.values.jobStatusFilter = jobStatusFilterValue
                if (!job.completed && !isJobNew) jobIsReady.push(true)
                else jobIsReady.push(false)
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
            else jobIsReady.push(false)
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
            filteredJobs.push(job)
          break
        }
        default:
          break
      }
    }
    if (!activeFilters.isAnyFilterActive) filteredJobs = allJobs

    // NOTE: 2. Controls
    const fromRouteValue = urlSearchParams.get('from')
    const fromRouteUiText = urlSearchParams.get('backActionUiText')
    const toRouteValue = urlSearchParams.get('to')
    const toRouteUiText = urlSearchParams.get('forwardActionUiText')
    const userRouteControls: TUserRouteControls = {}
    if (!!fromRouteValue) userRouteControls.from = {
      value: fromRouteValue,
      uiText: fromRouteUiText || 'Back',
    }
    if (!!toRouteValue) userRouteControls.to = {
      value: toRouteValue,
      uiText: toRouteUiText || 'Forward',
    }

    setStore({ queryParams, debug: auxSettings.debug, filteredJobs, activeFilters, counters, userRouteControls })

    // if () send({ type: 'filter.jobStatus.change', filter: jobStatusFilterValue as EJobsStatusFilter })
  }, [urlSearchParams, location.pathname, users, allJobs, setStore, params.user_id])

  // Persist todos
  useLayoutEffect(() => {
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
