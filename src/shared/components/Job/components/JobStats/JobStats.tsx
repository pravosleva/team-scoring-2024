import dayjs from 'dayjs';
import { useMemo } from 'react'
import { AutoRefreshedProgressBar } from '~/shared/components/ProgressBar'
import { getWorstCalc } from '~/shared/utils/team-scoring'
import { TJob, TopLevelContext, TUser } from '~/shared/xstate'
import Grid from '@mui/material/Grid2'
import { Alert } from '@mui/material'
import { Link } from 'react-router-dom'
import baseClasses from '~/App.module.scss'
import { JobLogProgressGraph } from './components'
import { getRounded } from '~/shared/utils/number-ops';
// import { getSortedSpeedsCalc } from '~/shared/utils/team-scoring/getSortedSpeedsCalc';
import { linear } from 'math-interpolate'

const getPercentage = ({ x, sum }: { x: number, sum: number }) => {
  const result = linear({
    x1: 0,
    y1: 0,
    x2: sum,
    y2: 100,
    x: x,
  })
  return result
}

type TProps = {
  job: TJob;
}

type TObjAnalysisProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  testedObj: any;
  requiredProps: string[];
}
type TObjAnalysisResult = {
  missingProps: string[];
  expectedProps: string[];
}
const getObjAnalysis = ({ testedObj, requiredProps }: TObjAnalysisProps): TObjAnalysisResult => {
  const res: TObjAnalysisResult = {
    missingProps: [],
    expectedProps: requiredProps,
  }
  for (const key of requiredProps) {
    if (typeof testedObj[key] === 'undefined') res.missingProps.push(key)
  }
  return res
}

