import { expect, test } from 'vitest'
import { getSortedSpeedsCalc } from './getSortedSpeedsCalc'

test('getSortedSpeeds: sensibility 4', () => {
  const tested = getSortedSpeedsCalc({
    sensibility: 4,
    theJobList: [
      {
        id: 0,
        title: 'job 0',
        completed: true,
        forecast: {
          assignedTo: 777,
          start: new Date(2011, 0, 1, 0, 0, 0, 0).getTime(),
          estimate: new Date(2011, 0, 3, 0, 0, 0, 0).getTime(),
          finish: new Date(2011, 0, 2, 0, 0, 0, 0).getTime(),
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
      {
        id: 1,
        title: 'job 1',
        completed: true,
        forecast: {
          assignedTo: 777,
          start: new Date(2012, 0, 1, 10, 0, 0, 0).getTime(),
          estimate: new Date(2012, 0, 20, 0, 0, 0, 0).getTime(),
          finish: new Date(2012, 1, 2, 0, 0, 0, 0).getTime(),
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
      {
        id: 2,
        title: 'job 2',
        completed: true,
        forecast: {
          assignedTo: 777,
          start: new Date(2013, 0, 1, 0, 0, 0, 0).getTime(),
          estimate: new Date(2013, 0, 27, 0, 0, 0, 0).getTime(),
          finish: new Date(2013, 1, 4, 0, 0, 0, 0).getTime(),
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
      {
        id: 3,
        title: 'job 3',
        completed: true,
        forecast: {
          assignedTo: 777,
          start: new Date(2014, 0, 1, 0, 0, 0, 0).getTime(),
          estimate: new Date(2014, 1, 23, 0, 0, 0, 0).getTime(),
          finish: new Date(2014, 2, 1, 0, 0, 0, 0).getTime(),
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
      {
        id: 4,
        title: 'job 4',
        completed: true,
        forecast: {
          assignedTo: 777,
          start: new Date(2015, 0, 1, 0, 0, 0, 0).getTime(),
          estimate: new Date(2015, 2, 8, 0, 0, 0, 0).getTime(),
          finish: new Date(2015, 4, 1, 0, 0, 0, 0).getTime(),
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
  })
  const expected = {
    sortedSpeeds: [
      {
        id: 4,
        v: 0.55,
      },
      {
        id: 1,
        v: 0.5883905013192612,
      },
      {
        id: 2,
        v: 0.7647058823529411,
      },
      {
        id: 3,
        v: 0.8983050847457628,
      },
      {
        id: 0,
        v: 2,
      },
    ],
    dates: null,
    delta:{
      items: [
        {
          next: 0.5883905013192612,
          prev: null,
          speed: 0.55,
          delta: null,
          isSensed: true,
          id: 4,
        },
        {
          next: 0.7647058823529411,
          prev: 0.55,
          speed: 0.5883905013192612,
          delta: 0.03839050131926114,
          isSensed: true,
          id: 1,
        },
        {
          next: 0.8983050847457628,
          prev: 0.5883905013192612,
          speed: 0.7647058823529411,
          delta: 0.17631538103367994,
          isSensed: false,
          id: 2,
        },
        {
          next: 2,
          prev: 0.7647058823529411,
          speed: 0.8983050847457628,
          delta: 0.13359920239282164,
          isSensed: true,
          id: 3,
        },
        {
          next: null,
          prev: 0.8983050847457628,
          speed: 2,
          delta: 1.1016949152542372,
          isSensed: false,
          id: 0,
        },
      ],
      max: 1.1016949152542372,
      min: 0.03839050131926114,
    },
    sensed: {
      averageSpeed: 0.6788985286883413,
      counter: 3,
      speedValues: [
        0.55,
        0.5883905013192612,
        0.8983050847457628,
      ],
    },
    sensibility: 4,
  }

  expect(tested).toStrictEqual(expected)
})
