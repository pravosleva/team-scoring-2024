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
]

export const getJobStage = ({ forecast, percentageValue }: {
  forecast: TForecast;
  percentageValue?: number;
}): TResult => {
  const fields: (keyof TForecast)[] = ['start', 'estimate', 'finish']
  let count = 0

  switch (true) {
    case (
      !!forecast.start
      && !!forecast.estimate
      && !forecast.finish
      && typeof percentageValue === 'number'
    ):
      if (percentageValue > 100)
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
