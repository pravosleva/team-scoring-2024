import dayjs from 'dayjs';
import { useMemo, useState, memo } from 'react'
import { AutoRefreshedProgressBar } from '~/shared/components/ProgressBar'
import {
  // getWorstCalc,
  NSWorstCalc,
} from '~/shared/utils/team-scoring'
import { TJob, TopLevelContext, TUser } from '~/shared/xstate'
import { Alert, Grid2 as Grid } from '@mui/material'
import { JobLogProgressGraph } from './components'
import { getRounded } from '~/shared/utils/number-ops'
import { SubjobsList } from './components'
import { JobTimingInfo } from './components/SubjobsList/components'
import { CollapsibleBox } from '~/shared/components'
import { JobResultReviewShort } from '~/pages/jobs/[job_id]/components'
import TaskAltIcon from '@mui/icons-material/TaskAlt'
import { useWorstCalcWebWorker } from '~/shared/components/Job/components/JobStats/hooks/useWorstCalcWebWorker'
import { groupLog } from '~/shared/utils'
import CircularProgress from '@mui/material/CircularProgress'
import { getPercentage } from '~/shared/utils/number-ops'

type TProps = {
  job: TJob;
  isDebugEnabled?: boolean;
}

type TObjAnalysisProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  testedObj: any;
  requiredProps: string[];
}
type TInputDataAnalysisResult = {
  missingProps: string[];
  expectedProps: string[];
}
const getInputDataAnalysis = ({ testedObj, requiredProps }: TObjAnalysisProps): TInputDataAnalysisResult => {
  const res: TInputDataAnalysisResult = {
    missingProps: [],
    expectedProps: requiredProps,
  }
  for (const key of requiredProps) {
    if (typeof testedObj[key] === 'undefined') res.missingProps.push(key)
  }
  return res
}

