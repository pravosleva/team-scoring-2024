import { TResult } from '~/shared/components/Job/utils/getDoneTimeDiff'
// import { TJob } from '~/shared/xstate'
import { TStandartSections } from './types'
// import { getSectionMsgs } from './getSectionMsgs';
import { EDayEnumValues } from '~/pages/business-time/utils/types';
import { getPercentage } from '~/shared/utils/number-ops';

export const getTimingStandartInfo = ({ timing }: {
  timing: TResult;
  // job: TJob;
}): TStandartSections => {
  const res: TStandartSections = {
    // estimated: {
    //   items: [],
    // },
    // realistic: {
    //   items: [],
    // },
  }

  for (const businessTimeCode in timing.commonBusinessAnalysis.all) {
    res[
      [
        `BT analysis for "${businessTimeCode}"`,
        '//',
        `Business: ${timing.commonBusinessAnalysis.totalHours[businessTimeCode].toFixed(1)}h`,
        `Productive: ${timing.commonBusinessAnalysis.productiveHours[businessTimeCode].toFixed(1)}h`,
        `(${getPercentage({
          x: timing.commonBusinessAnalysis.productiveHours[businessTimeCode],
          // sum: timing.commonBusinessAnalysis.totalHours[businessTimeCode],
          sum: timing.commonBusinessAnalysis.absoluteHours[businessTimeCode],
        }).toFixed(1)}% of total range: ${timing.commonBusinessAnalysis.absoluteHours[businessTimeCode].toFixed(1)}h)`,
      ].join(' ')
    ] = {
      items: Object.keys(timing.commonBusinessAnalysis.all[businessTimeCode])
        .filter((day) => timing.commonBusinessAnalysis.all[businessTimeCode][day as EDayEnumValues].logs.length > 0)
        .map((day) => `${day} (${timing.commonBusinessAnalysis.all[businessTimeCode][day as EDayEnumValues].totalHours.toFixed(1)}h):\n${timing.commonBusinessAnalysis.all[businessTimeCode][day as EDayEnumValues].logs.join('; ')}`)
    }
  }

  // switch (true) {
  //   case !!job.forecast.estimate:
  //     res.estimated.items = getSectionMsgs({ timing, key: 'estimation', prefix: 'Absolute' })
  //     break
  //   default:
  //     res.estimated.comment = 'Not estimated'
  //     break
  // }

  // switch (true) {
  //   case !!job.forecast.finish:
  //     res.realistic.items = getSectionMsgs({ timing, key: 'finish', prefix: 'Absolute' })
  //     break
  //   default:
  //     res.realistic.comment = 'Not finished'
  //     break
  // }

  return res
}