export const JobStats = ({ job }: TProps) => {
  const users = TopLevelContext.useSelector((s) => s.context.users.items)
    const jobs = TopLevelContext.useSelector((s) => s.context.jobs.items)
  const targetUser =  useMemo<TUser | null>(() => {
    const userId = Number(job?.forecast.assignedTo)
    return users?.find(({ id }) => id === userId) || null
  }, [users, job])
  const targetUserJobs = useMemo(() => {
    return !!targetUser ? jobs.filter(({ forecast }) => forecast.assignedTo === targetUser.id) : []
  }, [jobs, targetUser])
  const targetUserNameUI = useMemo<string | null>(() =>
    !!targetUser
    ? targetUser?.displayName
      ? targetUser?.displayName
      : null //'INCORRECT USER FORMAT'
    : null // 'NO TARGET USER'
    , [targetUser]
  )
  const otherUserJobsForAnalysis = useMemo(() => targetUserJobs
    .filter(({ id, forecast }) =>
      forecast.estimate
      && forecast.start
      && forecast.finish
      && job.id !== id
      && forecast.assignedTo === targetUser?.id
      && forecast.complexity === job.forecast.complexity
    ), [targetUserJobs, targetUser, job.forecast, job.id])

  const isJobDone = useMemo(() => !!job?.forecast.finish, [job])
  const isJobStarted = useMemo(() => !!job?.forecast.start, [job])
  const isJobEstimated = useMemo(() => !!job?.forecast.estimate, [job])
  const isJobStartedAndEstimated = useMemo(() => !!job?.forecast.start && !!job.forecast.estimate, [job])
  
  const calc = useMemo(() => 
    !!job && isJobStartedAndEstimated
    ? getWorstCalc({
      theJobList: otherUserJobsForAnalysis,
      ts: {
        testStart: job.forecast.start as number,
        testDiff: (job.forecast.estimate as number) - (job.forecast.start as number),
      },
    })
    : null, [job, isJobStartedAndEstimated, otherUserJobsForAnalysis])
  const worst100DateUI = useMemo(() => !!calc
    ? dayjs(calc.date100).format('YYYY-MM-DD HH:mm')
    : null, [calc])
  const averageSensedDateUI = useMemo(() => !!calc
    ? dayjs(calc.dateSensed).format('YYYY-MM-DD HH:mm')
    : null, [calc])

  const forecastEstimateStatAnalysis = useMemo(() =>
    getObjAnalysis({
      testedObj: {
        'Start date': job.forecast.start,
        'Estimate date': job.forecast.estimate,
        'Target user (please check Employee field)': targetUser,
        // 'Other user jobs for analysis': otherUserJobsForAnalysis.length > 0 ? 'ok' : undefined,
      },
      requiredProps: ['Start date', 'Estimate date', 'Target user (please check Employee field)']
    }),
    [targetUser, job.forecast.start, job.forecast.estimate]
  )
  const forecastWorstStatAnalysis = useMemo(() =>
    getObjAnalysis({
      testedObj: {
        // ...job.forecast,
        'Start date': job.forecast.start,
        'Estimate date': job.forecast.estimate,
        'Target user (please check Employee field)': targetUser,
        [`Other ready jobs for analysis (complexity ${job.forecast.complexity}${!!targetUserNameUI ? ` & assigned to "${targetUserNameUI}"` : ''})`]: otherUserJobsForAnalysis.length > 0
          ? 'ok'
          : undefined,
        'The Worst Date': worst100DateUI,
      },
      requiredProps: ['Start date', 'Estimate date', `Other ready jobs for analysis (complexity ${job.forecast.complexity}${!!targetUserNameUI ? ` & assigned to "${targetUserNameUI}"` : ''})`, 'The Worst Date'],
    }),
    [job.forecast.start, job.forecast.estimate, job.forecast.complexity, otherUserJobsForAnalysis, targetUser, targetUserNameUI, worst100DateUI]
  )
  const hasProgress = useMemo(() => !!job.logs.items.some((l) => !!l.progress), [job.logs.items])

  const sensedDeltaAsPercentageText = useMemo<string | null>(() => {
    if (!calc?.dateSensed || !job.forecast.estimate || !job.forecast.start)
      return null

    const delta = getPercentage({
      x: calc.dateSensed - job.forecast.start,
      sum: job.forecast.estimate - job.forecast.start,
    })
    return delta < 100
      ? `-${(100 - delta).toFixed(2)}%`
      : `+${(delta - 100).toFixed(2)}%`
    },
    [job.forecast.estimate, calc?.dateSensed, job.forecast.start]
  )
  const worstDeltaAsPercentageText = useMemo<string | null>(() => {
    if (!calc?.date100 || !job.forecast.estimate || !job.forecast.start)
      return null

    const delta = getPercentage({
      x: calc.date100 - job.forecast.start,
      sum: job.forecast.estimate - job.forecast.start,
    })
    return delta < 100
      ? `-${(100 - delta).toFixed(2)}%`
      : `+${(delta - 100).toFixed(2)}%`
    },
    [job.forecast.estimate, calc?.date100, job.forecast.start]
  )

  return (
    <Grid container spacing={2}>
      {
        !targetUser && (
          <Grid size={12}>
            <Alert
              severity='warning'
              variant='outlined'
            >
              <em>Target user not found in LS</em>
            </Alert>
          </Grid>
        )
      }

      {
        !isJobDone ? (
          isJobStarted && isJobEstimated && !!targetUser
          ? (
            <Grid size={12}>
              <Grid container spacing={1}>
                <Grid size={12}>
                  <b>🤌 Estimated: {dayjs(job.forecast.estimate).format('YYYY-MM-DD HH:mm')}</b>
                </Grid>
                <Grid size={12}>
                  <AutoRefreshedProgressBar
                    startDate={job.forecast.start as number}
                    targetDate={job.forecast.estimate as number}
                    delay={1000}
                  />
                </Grid>
                <Grid size={12}>
                  <em style={{ fontSize: 'small' }}>by {targetUser?.displayName}</em>
                </Grid>
              </Grid>
            </Grid>
          )
          : (
            <Grid size={12}>
              <Alert
                severity='warning'
                variant='filled'
              >
                <em>No stats for the job. <b>No data available: {forecastEstimateStatAnalysis.missingProps.join(', ')}</b></em>
              </Alert>
            </Grid>
          )
        ) : (
          <Grid size={12}>
            <Alert
              severity='success'
              variant='filled'
            >
              <em>Job is done</em>
            </Alert>
          </Grid>
        )
      }

      {
        !job.forecast.finish && (
          <>
            {
              !!job.forecast.start
              && !!job.forecast.estimate
              && !!calc?.dateSensed
              && !!targetUser
              ? (
                <Grid size={12}>
                  <Grid container spacing={1}>
                    <Grid size={12}>
                      <b>⚖️ Sensed: {averageSensedDateUI}</b>
                      <br />
                      <b style={{ color: 'gray' }}>{sensedDeltaAsPercentageText}</b>
                    </Grid>
                    <Grid size={12}>
                      <AutoRefreshedProgressBar
                        startDate={job.forecast.start}
                        targetDate={calc?.dateSensed}
                        delay={1000}
                      />
                    </Grid>
                    <Grid size={12}>
                      <em style={{ fontSize: 'small' }}>Based on sensed averageSpeed: <b>~{typeof calc.sortedSpeedsCalcOutput?.sensed.averageSpeed === 'number' ? getRounded(calc.sortedSpeedsCalcOutput?.sensed.averageSpeed, 2) : 'ERR'}</b> as average difference between speeds with <b>~{typeof calc.sortedSpeedsCalcOutput?.delta.min === 'number' ? getRounded(calc.sortedSpeedsCalcOutput?.delta.min, 2) : 'ERR'}</b> (minimal delta) & <b>{calc.sortedSpeedsCalcOutput?.sensibility || 'ERR'}</b> (sensibility coeff)</em>
                    </Grid>
                  </Grid>
                </Grid>
              )
              : (
                <Grid size={12}>
                  <Alert
                    severity='warning'
                    variant='filled'
                  >
                    <em>Sens date could not be calculated. ERR</em>
                  </Alert>
                </Grid>
              )
            }
          </>
        )
      }

      {
        !job.forecast.finish && (
          <>
            {
              !!job.forecast.start
              && !!job.forecast.estimate
              && !!calc?.date100
              && !!targetUser
              ? (
                <Grid size={12}>
                  <Grid container spacing={1}>
                    <Grid size={12}>
                      <b>😠 The worst: {worst100DateUI}</b>
                      <br />
                      <b style={{ color: 'gray' }}>{worstDeltaAsPercentageText}</b>
                    </Grid>
                    <Grid size={12}>
                      <AutoRefreshedProgressBar
                        startDate={job.forecast.start}
                        targetDate={calc?.date100}
                        delay={1000}
                      />
                    </Grid>
                    <Grid size={12}>
                      <em style={{ fontSize: 'small' }}>Based on {targetUser.displayName}'s bad experience</em>
                    </Grid>
                    {/*
                      job.forecast.estimate < worst100DateUI

                      <Grid size={12}>
                        <Alert
                          severity='warning'
                          variant='filled'
                        >
                          Alert
                        </Alert>
                      </Grid>
                    */}
                  </Grid>
                </Grid>
              )
              : (
                <Grid size={12}>
                  <Alert
                    severity='warning'
                    variant='filled'
                  >
                    <em>Worst date could not be calculated. <b>No data available: {forecastWorstStatAnalysis.missingProps.join(', ')}</b></em>
                  </Alert>
                </Grid>
              )
            }
          </>
        )
      }

      {
        hasProgress && otherUserJobsForAnalysis.length > 0 && (
          <Grid size={12}>
            <JobLogProgressGraph targetJob={job} jobsForAnalysis={otherUserJobsForAnalysis} />
          </Grid>
        )
      }

      {
        otherUserJobsForAnalysis.length > 0 && (
          <Grid size={12}>
            <Grid container spacing={1}>
              <Grid size={12}>
                <b>Similar jobs ({otherUserJobsForAnalysis.length})</b>
              </Grid>
              {
                !!targetUser && (
                  <Grid size={12}>
                    <em style={{ fontSize: 'small' }}>Completed and assigned to {targetUser.displayName || `#${targetUser.id}`}</em>
                  </Grid>
                )
              }
              <Grid size={12}>
                <ul className={baseClasses.compactList}>
                  {
                    otherUserJobsForAnalysis.map(({ id, title, forecast }) => (
                      <li key={id}>
                        {/* <span>{id === job.id ? '👉 ' : ''}</span> */}
                        <Link to={`/jobs/${id}`}>
                          <b>{title}</b> (complexity {forecast.complexity})
                        </Link>
                      </li>
                    ))
                  }
                </ul>
              </Grid>
            </Grid>
        </Grid>
        )
      }
    </Grid>
  )
}
