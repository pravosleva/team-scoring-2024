import { TResult } from '~/shared/components/Job/utils/getDoneTimeDiff'
import { TJob } from '~/shared/xstate'
import { TSections } from './types'
import { getSectionMsgs } from './getSectionMsgs';
import { EDayEnumValues } from '~/pages/business-time/utils/types';

export const getTimingInfo = ({ timing, job }: {
  timing: TResult;
  job: TJob;
}): TSections => {
  const res: TSections = {
    estimated: {
      items: [],
    },
    realistic: {
      items: [],
    },
  }

  for (const businessTimeCode in timing.commonBusinessAnalysis) {
    res[`BT analysis for ${businessTimeCode}`] = {
      items: Object.keys(timing.commonBusinessAnalysis[businessTimeCode])
        .filter((day) => timing.commonBusinessAnalysis[businessTimeCode][day as EDayEnumValues].length > 0)
        .map((day) => `${day}:\n${timing.commonBusinessAnalysis[businessTimeCode][day as EDayEnumValues].join('; ')}`)
    }
  }

  switch (true) {
    case !!job.forecast.estimate:
      res.estimated.items = getSectionMsgs({ timing, key: 'estimation', prefix: 'Absolute' })
      break
    default:
      res.estimated.comment = 'Not estimated'
      break
  }

  switch (true) {
    case !!job.forecast.finish:
      res.realistic.items = getSectionMsgs({ timing, key: 'finish', prefix: 'Absolute' })
      break
    default:
      res.realistic.comment = 'Not finished'
      break
  }

  return res
}
