import { TJob } from "~/shared/xstate"

export const getDoneJobsTiming = ({ jobs }: {
  jobs: TJob[];
}) => jobs.reduce((acc, job) => {
  if (
    // job.completed
    !!job.forecast.start && !!job.forecast.finish
  ) {
    const delta = job.forecast.start - job.forecast.finish
    acc += delta
  }
  return acc
}, 0)
