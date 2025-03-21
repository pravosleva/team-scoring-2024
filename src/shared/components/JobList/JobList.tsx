import { memo, useLayoutEffect, useState, useCallback } from 'react'
import { Job } from '~/shared/components/Job'
import { TopLevelContext, TJob, EJobsStatusFilter } from '~/shared/xstate/topLevelMachine/v2'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  TextField,
} from '@mui/material'
import Grid from '@mui/material/Grid2'
import { useParamsInspectorContextStore } from '~/shared/xstate/topLevelMachine/v2/context/ParamsInspectorContext'
import baseClasses from '~/App.module.scss'
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff'
import FilterAltIcon from '@mui/icons-material/FilterAlt'
import HiveIcon from '@mui/icons-material/Hive'
import NewReleasesIcon from '@mui/icons-material/NewReleases'
import TaskAltIcon from '@mui/icons-material/TaskAlt'
import ThumbUpIcon from '@mui/icons-material/ThumbUp'
import ThumbDownIcon from '@mui/icons-material/ThumbDown'

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
  activeJobId?: number | null;
  onToggleDrawer: (isDrawlerOpened: boolean) => ({ job }: { job: TJob }) => void;
}

export const JobList = memo(({ onToggleDrawer, activeJobId }: TProps) => {
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
  const [filteredTodos] = useParamsInspectorContextStore((ctx) => ctx.filteredJobs)
  const [activeFilters] = useParamsInspectorContextStore((ctx) => ctx.activeFilters)
  // const { values: filterValues } = activeFilters
  // const inputRef = useRef<HTMLInputElement>(null)

  // useEffect(() => {
  //   if (todos.length === 0) inputRef.current?.focus()
  // }, [todos])

  // -- NOTE: 2/3 Совершенно необязательный механизм,
  // просто интуитивный UX
  // TODO: Можно перенести в отдельный контекст
  const [lastSeenJob, setLastSeenJob] = useState<number | null>(null)
  const [urlSearchParams] = useSearchParams()
  useLayoutEffect(() => {
    const idToScroll = urlSearchParams.get('lastSeenJob')
    if (!!idToScroll && !Number.isNaN(Number(idToScroll))) setLastSeenJob(Number(idToScroll))
  }, [urlSearchParams, setLastSeenJob])
  // --
  const [mainCounters] = useParamsInspectorContextStore((ctx) => ctx.counters.main)
  const navigate = useNavigate()
  const goHomePage = useCallback(() => navigate('/jobs'), [navigate])
  return (
    <Grid container spacing={1}>
      <Grid
        size={12}
        sx={{
          borderBottom: '1px solid lightgray',
          position: 'sticky',
          top: 0,
          backgroundColor: '#fff',
          zIndex: 1,
          pb: 2,
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
          <h1>Jobs</h1>
          {/*
            activeFilters.isAnyFilterActive && (
              <Link to='/jobs'>
                <Button
                  size='small'
                  variant='outlined'
                  endIcon={<FilterAltOffIcon />}
                >Reset filters</Button>
              </Link>
            )
          */}
        </div>
        <div className={baseClasses.stack2}>
          {
            !activeFilters.isAnyFilterActive && (
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
          {/* <FormControlLabel
            control={
              <Checkbox
                checked={allCompleted}
                onChange={() => {
                  send({
                    type: 'todo.markAll',
                    mark: allCompleted ? 'active' : 'completed'
                  })
                }}
                name='gilad'
              />
            }
            label={`Mark all as ${mark}`}
          /> */}
          {/*
            activeFilters.isAnyFilterActive && (
              <pre className={baseClasses.preNormalized}>{JSON.stringify(filterValues, null, 2)}</pre>
            )
          */}

          {
            Object.values(mainCounters).some((v) => v > 0) && (
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 1,
                }}
              >
                {
                  mainCounters.allNew > 0 && (
                    <Link to='/jobs?jobStatusFilter=new'>
                      <Button sx={{ borderRadius: 4 }} size='small'
                        variant={
                          activeFilters.values.jobStatusFilter === EJobsStatusFilter.NEW
                          ? 'contained' : 'outlined'}
                        startIcon={<NewReleasesIcon />}>
                        New ({mainCounters.allNew})
                      </Button>
                    </Link>
                  )
                }
                {
                  mainCounters.allActive > 0 && (
                    <Link to='/jobs?jobStatusFilter=active'>
                      <Button sx={{ borderRadius: 4 }} size='small'
                        variant={
                          activeFilters.values.jobStatusFilter === EJobsStatusFilter.ACTIVE
                          && !activeFilters.estimateReached
                          && !activeFilters.assignedTo
                          ? 'contained' : 'outlined'}
                        startIcon={<FilterAltIcon />}>
                        Active ({mainCounters.allActive})
                      </Button>
                    </Link>
                  )
                }
                {
                  mainCounters.allCompleted > 0 && (
                    <Link to='/jobs?jobStatusFilter=completed'>
                      <Button
                        sx={{ borderRadius: 4 }}
                        size='small'
                        color='gray'
                        variant={
                          activeFilters.values.jobStatusFilter === EJobsStatusFilter.COMPLETED
                          && !activeFilters.estimateReached
                          && !activeFilters.assignedTo
                          ? 'contained' : 'outlined'}
                        startIcon={<TaskAltIcon />}
                      >
                        Completed ({mainCounters.allCompleted})
                      </Button>
                    </Link>
                  )
                }
                {
                  mainCounters.estimateNotReached > 0 && (
                    <Link to='/jobs?jobStatusFilter=active&estimateReached=0'>
                      <Button
                        sx={{ borderRadius: 4 }}
                        size='small'
                        color='success'
                        variant={
                          activeFilters.values.jobStatusFilter === EJobsStatusFilter.ACTIVE
                          && activeFilters.values.estimateReached === 0
                          && !activeFilters.assignedTo
                          ? 'contained' : 'outlined'}
                        startIcon={<ThumbUpIcon />}
                      >
                        Active Forecast ({mainCounters.estimateNotReached})
                      </Button>
                    </Link>
                  )
                }
                {
                  mainCounters.estimateReached > 0 && (
                    <Link to='/jobs?jobStatusFilter=active&estimateReached=1'>
                      <Button sx={{ borderRadius: 4 }} size='small' color='error'
                      variant={
                        activeFilters.values.jobStatusFilter === EJobsStatusFilter.ACTIVE
                        && activeFilters.values.estimateReached === 1
                        && !activeFilters.assignedTo
                        ? 'contained' : 'outlined'} startIcon={<ThumbDownIcon />}>
                        Active Fuckups ({mainCounters.estimateReached})
                      </Button>
                    </Link>
                  )
                }
                {
                  mainCounters.allProjects > 0 && (
                    <Link to='/jobs?isProject=1'>
                      <Button
                        sx={{ borderRadius: 4 }} size='small' color='info'
                        variant={
                          activeFilters.values.isProject === 1
                          ? 'contained' : 'outlined'
                        }
                        startIcon={<HiveIcon />}
                      >
                        Projects ({mainCounters.allProjects})
                      </Button>
                    </Link>
                  )
                }
                {
                  activeFilters.isAnyFilterActive && (
                    <Button
                      sx={{ borderRadius: 4 }}
                      size='small'
                      color='inherit'
                      variant='outlined'
                      startIcon={<FilterAltOffIcon />}
                      onClick={goHomePage}
                    >
                      Reset
                    </Button>
                  )
                }
              </Box>
            )
          }
        </div>
      </Grid>

      {filteredTodos.length > 0 ? (
        <>
          <Grid size={12}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 0,
              }}
            >
              {filteredTodos.map((job) =>
                <Job
                  isLastSeen={lastSeenJob === job.id}
                  onToggleDrawer={onToggleDrawer}
                  key={`${job.id}-${job.ts.update}`}
                  job={job}
                  isActive={activeJobId === job.id}
                />
              )}
            </Box>
          </Grid>

          {/* 
          <footer className='footer'>
            <span className='todo-count'>
              <strong>{numActiveTodos}</strong> item
              {numActiveTodos === 1 ? '' : 's'} left
            </span>
            <ul className='filters'>
              <li>
                <Link to='/jobs?jobStatusFilter=all' target='_self' className={clsx({ selected: filter === 'all' })}>
                  All
                </Link>
              </li>
              <li>
                <Link to='/jobs?jobStatusFilter=active' target='_self' className={clsx({ selected: filter === 'active' })}>
                  Active
                </Link>
              </li>
              <li>
                <Link to='/jobs?jobStatusFilter=completed' target='_self' className={clsx({ selected: filter === 'completed' })}>
                  Completed
                </Link>
              </li>
            </ul>
          
            {
              numActiveTodos < todos.length && (
                <button
                  onClick={() => send({ type: 'todos.clearCompleted' })}
                  className='clear-completed'
                >
                  Clear completed
                </button>
              )
            }
          </footer> */}
        </>
      ) : (
        <Grid size={12}>
          <em>No items yet</em>
        </Grid>
      )}
    </Grid>
  )
})