export const JobStats = memo(({ job, isDebugEnabled }: TProps) => {
  const users = TopLevelContext.useSelector((s) => s.context.users.items)
  const jobs = TopLevelContext.useSelector((s) => s.context.jobs.items)
  const targetUser = useMemo<TUser | null>(() => {
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
    ), [targetUserJobs, targetUser?.id, job.forecast.complexity, job.id])

  const isJobDone = useMemo(() => !!job?.forecast.finish, [job])
  const isJobStarted = useMemo(() => !!job?.forecast.start, [job])
  const isJobEstimated = useMemo(() => !!job?.forecast.estimate, [job])
  const isJobStartedAndEstimated = useMemo(() => !!job?.forecast.start && !!job.forecast.estimate, [job])

  // -- NOTE: v1 (Main thread)
  // const calc = useMemo(() => 
  //   !!job && isJobStartedAndEstimated
  //   ? getWorstCalc({
  //     theJobList: otherUserJobsForAnalysis,
  //     ts: {
  //       testStart: job.forecast.start as number,
  //       testDiff: (job.forecast.estimate as number) - (job.forecast.start as number),
  //     },
  //   })
  //   : null, [job, isJobStartedAndEstimated, otherUserJobsForAnalysis])
  // --

  // -- NOTE: v2 (Web Worker)
  const [calc, setCalc] = useState<NSWorstCalc.TResult | null>(null)
  const [calcErr, setCalcErr] = useState<string | null>(null)
  const isWorstCalcResultReady = useMemo(() => !!calc || !!calcErr, [calc, calcErr])
  const isWorkerEnabled = useMemo(() => isJobStartedAndEstimated, [isJobStartedAndEstimated])
  useWorstCalcWebWorker({
    isEnabled: isWorkerEnabled,
    isDebugEnabled: true,
    cb: {
      onEachSuccessItemData: (data) => {
        if (isDebugEnabled)
          groupLog({
            namespace: '[debug] useWorkers:onEachNewsItemData -> data',
            items: [
              data
            ],
          })
        if (!!data.originalResponse) {
          setCalcErr(null)
          setCalc(data.originalResponse)
        }
      },
      onFinalError: ({ id, reason }) => {
        if (isDebugEnabled)
          groupLog({
            namespace: '[debug] useWorkers:onFinalError -> id, reason',
            items: [
              id,
              reason
            ],
          })
        setCalcErr(reason)
      },
    },
    deps: {
      job,
      otherUserJobsForAnalysis,
    },
  })
  // --
  const worst100DateUI = useMemo(() => !!calc
    ? dayjs(calc.date100).format('DD.MM.YYYY HH:mm')
    : null, [calc])
  const averageSensedDateUI = useMemo(() => !!calc
    ? dayjs(calc.dateSensed).format('DD.MM.YYYY HH:mm')
    : null, [calc])

  const forecastEstimateStatAnalysis = useMemo(() =>
    getInputDataAnalysis({
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
    getInputDataAnalysis({
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
  const jobParent = useMemo<TJob | null | undefined>(() => typeof job.relations?.parent === 'number'
    ? jobs.find(({ id }) => id === job.relations?.parent)
    : null, [jobs, job.relations?.parent])
  const jobsChildren = useMemo<TJob[]>(() =>
    Array.isArray(job.relations?.children)
      && job.relations.children.length > 0
      ? job.relations.children.reduce((acc: TJob[], childrenJobId) => {
        const targetJob: TJob | undefined = jobs.find(({ id }) => id === childrenJobId)
        if (!!targetJob) acc.push(targetJob)
        return acc
      }, [])
      : [], [jobs, job.relations?.children])

  return (
    <Grid
      container
      spacing={2}
    // sx={{ border: '1px dashed red' }}
    >
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
        isWorkerEnabled && !isWorstCalcResultReady && (
          <Grid size={12} sx={{ widht: '100%', display: 'flex', justifyContent: 'center' }}>
            <CircularProgress />
          </Grid>
        )
      }

      {
        !!calcErr && (
          <Grid size={12}>
            <Alert
              severity='error'
              variant='outlined'
            >
              <em>Calc errored: {calcErr}</em>
            </Alert>
          </Grid>
        )
      }

      {
        !isJobDone
          ? (
            isJobStarted && isJobEstimated && !!targetUser
              ? (
                <Grid size={12}>
                  <Grid container spacing={1} sx={{ border: 'none' }}>
                    <Grid size={12}>
                      <b>🤌 Estimated: {dayjs(job.forecast.estimate).format('DD.MM.YYYY HH:mm')}</b>
                    </Grid>
                    <Grid container spacing={0} size={12} sx={{ border: 'none' }}>
                      <Grid size={12}>
                        <AutoRefreshedProgressBar
                          startDate={job.forecast.start as number}
                          targetDate={job.forecast.estimate as number}
                          delay={1000}
                          connectedOnThe={['bottom']}
                        />
                      </Grid>
                      <Grid size={12}>
                        <CollapsibleBox
                          connectedOnThe={['top']}
                          header={`by ${targetUser?.displayName || 'No target user info'}`}
                          text={
                            <>
                              <em style={{ fontSize: 'small' }}>
                                <JobTimingInfo job={job} />
                              </em>
                              <br />
                              <em>{dayjs(job.forecast.start).format('DD.MM.YYYY HH:mm')} - {dayjs(job.forecast.estimate).format('DD.MM.YYYY HH:mm')}</em>
                              <br />
                              <JobResultReviewShort job={job} />
                            </>
                          }
                        />
                      </Grid>
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
          )
          : (
            <Grid container spacing={1} sx={{ border: 'none', width: '100%' }}>
              {/* <Grid size={12}>
                <Alert
                  severity='success'
                  variant='filled'
                >
                  <em>Job is done</em>
                  <br />
                  <em>{dayjs(job.forecast.start).format('DD.MM.YYYY HH:mm')} - {dayjs(job.forecast.finish).format('DD.MM.YYYY HH:mm')}</em>
                </Alert>
              </Grid> */}
              <Grid size={12}>
                <CollapsibleBox
                  icon={<TaskAltIcon fontSize='small' />}
                  header={`Resume [${targetUser?.displayName || 'No target user info'}]`}
                  text={
                    <>
                      <em style={{ fontSize: 'small' }}>
                        <JobTimingInfo job={job} />
                      </em>
                      <br />
                      <JobResultReviewShort job={job} />
                    </>
                  }
                />
              </Grid>
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
                    <Grid container spacing={1} sx={{ border: 'none' }}>
                      <Grid size={12}>
                        <b>⚖️ Sensed: {averageSensedDateUI}</b>
                      </Grid>
                      <Grid
                        container
                        spacing={0}
                        size={12}
                        sx={{ border: 'none' }}
                      >
                        <Grid size={12}>
                          <AutoRefreshedProgressBar
                            key={job.forecast.complexity}
                            startDate={job.forecast.start}
                            targetDate={calc?.dateSensed}
                            delay={5000}
                            connectedOnThe={['bottom']}
                          />
                        </Grid>

                        <Grid size={12}>
                          <CollapsibleBox
                            header={`${sensedDeltaAsPercentageText || 'No analysis for delta'} for ${targetUser.displayName}`}
                            text={
                              <>
                                {
                                  !!calc?.dateSensed && dayjs(calc?.dateSensed).diff(job.forecast.start, 'year') <= 5
                                    ? (
                                      <>
                                        <em style={{ fontSize: 'small' }}>
                                          <JobTimingInfo job={{ ...job, forecast: { ...job.forecast, estimate: calc?.dateSensed } }} />
                                        </em>
                                        <br />
                                        <em style={{ fontSize: 'small' }}>Based on sensed averageSpeed: <b>~{typeof calc.sortedSpeedsCalcOutput?.sensed.averageSpeed === 'number' ? getRounded(calc.sortedSpeedsCalcOutput?.sensed.averageSpeed, 2) : 'ERR'}</b> as average difference between speeds with <b>~{typeof calc.sortedSpeedsCalcOutput?.delta.min === 'number' ? getRounded(calc.sortedSpeedsCalcOutput?.delta.min, 2) : 'ERR'}</b> (minimal delta) & <b>{calc.sortedSpeedsCalcOutput?.sensibility || 'ERR'}</b> (sensibility coeff)</em>
                                        <br />
                                        <JobResultReviewShort job={{ ...job, forecast: { ...job.forecast, estimate: calc?.dateSensed } }} />
                                      </>
                                    )
                                    : (
                                      <em style={{ fontSize: 'small' }}>No stat</em>
                                    )
                                }

                              </>
                            }
                            connectedOnThe={['top']}
                          />
                        </Grid>

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
                      <em>Sens date could not be calculated.</em>
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
                    <Grid container spacing={1} sx={{ border: 'none' }}>
                      <Grid size={12}>
                        <b>😠 The worst: {worst100DateUI}</b>
                      </Grid>
                      <Grid container spacing={0} size={12} sx={{ border: 'none' }}>
                        <Grid size={12}>
                          <AutoRefreshedProgressBar
                            key={job.forecast.complexity}
                            startDate={job.forecast.start}
                            targetDate={calc?.date100}
                            delay={5000}
                            connectedOnThe={['bottom']}
                          />
                        </Grid>
                        <Grid size={12}>
                          <CollapsibleBox
                            header={`${worstDeltaAsPercentageText} for ${targetUser.displayName}`}
                            text={
                              <>
                                {
                                  !!calc?.date100 && dayjs(calc?.date100).diff(job.forecast.start, 'year') <= 5
                                    ? (
                                      <>
                                        <em style={{ fontSize: 'small' }}>
                                          <JobTimingInfo job={{ ...job, forecast: { ...job.forecast, estimate: calc?.date100 } }} />
                                        </em>
                                        <br />
                                        <em style={{ fontSize: 'small' }}>Based on {targetUser.displayName}'s bad experience</em>
                                        <br />
                                        <JobResultReviewShort job={{ ...job, forecast: { ...job.forecast, estimate: calc?.date100 } }} />
                                      </>
                                    )
                                    : (
                                      <em style={{ fontSize: 'small' }}>No stat</em>
                                    )
                                }
                              </>
                            }
                            connectedOnThe={['top']}
                          />
                        </Grid>
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
        jobsChildren.length > 0 && (
          <SubjobsList
            header={<b>Jobs-children</b>}
            jobs={jobsChildren}
            descr='Related as children.'
            showLastLog
          />
        )
      }

      {
        !!jobParent && (
          <SubjobsList
            header={<b>Job-parent</b>}
            noPercentageInHeader
            jobs={[jobParent]}
            descr='This job is a children for that parent job:'
            noTotalTiming
            showLastLog
          />
        )
      }

      {
        otherUserJobsForAnalysis.length > 0 && (
          <SubjobsList
            header={<b>Similar jobs</b>}
            jobs={otherUserJobsForAnalysis}
            descr={!!targetUser ? `Assigned to ${targetUser.displayName || `#${targetUser.id}`} and completed.` : undefined}
          />
        )
      }

      {
        hasProgress && otherUserJobsForAnalysis.length > 0 && (
          <Grid size={12}>
            <JobLogProgressGraph targetJob={job} jobsForAnalysis={otherUserJobsForAnalysis} />
          </Grid>
        )
      }
    </Grid>
  )
})
