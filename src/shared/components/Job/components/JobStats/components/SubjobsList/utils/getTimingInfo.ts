import { TResult } from '~/shared/components/Job/utils/getDoneTimeDiff'
import { TJob } from '~/shared/xstate'
import { TSections } from './types'
import { getSectionMsgs } from './getSectionMsgs';

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
