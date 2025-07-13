import { memo, useLayoutEffect, useState, useEffect, useCallback, useMemo } from 'react'
import { Job } from '~/shared/components/Job'
import { TopLevelContext, TJob, EJobsStatusFilter } from '~/shared/xstate/topLevelMachine/v2'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Box, Button, TextField } from '@mui/material'
import Grid from '@mui/material/Grid2'
import { TCountersPack, useParamsInspectorContextStore } from '~/shared/xstate/topLevelMachine/v2/context/ParamsInspectorContext'
import baseClasses from '~/App.module.scss'
import { scrollToIdFactory } from '~/shared/utils/web-api-ops'
import { scrollTopExtra } from '~/shared/components/Layout/utils'
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff'
import FilterAltIcon from '@mui/icons-material/FilterAlt'
import HiveIcon from '@mui/icons-material/Hive'
import NewReleasesIcon from '@mui/icons-material/NewReleases'
import TaskAltIcon from '@mui/icons-material/TaskAlt'
import ThumbUpIcon from '@mui/icons-material/ThumbUp'
import ThumbDownIcon from '@mui/icons-material/ThumbDown'
import { getFullUrl as _getFullUrl } from '~/shared/utils/string-ops'
// import clsx from 'clsx'

// const { useStore: useParamsInspectorContextWrapper } = ParamsInspectoreContext

// NOTE: See also https://codesandbox.io/p/devbox/prod-architecture-7fng6v

// function filterTodos(filter: EJobsStatusFilter, jobs: TJob[]) {
//   switch (filter) {
//     case EJobsStatusFilter.ACTIVE:
//       return [...jobs].filter((todo) => !todo.completed)
//     case EJobsStatusFilter.COMPLETED:
//       return [...jobs].filter((todo) => todo.completed)
//     default:
//       return [...jobs]
//   }
// }

type TProps = {
  counters?: TCountersPack;
  activeJobId?: number | null;
  onToggleDrawer?: (isDrawlerOpened: boolean) => ({ jobId }: { jobId: number }) => void;
  jobs: TJob[];
  onCreateNew?: () => void;
  subheader: string;
  pageInfo?: string;
  isCreatable?: boolean;
  isSortable?: boolean;
  pagerControlsHardcodedPath: string;
}
const specialScroll = scrollToIdFactory({
  timeout: 200,
  offsetTop: 16,
  elementHeightCritery: 550,
})

