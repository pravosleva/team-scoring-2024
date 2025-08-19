import dayjs, { Dayjs } from 'dayjs'
import { TJob } from '~/shared/xstate'
import dayjsBusinessTime from 'dayjs-business-time'
import { getBusinessTimeConfig } from './getBusinessTimeConfig'
import { EDayEnumValues, TDayConfig } from '~/pages/business-time/utils/types'

// NOTE: See also https://www.npmjs.com/package/dayjs-business-time
dayjs.extend(dayjsBusinessTime)

// -- NOTE: Holidays
const holidays: string[] = [
  '2025-01-01',
]
dayjs.setHolidays(holidays)
// --

// NOTE: Для расчета продуктивности нужно использовать
// целевые рабочие дни для синхронизации с насройками графика рабочего времени:
const testedBusinessWeekDays: {
  [key in EDayEnumValues]: string;
} = {
  monday: '2025-01-13',
  tuesday: '2025-01-14',
  wednesday: '2025-01-15',
  thursday: '2025-01-16',
  friday: '2025-01-17',
  saturday: '2025-01-18',
  sunday: '2025-01-19',
}

const getBusinessDayAnalyze = ({ dayBusinessTime, criteries, day }: {
  day: EDayEnumValues;
  dayBusinessTime: TDayConfig;
  criteries: {
    goodDiffInMinutes: number;
    criticalDiffInMinutes: number;
    optimalCoffeBreakDiffInMinutes: [number, number];
    optimalLunchDiffInMinutes: [number, number];
  };
}): {
  absoluteHours: number;
  totalHours: number;
  productiveHours: number;
  bigRangesCounter: number;
  ok: boolean;
  message?: string;
  logs: string[];
} => {
  const logs: string[] = []
  const res = {
    absoluteHours: 0,
    productiveHours: 0,
    totalHours: 0,
    bigRangesCounter: 0,
    ok: true,
  }

  if (!!dayBusinessTime) {
    let _c = 0
    let _prevEnd: Dayjs | null = null
    const testedBusinessDay: string = testedBusinessWeekDays[day as EDayEnumValues] // testedBusinessDay.addBusinessHours(timeToAdd).format('YYYY-MM-DD')
    // -- NOTE: absolute diff exp
    const start: Dayjs = dayjs(`${testedBusinessDay} ${dayBusinessTime[0].start}`)
    const end: Dayjs = dayjs(`${testedBusinessDay} ${dayBusinessTime[dayBusinessTime.length - 1].end}`)
    res.absoluteHours = end.diff(start, 'hours') - 1 // NOTE: 1h for lunch
    // --

    const _rangesInfo = dayBusinessTime.reduce((acc: {
      message: string;
      ok: boolean;
      productiveHoursDiff: number;
      minsDiff: number;
      coffeBreakDiff: number;
    }[], timingItem) => {
      const isFirst = _c === 0
      const _itemMsgs = []
      const middleResult = {
        message: '',
        ok: false,
        minsDiff: 0,
        coffeBreakDiff: 0,
        productiveHoursDiff: 0,
      }
      const start: Dayjs = dayjs(`${testedBusinessDay} ${timingItem.start}`)
      const end: Dayjs = dayjs(`${testedBusinessDay} ${timingItem.end}`)
      const minutesDiff = start.businessTimeDiff(end, 'minutes')

      middleResult.minsDiff = minutesDiff
      middleResult.ok = minutesDiff >= criteries.goodDiffInMinutes

      const isProductiveRange = middleResult.ok

      const hoursDiff = start.businessTimeDiff(end, 'hours')
      res.totalHours += hoursDiff

      if (isProductiveRange) {
        middleResult.productiveHoursDiff += hoursDiff
        res.productiveHours += hoursDiff
      }

      if (isProductiveRange)
        _itemMsgs.push(`✅ ${timingItem.start} -> ${timingItem.end}\nProductive range (${minutesDiff}min)`)
      else {
        const isCriticalUnproductiveRange = minutesDiff <= criteries.criticalDiffInMinutes
        if (isCriticalUnproductiveRange) {
          _itemMsgs.push(`⛔ ${timingItem.start} -> ${timingItem.end}\nCritical unproductive range (${minutesDiff}min)`)
        } else {
          _itemMsgs.push(`⚠️ ${timingItem.start} -> ${timingItem.end}\nUnproductive range (${minutesDiff}min)`)
        }
      }

      if (!!timingItem._descr) _itemMsgs.push(timingItem._descr)

      switch (true) {
        case isFirst:
          _prevEnd = end
          break
        default: {
          if (!!_prevEnd) {
            const fromPrevEndDiff = _prevEnd.businessTimeDiff(start, 'minutes')
            const isBigRange = fromPrevEndDiff >= criteries.optimalLunchDiffInMinutes[0]
            if (isBigRange) {
              res.bigRangesCounter += 1
            }
            middleResult.coffeBreakDiff = fromPrevEndDiff
          }
          _prevEnd = end
          break
        }
      }
      middleResult.message = _itemMsgs.join(', ')

      acc.push(middleResult)
      _c += 1
      return acc
    }, [])

    // logs.push(`Analisys for ${day}: ${_rangesInfo.map((rs) => rs.message).join(', ')}`)
    logs.push(_rangesInfo.map((rs) => rs.message).join('\n'))
  }

  return { ...res, message: logs.length > 0 ? logs.join('; ') : '', logs }
}

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
          logs: string[];
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
          logs: [],
        },
        monday: {
          totalHours: 0,
          logs: [],
        },
        tuesday: {
          totalHours: 0,
          logs: [],
        },
        wednesday: {
          totalHours: 0,
          logs: [],
        },
        thursday: {
          totalHours: 0,
          logs: [],
        },
        friday: {
          totalHours: 0,
          logs: [],
        },
        saturday: {
          totalHours: 0,
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
          logs: [],
        },
        monday: {
          totalHours: 0,
          logs: [],
        },
        tuesday: {
          totalHours: 0,
          logs: [],
        },
        wednesday: {
          totalHours: 0,
          logs: [],
        },
        thursday: {
          totalHours: 0,
          logs: [],
        },
        friday: {
          totalHours: 0,
          logs: [],
        },
        saturday: {
          totalHours: 0,
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
  }

  return res
}
