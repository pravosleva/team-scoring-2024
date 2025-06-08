import { TForecast } from "~/shared/xstate"

// type TForecastKeys = keyof TForecast

type TResult = {
  value: number;
  descr: string;
}

const dict = [
  'New',
  'Started',
  'Started and estimated',
  'Finished',
  'Estimate reached',
  'Will be started',
]

export const getJobStage = ({ forecast, percentageValue }: {
  forecast: TForecast;
  percentageValue?: number;
}): TResult => {
  const fields: (keyof TForecast)[] = ['start', 'estimate', 'finish']
  let count = 0

  // const hasParent = !!job.relations?.parent
  // const hasChildren = Array.isArray(job.relations?.children)
  //   && job.relations.children.length > 0
  // const isStarted = typeof forecast.start === 'number'
  const isStartedOnly = typeof forecast.start === 'number'
    && typeof forecast.estimate === 'undefined'
    && typeof forecast.finish === 'undefined'
  const isStartedAndEstimated = typeof forecast.start === 'number'
    && typeof forecast.estimate === 'number'
    && typeof forecast.finish === 'undefined'
  const isFinished = typeof forecast.start === 'number'
    && typeof forecast.estimate === 'number'
    && typeof forecast.finish === 'number'

  switch (true) {
    case isFinished:
      count = 3
      break
    case isStartedOnly && typeof percentageValue === 'number':
      if (percentageValue < 0)
        count = 5
      else
        count = 0
      break
    case (
      isStartedAndEstimated
      && typeof percentageValue === 'number'
    ):
      if (percentageValue < 0)
        count = 5
      else if (percentageValue > 100)
        count = 4
      else
        count = 2
      break
    default:
      for (const key of fields) if (typeof forecast[key] === 'number') count += 1
      break
  }

  return {
    value: count,
    descr: dict[count] || `Unknown stage (${count})`
  }
}
