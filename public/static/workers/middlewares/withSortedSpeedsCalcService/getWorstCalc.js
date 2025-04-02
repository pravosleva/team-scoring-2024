importScripts('../middlewares/withSortedSpeedsCalcService/utils/getSortedSpeedsCalc.js')

const getWorstCalc = ({ theJobList, ts }) => {
  const result = {
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
    result.date0 = (speedsCalc.dates?.best)
    result.date50 = (speedsCalc.dates?.average)
    result.date100 = (speedsCalc.dates?.worst)
    result.dateSensed = (speedsCalc.dates?.sensedAverage)
    result.sortedSpeedsCalcOutput = speedsCalc
  }
  return result
}
