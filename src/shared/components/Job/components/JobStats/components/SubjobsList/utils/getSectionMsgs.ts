import { TResult } from '~/shared/components/Job/utils/getDoneTimeDiff'

export const getSectionMsgs = ({ key, timing, prefix }: {
  key: 'estimation' | 'finish';
  timing: TResult;
  prefix: string;
}): string[] => {
  const sectionMsgs = []
  if (!!timing[key]) sectionMsgs.push(`${prefix}: ${timing[key].uiText}`)
  const sectionBusinessMsgs = []

  if (!!timing[key]?.business) {
    for (const businessTimeStandardName in timing[key].business) {
      if (!!timing[key].business[businessTimeStandardName]) {
        sectionBusinessMsgs.push(
          `BT "${businessTimeStandardName}": ${timing[key].business[businessTimeStandardName]?.uiText}`
        )
      }
    }
  }
  
  // if (!!timing.finish) msgs.push(`Realistic: ${timing.finish.uiText} (Business: ${timing.finish.business.uiText})`)
  // if (sectionBusinessMsgs.length > 0) sectionMsgs.push(`(${sectionBusinessMsgs.join(', ')})`)
  return [...sectionMsgs, ...sectionBusinessMsgs]
}
