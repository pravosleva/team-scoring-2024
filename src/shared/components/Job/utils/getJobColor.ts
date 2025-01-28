import { TForecast } from '~/shared/xstate'
import { getJobStage } from './getJobStage'

export const getJobColor = ({ forecast, percentageValue }: {
  forecast: TForecast;
  percentageValue?: number;
}): string => {
  const stage = getJobStage({ forecast, percentageValue }).value
  const colors = [
    '#d1d4de', // NOTE: 0 - new, gray
    '#d1d4de', // NOTE: 1 - started, gray
    // '#fb8c00', // NOTE: 2 - started, estimated (warn)
    '#02c39a', // NOTE: 2 - started, estimated (green)
    // '#1565c0', // NOTE: 3 - finished, ready for analysis (blue)
    // '#02c39a', // NOTE: 3 - finished, ready for analysis (green)
    '#d1d4de', // NOTE: 3 - finished (gray)
    '#e63946', // NOTE: 4 - Estimate fuckup (red)
  ]

  return colors[stage] || colors[0]
}
