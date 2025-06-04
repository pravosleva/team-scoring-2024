// import { BusinessHoursMap } from 'dayjs'
import { getDefaultBusinessTimeConfig } from "~/pages/business-time/utils/getDefaultBusinessTimeConfig";
import { TBusinessTimeData } from '~/pages/business-time/utils/types';

// -- NOTE: Business Week definition
 
// const _businessTimeConfigForExample: {
//   fdw: BusinessHoursMap;
//   mg: BusinessHoursMap;
//   mgExp: BusinessHoursMap;
// }
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
