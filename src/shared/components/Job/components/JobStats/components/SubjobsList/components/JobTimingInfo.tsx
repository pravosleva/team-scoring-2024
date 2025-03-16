/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Fragment, memo, useMemo } from 'react'
import { TJob } from '~/shared/xstate'
import { getDoneTimeDiff, TResult } from '~/shared/components/Job/utils/getDoneTimeDiff'

const getSectionMsgs = ({ key, timing, prefix }: {
  key: 'estimation' | 'finish';
  timing: TResult;
  prefix: string;
}): string[] => {
  const sectionMsgs = []
  if (!!timing[key]) sectionMsgs.push(`${prefix}: ${timing[key].uiText}`)
  const sectionBusinessMsgs = []
  if (!!timing[key]?.business.mg) sectionBusinessMsgs.push(`Business MG: ${timing[key].business.mg.uiText}`)
  if (!!timing[key]?.business.mgExp) sectionBusinessMsgs.push(`MGEXP: ${timing[key].business.mgExp.uiText}`)  
  if (!!timing[key]?.business.fdw) sectionBusinessMsgs.push(`5DW: ${timing[key].business.fdw.uiText}`)
  // if (!!timing.finish) msgs.push(`Realistic: ${timing.finish.uiText} (Business: ${timing.finish.business.uiText})`)
  if (sectionBusinessMsgs.length > 0) sectionMsgs.push(`(${sectionBusinessMsgs.join(', ')})`)
  return sectionMsgs
}

type TSections = {
  est: string | null;
  real: string | null;
};

export const JobTimingInfo = memo(({ job }: {
  job: TJob;
}) => {
  const timing = getDoneTimeDiff({ job })
  const sections = useMemo<TSections>(() => ({
    est: !!job.forecast.estimate
      ? getSectionMsgs({ timing, key: 'estimation', prefix: 'Estimated' }).join(' ')
      : null,
    real: !!job.forecast.finish
      ? getSectionMsgs({ timing, key: 'finish', prefix: 'Realistic' }).join(' ')
      : null
  }), [timing, job.forecast.estimate, job.forecast.finish])
  const output: string[] = useMemo(() => Object.keys(sections).reduce((acc: string[], key) => {
    // @ts-ignore
    if (!!sections[key]) acc.push(sections[key])
    return acc
  }, []), [sections])
  
  return (
    <>
      {
        output.map((report, i) => (
          <Fragment key={`${i}-${report}`}>
            {i > 0 && <br />}
            <span>
              {report}
            </span>
          </Fragment>
        ))
      }
    </>
  )
})
