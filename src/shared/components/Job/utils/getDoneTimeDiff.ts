import dayjs, { BusinessHoursMap } from "dayjs"
import { TJob } from "~/shared/xstate"
import dayjsBusinessTime from 'dayjs-business-time'

// NOTE: See also https://www.npmjs.com/package/dayjs-business-time
dayjs.extend(dayjsBusinessTime);

// -- NOTE: Business Week definition
const businessTimeConfig: {
  fdw: BusinessHoursMap;
  mg: BusinessHoursMap;
  mgExp: BusinessHoursMap;
  // [key: string]: BusinessHoursMap;
} = {
  fdw: {
    sunday: null,
    monday: [
      { start: '10:00:00', end: '14:00:00' },
      // NOTE: Lunch 1h
      { start: '15:00:00', end: '19:00:00' },
    ],
    tuesday: [
      { start: '10:00:00', end: '14:00:00' },
      // NOTE: Lunch 1h
      { start: '15:00:00', end: '19:00:00' },
    ],
    wednesday: [
      { start: '10:00:00', end: '14:00:00' },
      // NOTE: Lunch 1h
      { start: '15:00:00', end: '19:00:00' },
    ],
    thursday: [
      { start: '10:00:00', end: '14:00:00' },
      // NOTE: Lunch 1h
      { start: '15:00:00', end: '19:00:00' },
    ],
    friday: [
      { start: '10:00:00', end: '14:00:00' },
      // NOTE: Lunch 1h
      { start: '15:00:00', end: '19:00:00' },
    ],
    saturday: null,
  },
  mg: {
    sunday: null,
    monday: [
      { start: '11:00:00', end: '15:00:00' },
      // NOTE: 15-15:30 созвон 0.5-1h
      { start: '15:30:00', end: '16:00:00' },
      // NOTE: Lunch 1h
      { start: '17:00:00', end: '20:00:00' },
    ],
    tuesday: [
      { start: '11:00:00', end: '15:00:00' },
      // NOTE: 15-15:30 созвон 0.5-1h
      { start: '15:30:00', end: '16:00:00' },
      // NOTE: Lunch 1h
      { start: '17:00:00', end: '20:00:00' },
    ],
    wednesday: [
      { start: '11:00:00', end: '12:00:00' },
      // NOTE: 12-13 созвон 1h
      { start: '13:00:00', end: '15:00:00' },
      // NOTE: 15-15:30 созвон 0.5-1h
      { start: '15:30:00', end: '16:00:00' },
      // NOTE: Lunch 1h
      { start: '17:00:00', end: '20:00:00' },
    ],
    thursday: [
      { start: '11:00:00', end: '12:00:00' },
      // NOTE: 12-13 созвон 1h
      { start: '13:00:00', end: '15:00:00' },
      // NOTE: 15-15:30 созвон 0.5-1h
      { start: '15:30:00', end: '16:00:00' },
      // NOTE: Lunch 1h
      { start: '17:00:00', end: '20:00:00' },
    ],
    friday: [
      { start: '11:00:00', end: '12:00:00' },
      // NOTE: 12-13 созвон 1h
      { start: '13:00:00', end: '15:00:00' },
      // NOTE: 15-15:30 созвон 0.5-1h
      { start: '15:30:00', end: '16:00:00' },
      // NOTE: Lunch 1h
      { start: '17:00:00', end: '20:00:00' },
    ],
    saturday: null,
  },
  mgExp: {
    sunday: null,
    monday: [
      { start: '10:00:00', end: '15:00:00' },
      // NOTE: 15-15:30 созвон 0.5-1h
      { start: '15:30:00', end: '16:00:00' },
      // NOTE: Lunch 1h
      { start: '17:00:00', end: '18:30:00' },
      // NOTE: Metro
      { start: '20:30:00', end: '22:00:00' },
    ],
    tuesday: [
      { start: '10:00:00', end: '15:00:00' },
      // NOTE: 15-15:30 созвон 0.5-1h
      { start: '15:30:00', end: '16:00:00' },
      // NOTE: Lunch 1h
      { start: '17:00:00', end: '18:30:00' },
      // NOTE: Metro
      { start: '20:30:00', end: '22:00:00' },
    ],
    wednesday: [
      { start: '10:00:00', end: '12:00:00' },
      // NOTE: 12-13 созвон 1h
      { start: '13:00:00', end: '15:00:00' },
      // NOTE: 15-15:30 созвон 0.5-1h
      { start: '15:30:00', end: '16:00:00' },
      // NOTE: Lunch 1h
      { start: '17:00:00', end: '18:30:00' },
      // NOTE: Teremok
      { start: '20:00:00', end: '22:00:00' },
    ],
    thursday: [
      { start: '10:00:00', end: '12:00:00' },
      // NOTE: 12-13 созвон 1h
      { start: '13:00:00', end: '15:00:00' },
      // NOTE: 15-15:30 созвон 0.5-1h
      { start: '15:30:00', end: '16:00:00' },
      // NOTE: Lunch 1h
      { start: '17:00:00', end: '18:30:00' },
      // NOTE: Metro
      { start: '20:30:00', end: '22:00:00' },
    ],
    friday: [
      { start: '10:00:00', end: '12:30:00' },
      // NOTE: 12:30-13:30 созвон 1h
      { start: '13:30:00', end: '15:00:00' },
      // NOTE: 15-15:30 созвон 0.5-1h
      { start: '15:30:00', end: '16:00:00' },
      // NOTE: Lunch 1h
      { start: '17:00:00', end: '18:30:00' },
      // NOTE: Teremok
      { start: '20:00:00', end: '22:00:00' },
    ],
    saturday: null,
  }
}
// --

