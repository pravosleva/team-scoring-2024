import { BusinessHoursMap } from 'dayjs'
import { getDefaultBusinessTimeConfig } from "~/pages/business-time/utils/getDefaultBusinessTimeConfig";
import { TBusinessTimeData } from '~/pages/business-time/utils/types';

// -- NOTE: Business Week definition
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _businessTimeConfig: {
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

export const getBusinessTimeConfig = (): TBusinessTimeData => {
  // NOTE: v2 (from LS)
  let businessTimeConfig: TBusinessTimeData
  try {
    businessTimeConfig = JSON.parse(window.localStorage.getItem('teamScoring2024:businessTimeConfig') as string)
  } catch (err) {
    console.error(err)
    businessTimeConfig = getDefaultBusinessTimeConfig({ isReadOnly: true })
  }
  return businessTimeConfig

  // NOTE: v1 (hardcoded)
  // return _businessTimeConfig
}
// --
