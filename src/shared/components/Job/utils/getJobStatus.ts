import { TJob } from "~/shared/xstate"

export const getJobStatus = ({ job }: {
  job: TJob;
}): string => {
  let result = '⛔'
  // NOTE: '🆕 ⏸️ 🛑 ⛔ ❌ 🚫 ⭕'

  switch (true) {
    case !job.forecast.start:
      result = '⏸️'
      break
    case !!job.forecast.start && !!job.forecast.estimate && !job.forecast.finish:
      result = '▶️'
      break
    case !!job.forecast.start && !!job.forecast.estimate && !!job.forecast.finish:
      result = '✅'
      break
    default:
      break
  }

  return result
}
