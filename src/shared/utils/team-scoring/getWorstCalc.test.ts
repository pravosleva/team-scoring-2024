import { expect, test } from 'vitest'
import { getWorstCalc } from './getWorstCalc'

test('getWorstCalc: exp', () => {
  const expStart = new Date(2011, 0, 1, 0, 0, 0, 0).getTime()
  const expEstimate = new Date(2011, 0, 3, 0, 0, 0, 0).getTime()
  const expSuccessFinish = new Date(2011, 0, 2, 0, 0, 0, 0).getTime()
  
  const testedStart = new Date(2025, 0, 1, 0, 0, 0, 0).getTime()
  const testedNowDate = new Date(2025, 0, 13, 0, 0, 0, 0).getTime()
  const testedEstimate = new Date(2025, 0, 15, 0, 0, 0, 0).getTime()

  const tested = getWorstCalc({
    theJobList: [
      {
        id: 0,
        title: 'job 0',
        completed: false,
        forecast: {
          assignedTo: 777,
          estimate: expEstimate,
          start: expStart,
          finish: expSuccessFinish,
          complexity: 0,
        },
        ts: {
          create: 1,
          update: 1,
        },
        logs: {
          limit: 5,
          items: [],
          isEnabled: false,
        },
      },
    ],
    ts: {
      testDiff: testedEstimate - testedNowDate,
      testStart: testedStart,
    },
  })
  const expected = {
    averageSpeed: 2,
    averageValue: 0,
    date0: 1735765200000,
    date100: 1735765200000,
    date50: 1735765200000,
    dateSensed: 1735765200000,
    sortedSpeedsCalcOutput: {
      dates: {
        average: 1735765200000,
        best: 1735765200000,
        sensedAverage: 1735765200000,
        worst: 1735765200000,
      },
      delta: {
        items: [
          {
            delta: null,
            id: 0,
            isSensed: true,
            next: null,
            prev: null,
            speed: 2,
          },
        ],
        max: 0,
        min: 1000000,
      },
      sensed: {
        averageSpeed: 2,
        counter: 1,
        speedValues: [
          2,
        ], 
      },
      sensibility: 4,
      sortedSpeeds: [
        {
          id: 0,
          v: 2,
        },
      ],
    }
  }
  expect(tested).toStrictEqual(expected)
})
