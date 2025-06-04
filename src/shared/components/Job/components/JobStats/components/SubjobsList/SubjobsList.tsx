import React, { memo, useMemo } from 'react'
import Grid from '@mui/material/Grid2'
import baseClasses from '~/App.module.scss'
import { TJob } from '~/shared/xstate'
import { linear } from 'math-interpolate'
import { getDoneTimeDiff } from '~/shared/components/Job/utils/getDoneTimeDiff'
import { Link } from 'react-router-dom'
import { getJobStatus } from '~/shared/components/Job/utils/getJobStatus'
// import { getModifiedJobLogText } from '~/pages/jobs/[id]/utils/getModifiedJobLogText'
import { JobTimingInfo } from './components'
import dayjs from 'dayjs'

const getPercentage = ({ x, sum }: { x: number, sum: number }) => {
  const result = linear({
    x1: 0,
    y1: 0,
    x2: sum,
    y2: 100,
    x: x,
  })
  return Number(result.toFixed(0))
}

type TProps = {
  jobs: TJob[];
  header: React.ReactNode | string;
  descr?: string;
  noPercentageInHeader?: boolean;
  noTotalTiming?: boolean;
  showLastLog?: boolean;
}

export const SubjobsList = memo(({ jobs, header, descr, noPercentageInHeader, showLastLog }: TProps) => {
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

  return (
    <Grid size={12}>
      <Grid container spacing={1}>
        <Grid size={12}>
          {header} {!noPercentageInHeader && <span style={{ opacity: 0.5 }}>{donePercentage}% ({doneItems} of {jobs.length})</span>}
        </Grid>
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
        {
          (!!jobsTotalHoursTiming?.estimated?.absolute || !!jobsTotalHoursTiming?.estimated?.realistic) && (
            <Grid size={12}>
              <pre className={baseClasses.preNormalized}>{JSON.stringify(jobsTotalHoursTiming, null, 2)}</pre>
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
            className={baseClasses.compactList}
            // style={{ listStyleType: 'circle' }}
          >
            {
              jobs.map((job) => (
                <li
                  key={job.id}
                  // style={{ display: 'flex', gap: '2px', flexDirection: 'column' }}
                >
                  <Link to={`/jobs/${job.id}`}>
                    <b>{getJobStatus({ job })} {job.title}</b> (complexity {job.forecast.complexity})
                  </Link>
                  {
                    showLastLog && job.logs.items.length > 0 && (
                      <>
                        <br />
                        <span
                          style={{
                            borderLeft: '4px solid lightgray',
                            paddingLeft: '8px',
                          }}
                        >
                          <span style={{ color: 'gray' }}>Last log {dayjs(job.logs.items[0].ts).format('DD.MM.YYYY HH:mm')}</span> <b>{job.logs.items[0].text}</b>
                        </span>
                      </>
                    )
                  }
                  <br />
                  <span>
                    <JobTimingInfo
                      key={job.id}
                      job={job}
                    />
                  </span>
                </li>
              ))
            }
          </ul>
        </Grid>
      </Grid>
    </Grid>
  )
})
