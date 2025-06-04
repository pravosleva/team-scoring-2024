import dayjs from 'dayjs'
import { TJob } from '~/shared/xstate'
import dayjsBusinessTime from 'dayjs-business-time'
import { getBusinessTimeConfig } from './getBusinessTimeConfig';

// NOTE: See also https://www.npmjs.com/package/dayjs-business-time
dayjs.extend(dayjsBusinessTime);

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

    res.finish = {
      totalDays: days,
      totalHours: finishDate.diff(startDate, 'hours', true),
      // minutes,
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

    res.estimation = {
      totalDays: days,
      totalHours: estimateDate.diff(startDate, 'hours', true),
      // minutes,
      uiText: msgs.join(' '),
      business: {}
    }

    const businessTimeConfig = getBusinessTimeConfig()
    for (const businessType in businessTimeConfig) {
      console.log(businessType)
      // NOTE: 1. Set Business Times in dayjs
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      dayjs.setBusinessTime(businessTimeConfig[businessType].cfg)
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
