import { useMemo, memo } from 'react'
// import { Layout } from '~/shared/components/Layout'
import { useParams } from 'react-router-dom'
import { TJob, TopLevelContext, TUser } from '~/shared/xstate'
import Grid from '@mui/material/Grid2'
import {
  DistributionFunctionGraph,
  ResponsiveBlock,
  SpeedsFunctionGraph,
} from '~/shared/components'
import { getWorstCalc } from '~/shared/utils/team-scoring'
// import { AutoRefreshedProgressBar } from '~/shared/components/ProgressBar'
import dayjs from 'dayjs'
import baseClasses from '~/App.module.scss'
import { Link } from 'react-router-dom'
import { Alert, Box, Button, Rating } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { JobStats } from '~/shared/components/Job/components'
import { getTruncated } from '~/shared/utils/string-ops'
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
import { useParamsInspectorContextStore } from '~/shared/xstate/topLevelMachine/v2/context/ParamsInspectorContext'
import { TotalJobChecklist } from './components'

export const JobPage = memo(() => {
  // const todosActorRef = TopLevelContext.useActorRef()
  // const { send } = todosActorRef
  const params = useParams()
  const users = TopLevelContext.useSelector((s) => s.context.users.items)
  const jobs = TopLevelContext.useSelector((s) => s.context.jobs.items)
  const targetJob = useMemo<TJob | null>(() => jobs
    .filter((j) => String(j.id) === params.job_id)?.[0] || null, [jobs, params.job_id])
  const targetUser =  useMemo<TUser | null>(() => {
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
  //   // eslint-disable-next-line @typescript-eslint/no-unused-vars
  //   } catch (_err) {
  //     return null
  //   }
  // }, [targetJob])

  // const [urlSearchParams] = useSearchParams()
  // const urlSearchParamFrom = useMemo(() => urlSearchParams.get('from'), [urlSearchParams])
  // const urlSearchParamBackActionUiText = useMemo(() => urlSearchParams.get('backActionUiText'), [urlSearchParams])
  const [userRouteControls] = useParamsInspectorContextStore((ctx) => ctx.userRouteControls)

  return (
    <Grid container spacing={2}>
      <Grid
        size={12}
        className={baseClasses.boxShadowBottom}
        sx={{
          // borderBottom: '1px solid lightgray',
          position: 'sticky',
          top: 0,
          backgroundColor: '#fff',
          zIndex: 1,
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

          <div style={{ fontSize: 'small', fontWeight: 'bold' }}>{targetJob?.title || `Not found #${params.job_id}`}</div>
          
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

      {/* <Grid size={12}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <div style={{ fontWeight: 'bold' }}>{targetJob?.title || `Not found #${params.job_id}`}</div>
          {!!targetJob?.descr && <em style={{ color: 'gray', fontSize: 'small' }}>{targetJob?.descr}</em>}
        </Box>
      </Grid> */}

      <Grid size={12}>
        <TotalJobChecklist key={targetJob?.ts.update} />
      </Grid>

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
                && !! targetJob?.forecast.start
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
              <em style={{ fontSize: 'small' }}>Based on another completed jobs{!!targetUserNameUI ? ` assigned to ${targetUserNameUI}` : ''}</em>
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

      <Grid size={12}>
        <pre className={baseClasses.preNormalized}>
          {JSON.stringify({ targetUser }, null, 2)}
        </pre>
      </Grid>

      <Grid size={12}>
        <pre className={baseClasses.preNormalized}>
          {JSON.stringify({ targetJob }, null, 2)}
        </pre>
      </Grid>

      <Grid size={12}>
        <pre className={baseClasses.preNormalized}>
          {JSON.stringify({ otherUserJobsForAnalysis }, null, 2)}
        </pre>
      </Grid>

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
            >
              <Button variant='contained' startIcon={<ArrowBackIcon />} fullWidth>
                {userRouteControls.from.uiText}
              </Button>
            </Link>
          )
        }
        {
          !userRouteControls.from && !!targetJob && (
            <Link to={`/jobs${!!targetJob ? `?lastSeenJob=${targetJob.id}` : ''}`}>
              <Button fullWidth variant='outlined' startIcon={<ArrowBackIcon />}>
                Jobs
              </Button>
            </Link>
          )
        }
        {
          !!targetJob?.forecast.assignedTo && (
            <Link to={`/employees/${targetJob.forecast.assignedTo}${!!targetJob ? `?lastSeenJob=${targetJob.id}` : ''}`} target='_self'>
              <Button
                variant='outlined'
                color='gray'
                startIcon={<AccountCircleIcon />}
                fullWidth
              >
                {getTruncated(targetUser?.displayName || 'Employee', 10)}
              </Button>
            </Link>
          )
        }
      </ResponsiveBlock>
    </Grid>
  )
})
