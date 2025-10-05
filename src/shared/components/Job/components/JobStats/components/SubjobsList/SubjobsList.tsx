import React, { memo, useMemo } from 'react'
import Grid from '@mui/material/Grid2'
import baseClasses from '~/App.module.scss'
import { TJob } from '~/shared/xstate'
import { getPercentage } from '~/shared/utils/number-ops'
import { getDoneTimeDiff } from '~/shared/components/Job/utils/getDoneTimeDiff'
import { Link } from 'react-router-dom'
import { getJobStatus } from '~/shared/components/Job/utils/getJobStatus'
// import { getModifiedJobLogText } from '~/pages/jobs/[id]/utils/getModifiedJobLogText'
import { JobTimingInfo } from './components'
import dayjs from 'dayjs'
import { CollapsibleText } from '~/pages/jobs/[job_id]/components/ProjectsTree/components'
import { getJobsIntuitiveSummaryInfo } from '~/shared/components/Job/utils'
// import clsx from 'clsx'

type TProps = {
  jobs: TJob[];
  header: React.ReactNode | string;
  descr?: string;
  noPercentageInHeader?: boolean;
  noTotalTiming?: boolean;
  showLastLog?: boolean;
  showSummaryTiming?: boolean;
}

export const SubjobsList = memo(({ jobs, header, descr, noPercentageInHeader, showLastLog, showSummaryTiming }: TProps) => {
  const doneItems = useMemo<number>(() => jobs.reduce((acc, job) => {
    if (job.completed) acc += 1
    return acc
  }, 0), [jobs])
  const donePercentage = useMemo(() => getPercentage({ sum: jobs.length, x: doneItems }), [doneItems, jobs.length])
  const jobsTotalHoursTiming = useMemo(() => jobs
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .reduce((acc: any, job) => {
      const timing = getDoneTimeDiff({ job })
      if (!!timing.estimation) {
        acc.estimated.absolute += timing.estimation.totalHours
        if (!!timing.estimation.business) {
          for (const businessTimeStandardName in timing.estimation.business) {
            if (typeof acc.estimated.business[businessTimeStandardName] === 'undefined')
              acc.estimated.business[businessTimeStandardName] = timing.estimation.business[businessTimeStandardName]?.totalHours || 0
            else
              acc.estimated.business[businessTimeStandardName] += timing.estimation.business[businessTimeStandardName]?.totalHours || 0
          }
        }
      }
      if (!!timing.finish) {
        acc.realistic.absolute += timing.finish.totalHours
        if (!!timing.finish.business) {
          for (const businessTimeStandardName in timing.finish.business) {
            if (typeof timing.finish.business[businessTimeStandardName] !== 'undefined') {
              if (!acc.realistic.business[businessTimeStandardName])
                acc.realistic.business[businessTimeStandardName] = timing.finish.business[businessTimeStandardName]?.totalHours || 0
              else
                acc.realistic.business[businessTimeStandardName] += timing.finish.business[businessTimeStandardName]?.totalHours || 0
            }
          }
        }
      }
      return acc
    }, {
      estimated: { absolute: 0, business: {} },
      realistic: { absolute: 0, business: {} },
    }), [jobs])
  const finalDescr = useMemo(() => {
    const msgs = []
    if (!!descr) msgs.push(descr)
    // if (!noTotalTiming) {
    //   // NOTE: v1
    //   // msgs.push(`Estimated Absolute: ${jobsTotalHoursTiming.estimated.absolute.toFixed(1)}h; Business: MG ${jobsTotalHoursTiming.estimated.business.mg.toFixed(1)}h, MGEXP ${jobsTotalHoursTiming.estimated.business.mgExp.toFixed(1)}h, 5DW ${jobsTotalHoursTiming.estimated.business.s5w.toFixed(1)}h`)
    //   // msgs.push(`Realistic Absolute: ${jobsTotalHoursTiming.realistic.absolute.toFixed(1)}h; Business: MG ${jobsTotalHoursTiming.realistic.business.mg.toFixed(1)}h, MGEXP ${jobsTotalHoursTiming.realistic.business.mgExp.toFixed(1)}h, 5DW ${jobsTotalHoursTiming.realistic.business.s5w.toFixed(1)}h`)

    //   // NOTE: v2
    //   msgs.push([
    //     `Estimated: Absolute -> ${jobsTotalHoursTiming.estimated.absolute.toFixed(1)}h`,
    //     Object.keys(jobsTotalHoursTiming.estimated.business).map((btName) =>
    //       `"${btName}" -> ${jobsTotalHoursTiming.estimated.business[btName].toFixed(1)}h`
    //     ).join(', ')
    //   ].join('; '))

    //   msgs.push([
    //     `Business Time: Absolute -> ${jobsTotalHoursTiming.realistic.absolute.toFixed(1)}h`,
    //     Object.keys(jobsTotalHoursTiming.realistic.business).map((btName) =>
    //       `"${btName}" -> ${jobsTotalHoursTiming.realistic.business[btName].toFixed(1)}h`
    //     ).join(', ')
    //   ].join('; '))
    // }
    return msgs.join('\n')
  }, [descr])

  const summaryTimingInfo = useMemo<{
    intuitiveStartDate: number | null;
    firstResult: number | null;
    lastResult: number | null;
    intuitiveFinishDate: number;
    humanized: string | null;
  } | null>(() => {
    switch (showSummaryTiming) {
      case true: {
        const summaryInfo = getJobsIntuitiveSummaryInfo({ jobs })
        const intuitiveStartDate = summaryInfo.intuitiveStart
        const intuitiveFinishDate = summaryInfo.intuitiveFinish
        const humanizedIntuitiveDiff = summaryInfo.humanizedIntuitiveDiff
        return {
          intuitiveStartDate,
          firstResult: !!summaryInfo.firstJobFinish
            ? (summaryInfo.firstJobFinish === summaryInfo.firstJobStart || summaryInfo.firstJobFinish === summaryInfo.firstLog)
              ? null
              : summaryInfo.firstJobFinish
            : null,
          intuitiveFinishDate,
          lastResult: !!summaryInfo.lastJobFinishTs
            ? (summaryInfo.lastJobFinishTs === summaryInfo.firstJobFinish || summaryInfo.lastJobFinishTs === summaryInfo.lastLogTs)
              ? null
              : summaryInfo.lastJobFinishTs
            : null,
          humanized: humanizedIntuitiveDiff
        }
      }
      default:
        return null
    }
  }, [showSummaryTiming, jobs])

  return (
    <Grid size={12}>
      <CollapsibleText
        briefText={
          <>
            {header} {!noPercentageInHeader && <span style={{ opacity: 0.5 }}>{donePercentage.toFixed(0)}% ({doneItems} of {jobs.length}){!!summaryTimingInfo?.humanized ? ` ~${summaryTimingInfo.humanized}` : ''}</span>}
          </>
        }
        contentRender={() => (
          <Grid container spacing={1}>
            {/* <Grid size={12}>
              {header} {!noPercentageInHeader && <span style={{ opacity: 0.5 }}>{donePercentage}% ({doneItems} of {jobs.length})</span>}
            </Grid> */}
            {
              showSummaryTiming && !!summaryTimingInfo && (
                <Grid size={12}>
                  <div>
                    {[
                      !!summaryTimingInfo.intuitiveStartDate
                        ? `~${dayjs(summaryTimingInfo.intuitiveStartDate).format('DD.MM.YYYY')}`
                        : null,
                      !!summaryTimingInfo.firstResult
                        ? `🔥 ${dayjs(summaryTimingInfo.firstResult).format('DD.MM.YYYY')}`
                        : 'No result yet',
                      // !!summaryTimingInfo.lastResult && (summaryTimingInfo.firstResult !== summaryTimingInfo.lastResult)
                      //   ? `${donePercentage === 100 ? '🏁 ' : ''}${dayjs(summaryTimingInfo.lastResult).format('DD.MM.YYYY')}`
                      //   : null,
                      !!summaryTimingInfo.intuitiveFinishDate
                        ? `💬 ~${dayjs(summaryTimingInfo.intuitiveFinishDate).format('DD.MM.YYYY')}`
                        : null,
                    ].filter(Boolean).join(' 👉 ')}
                  </div>
                </Grid>
              )
            }
            {
              !!finalDescr && (
                <Grid size={12}>
                  <div
                    style={{
                      fontSize: 'small',
                      fontStyle: 'italic',
                      whiteSpace: 'pre-wrap',
                      overflowWrap: 'break-word',
                    }}
                  >{finalDescr}</div>
                </Grid>
              )
            }
            {/* <Grid size={12}>
              <ul
                className={baseClasses.compactList}
                style={{ listStyleType: 'circle', gap: 0 }}
              >
                {
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  sections[reportName].items.map((report, i) => (
                    <li key={`${i}-${report}`}>
                      {report}
                    </li>
                  ))
                }
              </ul>
            </Grid> */}
            <Grid size={12}>
              <ul
                className={baseClasses.compactList3}
              // style={{ listStyleType: 'circle' }}
              >
                {
                  jobs.map((job) => {
                    const jobIntuitiveSummaryInfo = getJobsIntuitiveSummaryInfo({ jobs: [job] }).humanizedIntuitiveDiff
                    return (
                      <li
                        key={job.id}
                        style={{
                          display: 'flex',
                          gap: '8px',
                          flexDirection: 'column',
                          // border: '1px solid red'
                        }}
                      >
                        <Link to={`/jobs/${job.id}`}>
                          <b>{getJobStatus({ job })} {job.title}</b> (complexity {job.forecast.complexity}){!!jobIntuitiveSummaryInfo ? ` ~${jobIntuitiveSummaryInfo}` : ''}
                        </Link>
                        {
                          showLastLog && job.logs.items.length > 0 && (
                            <>
                              <span
                                style={{
                                  borderLeft: '4px solid #959eaa',
                                  paddingLeft: '8px',
                                }}
                              >
                                <span style={{ color: '#959eaa' }}>Last log {dayjs(job.logs.items[0].ts).format('DD.MM.YYYY HH:mm')}</span> <b>{job.logs.items[0].text}</b>
                              </span>
                            </>
                          )
                        }
                        <CollapsibleText
                          briefText='Timing'
                          contentRender={() => (
                            <span>
                              <JobTimingInfo
                                key={job.id}
                                job={job}
                              />
                            </span>
                          )}
                        />
                      </li>
                    )
                  })
                }
              </ul>
            </Grid>
            {
              (!!jobsTotalHoursTiming?.estimated?.absolute || !!jobsTotalHoursTiming?.estimated?.realistic) && (
                <Grid size={12}>
                  <pre className={baseClasses.preNormalized}>{JSON.stringify(jobsTotalHoursTiming, null, 2)}</pre>
                </Grid>
              )
            }
          </Grid>
        )}
      />
    </Grid>
  )
})
