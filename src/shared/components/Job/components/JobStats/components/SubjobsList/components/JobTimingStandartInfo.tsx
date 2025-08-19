
import { memo, useMemo } from 'react'
import { TJob } from '~/shared/xstate'
import { getDoneTimeDiff } from '~/shared/components/Job/utils/getDoneTimeDiff'
import baseClasses from '~/App.module.scss'
import { getCapitalizedFirstLetter } from '~/shared/utils/string-ops'
import { TStandartSections, getTimingStandartInfo } from '~/shared/components/Job/components/JobStats/components/SubjobsList/utils'
// import { EDayEnumValues } from '~/pages/business-time/utils/types'

export const JobTimingStandartInfo = memo(({ job }: {
  job: TJob;
}) => {
  const timing = getDoneTimeDiff({ job })
  const sections = useMemo<TStandartSections>(() => getTimingStandartInfo({
    timing
  }), [timing])

  return (
    <>
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
      <em>* BT - Business Time productivity wich calculated for each week day from your Business Time Config</em>
      {/* <br />
      <pre
        className={baseClasses.preNormalized}
        style={{
          margin: '0px',
        }}
      >{JSON.stringify(timing, null, 2)}</pre> */}
    </>
  )
})
