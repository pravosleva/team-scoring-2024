import { TJob } from '~/shared/xstate'
import { getSortedSpeedsCalc } from './getSortedSpeedsCalc'
import { NResult } from './types'
import { getMedian } from '~/shared/utils/number-ops'

type TProps = {
  theJobList: TJob[];
  ts: {
    testDiff: number;
    testStart: number;
  };
}
type TResult = {
  averageSpeed: number;
  averageValue: number;
  date0: number;
  date50: number;
  date100: number;
  dateSensed: number;
  sortedSpeedsCalcOutput: NResult.TOutput | null;
}

export const getWorstCalc = ({ theJobList, ts }: TProps): TResult => {
  const result: TResult = {
    averageSpeed: 0,
    averageValue: 0,
    date0: 0,
    date50: 0,
    date100: 0,
    dateSensed: 0,
    sortedSpeedsCalcOutput: null,
  }
  // const testDiff = testFinish - testStart;

  if (theJobList.length === 0 || ts.testDiff === 0) {
    result.averageSpeed = 1
    result.averageValue = ts.testStart
  } else {
    // const speeds = theJobList.map(
    //   // @ts-ignore
    //   (e) => (e.forecast.estimate / 1000 - e.forecast.start / 1000) / (e.forecast.finish / 1000 - e.forecast.start / 1000)
    // )
    const speedsCalc = getSortedSpeedsCalc({
      theJobList,
      sensibility: 4,
      ts,
    })

    result.averageSpeed = getMedian(speedsCalc.sortedSpeeds.map(({ v }) => v))
    // result.averageValue = averageValue
    result.date0 = (speedsCalc.dates?.best as number)
    result.date50 = (speedsCalc.dates?.average as number)
    result.date100 = (speedsCalc.dates?.worst as number)
    result.dateSensed = (speedsCalc.dates?.sensedAverage as number)
    result.sortedSpeedsCalcOutput = speedsCalc
  }
  return result
}
