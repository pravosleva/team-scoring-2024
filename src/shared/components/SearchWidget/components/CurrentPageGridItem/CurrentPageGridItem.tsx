import { memo, useCallback, useMemo } from 'react'
import { TJob } from '~/shared/xstate'
import baseClasses from '~/App.module.scss'
import { Button, Grid2 as Grid } from '@mui/material'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import SportsBasketballIcon from '@mui/icons-material/SportsBasketball'
import ExtensionIcon from '@mui/icons-material/Extension'
import ConstructionIcon from '@mui/icons-material/Construction'
import HiveIcon from '@mui/icons-material/Hive'
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart'
import { CollapsibleText } from '~/pages/jobs/[job_id]/components/ProjectsTree/components'
import { SimpleJobPointsetChecker } from '~/shared/components/SimpleJobPointsetChecker'
import dayjs from 'dayjs'
import __TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en'
import ru from 'javascript-time-ago/locale/ru'
import { TFilteredJobsLogsMappingChunk } from './types'
import { CopyToClipboardWrapper } from '~/shared/components/CopyToClipboardWrapper'
import { getMatchedByAllStrings } from '~/shared/utils/string-ops'
import { HighlightedText } from '~/shared/components'
import clsx from 'clsx'

__TimeAgo.addDefaultLocale(en)
__TimeAgo.addLocale(ru)

const timeAgo = new __TimeAgo('en-US')
// const PUBLIC_URL = import.meta.env.VITE_PUBLIC_URL || ''

type TProps = {
  job: TJob;
  filteredJobsLogsMappingChunk: TFilteredJobsLogsMappingChunk[];
  onClickCb: () => void;
  testedValue: string;
}

