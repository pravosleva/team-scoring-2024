import dayjs from 'dayjs'
import { TJob } from '~/shared/xstate'
import dayjsBusinessTime from 'dayjs-business-time'
import { getBusinessTimeConfig } from './getBusinessTimeConfig'
import { EDayEnumValues } from '~/pages/business-time/utils/types'
import { getBusinessDayAnalyze } from './getBusinessDayAnalyze'

// NOTE: See also https://www.npmjs.com/package/dayjs-business-time
dayjs.extend(dayjsBusinessTime)

// -- NOTE: Holidays
const holidays: string[] = [
  '2025-01-01',
]
dayjs.setHolidays(holidays)
// --

type TOutputTimePack = {
  totalDays: number;
  totalHours: number;
  uiText: string;
};
export type TResult = {
  finish: {
    totalDays: number;
    totalHours: number;
    // minutes: number;
    uiText: string;
    business: {
      [key: string]: TOutputTimePack | null;
    };
  } | null;
  estimation: {
    totalDays: number;
    totalHours: number;
    // minutes: number;
    uiText: string;
    business: {
      [key: string]: TOutputTimePack | null;
    };
  } | null;
  commonBusinessAnalysis: {
    absoluteHours: {
      [key: string]: number;
    };
    totalHours: {
      [key: string]: number;
    };
    productiveHours: {
      [key: string]: number;
    };
    all: {
      [key: string]: {
        [key in EDayEnumValues]: {
          totalHours: number;
          productiveHours: number;
          absoluteHours: number;
          logs: string[];
          _diagrams?: string[];
        }
      };
    };
  };
}

