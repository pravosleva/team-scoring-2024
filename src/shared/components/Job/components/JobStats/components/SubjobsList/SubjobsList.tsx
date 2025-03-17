import React, { memo, useMemo } from 'react'
import Grid from '@mui/material/Grid2'
import baseClasses from '~/App.module.scss'
import { TJob } from '~/shared/xstate'
import { linear } from 'math-interpolate'
import { getDoneTimeDiff } from '~/shared/components/Job/utils/getDoneTimeDiff'
import { Link } from 'react-router-dom'
import { getJobStatus } from '~/shared/components/Job/utils/getJobStatus'
import { JobTimingInfo } from './components'

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

export const SubjobsList = memo(({ jobs, header, descr, noPercentageInHeader, noTotalTiming, showLastLog }: TProps) => {
  const doneItems = useMemo<number>(() => jobs.reduce((acc, job) => {
    if (job.completed) acc += 1
    return acc
  }, 0), [jobs])
  const donePercentage = useMemo(() => getPercentage({ sum: jobs.length, x: doneItems }), [doneItems, jobs.length])
  const jobsTotalHoursTiming = useMemo(() => jobs
    .reduce((acc, job) => {
      const timing = getDoneTimeDiff({ job })
      if (!!timing.estimation) {
        acc.estimated.absolute += timing.estimation.totalHours
        if (!!timing.estimation.business) {
          acc.estimated.business.mg += timing.estimation.business?.mg?.totalHours || 0
          acc.estimated.business.mgExp += timing.estimation.business?.mgExp?.totalHours || 0
          acc.estimated.business.s5w += timing.estimation.business?.fdw?.totalHours || 0
        }
      }
      if (!!timing.finish) {
        acc.realistic.absolute += timing.finish.totalHours
        acc.realistic.business.mg += timing.finish.business?.mg?.totalHours || 0
        acc.realistic.business.mgExp += timing.finish.business?.mgExp?.totalHours || 0
        acc.realistic.business.s5w += timing.finish.business?.fdw?.totalHours || 0
      }
      return acc
    }, {
      estimated: { absolute: 0, business: { mg: 0, mgExp: 0, s5w: 0 } },
      realistic: { absolute: 0, business: { mg: 0, mgExp: 0, s5w: 0 } },
    }), [jobs])
  const finalDescr = useMemo(() => {
    const msgs = []
    if (!!descr) msgs.push(descr)
    if (!noTotalTiming) {

      msgs.push(`Estimated Absolute: ${jobsTotalHoursTiming.estimated.absolute.toFixed(1)}h; Business: MG ${jobsTotalHoursTiming.estimated.business.mg.toFixed(1)}h, MGEXP ${jobsTotalHoursTiming.estimated.business.mgExp.toFixed(1)}h, 5DW ${jobsTotalHoursTiming.estimated.business.s5w.toFixed(1)}h`)
      msgs.push(`Realistic Absolute: ${jobsTotalHoursTiming.realistic.absolute.toFixed(1)}h; Business: MG ${jobsTotalHoursTiming.realistic.business.mg.toFixed(1)}h, MGEXP ${jobsTotalHoursTiming.realistic.business.mgExp.toFixed(1)}h, 5DW ${jobsTotalHoursTiming.realistic.business.s5w.toFixed(1)}h`)
    }
    return msgs.join('\n')
  }, [jobsTotalHoursTiming, descr, noTotalTiming])

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
        <Grid size={12}>
          <ul className={baseClasses.compactList}>
            {
              jobs.map((job) => (
                <li>
                  <Link to={`/jobs/${job.id}`}>
                    <b>{getJobStatus({ job })} {job.title}</b> (complexity {job.forecast.complexity})
                  </Link>
                  <br />
                  <JobTimingInfo
                    key={job.id}
                    job={job}
                  />
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
                          <span style={{ color: 'gray' }}>Last log:</span> <b>{job.logs.items[0].text}</b>
                        </span>
                      </>
                    )
                  }
                </li>
              ))
            }
          </ul>
        </Grid>
      </Grid>
    </Grid>
  )
})
