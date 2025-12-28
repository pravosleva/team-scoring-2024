import { useMemo, memo } from 'react'
// import { Layout } from '~/shared/components/Layout'
import { useParams } from 'react-router-dom'
import { TJob, TopLevelContext, TUser, useSearchWidgetDataLayerContextStore } from '~/shared/xstate'
import Grid from '@mui/material/Grid2'
import {
  CollapsibleBox,
  DistributionFunctionGraph,
  HighlightedText,
  ResponsiveBlock,
  SimpleJobPointsetChecker,
  SpeedsFunctionGraph,
} from '~/shared/components'
import { getWorstCalc } from '~/shared/utils/team-scoring'
// import { AutoRefreshedProgressBar } from '~/shared/components/ProgressBar'
import dayjs from 'dayjs'
import baseClasses from '~/App.module.scss'
import { Link } from 'react-router-dom'
import { Alert, Box, Button, Rating } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { JobStats } from '~/shared/components/Job/components'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import ConstructionIcon from '@mui/icons-material/Construction'
import { AutoRefreshedJobMuiAva } from '~/shared/components/Job/utils'
import {
  // getJobStatusText,
  getTargetUserNameUI,
} from './utils'
import { JobResultReviewShort } from './components'
import StarBorderIcon from '@mui/icons-material/StarBorder'
import StarIcon from '@mui/icons-material/Star'
import { useParamsInspectorContextStore } from '~/shared/xstate/topLevelMachine/v2/context/ParamsInspectorContextWrapper'
import { TotalJobChecklist, ProjectsTree } from './components'
import { getIsNumeric } from '~/shared/utils/number-ops'
import clsx from 'clsx'
import { ProductivityAnalysisGraph } from '~/shared/components/Job/components/JobStats/components/ProductivityAnalysisGraph'
import { JobTimingStandartInfo } from '~/shared/components/Job/components/JobStats/components/SubjobsList/components/JobTimingStandartInfo'
import { scrollToIdFactory } from '~/shared/utils/web-api-ops'
import QueryStatsIcon from '@mui/icons-material/QueryStats'

const specialScroll = scrollToIdFactory({
  timeout: 200,
  offsetTop: 16,
  elementHeightCritery: 550,
})

