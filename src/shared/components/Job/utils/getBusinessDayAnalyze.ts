import dayjs, { Dayjs } from 'dayjs'
// import { TJob } from '~/shared/xstate'
import dayjsBusinessTime from 'dayjs-business-time'
// import { getBusinessTimeConfig } from './getBusinessTimeConfig'
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

export const getBusinessDayAnalyze = ({ dayBusinessTime, criteries, day }: {
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
