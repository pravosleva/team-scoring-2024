import dayjs from 'dayjs'
import { TJob, TUser } from '~/shared/xstate'

export const getJobStatusText = ({ job, user }: {
  job: TJob | null;
  user: TUser | null;
}) => {
  let text: string = 'Unknown case'

  const isJobDone = !!job?.forecast.finish
  const isJobStarted = !!job?.forecast.start
  // const isJobEstimated = !!job?.forecast.estimate
  const isJobStartedAndEstimated = !!job?.forecast.start && !!job.forecast.estimate  

  const targetUserNameUI = !!job
    ? job.forecast.assignedTo
      ? !!job
        ? (user?.displayName || String(user?.id) || 'unknown user (incorrect user format)')
        : 'unknown user (not found in LS)'
      : null //'NOT ASSIGNED'
    : null // 'NO TARGET JOB / NO USER'

  switch (true) {
    case isJobDone:
      text = `Job is done at ${dayjs(job?.forecast.finish).format('D.MM.YYYY HH:mm')}${!!targetUserNameUI ? ` by ${targetUserNameUI}` : ''}`
      break
    case isJobStartedAndEstimated:
      text = `Job started and estimated${!!targetUserNameUI ? ` by ${targetUserNameUI}` : ''}`
      break
    case isJobStarted:
      text = `Job started and wait for estimate${!!targetUserNameUI ? ` by ${targetUserNameUI}` : ''}`
      break
    default:
      break
  }

  return text
}