type TOutputTimePack = {
  totalDays: number;
  // hours: number;
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
      mg: TOutputTimePack | null;
      mgExp: TOutputTimePack | null;
      fdw: TOutputTimePack | null;
    };
  } | null;
  estimation: {
    totalDays: number;
    totalHours: number;
    // minutes: number;
    uiText: string;
    business: {
      mg: TOutputTimePack | null;
      mgExp: TOutputTimePack | null;
      fdw: TOutputTimePack | null;
    };
  } | null;
}

export const getDoneTimeDiff = ({ job }: {
  job: TJob;
}): TResult => {
  const res: TResult = {
    finish: null,
    estimation: null,
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
    // if (!!minutes) msgs.push(`${minutes}m`)

    res.finish = {
      totalDays: days,
      totalHours: finishDate.diff(startDate, 'hours', true),
      // minutes,
      uiText: msgs.join(' '),
      business: {
        mg: null,
        mgExp: null,
        fdw: null,
      }
    }

    for (const businessType in businessTimeConfig) {
      // NOTE: 1. Set Business Times in dayjs
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      dayjs.setBusinessTime(businessTimeConfig[businessType])
      const businessDiff = startDate.businessTimeDiff(finishDate, 'day')
      const businessMsgs = []
      const businessHours = startDate.businessTimeDiff(finishDate, 'hours')
      businessMsgs.push(`${businessHours.toFixed(1)}h`)

      const outputBusinessChunk: TOutputTimePack = {
        totalDays: businessDiff,
        totalHours: businessHours,
        uiText: businessMsgs.join(' '),
      }
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      res.finish.business[businessType] = outputBusinessChunk
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
    // if (!!minutes) msgs.push(`${minutes}m`)

    // dayjs.setBusinessTime(businessTimeConfig.mg)
    // const businessDiff = startDate.businessTimeDiff(estimateDate, 'day')
    // const businessDays = Math.floor(businessDiff)
    // // const businessHours = Math.floor((businessDiff - businessDays) * 24)
    // const businessMsgs = []
    // // if (!!businessDays) businessMsgs.push(`${businessDays}d`)
    // // businessMsgs.push(`${businessHours}h`)
    // const businessHours = startDate.businessTimeDiff(estimateDate, 'hour')
    // businessMsgs.push(`${businessHours}h`)

    // NOTE: 1. Set Business Times in dayjs
    // dayjs.setBusinessTime(businessTimeConfig.mg)
    // const mgBusinessDiff = startDate.businessTimeDiff(estimateDate, 'day')
    // const mgBusinessMsgs = []
    // const mgBusinessHours = startDate.businessTimeDiff(estimateDate, 'hours')
    // mgBusinessMsgs.push(`${mgBusinessHours.toFixed(1)}h`)
    // const mg: TOutputTimePack = {
    //   totalDays: Math.floor(mgBusinessDiff),
    //   totalHours: mgBusinessHours,
    //   uiText: mgBusinessMsgs.join(' '),
    // }

    // // NOTE: 2. Set Business Times in dayjs
    // dayjs.setBusinessTime(businessTimeConfig.fdw)
    // const s5WBusinessDiff = startDate.businessTimeDiff(estimateDate, 'day')
    // const s5WBusinessMsgs = []
    // const s5WBusinessHours = startDate.businessTimeDiff(estimateDate, 'hours')
    // s5WBusinessMsgs.push(`${s5WBusinessHours.toFixed(1)}h`)
    // const fdw: TOutputTimePack = {
    //   totalDays: Math.floor(s5WBusinessDiff),
    //   totalHours: s5WBusinessHours,
    //   uiText: s5WBusinessMsgs.join(' '),
    // }

    // res.estimation = {
    //   totalDays: days,
    //   totalHours: estimateDate.diff(startDate, 'hours', true),
    //   // minutes,
    //   uiText: msgs.join(' '),
    //   business: {
    //     mg,
    //     fdw,
    //   },
    // }

    res.estimation = {
      totalDays: days,
      totalHours: estimateDate.diff(startDate, 'hours', true),
      // minutes,
      uiText: msgs.join(' '),
      business: {
        mg: null,
        mgExp: null,
        fdw: null,
      }
    }

    for (const businessType in businessTimeConfig) {
      // NOTE: 1. Set Business Times in dayjs
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      dayjs.setBusinessTime(businessTimeConfig[businessType])
      const businessDiff = startDate.businessTimeDiff(estimateDate, 'day')
      const businessMsgs = []
      const businessHours = startDate.businessTimeDiff(estimateDate, 'hours')
      businessMsgs.push(`${businessHours.toFixed(1)}h`)

      const outputBusinessChunk: TOutputTimePack = {
        totalDays: businessDiff,
        totalHours: businessHours,
        uiText: businessMsgs.join(' '),
      }
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      res.estimation.business[businessType] = outputBusinessChunk
    }
  }

  return res
}
