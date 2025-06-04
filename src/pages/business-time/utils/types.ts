import { EnumAsUnion } from '~/shared/utils/types/enum-as-union'

// type TDay = 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday'
 
export enum EDay {
  SUN = 'sunday',
  MON = 'monday',
  TUE = 'tuesday',
  WED = 'wednesday',
  THU = 'thursday',
  FRI = 'friday',
  SAT = 'saturday',
}
export type EDayEnumValues = EnumAsUnion<typeof EDay>;
// type EDayEnumValues = Record<EDay, string>;

export type TDayFormat = { start: string, end: string, _descr?: string }
export type TDayConfig = TDayFormat[] | null
export type TWeekConfig = { [key in EDayEnumValues]: TDayConfig }

export type TBusinessTimeData = {
  comment: string;
  isReadOnly: boolean;
  cfg: {
    [key in EDayEnumValues]: TDayConfig;
  };
  ts: {
    createdAt: number;
    updatedAt: number;
  },
}