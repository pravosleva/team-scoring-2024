importScripts('./middlewares/withSortedSpeedsCalcService/utils/getMedian.js')

class Probability {
  constructor({ theJobList, sensibility, ts }) {
    this.jobs = theJobList
    this.sensibility = sensibility
    if (!!ts) this.ts = ts
    this.speeds = this.jobs.map(
      (e) => ({
        v: ((e.forecast.estimate) / 1000 - (e.forecast.start) / 1000) / ((e.forecast.finish) / 1000 - (e.forecast.start) / 1000),
        id: e.id,
      })
    )
    this.sortedSpeeds = this.speeds.sort((e1, e2) => e1.v - e2.v)
  }
  get sensedInfo() { 
    const deltas = []
    let minDelta = 1000000
    let maxDelta = 0

    for (let i = 0, max = this.sortedSpeeds.length; i < max; i++) {
      const prevValue = !!this.sortedSpeeds[i - 1]
        ? this.sortedSpeeds[i - 1]
        : null
      const nextValue = !!this.sortedSpeeds[i + 1]
        ? this.sortedSpeeds[i + 1]
        : null
      const currentValue = this.sortedSpeeds[i]
      const delta = typeof prevValue?.v === 'number'
        ? currentValue.v - (prevValue.v)
        : null
      deltas.push({
        id: this.sortedSpeeds[i].id,
        speed: this.sortedSpeeds[i].v,
        delta,
        next: nextValue?.v || null,
        prev: prevValue?.v || null,
        isSensed: false,
      })
      if (typeof delta === 'number') {
        if (minDelta >= delta) minDelta = delta
        if (maxDelta <= delta) maxDelta = delta
      }
    }
    const deltasInfo = {
      all: deltas,
      min: minDelta,
      max: maxDelta,
    }
    const result = {
      counter: 0,
      speedValues: [],
      averageSpeed: 0,
      deltasInfo,
    }
    for (let i = 0, max = deltasInfo.all.length; i< max; i++) {
      if ((deltasInfo.all[i].delta) <= this.sensibility * deltasInfo.min) {
        deltasInfo.all[i].isSensed = true

        // NOTE: Предыдущий кейс тоже надо учесть,
        // т.к. он также соответствует комфортной работе
        if (i >= 1) deltasInfo.all[i - 1].isSensed = true

        if (typeof deltasInfo.all[i].speed === 'number') {
          result.counter += 1
          result.speedValues.push((deltasInfo.all[i].speed))
        }
      }
      else
        deltasInfo.all[i].isSensed = false
    }
    result.averageSpeed = getMedian(result.speedValues)

    return result
  }
  get dates() {
    if (!this.ts) return null
    else {
      const testPredSorted = this.sortedSpeeds
        .map(({ v }) => (this.ts?.testDiff) / v)
        .sort((e1, e2) => e1 - e2)
    
      const bestValue = testPredSorted[0]
      const worstValue = testPredSorted[testPredSorted.length - 1]
      const averageValue =
        testPredSorted.length % 2 === 0
          ? Math.floor(
            getMedian([
                testPredSorted[Math.floor(testPredSorted.length / 2) - 1],
                testPredSorted[Math.floor(testPredSorted.length / 2)],
              ])
            )
          : Math.floor(testPredSorted[Math.floor(testPredSorted.length / 2)])

      return {
        best: bestValue + this.ts.testStart,
        worst: worstValue + this.ts.testStart,
        average: averageValue + this.ts.testStart,
        sensedAverage: (this.ts.testDiff / this.sensedInfo.averageSpeed) + this.ts.testStart,
      }
    }
  }
}

const getSortedSpeedsCalc = ({ theJobList, sensibility, ts }) => {
  const probExp = new Probability({ sensibility, theJobList, ts })
  const {
    sortedSpeeds,
    sensedInfo: {
      deltasInfo,
      averageSpeed,
      counter,
      speedValues,
    },
    dates,
  } = probExp

  return {
    sortedSpeeds,
    delta: {
      items: deltasInfo.all,
      min: deltasInfo.min,
      max: deltasInfo.max,
    },
    sensed: {
      averageSpeed,
      counter,
      speedValues,
    },
    dates,
    sensibility,
  }
}