export const CurrentPageGridItem = memo(({ testedValue, job: j, filteredJobsLogsMappingChunk, onClickCb }: TProps) => {
  const { pathname } = useLocation()
  const isLogPage = useMemo(() => getMatchedByAllStrings({
    tested: pathname,
    expected: ['/jobs/', '/logs/'],
  }), [pathname])
  const isJobPage = useMemo(() => getMatchedByAllStrings({
    tested: pathname,
    expected: ['/jobs/'],
  }) && !isLogPage, [pathname, isLogPage])

  const params = useParams()
  const navigate = useNavigate()
  const handleGoActivity = useCallback(({ jobId, logTs, relativeUrl }: { jobId: number; logTs: number; relativeUrl?: string }) => () => {
    onClickCb()
    setTimeout(() => navigate(relativeUrl || `/last-activity/${jobId}?lastSeenLogKey=job-${jobId}-log-${logTs}`), 0)
  }, [navigate, onClickCb])
  const handleGoJob = useCallback(({ jobId }: { jobId: number }) => () => {
    onClickCb()
    setTimeout(() => navigate(`/jobs/${jobId}`), 0)
  }, [navigate, onClickCb])

  return (
    <Grid
      key={j.id}
      size={12}
      sx={{
        // padding: '8px',
        // border: '1px solid red',
        pl: 2,
        pr: 2,
        // alignSelf: 'start',
      }}
    >
      <div className={baseClasses.stack1}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div>
              <HighlightedText
                comparedValue={j.title}
                testedValue={testedValue}
                style={{
                  fontWeight: 'bold',
                  color: !!params.job_id && Number(params.job_id) === j.id ? 'red' : 'inherit',
                }}
              />
            </div>
            <div
              style={{ display: 'flex', flexDirection: 'row', gap: '16px', flexWrap: 'wrap' }}
            >
              <Button
                disabled={!!params.job_id && Number(params.job_id) === j.id && isJobPage}
                onClick={handleGoJob({ jobId: j.id })}
                sx={{ borderRadius: 4 }}
                size='small'
                variant='contained'
                // startIcon={<NewReleasesIcon />}
                // onClick={handleNavigateToJobNode({ jobId: j.id })}
                startIcon={
                  !!j.relations.parent
                    ? <ExtensionIcon />
                    : <ConstructionIcon />
                }
                endIcon={
                  j.relations.children.length > 0
                    ? <HiveIcon />
                    : undefined}
              >
                Job
              </Button>
            </div>
          </div>
        </div>
        {
          !!j.descr && (
            <CollapsibleText
              briefText='Description'
              isClickableBrief
              contentRender={() => (
                <div>
                  <HighlightedText
                    comparedValue={j.descr as string}
                    testedValue={testedValue}
                    style={{
                      fontWeight: 'bold',
                      color: '#959eaa',
                    }}
                  />
                </div>
              )}
            />
          )
        }
        {
          Array.isArray(j.pointset) && j.pointset.length > 0 && (
            <CollapsibleText
              briefText='Roadmap'
              isClickableBrief
              contentRender={() => (
                <SimpleJobPointsetChecker
                  noFixedNavigateBtn
                  isCreatable={false}
                  isEditable={false}
                  jobId={j.id}
                />
              )}
            />
          )
        }

        {
          !!filteredJobsLogsMappingChunk
          && Array.isArray(filteredJobsLogsMappingChunk)
          && filteredJobsLogsMappingChunk.length > 0
          && (
            <CollapsibleText
              briefPrefix='└─'
              briefText={`Logs (${filteredJobsLogsMappingChunk.length}) 👉 Sorted by date`}
              isClickableBrief
              contentRender={() => (
                <div
                  className={baseClasses.stack1}
                  style={{ paddingLeft: '24px' }}
                >
                  {
                    filteredJobsLogsMappingChunk
                      .map((log) => (
                        <div key={`logs-item-${j.id}-${log.original.ts}`} className={baseClasses.stack1}>
                          <span
                            style={{
                              color: '#959eaa',
                              // whiteSpace: 'pre-wrap',
                              fontSize: 'x-small',
                              fontWeight: 'bold',
                              display: 'flex',
                              flexDirection: 'row',
                              gap: '6px',
                              alignItems: 'center',
                              // justifyContent: 'space-between',
                            }}
                          >
                            <span
                              style={{
                                color: '#FFF',
                                borderRadius: '16px',
                                padding: '1px 6px',
                                // backgroundColor: 'black',
                                lineHeight: '16px',
                              }}
                              className={clsx(baseClasses.backdropBlurDark)}
                            >
                              {dayjs(log.original.ts).format('DD.MM.YYYY HH:mm')}
                            </span>
                            <span>({timeAgo.format(log.original.ts)})</span>
                            {/* <span
                              style={{
                                display: 'flex',
                                flexDirection: 'row',
                                gap: '8px',
                                justifyContent: 'flex-start',
                                alignItems: 'center',
                              }}
                            >
                              <a target='_blank' href={`${PUBLIC_URL}/#/jobs/${j.id}/logs/${log.original.ts}?lastSeenLogKey=job-${j.id}-log-${log.original.ts}`}>LOG ↗️</a>
                            </span> */}
                          </span>
                          <HighlightedText
                            comparedValue={log.original.text}
                            testedValue={testedValue}
                            style={{
                              fontWeight: 'bold',
                              color: !!params.log_ts && Number(params.log_ts) === log.original.ts
                                ? 'red'
                                : 'inherit',
                              borderLeft: '4px solid #959eaa',
                              paddingLeft: '8px',
                            }}
                          />
                          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', gap: '16px' }}>
                            <Button
                              // disabled={!!params.log_ts && Number(params.log_ts) === log.original.ts}
                              // fullWidth
                              onClick={handleGoActivity({ jobId: j.id, logTs: log.original.ts })}
                              sx={{ borderRadius: 4 }}
                              size='small'
                              variant='outlined'
                              // startIcon={<NewReleasesIcon />}
                              // onClick={() => navigate(`/last-activity/${j.id}`)}
                              startIcon={<SportsBasketballIcon />}
                            >
                              Log Activity
                            </Button>
                            <Button
                              disabled={!!params.log_ts && Number(params.log_ts) === log.original.ts && isLogPage}
                              // fullWidth
                              onClick={handleGoActivity({
                                jobId: j.id,
                                logTs: log.original.ts,
                                relativeUrl: `/jobs/${j.id}/logs/${log.original.ts}?lastSeenLogKey=job-${j.id}-log-${log.original.ts}`,
                              })}
                              sx={{ borderRadius: 4 }}
                              size='small'
                              variant='outlined'
                              // startIcon={<NewReleasesIcon />}
                              // onClick={() => navigate(`/last-activity/${j.id}`)}
                              startIcon={<MonitorHeartIcon />}
                            >
                              Log
                            </Button>
                          </div>
                          {
                            !!log._service.commonMessage && (
                              <em style={{ color: '#959eaa' }}>{log._service.commonMessage}</em>
                            )
                          }
                          {
                            log._service.logLocalLinks.length > 0 && (
                              <>
                                <CollapsibleText
                                  briefPrefix={log._service.logExternalLinks.length > 0 ? '├─' : '└─'}
                                  briefText={`Checklist (${log._service.logLocalLinks.length}) 👉 Sorted by priority (order DESC)`}
                                  isClickableBrief
                                  contentRender={() => (
                                    <div
                                      className={baseClasses.stack1}
                                      style={{ paddingLeft: '24px' }}
                                    >
                                      {
                                        log._service.logLocalLinks.map(({ ui, descr, relativeUrl: _relativeUrl, id, updatedAgo: _updatedAgo }) => (
                                          <div key={id} className={baseClasses.stack1}>
                                            {/* <a target='_blank' href={`${PUBLIC_URL}/#${relativeUrl}`}>{ui} ↗️</a> */}

                                            <HighlightedText
                                              comparedValue={ui}
                                              testedValue={testedValue}
                                              style={{
                                                borderLeft: '4px solid #959eaa',
                                                paddingLeft: '8px',
                                                fontWeight: 'bold',
                                              }}
                                            />
                                            {/* <Button
                                              disabled={!!params.log_ts && Number(params.log_ts) === log.original.ts && isLogPage}
                                              onClick={handleGoActivity({ jobId: j.id, logTs: log.original.ts, relativeUrl })}
                                              sx={{ borderRadius: 4 }}
                                              size='small'
                                              variant='text'
                                              // startIcon={<NewReleasesIcon />}
                                              // onClick={() => navigate(`/last-activity/${j.id}`)}
                                              startIcon={<MonitorHeartIcon />}
                                            >
                                              Log
                                            </Button> */}
                                            {
                                              !!descr && (
                                                <HighlightedText
                                                  comparedValue={descr}
                                                  testedValue={testedValue}
                                                  style={{
                                                    color: '#959eaa'
                                                  }}
                                                />
                                              )
                                            }
                                          </div>
                                        ))
                                      }
                                    </div>
                                  )}
                                />
                              </>
                            )
                          }
                          {
                            log._service.logExternalLinks.length > 0 && (
                              <>
                                <CollapsibleText
                                  briefPrefix='└─'
                                  briefText={`External links (${log._service.logExternalLinks.length})`}
                                  isClickableBrief
                                  contentRender={() => (
                                    <div
                                      className={baseClasses.stack1}
                                      style={{ paddingLeft: '24px' }}
                                    >
                                      {
                                        log._service.logExternalLinks.map(({ url, ui, descr, logTs, jobId }) => (
                                          <div key={`${jobId}--${logTs}`} className={baseClasses.stack1}>
                                            <HighlightedText
                                              comparedValue={ui}
                                              testedValue={testedValue}
                                              style={{
                                                borderLeft: '4px solid #959eaa',
                                                paddingLeft: '8px',
                                              }}
                                            />
                                            <a href={url} target='_blank'>{`${url} ↗️`}</a>
                                            {
                                              !!descr && (
                                                <HighlightedText
                                                  comparedValue={descr}
                                                  testedValue={testedValue}
                                                  style={{ color: '#959eaa' }}
                                                />
                                              )
                                            }
                                            <span className={baseClasses.truncate}>
                                              <CopyToClipboardWrapper
                                                text={url}
                                                uiText={ui}
                                                showNotifOnCopy
                                              />
                                            </span>
                                          </div>
                                        ))
                                      }
                                    </div>)}
                                />
                              </>
                            )
                          }
                        </div>
                      ))
                  }
                </div>
              )}
            />
          )
        }
        {/* <pre
          className={clsx(
            baseClasses.preNormalized,
          )}
        >{JSON.stringify(outputWorkerData.output, null, 2)}</pre> */}
      </div>
    </Grid>
  )
})
