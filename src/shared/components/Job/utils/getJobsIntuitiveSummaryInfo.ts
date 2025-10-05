import dayjs from 'dayjs';
import { TJob } from '~/shared/xstate'

export const getJobsIntuitiveSummaryInfo = ({ jobs }: { jobs: TJob[] }): {
  firstLog: number;
  firstJobStart: number | null;
  firstJobFinish: number | null;
  intuitiveStart: number | null;
  lastLogTs: number;
  lastJobFinishTs: number | null;
  intuitiveFinish: number;
  humanizedIntuitiveDiff: string | null;
} => {
  const firstLogs: number[] = [] // jobs[0].forecast.start || jobs[0].
  const jobStarts: number[] = []
  const lastLogTss: number[] = []
  const lastJobFinishTss: number[] = []
  for (const job of jobs) {
    firstLogs.push(job.logs.items[job.logs.items.length - 1].ts)
    if (!!job.forecast.start) jobStarts.push(job.forecast.start)
    lastLogTss.push(job.logs.items[0].ts)
    if (!!job.forecast.finish) lastJobFinishTss.push(job.forecast.finish)
  }
  const lastJobFinishTs = lastJobFinishTss.length > 0
    ? Math.max(...lastJobFinishTss)
    : null
  const lastLogTs = Math.max(...lastLogTss)
  const firstJobStart = jobStarts.length > 0 ? Math.min(...jobStarts) : null
  const firstLog = Math.min(...firstLogs)
  const intuitiveStart = firstJobStart // || firstLog
  const intuitiveFinish = lastJobFinishTs || lastLogTs
  const humanizedIntuitiveDiff = (!!intuitiveStart && !!intuitiveFinish)
    ? [
      dayjs(intuitiveFinish).diff(intuitiveStart, 'weeks', true).toFixed(1),
      'w',
      !!lastJobFinishTs ? lastJobFinishTs < lastLogTs ? '-' : '' : '+',
    ].join('')
    : null
  return {
    firstLog,
    firstJobStart,
    intuitiveStart,
    firstJobFinish: Math.min(...lastJobFinishTss),
    lastLogTs,
    lastJobFinishTs,
    intuitiveFinish,
    humanizedIntuitiveDiff,
  }
}
