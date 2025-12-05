
import { memo, useMemo } from 'react'
import { TJob } from '~/shared/xstate'
import { getDoneTimeDiff } from '~/shared/components/Job/utils/getDoneTimeDiff'
import baseClasses from '~/App.module.scss'
import { getCapitalizedFirstLetter } from '~/shared/utils/string-ops'
import { TSections, getTimingInfo } from '~/shared/components/Job/components/JobStats/components/SubjobsList/utils'
import { CopyToClipboardWrapper } from '~/shared/components/CopyToClipboardWrapper'
// import { EDayEnumValues } from '~/pages/business-time/utils/types'

export const JobTimingInfo = memo(({ job }: {
  job: TJob;
}) => {
  const timing = getDoneTimeDiff({ job })
  const sections = useMemo<TSections>(() => getTimingInfo({
    timing, job
  }), [timing, job])

  return (
    <div className={baseClasses.stack1}>
      {
        Object.keys(sections).length > 0 && (
          <div className={baseClasses.stack0}>
            {
              Object.keys(sections).map((reportName, i) => (
                <div key={`${i}-${reportName}`} style={{ paddingBottom: 0 }}>
                  <div>
                    {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
                    {/* @ts-ignore */}
                    <b>{getCapitalizedFirstLetter(reportName)}{!!sections[reportName].comment ? ` - ${sections[reportName].comment}` : null}{sections[reportName].items.length > 0 ? ':' : null}</b>
                  </div>
                  {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    sections[reportName].items.length > 0
                      ? (
                        <ul
                          className={baseClasses.compactList}
                          style={{ listStyleType: 'circle', gap: 0 }}
                        >
                          {
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            sections[reportName].items.map((report, i) => (
                              <li
                                key={`${i}-${report}`}
                                style={{ whiteSpace: 'pre-wrap' }}
                              >
                                {getCapitalizedFirstLetter(report)}

                                {/*
                                  Object.keys(timing.commonAnalysis)
                                    .some(
                                      (d) => timing.commonAnalysis[d as EDayEnumValues].length > 0
                                    ) && (
                                      <ul
                                        className={baseClasses.compactList}
                                        style={{ listStyleType: 'circle', gap: 0 }}
                                      >
                                        {
                                          Object.keys(timing.commonAnalysis).map((day) => (
                                            <li key={day}>
                                              <ul
                                                className={baseClasses.compactList}
                                                style={{ listStyleType: 'circle', gap: 0 }}
                                              >
                                                {
                                                  timing.commonAnalysis[day as EDayEnumValues].map((log) => (
                                                    <li key={log}>{log}</li>
                                                  ))
                                                }
                                              </ul>
                                            </li>
                                          ))
                                        }
                                      </ul>
                                    )
                                */}
                              </li>
                            ))
                          }
                        </ul>
                      )
                      : null
                  }

                </div>
              ))
            }
          </div>
        )
      }
      <div>
        <CopyToClipboardWrapper
          text={JSON.stringify(sections, null, 2)}
          uiText='Copy as json'
          showNotifOnCopy
        />
      </div>
      {/*
        (!!job.forecast.estimate || !!job.forecast.finish) && (
          <>
            <em>* BT - Business Time standard name</em>
          </>
        )
      */}
      {/* <br />
      <pre
        className={baseClasses.preNormalized}
        style={{
          margin: '0px',
        }}
      >{JSON.stringify(timing, null, 2)}</pre> */}
    </div>
  )
})
