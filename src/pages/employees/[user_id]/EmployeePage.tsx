import { useCallback, useMemo, useState, useEffect, memo, Fragment } from 'react'
import { useParams, useLocation, useNavigate, Link, useSearchParams } from 'react-router-dom'
import { EJobsStatusFilter, TJob, TopLevelContext, TUser } from '~/shared/xstate'
import Grid from '@mui/material/Grid2'
import { Box, Button, ListItem, ListItemButton, ListItemText, ListItemAvatar } from '@mui/material'
import { AutoRefreshedJobMuiAva } from '~/shared/components/Job/utils'
import baseClasses from '~/App.module.scss'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import dayjs from 'dayjs'
import { UserAva } from '~/shared/components/Job/components'
import FilterAltIcon from '@mui/icons-material/FilterAlt'
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff'
import { useParamsInspectorContextStore } from '~/shared/xstate/topLevelMachine/v2/context/ParamsInspectorContextWrapper'
import { JobResultReviewShort } from '~/pages/jobs/[job_id]/components'
import {
  ResponsiveBlock,
  SpeedsFunctionGraph,
} from '~/shared/components'
import HiveIcon from '@mui/icons-material/Hive'
import NewReleasesIcon from '@mui/icons-material/NewReleases'
import TaskAltIcon from '@mui/icons-material/TaskAlt'
import ThumbUpIcon from '@mui/icons-material/ThumbUp'
import ThumbDownIcon from '@mui/icons-material/ThumbDown'
import { sort } from '~/shared/utils/array-ops/sort-array-objects@3.0.0'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
// import { CollapsibleJobInfoAndButton } from './components'
// import { getTruncated } from '~/shared/utils/string-ops'