export const JobPage = memo(() => {
  // const todosActorRef = TopLevelContext.useActorRef()
  // const { send } = todosActorRef
  const params = useParams()
  const users = TopLevelContext.useSelector((s) => s.context.users.items)
  const jobs = TopLevelContext.useSelector((s) => s.context.jobs.items)
  const targetJob = useMemo<TJob | null>(() => jobs
    .filter((j) => String(j.id) === params.job_id)?.[0] || null, [jobs, params.job_id])
  const targetUser = useMemo<TUser | null>(() => {
    const userId = Number(targetJob?.forecast.assignedTo)
    return users?.find(({ id }) => id === userId) || null
  }, [users, targetJob])
  const targetUserJobs = useMemo(() => {
    return !!targetUser ? jobs.filter(({ forecast }) => forecast.assignedTo === targetUser.id) : []
  }, [jobs, targetUser])
  const otherUserJobsForAnalysis = useMemo(() => targetUserJobs
    .filter(({ forecast, id }) =>
      forecast.estimate
      && forecast.start
      && forecast.finish
      && String(id) !== params.job_id
      && targetJob?.forecast.complexity === forecast.complexity
    ), [targetUserJobs, params.job_id, targetJob])

  const isJobDone = useMemo(() => !!targetJob?.forecast.finish, [targetJob])
  const isJobStarted = useMemo(() => !!targetJob?.forecast.start, [targetJob])
  const isJobEstimated = useMemo(() => !!targetJob?.forecast.estimate, [targetJob])
  const isJobStartedAndEstimated = useMemo(() => !!targetJob?.forecast.start && !!targetJob.forecast.estimate, [targetJob])
  const targetUserNameUI = useMemo(() => getTargetUserNameUI({ user: targetUser }), [targetUser])
  const worst100Date = useMemo<number | null>(() =>
    !!targetJob && isJobStartedAndEstimated
      ? getWorstCalc({
        theJobList: otherUserJobsForAnalysis,
        ts: {
          testStart: targetJob.forecast.start as number,
          testDiff: (targetJob.forecast.estimate as number) - (targetJob.forecast.start as number),
        },
      }).date100
      : null, [targetJob, isJobStartedAndEstimated, otherUserJobsForAnalysis])

  // const statusText = useMemo(() => getJobStatusText({
  //   job: targetJob,
  //   user: targetUser,
  // }), [targetJob, targetUser])

  // const targetJobWithoutLogs = useMemo(() => {
  //   try {
  //     if (!targetJob) throw new Error('No targetJob')
  //     // eslint-disable-next-line @typescript-eslint/no-unused-vars
  //     const { logs, ...rest } = targetJob
  //     return rest
  //     // eslint-disable-next-line @typescript-eslint/no-unused-vars
  //   } catch (_err) {
  //     return null
  //   }
  // }, [targetJob])

  // const [urlSearchParams] = useSearchParams()
  // const urlSearchParamFrom = useMemo(() => urlSearchParams.get('from'), [urlSearchParams])
  // const urlSearchParamBackActionUiText = useMemo(() => urlSearchParams.get('backActionUiText'), [urlSearchParams])
  const [userRouteControls] = useParamsInspectorContextStore((ctx) => ctx.userRouteControls)
  const [searchValueBasic] = useSearchWidgetDataLayerContextStore((s) => s.searchValueBasic)

  return (
    <Grid container spacing={2}>
      <Grid
        size={12}
        // className={baseClasses.boxShadowBottom}
        sx={{
          borderBottom: '1px solid lightgray',
          // position: 'sticky',
          // top: 0,
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
              !!targetJob
                ? (
                  <AutoRefreshedJobMuiAva job={targetJob} delay={1000} />
                ) : (
                  <ConstructionIcon />
                )
            }
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}
            >
              {
                !targetJob && (
                  <div style={{ fontWeight: 'bold' }}>Ooops! Job not found...</div>
                )
              }
              {
                !!targetJob && (
                  <Rating
                    size='small'
                    name='rating-view'
                    value={targetJob.forecast.complexity}
                    readOnly
                    icon={<StarIcon htmlColor='gray' fontSize='inherit' />}
                    emptyIcon={<StarBorderIcon fontSize='inherit' />}
                    max={targetJob.forecast.complexity > 5 ? targetJob.forecast.complexity : 5}
                  />
                )
              }
              {!!targetJob && <JobResultReviewShort job={targetJob} />}
            </div>
          </Box>
          {/* <em style={{ fontSize: 'small' }}>Status: {statusText}</em> */}

          <HighlightedText
            comparedValue={targetJob?.title || `Not found #${params.job_id}`}
            testedValue={clsx(searchValueBasic)}
            style={{ display: 'block', fontSize: 'small', fontWeight: 'bold' }}
            className={baseClasses.truncate}
          />

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
            <em>Created at {dayjs(targetJob?.ts.create).format('DD.MM.YYYY')}</em>
            <em>Updated at {dayjs(targetJob?.ts.update).format('DD.MM.YYYY')}</em>
          </div>
        </div>
      </Grid>

      <Grid size={12}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <HighlightedText
            comparedValue={targetJob?.title || `Not found #${params.job_id}`}
            testedValue={clsx(searchValueBasic)}
            style={{ display: 'block', fontWeight: 'bold' }}
          />

          {!!targetJob?.descr && (
            <HighlightedText
              comparedValue={targetJob.descr}
              testedValue={clsx(searchValueBasic)}
              style={{ display: 'block', fontSize: 'small', fontStyle: 'italic', color: '#959eaa' }}
            />
          )}
        </Box>
      </Grid>

      {
        !!targetJob && (
          <Grid size={12}>
            <SimpleJobPointsetChecker jobId={targetJob.id} isEditable={true} isCreatable={true} />
          </Grid>
        )
      }

      {
        !!targetJob && (
          <ProjectsTree jobId={targetJob.id} isDebugEnabled={false} />
        )
      }

      {/*
        !!targetJob?.descr && (
          <Grid size={12}>
            <em style={{ color: 'gray' }}>{targetJob.descr}</em>
          </Grid>
        )
      */}

      {
        !!params.job_id && getIsNumeric(params.job_id) && (
          <Grid size={12}>
            <TotalJobChecklist
              job_id={Number(params.job_id)}
              key={targetJob?.ts.update}
            />
          </Grid>
        )
      }

      <Grid size={12}>
        <pre
          style={{
            // fontSize: '13px',
            // maxHeight: '150px',
            // backgroundColor: 'lightgray',
          }}
          className={baseClasses.preNormalized}
        >{JSON.stringify({ userRouteControls, params }, null, 2)}</pre>
      </Grid>

      {
        otherUserJobsForAnalysis.length > 0
          ? (
            <>
              <Grid size={12}>
                <h2>[ Analysis ]</h2>
              </Grid>
              <Grid size={12}>
                {
                  !!targetJob?.forecast.estimate
                    && !!targetJob?.forecast.start
                    ? (
                      <DistributionFunctionGraph
                        targetJob={targetJob}
                        targetJobs={otherUserJobsForAnalysis}
                        ts={{
                          testStart: targetJob?.forecast.start,
                          testDiff: targetJob?.forecast.estimate - targetJob?.forecast.start,
                        }}
                      // title='Analysis'
                      />
                    ) : (
                      <Alert
                        severity='warning'
                        variant='filled'
                      >
                        <em>Incorrect job forecast params</em>
                      </Alert>
                    )
                }
              </Grid>
              <Grid size={12}>
                <SpeedsFunctionGraph
                  targetJob={targetJob || undefined}
                  targetJobs={otherUserJobsForAnalysis}
                />
              </Grid>
              <Grid size={12}>
                <em style={{ fontSize: 'small' }}>
                  {clsx('Based on another completed jobs', !!targetUserNameUI ? `assigned to ${targetUserNameUI}` : undefined)}
                </em>
              </Grid>
            </>
          ) : (
            <Grid size={12}>
              <h2>[ Analysis ]</h2>
              <Alert
                severity='warning'
                variant='filled'
              >
                <em>No other jobs for analysis</em>
              </Alert>
            </Grid>
          )
      }

      {
        !!targetJob && (
          <Grid size={12}>
            <Grid container spacing={0} sx={{ border: 'none' }}>
              <Grid container spacing={1} size={12} sx={{ border: 'none' }}>
                <Grid size={12}>
                  <b>ℹ️ About your Business Time</b>
                </Grid>
                <Grid size={12} className={baseClasses.autoShow}>
                  <CollapsibleBox
                    id='job-stats'
                    onClose={({ id }) => specialScroll({ id })}
                    onOpen={({ id }) => specialScroll({ id })}
                    connectedOnThe={[]}
                    header={'Productivity Analysis'}
                    icon={<QueryStatsIcon fontSize='small' />}
                    text={
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <ProductivityAnalysisGraph job={targetJob} />
                        <em style={{ fontSize: 'small' }}>
                          <JobTimingStandartInfo job={targetJob} />
                        </em>
                        {/* <br />
                          <em>{dayjs(job.forecast.start).format('DD.MM.YYYY HH:mm')} - {dayjs(job.forecast.estimate).format('DD.MM.YYYY HH:mm')}</em>
                          <br />
                          <JobResultReviewShort job={job} /> */}
                      </div>
                    }
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        )
      }

      {
        !isJobDone && (
          <Grid size={12}>
            <h2>[ Current stats ]</h2>
            {
              isJobStartedAndEstimated
                && !!worst100Date
                && !!targetJob?.forecast.start
                ? (
                  <JobStats job={targetJob} />
                ) : (
                  <Alert
                    severity='warning'
                    variant='filled'
                  >
                    <em>Job {isJobStarted ? 'started' : 'not started'} and {isJobEstimated ? 'estimated' : 'not estimated'}</em>
                  </Alert>
                )
            }
          </Grid>
        )
      }

      {/* <Grid size={12}>
        <pre className={baseClasses.preNormalized}>
          {JSON.stringify({ targetUser }, null, 2)}
        </pre>
      </Grid>

      <Grid size={12}>
        <pre className={baseClasses.preNormalized}>
          {JSON.stringify({ targetJobWithoutLogs }, null, 2)}
        </pre>
      </Grid> */}

      {/* <Grid size={12}>
        <pre className={baseClasses.preNormalized}>
          {JSON.stringify({ otherUserJobsForAnalysis }, null, 2)}
        </pre>
      </Grid> */}

      <ResponsiveBlock
        className={clsx(baseClasses.stack1, baseClasses.backdropBlurSuperLite)}
        style={{
          // padding: '16px 0 16px 0',
          padding: '0px 0px 0px 0px',
          borderRadius: '32px',
          position: 'sticky',
          bottom: 16,
          // backgroundColor: '#fff',
          border: '2px solid #fff',
          // border: '2px solid #959eaa',
          zIndex: 50, // NOTE: See ./components/ProjectTree/components/ProjectNode
          marginTop: 'auto',
          marginBottom: '16px',
          // boxShadow: '0 -10px 7px -8px rgba(34,60,80,.2)',
          boxShadow: 'rgba(0, 0, 0, 0.35) 0px 5px 15px',
          // width: 'calc(100% - 16px)',
          // marginLeft: 'auto',
          // marginRight: 'auto',
          // transform: 'translateX(-8px)'
        }}
      >

        <ResponsiveBlock
          // className={baseClasses.specialActionsGrid}
          className={clsx(baseClasses.stack1, baseClasses.fadeIn)}
          style={{
            padding: '16px 16px 16px 16px',
            // border: '1px dashed red',
            // boxShadow: '0 -10px 7px -8px rgba(34,60,80,.2)',
            position: 'sticky',
            bottom: '16px',
            // backgroundColor: '#fff',
            zIndex: 3,
            marginTop: 'auto',
            // borderRadius: '16px 16px 0px 0px',
            // borderRadius: '32px',
            borderRadius: '30px',
            // boxShadow: '0 -10px 7px -8px rgba(34,60,80,.2)',
            // boxShadow: 'rgba(0, 0, 0, 0.35) 0px 5px 15px',
            // boxShadow: 'rgba(100, 100, 111, 0.2) 0px 7px 29px 0px',
            // marginBottom: '16px',
          }}
        >
          {
            !!targetJob ? (
              <Link
                to={
                  [
                    '/jobs',
                    !!targetJob
                      ? `?lastSeenJob=${targetJob.id}&openDrawer=1`
                      : '',
                  ].join('')
                }
              >
                <Button
                  size='small'
                  fullWidth
                  variant='outlined'
                  startIcon={<ArrowBackIcon />}
                  // className={baseClasses.truncate}
                  sx={{
                    borderRadius: 4,
                    boxShadow: 'none',
                  }}
                >
                  <span className={baseClasses.truncate}>Open details | {targetJob.title || 'No title'}</span>
                </Button>
              </Link>
            ) : (
              <em>No target job</em>
            )
          }

          {
            (
              !!targetJob?.forecast.assignedTo
              || (!!userRouteControls.to || !!userRouteControls.from)
            ) && (
              <ResponsiveBlock
                className={baseClasses.specialActionsGrid}
              >
                {
                  !!targetJob?.forecast.assignedTo && (
                    <Link
                      to={
                        [
                          `/employees/${targetJob.forecast.assignedTo}`,
                          !!targetJob
                            ? '?'
                            : '',
                          !!targetJob
                            ? [
                              `lastSeenJob=${targetJob.id}`,
                              `from=${encodeURIComponent(`/jobs/${targetJob.id}`)}`,
                              // `backActionUiText=${encodeURIComponent(`Job // ${targetJob.title}`)}`,
                            ].join('&')
                            : '',
                        ].join('')
                      }
                      target='_self'
                      className={baseClasses.truncate}
                    >
                      <Button
                        size='small'
                        variant='outlined'
                        color='gray'
                        startIcon={<AccountCircleIcon />}
                        fullWidth
                        className={baseClasses.truncate}
                        sx={{
                          borderRadius: 4,
                          boxShadow: 'none',
                        }}
                      >
                        <span className={baseClasses.truncate}>{targetUser?.displayName || 'Employee'}</span>
                      </Button>
                    </Link>
                  )
                }
                {
                  (!!userRouteControls.to || !!userRouteControls.from) && (
                    <ResponsiveBlock
                      className={baseClasses.specialActionsGrid}
                    // style={{
                    //   border: '1px solid red'
                    // }}
                    >
                      {
                        !!userRouteControls.from
                          ? (
                            <Link
                              to={userRouteControls.from.value}
                              target='_self'
                              className={baseClasses.truncate}
                            >
                              <Button
                                size='small'
                                variant='contained'
                                startIcon={<ArrowBackIcon />}
                                fullWidth
                                className={baseClasses.truncate}
                                sx={{
                                  borderRadius: 4,
                                  boxShadow: 'none',
                                }}
                              >
                                <span className={baseClasses.truncate}>{userRouteControls.from.uiText}</span>
                              </Button>
                            </Link>
                          )
                          : null
                      }

                      {
                        !!userRouteControls.to
                          ? (
                            <Link
                              to={userRouteControls.to.value}
                              target='_self'
                              className={baseClasses.truncate}
                            >
                              <Button
                                size='small'
                                variant='contained'
                                endIcon={<ArrowForwardIcon />}
                                fullWidth
                                className={baseClasses.truncate}
                                sx={{
                                  borderRadius: 4,
                                  boxShadow: 'none',
                                }}
                              >
                                <span className={baseClasses.truncate}>{userRouteControls.to.uiText || 'To'}</span>
                              </Button>
                            </Link>
                          )
                          : null
                      }
                    </ResponsiveBlock>
                  )
                }
              </ResponsiveBlock>
            )
          }

        </ResponsiveBlock>
      </ResponsiveBlock>
    </Grid>
  )
})