export const JobList2 = memo(({ counters: _counters, pageInfo, pagerControlsHardcodedPath, isCreatable, isSortable, activeJobId, onToggleDrawer, jobs, onCreateNew, subheader }: TProps) => {
  const topLevelActorRef = TopLevelContext.useActorRef()
  const { send } = topLevelActorRef
  const todo = TopLevelContext.useSelector((s) => s.context.todo)
  // const todos = TopLevelContext.useSelector((s) => s.context.jobs.items)
  // const filter = TopLevelContext.useSelector((s) => s.context.jobs.filter)
  // const numActiveTodos = todos.filter((todo) => !todo.completed).length
  // -- NOTE: Mark all
  // const allCompleted = todos.length > 0 && numActiveTodos === 0
  // const mark = !allCompleted ? 'completed' : 'active'
  // --
  // const filteredTodos = filterTodos(filter, todos)
  // const [filteredTodos] = useParamsInspectorContextStore((ctx) => ctx.filteredJobs)
  const [activeFilters] = useParamsInspectorContextStore((ctx) => ctx.activeFilters)
  // console.log(activeFilters)
  // const { values: filterValues } = activeFilters
  // const inputRef = useRef<HTMLInputElement>(null)

  // useEffect(() => {
  //   if (todos.length === 0) inputRef.current?.focus()
  // }, [todos])

  // -- NOTE: 2/3 Совершенно необязательный механизм,
  // просто интуитивный UX
  // TODO: Можно перенести в отдельный контекст
  const [lastSeenJobId, setLastSeenJobId] = useState<number | null>(null)
  const [urlSearchParams] = useSearchParams()
  useLayoutEffect(() => {
    const idToScroll = urlSearchParams.get('lastSeenJob')
    if (!!idToScroll && !Number.isNaN(Number(idToScroll))) setLastSeenJobId(Number(idToScroll))
  }, [urlSearchParams, setLastSeenJobId])
  // --
  const [_mainCounters] = useParamsInspectorContextStore((ctx) => ctx.counters.main)
  const counters = useMemo(() => _counters || _mainCounters, [_mainCounters, _counters])
  // const [totalJobsCounter] = useParamsInspectorContextStore((ctx) => ctx.counters.total)
  const navigate = useNavigate()
  const [queryParams] = useParamsInspectorContextStore((ctx) => ctx.queryParams)

  const getFullUrl = useCallback(({ url, query, queryKeysToremove }: {
    url: string;
    query?: { [key: string]: string | null | number; };
    queryKeysToremove?: string[];
  }) => _getFullUrl({ url, query: { ...queryParams, ...(query || {}) }, queryKeysToremove }), [queryParams])

  const goPage = useCallback(({ url, query, queryKeysToremove }: {
    url: string;
    query?: { [key: string]: string | null | number; };
    queryKeysToremove?: string[];
  }) => () => navigate(getFullUrl({ url, query, queryKeysToremove })), [navigate, getFullUrl])

  useEffect(() => {
    scrollTopExtra()
    if (!!lastSeenJobId) {
      specialScroll({ id: `job_list_item_${lastSeenJobId}` })
      // blinkNode({ id: `job_list_item_${jobId}` })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastSeenJobId, location.pathname])

  return (
    <Grid container spacing={1}>
      <Grid
        size={12}
        sx={{
          borderBottom: '1px solid lightgray',
          position: 'sticky',
          top: 0,
          backgroundColor: '#fff',
          zIndex: 2,
          pb: (isCreatable || activeFilters.isAnyFilterActive) ? 2 : 0,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            // justifyContent: 'space-between',
            gap: '16px',
            alignItems: 'center'
          }}
        >
          <h2
            className={baseClasses.truncate}
            style={{ display: 'inline-flex', gap: '16px', alignItems: 'center' }}
          >
            <span className={baseClasses.truncate}>{subheader}</span>
            {!!pageInfo && <span style={{ color: '#959eaa', fontSize: 'small' }}>{pageInfo}</span>}
          </h2>
        </div>

        {
          (isCreatable || isSortable) && (
            <div className={baseClasses.stack2}>
              {/* <pre
                className={clsx(
                  baseClasses.preNormalized,
                )}
                style={{ maxHeight: '300px', overflowY: 'auto' }}
              >
                {JSON.stringify({
                  shouldTextFieldBeShowed: isCreatable && !activeFilters.isAnyFilterActive,
                }, null, 2)}
              </pre> */}
              {
                isCreatable && !activeFilters.isAnyFilterActive && (
                  <TextField
                    type='text'
                    // ref={inputRef}
                    placeholder='What needs to be done?'
                    label='Title'
                    variant='outlined'
                    // error={!!__errsState[key]}
                    // helperText={__errsState[key] || undefined}
                    onKeyUp={(ev: React.KeyboardEvent<HTMLInputElement>) => {
                      if (ev.key === 'Enter') {
                        send({
                          type: 'newTodo.commit',
                          value: {
                            title: (ev.target as HTMLInputElement).value,
                            // NOTE: employee? (Could be unassigned)
                          },
                        })
                        if (typeof onCreateNew === 'function') onCreateNew()
                      }
                    }}
                    onChange={(ev) => {
                      send({ type: 'newTodo.change', value: ev.currentTarget.value })
                    }}
                    value={todo}
                    size='small'
                  />
                )
              }
              {
                isSortable && Object.values(counters).some((v) => v > 0) && (
                  <Box
                    sx={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 1,
                    }}
                  >
                    {
                      counters.allNew > 0 && (
                        <Link
                          to={getFullUrl({
                            url: pagerControlsHardcodedPath,
                            query: {
                              jobStatusFilter: 'new',
                            },
                            queryKeysToremove: activeFilters.values.jobStatusFilter === EJobsStatusFilter.NEW
                              ? ['jobStatusFilter', 'page']
                              : ['page', 'estimateReached']
                          })}
                        // to={`${pagerControlsHardcodedPath}?jobStatusFilter=new${!!lastSeenJobId ? `&lastSeenJob=${lastSeenJobId}` : ''}`}
                        >
                          <Button sx={{ borderRadius: 4 }} size='small'
                            variant={
                              activeFilters.values.jobStatusFilter === EJobsStatusFilter.NEW
                                ? 'contained' : 'outlined'}
                            startIcon={<NewReleasesIcon />}>
                            New ({counters.allNew})
                          </Button>
                        </Link>
                      )
                    }
                    {
                      counters.allActive > 0 && (
                        <Link
                          // to={`${pagerControlsHardcodedPath}?jobStatusFilter=active${!!lastSeenJobId ? `&lastSeenJob=${lastSeenJobId}` : ''}`}
                          to={getFullUrl({
                            url: pagerControlsHardcodedPath,
                            query: { jobStatusFilter: 'active' },
                            queryKeysToremove:
                              activeFilters.values.jobStatusFilter === EJobsStatusFilter.ACTIVE
                                ? activeFilters.estimateReached
                                  ? ['estimateReached', 'page']
                                  : ['jobStatusFilter', 'estimateReached', 'page']
                                : ['estimateReached', 'page']
                          })}
                        >
                          <Button sx={{ borderRadius: 4 }} size='small'
                            variant={
                              activeFilters.values.jobStatusFilter === EJobsStatusFilter.ACTIVE
                                && !activeFilters.estimateReached
                                ? 'contained' : 'outlined'}
                            startIcon={<FilterAltIcon />}>
                            Active ({counters.allActive})
                          </Button>
                        </Link>
                      )
                    }
                    {
                      counters.allCompleted > 0 && (
                        <Link
                          // to={`${pagerControlsHardcodedPath}?jobStatusFilter=completed${!!lastSeenJobId ? `&lastSeenJob=${lastSeenJobId}` : ''}`}
                          to={getFullUrl({
                            url: pagerControlsHardcodedPath,
                            query: { jobStatusFilter: 'completed' },
                            queryKeysToremove: activeFilters.values.jobStatusFilter === EJobsStatusFilter.COMPLETED
                              ? ['jobStatusFilter', 'estimateReached', 'page']
                              : ['page', 'estimateReached'],
                          })}
                        >
                          <Button
                            sx={{ borderRadius: 4 }}
                            size='small'
                            color='gray'
                            variant={
                              activeFilters.values.jobStatusFilter === EJobsStatusFilter.COMPLETED
                                && !activeFilters.estimateReached
                                ? 'contained' : 'outlined'}
                            startIcon={<TaskAltIcon />}
                          >
                            Completed ({counters.allCompleted})
                          </Button>
                        </Link>
                      )
                    }
                    {
                      counters.estimateNotReached > 0 && (
                        <Link
                          // to={`${pagerControlsHardcodedPath}?jobStatusFilter=active&estimateReached=0${!!lastSeenJobId ? `&lastSeenJob=${lastSeenJobId}` : ''}`}
                          to={getFullUrl({
                            url: pagerControlsHardcodedPath,
                            query: { jobStatusFilter: 'active', estimateReached: '0' },
                            queryKeysToremove:
                              activeFilters.values.jobStatusFilter === EJobsStatusFilter.ACTIVE
                                ? activeFilters.values.estimateReached === 0
                                  ? ['jobStatusFilter', 'estimateReached', 'page']
                                  : ['page']
                                : ['page']
                          })}
                        >
                          <Button
                            sx={{ borderRadius: 4 }}
                            size='small'
                            color='success'
                            variant={
                              activeFilters.values.jobStatusFilter === EJobsStatusFilter.ACTIVE
                                && activeFilters.values.estimateReached === 0
                                ? 'contained' : 'outlined'}
                            startIcon={<ThumbUpIcon />}
                          >
                            Active Forecast ({counters.estimateNotReached})
                          </Button>
                        </Link>
                      )
                    }
                    {
                      counters.estimateReached > 0 && (
                        <Link
                          // to={`${pagerControlsHardcodedPath}?jobStatusFilter=active&estimateReached=1${!!lastSeenJobId ? `&lastSeenJob=${lastSeenJobId}` : ''}`}
                          to={getFullUrl({
                            url: pagerControlsHardcodedPath,
                            query: { jobStatusFilter: 'active', estimateReached: '1' },
                            queryKeysToremove:
                              activeFilters.values.jobStatusFilter === EJobsStatusFilter.ACTIVE
                                ? activeFilters.values.estimateReached === 1
                                  ? ['estimateReached', 'page']
                                  : ['page']
                                : ['page']
                          })}
                        >
                          <Button sx={{ borderRadius: 4 }} size='small' color='error'
                            variant={
                              activeFilters.values.jobStatusFilter === EJobsStatusFilter.ACTIVE
                                && activeFilters.values.estimateReached === 1
                                ? 'contained' : 'outlined'} startIcon={<ThumbDownIcon />}>
                            Active Fuckups ({counters.estimateReached})
                          </Button>
                        </Link>
                      )
                    }
                    {
                      counters.allProjects > 0 && (
                        <Link
                          // to={`${pagerControlsHardcodedPath}?isProject=1`}
                          to={getFullUrl({
                            url: pagerControlsHardcodedPath,
                            query: { isProject: '1' },
                            queryKeysToremove:
                              activeFilters.isProject
                                ? ['isProject', 'page']
                                : ['page']
                          })}
                        >
                          <Button
                            sx={{ borderRadius: 4 }} size='small' color='info'
                            variant={
                              activeFilters.values.isProject === 1
                                ? 'contained' : 'outlined'
                            }
                            startIcon={<HiveIcon />}
                          >
                            Projects ({counters.allProjects})
                          </Button>
                        </Link>
                      )
                    }
                    {
                      activeFilters.isAnyFilterActive && !activeFilters.assignedTo && (
                        <Button
                          sx={{ borderRadius: 4 }}
                          size='small'
                          color='inherit'
                          variant='outlined'
                          startIcon={<FilterAltOffIcon />}
                          onClick={goPage({ url: pagerControlsHardcodedPath, queryKeysToremove: ['isProject', 'jobStatusFilter', 'estimateReached'] })}
                        >
                          Reset
                        </Button>
                      )
                    }
                  </Box>
                )
              }
            </div>
          )
        }
      </Grid>

      {jobs.length > 0 ? (
        <>
          <Grid size={12}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 0,
              }}
            >
              {jobs.map((job) =>
                <Job
                  isLastSeen={lastSeenJobId === job.id}
                  onToggleDrawer={onToggleDrawer}
                  key={`${job.id}-${job.ts.update}`}
                  job={job}
                  isActive={activeJobId === job.id}
                />
              )}
            </Box>
          </Grid>
        </>
      ) : (
        <Grid size={12}>
          <em>No items yet</em>
        </Grid>
      )}
    </Grid>
  )
})