export const EmployeePage = memo(() => {
  // const todosActorRef = TopLevelContext.useActorRef()
  // const { send } = todosActorRef
  const [urlSearchParams] = useSearchParams()
  const [lastSeenJobId, setLastSeenJobId] = useState<number | null>(null)
  const location = useLocation()
  const params = useParams()
  useEffect(() => {
    const lastSeenJob = urlSearchParams.get('lastSeenJob')
    if (!!lastSeenJob && !Number.isNaN(Number(lastSeenJob))) setLastSeenJobId(Number(lastSeenJob))
    else setLastSeenJobId(null)
  }, [setLastSeenJobId, urlSearchParams])
  const users = TopLevelContext.useSelector((s) => s.context.users.items)
  // const jobs = TopLevelContext.useSelector((s) => s.context.jobs.items)
  const targetUser = useMemo<TUser | null>(() => {
    return users?.find(({ id }) => id === Number(params.user_id)) || null
  }, [users, params.user_id])
  // const targetJobs = useMemo(() => {
  //   return !!targetUser ? jobs.filter(({ forecast }) => forecast.assignedTo === targetUser.id) : []
  // }, [jobs, targetUser])
  const [filteredJobs] = useParamsInspectorContextStore((ctx) => ctx.filteredJobs)
  const sortedJobs = useMemo<(TJob & { tsUpdate: number })[]>(() => {
    return sort(
      filteredJobs.map((job) => ({ ...job, tsUpdate: job.ts.update })),
      ['tsUpdate'],
      -1
    )
  }, [filteredJobs])
  const jobsForAnalysis = useMemo(() => sortedJobs
    .filter(({ forecast }) =>
      forecast.estimate
      && forecast.start
      && forecast.finish
    ), [sortedJobs])
  const navigate = useNavigate()
  const goJobPage = useCallback(({ id }: { id: number; }) => () => {
    // navigate(`/jobs/${id}?from=${
    //   encodeURIComponent(`/employees${!!targetUser ? `/${targetUser.id}` : ''}?to=/jobs/${id}&lastSeenJob=${id}&forwardActionUiText=Job&from=/jobs&backActionUiText=Jobs&lastSeenJob=${id}`)
    // }&backActionUiText=${
    //   encodeURIComponent(!!targetUser ? targetUser.displayName : 'Employees')
    // }`)
    navigate([
      `/jobs/${id}`,
      '?',
      [
        `from=${encodeURIComponent(
          [
            '/employees',
            !!targetUser ? `/${targetUser.id}` : '',
            '?',
            [
              `to=/jobs/${id}`,
              'forwardActionUiText=Job',
              // 'from=/jobs',
              // 'backActionUiText=Jobs',
              `lastSeenJob=${id}`,
            ].join('&')
          ].join('')
        )}`,
        `backActionUiText=${encodeURIComponent(
          !!targetUser
            ? targetUser.displayName
            : 'Employees'
        )}`
      ].join('&')
    ].join(''))
  }, [navigate, targetUser])
  const goUserPage = useCallback(() => {
    navigate(`/employees/${targetUser?.id}`)
  }, [navigate, targetUser])

  const [employeesCounters] = useParamsInspectorContextStore((ctx) => ctx.counters.employees)
  const targetUserCounters = useMemo(() => !!targetUser ? employeesCounters[String(targetUser.id)] : null, [targetUser, employeesCounters])
  const [activeFilters] = useParamsInspectorContextStore((ctx) => ctx.activeFilters)

  const [userRouteControls] = useParamsInspectorContextStore((ctx) => ctx.userRouteControls)
  return (
    <>
      <Grid
        container
        spacing={1}
        sx={{
          marginBottom: '24px',
        }}
      >
        <Grid
          size={12}
          sx={{
            borderBottom: '1px solid lightgray',
            position: 'sticky',
            top: 0,
            backgroundColor: '#fff',
            zIndex: 2,
            pt: 2,
            pb: 2,
          }}
        >
          <div
            style={{
              width: '100%', display: 'flex', flexDirection: 'column', gap: '8px',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              {
                !!targetUser?.displayName
                  ? (
                    <UserAva
                      name={targetUser.displayName}
                      size={40}
                    />
                  ) : (
                    <AccountCircleIcon />
                  )
              }
              <div
                style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0px' }}
              >
                <div style={{ fontWeight: 'bold' }}>{targetUser?.displayName || `#${params.user_id}`}</div>
                {/* <div>[WIP] AVG</div> */}
              </div>
            </Box>
            {
              !!targetUser && (
                <div
                  style={{
                    fontSize: 'x-small',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '8px',
                    justifyContent: 'space-between',
                    color: 'gray',
                  }}
                >
                  <em>Created at {dayjs(targetUser?.ts.create).format('DD.MM.YYYY')}</em>
                  <em>Updated at {dayjs(targetUser?.ts.update).format('DD.MM.YYYY')}</em>
                </div>
              )
            }
          </div>
        </Grid>

        {
          !!targetUserCounters
          && Object.values(targetUserCounters).some((v) => v > 0)
          && !!targetUser
          && (
            <Grid size={12}>
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 1,
                  pt: 2,
                }}
              >
                {
                  targetUserCounters.allNew > 0 && (
                    <Link to={`/employees/${targetUser?.id}?jobStatusFilter=new`}>
                      <Button sx={{ borderRadius: 4 }} size='small'
                        variant={
                          activeFilters.values.jobStatusFilter === EJobsStatusFilter.NEW
                            ? 'contained' : 'outlined'}
                        startIcon={<NewReleasesIcon />}>
                        New ({targetUserCounters.allNew})
                      </Button>
                    </Link>
                  )
                }
                {
                  targetUserCounters.allActive > 0 && (
                    <Link
                      // to={`/jobs?jobStatusFilter=active&assignedTo=${targetUser?.id}`}
                      to={`/employees/${targetUser?.id}?jobStatusFilter=active`}
                    >
                      <Button sx={{ borderRadius: 4 }}
                        size='small'
                        variant={
                          activeFilters.values.jobStatusFilter === EJobsStatusFilter.ACTIVE
                            && !activeFilters.estimateReached
                            && activeFilters.assignedTo
                            ? 'contained'
                            : 'outlined'
                        }
                        startIcon={<FilterAltIcon />}
                      >
                        Active ({targetUserCounters?.allActive})
                      </Button>
                    </Link>
                  )
                }
                {
                  targetUserCounters.allCompleted > 0 && (
                    <Link
                      // to={`/jobs?jobStatusFilter=completed&assignedTo=${targetUser?.id}`}
                      to={`/employees/${targetUser?.id}?jobStatusFilter=completed`}
                    >
                      <Button sx={{ borderRadius: 4 }}
                        size='small'
                        color='gray'
                        variant={
                          activeFilters.values.jobStatusFilter === EJobsStatusFilter.COMPLETED
                            && !activeFilters.estimateReached
                            && activeFilters.assignedTo
                            ? 'contained' : 'outlined'}
                        startIcon={<TaskAltIcon />}
                      >
                        Completed ({targetUserCounters.allCompleted})
                      </Button>
                    </Link>
                  )
                }
                {
                  targetUserCounters.estimateNotReached > 0 && (
                    <Link
                      // to={`/jobs?jobStatusFilter=active&assignedTo=${targetUser?.id}&estimateReached=0`}
                      to={`/employees/${targetUser?.id}?jobStatusFilter=active&estimateReached=0`}
                    >
                      <Button sx={{ borderRadius: 4 }}
                        size='small'
                        color='success'
                        variant={
                          activeFilters.values.jobStatusFilter === EJobsStatusFilter.ACTIVE
                            && activeFilters.values.estimateReached === 0
                            && activeFilters.assignedTo
                            ? 'contained' : 'outlined'
                        }
                        startIcon={<ThumbUpIcon />}
                      >
                        Active Forecast ({targetUserCounters.estimateNotReached})
                      </Button>
                    </Link>
                  )
                }
                {
                  targetUserCounters.estimateReached > 0 && (
                    <Link
                      // to={`/jobs?jobStatusFilter=active&assignedTo=${targetUser?.id}&estimateReached=1`}
                      to={`/employees/${targetUser?.id}?jobStatusFilter=active&estimateReached=1`}
                    >
                      <Button sx={{ borderRadius: 4 }}
                        size='small'
                        color='error'
                        variant={
                          activeFilters.values.jobStatusFilter === EJobsStatusFilter.ACTIVE
                            && activeFilters.values.estimateReached === 1
                            && activeFilters.assignedTo
                            ? 'contained' : 'outlined'
                        }
                        startIcon={<ThumbDownIcon />}
                      >
                        Active Fuckups ({targetUserCounters.estimateReached})
                      </Button>
                    </Link>
                  )
                }
                {
                  targetUserCounters.allProjects > 0 && (
                    <Link to={`/employees/${targetUser?.id}?isProject=1`}>
                      <Button
                        sx={{ borderRadius: 4 }} size='small' color='info'
                        variant={
                          activeFilters.values.isProject === 1
                            ? 'contained' : 'outlined'
                        }
                        startIcon={<HiveIcon />}
                      >
                        Projects ({targetUserCounters.allProjects})
                      </Button>
                    </Link>
                  )
                }
                {
                  (activeFilters.estimateReached
                    || activeFilters.jobStatusFilter
                    || activeFilters.isProject) && (
                    <Button sx={{ borderRadius: 4 }}
                      size='small'
                      color='inherit'
                      variant='outlined'
                      startIcon={<FilterAltOffIcon />}
                      onClick={goUserPage}
                    >
                      Reset
                    </Button>
                  )
                }
              </Box>
            </Grid>
          )
        }

        {
          sortedJobs.length === 0
            ? (
              <>
                <Grid size={12}>
                  <em>No target jobs for this user</em>
                </Grid>
                {/* <Grid size={12}>
                  <pre className={baseClasses.preNormalized}>
                    {JSON.stringify({ jobs, sortedJobs }, null, 2)}
                  </pre>
                </Grid> */}
              </>
            ) : (
              <Grid
                size={12}
              >
                <h2>[ Jobs ]</h2>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                  }}
                >
                  {/* <List
                sx={{
                  border: '1px solid red',
                  gap: 1,
                }}
              > */}
                  {
                    sortedJobs.map((job) => {
                      return (
                        <Fragment key={job.id}>
                          <ListItem
                            disablePadding
                            id={`job_list_item_${job.id}`}
                          >
                            <ListItemButton
                              onClick={goJobPage({ id: job.id })}
                              sx={{
                                borderRadius: 2,
                                backgroundColor: lastSeenJobId === job.id
                                  ? '#f7f5fa'
                                  : 'inherit',
                              }}
                            >
                              <ListItemAvatar>
                                <AutoRefreshedJobMuiAva job={job} delay={1000} />
                              </ListItemAvatar>
                              <ListItemText
                                primary={
                                  <span
                                    // className={baseClasses.truncate}
                                    style={{
                                      display: 'block',
                                      fontSize: 'small',
                                    }}
                                  >
                                    {job.title}
                                  </span>
                                }
                                secondary={<JobResultReviewShort job={job} />}
                              />
                            </ListItemButton>
                          </ListItem>
                          {/* <CollapsibleJobInfoAndButton
                          jobId={job.id}
                        /> */}
                        </Fragment>
                      )
                    })
                  }
                  {/* </List> */}
                </Box>
                {/* <pre className={baseClasses.preNormalized}>
                {JSON.stringify({ targetJobs }, null, 2)}
              </pre> */}
              </Grid>
            )
        }

        {
          jobsForAnalysis.length === 0
            ? (
              <Grid size={12}>
                <em>No jobs for analysis this user</em>
              </Grid>
            ) : (
              <Grid size={12}>
                <h2>[ Jobs analysis: {jobsForAnalysis.length} ]</h2>
                <SpeedsFunctionGraph targetJobs={jobsForAnalysis} />
                {/* getSortedSpeedsCalc */}
              </Grid>
            )
        }

        <Grid size={12}>
          <h2>[ Debug ]</h2>
          <pre className={baseClasses.preNormalized}>
            {JSON.stringify({ targetUser, params, location }, null, 2)}
          </pre>
        </Grid>
      </Grid>

      {
        (!!userRouteControls.from || !!userRouteControls.to) && (
          <ResponsiveBlock
            className={baseClasses.specialActionsGrid}
            style={{
              padding: '16px 0 16px 0',
              position: 'sticky',
              bottom: 0,
              backgroundColor: '#fff',
              zIndex: 1,
              marginTop: 'auto',
              boxShadow: '0 -10px 7px -8px rgba(34,60,80,.2)',
            }}
          >
            {
              !!userRouteControls.from && (
                <Link
                  to={userRouteControls.from.value}
                  target='_self'
                  className={baseClasses.truncate}
                >
                  <Button variant='contained' startIcon={<ArrowBackIcon />} fullWidth className={baseClasses.truncate}>
                    {/* getTruncated(userRouteControls.from.uiText, 11) */}
                    <span className={baseClasses.truncate}>{userRouteControls.from.uiText}</span>
                  </Button>
                </Link>
              )
            }
            {
              !userRouteControls.from && (
                <Link
                  to={`/jobs${!!lastSeenJobId ? `?lastSeenJob=${lastSeenJobId}` : ''}`}
                  target='_self'
                >
                  <Button variant='contained' startIcon={<ArrowBackIcon />} fullWidth>
                    Jobs
                  </Button>
                </Link>
              )
            }
            {
              !!userRouteControls.to && (
                <Link
                  to={userRouteControls.to.value}
                  target='_self'
                  className={baseClasses.truncate}
                >
                  <Button variant='outlined' endIcon={<ArrowForwardIcon />} fullWidth className={baseClasses.truncate}>
                    {/* getTruncated(userRouteControls.to.uiText, 11) */}
                    <span className={baseClasses.truncate}>{userRouteControls.to.uiText}</span>
                  </Button>
                </Link>
              )
            }
          </ResponsiveBlock>
        )
      }
    </>
  )
})
