import { TBusinessTimeData } from './types'

export const getDefaultBusinessTimeConfig = ({ isReadOnly }: {
  isReadOnly: boolean;
}): TBusinessTimeData => {
  return {
    comment: '',
    isReadOnly,
    cfg: {
      sunday: null,
      monday: [
        { start: '10:00:00', end: '14:00:00', _descr: 'Then Lunch 1h' },
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
    ts: {
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime(),
    },
  }
}