export const getDoneTimeDiff = ({ job }: {
  job: TJob;
}): TResult => {
  const res: TResult = {
    finish: null,
    estimation: null,
    commonBusinessAnalysis: {
      absoluteHours: {},
      totalHours: {},
      productiveHours: {},
      all: {},
    },
  }

  if (!!job.forecast.start && !!job.forecast.finish) {
    const startDate = dayjs(job.forecast.start)
    const finishDate = dayjs(job.forecast.finish)
    const diff = finishDate.diff(startDate, 'day', true)
    const days = Math.floor(diff)
    const hours = Math.floor((diff - days) * 24)
    // const minutes = Math.floor((days - hours) * 60)

    const msgs = []
    if (!!days) msgs.push(`${days}d`)
    msgs.push(`${hours}h`)

    res.finish = {
      totalDays: days,
      totalHours: finishDate.diff(startDate, 'hours', true),
      uiText: msgs.join(' '),
      business: {},
    }

    const businessTimeConfig = getBusinessTimeConfig()
    for (const businessType in businessTimeConfig) {
      // NOTE: 1. Set Business Times in dayjs
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      dayjs.setBusinessTime(businessTimeConfig[businessType].cfg)
      const businessDiff = startDate.businessTimeDiff(finishDate, 'day')
      const businessMsgs = []
      const businessHours = startDate.businessTimeDiff(finishDate, 'hours')
      businessMsgs.push(`${businessHours.toFixed(1)}h`)

      const outputBusinessChunk: TOutputTimePack = {
        totalDays: businessDiff,
        totalHours: businessHours,
        uiText: businessMsgs.join('; '),
      }

      res.finish.business[businessType] = outputBusinessChunk
      res.commonBusinessAnalysis.all[businessType] = {
        sunday: {
          totalHours: 0,
          productiveHours: 0,
          absoluteHours: 0,
          logs: [],
        },
        monday: {
          totalHours: 0,
          productiveHours: 0,
          absoluteHours: 0,
          logs: [],
        },
        tuesday: {
          totalHours: 0,
          productiveHours: 0,
          absoluteHours: 0,
          logs: [],
        },
        wednesday: {
          totalHours: 0,
          productiveHours: 0,
          absoluteHours: 0,
          logs: [],
        },
        thursday: {
          totalHours: 0,
          productiveHours: 0,
          absoluteHours: 0,
          logs: [],
        },
        friday: {
          totalHours: 0,
          productiveHours: 0,
          absoluteHours: 0,
          logs: [],
        },
        saturday: {
          totalHours: 0,
          productiveHours: 0,
          absoluteHours: 0,
          logs: [],
        },
      }
    }
  }
  if (!!job.forecast.start && !!job.forecast.estimate) {
    const startDate = dayjs(job.forecast.start)
    const estimateDate = dayjs(job.forecast.estimate)
    const diff = estimateDate.diff(startDate, 'day', true)
    const days = Math.floor(diff)
    const hours = Math.floor((diff - days) * 24)
    // const minutes = Math.floor((days - hours) * 60)

    const msgs = []
    if (!!days) msgs.push(`${days}d`)
    msgs.push(`${hours}h`)

    res.estimation = {
      totalDays: days,
      totalHours: estimateDate.diff(startDate, 'hours', true),
      // minutes,
      uiText: msgs.join(' '),
      business: {}
    }

    const businessTimeConfig = getBusinessTimeConfig()
    for (const businessType in businessTimeConfig) {
      res.commonBusinessAnalysis.all[businessType] = {
        sunday: {
          totalHours: 0,
          productiveHours: 0,
          absoluteHours: 0,
          logs: [],
        },
        monday: {
          totalHours: 0,
          productiveHours: 0,
          absoluteHours: 0,
          logs: [],
        },
        tuesday: {
          totalHours: 0,
          productiveHours: 0,
          absoluteHours: 0,
          logs: [],
        },
        wednesday: {
          totalHours: 0,
          productiveHours: 0,
          absoluteHours: 0,
          logs: [],
        },
        thursday: {
          totalHours: 0,
          productiveHours: 0,
          absoluteHours: 0,
          logs: [],
        },
        friday: {
          totalHours: 0,
          productiveHours: 0,
          absoluteHours: 0,
          logs: [],
        },
        saturday: {
          totalHours: 0,
          productiveHours: 0,
          absoluteHours: 0,
          logs: [],
        },
      }

      // NOTE: 1. Set Business Times in dayjs
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      dayjs.setBusinessTime(businessTimeConfig[businessType].cfg)
      const businessDiff = startDate.businessTimeDiff(estimateDate, 'day')
      const businessMsgs = []
      const businessHours = startDate.businessTimeDiff(estimateDate, 'hours')
      businessMsgs.push(`${businessHours.toFixed(1)}h`)

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      for (const day in businessTimeConfig[businessType].cfg) {
        // console.log(day)
        // console.log(businessTimeConfig[businessType].cfg)
        const analysis = getBusinessDayAnalyze({
          day: (day as EDayEnumValues),
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          dayBusinessTime: businessTimeConfig[businessType].cfg[day],
          criteries: {
            goodDiffInMinutes: 90,
            criticalDiffInMinutes: 45,
            optimalCoffeBreakDiffInMinutes: [10, 15],
            optimalLunchDiffInMinutes: [45, 59],
          },
        })
        if (typeof res.commonBusinessAnalysis.totalHours[businessType] === 'undefined') {
          res.commonBusinessAnalysis.totalHours[businessType] = analysis.totalHours
        } else {
          res.commonBusinessAnalysis.totalHours[businessType] += analysis.totalHours
        }

        if (typeof res.commonBusinessAnalysis.productiveHours[businessType] === 'undefined') {
          res.commonBusinessAnalysis.productiveHours[businessType] = analysis.productiveHours
        } else {
          res.commonBusinessAnalysis.productiveHours[businessType] += analysis.productiveHours
        }

        if (typeof res.commonBusinessAnalysis.absoluteHours[businessType] === 'undefined') {
          res.commonBusinessAnalysis.absoluteHours[businessType] = analysis.absoluteHours
        } else {
          res.commonBusinessAnalysis.absoluteHours[businessType] += analysis.absoluteHours
        }

        res.commonBusinessAnalysis.all[businessType][day as EDayEnumValues].totalHours = analysis.totalHours
        if (analysis.logs.length > 0) {
          res.commonBusinessAnalysis.all[businessType][day as EDayEnumValues].logs = analysis.logs
        }
        res.commonBusinessAnalysis.all[businessType][day as EDayEnumValues].productiveHours += analysis.productiveHours
        res.commonBusinessAnalysis.all[businessType][day as EDayEnumValues].absoluteHours += analysis.absoluteHours

        if (
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          Array.isArray(businessTimeConfig[businessType]?.cfg[day]?._diagrams)
        ) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          res.commonBusinessAnalysis.all[businessType][day as EDayEnumValues]._diagrams = businessTimeConfig[businessType].cfg[day as EDayEnumValues]._diagrams
        }
      }

      const outputBusinessChunk: TOutputTimePack = {
        totalDays: businessDiff,
        totalHours: businessHours,
        uiText: businessMsgs.join('; '),
      }
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      res.estimation.business[businessType] = outputBusinessChunk
    }
  } else {
    const businessTimeConfig = getBusinessTimeConfig()
    for (const businessType in businessTimeConfig) {
      res.commonBusinessAnalysis.all[businessType] = {
        sunday: {
          totalHours: 0,
          productiveHours: 0,
          absoluteHours: 0,
          logs: [],
        },
        monday: {
          totalHours: 0,
          productiveHours: 0,
          absoluteHours: 0,
          logs: [],
        },
        tuesday: {
          totalHours: 0,
          productiveHours: 0,
          absoluteHours: 0,
          logs: [],
        },
        wednesday: {
          totalHours: 0,
          productiveHours: 0,
          absoluteHours: 0,
          logs: [],
        },
        thursday: {
          totalHours: 0,
          productiveHours: 0,
          absoluteHours: 0,
          logs: [],
        },
        friday: {
          totalHours: 0,
          productiveHours: 0,
          absoluteHours: 0,
          logs: [],
        },
        saturday: {
          totalHours: 0,
          productiveHours: 0,
          absoluteHours: 0,
          logs: [],
        },
      }

      // NOTE: 1. Set Business Times in dayjs
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      dayjs.setBusinessTime(businessTimeConfig[businessType].cfg)
      // const businessDiff = startDate.businessTimeDiff(estimateDate, 'day')
      // const businessMsgs = []
      // const businessHours = startDate.businessTimeDiff(estimateDate, 'hours')
      // businessMsgs.push(`${businessHours.toFixed(1)}h`)

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      for (const day in businessTimeConfig[businessType].cfg) {
        // console.log(day)
        // console.log(businessTimeConfig[businessType].cfg)
        const analysis = getBusinessDayAnalyze({
          day: (day as EDayEnumValues),
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          dayBusinessTime: businessTimeConfig[businessType].cfg[day],
          criteries: {
            goodDiffInMinutes: 90,
            criticalDiffInMinutes: 45,
            optimalCoffeBreakDiffInMinutes: [10, 15],
            optimalLunchDiffInMinutes: [45, 59],
          },
        })
        if (typeof res.commonBusinessAnalysis.totalHours[businessType] === 'undefined') {
          res.commonBusinessAnalysis.totalHours[businessType] = analysis.totalHours
        } else {
          res.commonBusinessAnalysis.totalHours[businessType] += analysis.totalHours
        }

        if (typeof res.commonBusinessAnalysis.productiveHours[businessType] === 'undefined') {
          res.commonBusinessAnalysis.productiveHours[businessType] = analysis.productiveHours
        } else {
          res.commonBusinessAnalysis.productiveHours[businessType] += analysis.productiveHours
        }

        if (typeof res.commonBusinessAnalysis.absoluteHours[businessType] === 'undefined') {
          res.commonBusinessAnalysis.absoluteHours[businessType] = analysis.absoluteHours
        } else {
          res.commonBusinessAnalysis.absoluteHours[businessType] += analysis.absoluteHours
        }

        res.commonBusinessAnalysis.all[businessType][day as EDayEnumValues].totalHours = analysis.totalHours
        if (analysis.logs.length > 0) {
          res.commonBusinessAnalysis.all[businessType][day as EDayEnumValues].logs = analysis.logs
        }
        res.commonBusinessAnalysis.all[businessType][day as EDayEnumValues].productiveHours += analysis.productiveHours
        res.commonBusinessAnalysis.all[businessType][day as EDayEnumValues].absoluteHours += analysis.absoluteHours

        if (
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          Array.isArray(businessTimeConfig[businessType]?.cfg[day]?._diagrams)
        ) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          res.commonBusinessAnalysis.all[businessType][day as EDayEnumValues]._diagrams = businessTimeConfig[businessType].cfg[day as EDayEnumValues]._diagrams
        }
      }
    }
  }

  return res
}
