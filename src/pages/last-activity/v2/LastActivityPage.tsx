import { memo, useState, useMemo, useCallback } from 'react'
import baseClasses from '~/App.module.scss'
import { Alert, Button, Grid2 as Grid } from '@mui/material'
import { LastActivityPagerAbstracted, ResponsiveBlock } from '~/shared/components'
import { useParamsInspectorContextStore } from '~/shared/xstate/topLevelMachine/v2/context/ParamsInspectorContextWrapper'
import { useLogsPagerWorker } from './hooks'
import { debugFactory } from '~/shared/utils'
import { TLogsItem, TopLevelContext } from '~/shared/xstate'
import { NWService } from '~/shared/utils/wws/types'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { getFullUrl } from '~/shared/utils/string-ops'
import clsx from 'clsx'
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { getModifiedJobLogText } from '~/pages/jobs/[job_id]/utils'

type TJobType = 'default' | 'globalTag'
type TLogBorder = 'default' | 'red'
type TLogBg = 'default' | 'green' | 'warn'
type TModifiedLog = (TLogsItem & {
  jobId: number;
  jobTitle: string;
  logBorder: TLogBorder;
  logBg: TLogBg;
  jobType: TJobType;
  logUniqueKey: string;
  jobTsUpdate: number;
  __prevLog: (TLogsItem & Pick<TModifiedLog, 'jobId' | 'jobTitle' | 'jobType' | 'logUniqueKey'>) | null;
  __nextLog: (TLogsItem & Pick<TModifiedLog, 'jobId' | 'jobTitle' | 'jobType' | 'logUniqueKey'>) | null;
});
type TTargetResultByWorker = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _partialInput: any;
  message?: string;
  binarySearchedIndex: number;
  pagination: {
    pageLimit: number;
    totalItems: number;
    totalPages: number;
    currentPageIndex: number;
    currentPage: number;
    nextPageIndex: number | null;
    nextPage: number | null;
    prevPageIndex: number | null;
    prevPage: number | null;
    isCurrentPageFirst: boolean;
    isCurrentPageLast: boolean;
    itemsRangeInfo: string;
  };
  currentPage: TModifiedLog[] | null;
  nextPage: TModifiedLog[] | null;
  prevPage: TModifiedLog[] | null;
}
type TWorkerServiceReport = {
  message?: string;
}
const logger = debugFactory<NWService.TDataResult<TTargetResultByWorker> | null, { reason: string; } | null>({
  label: '👉 LastActivityPage v2 EXP',
})
const getNormalizedPage = (index: number): number => index + 1

export const LastActivityPage = memo(() => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [counter, _setCounter] = useState<number>(0)
  // const incCounter = useCallback(() => {
  //   setCounter((v) => v + 1)
  // }, [])

  const [outputWorkerData, setOutputWorkerData] = useState<TTargetResultByWorker | null>(null)
  const [outputWorkerErrMsg, setOutputWorkerErrMsg] = useState<string | null>(null)
  const [outputWorkerDebugMsg, setOutputWorkerDebugMsg] = useState<string | null>(null)

  const jobs = TopLevelContext.useSelector((s) => s.context.jobs.items)
  const [mainCounters] = useParamsInspectorContextStore((ctx) => ctx.counters.main)
  const [activeFilters] = useParamsInspectorContextStore((ctx) => ctx.activeFilters)
  const [queryParams] = useParamsInspectorContextStore((ctx) => ctx.queryParams)
  const [debugSettings] = useParamsInspectorContextStore((ctx) => ctx.debug)
  const isDebugEnabled = debugSettings.filters.isEnabled && debugSettings.filters.level === 1

  const [urlSearchParams] = useSearchParams()
  const requiredPage = useMemo<number | undefined>(() =>
    !!urlSearchParams.get('page') && !Number.isNaN(Number(urlSearchParams.get('page')))
      ? Number(urlSearchParams.get('page'))
      : undefined,
    [urlSearchParams]
  )
  const urlSearchParamLastSeenLogTs = useMemo<number | null>(() => {
    const lastSeenLogKey = urlSearchParams.get('lastSeenLogKey')
    if (!!lastSeenLogKey) {
      const splitted = lastSeenLogKey.split('-')
      if (!!splitted[3] && !Number.isNaN(Number(splitted[3]))) {
        return Number(splitted[3])
      } else return null
    } else return null
  }, [urlSearchParams])

  useLogsPagerWorker<TTargetResultByWorker, TWorkerServiceReport>({
    isEnabled: true,
    isDebugEnabled,
    cb: {
      onEachSuccessItemData: (data) => {
        if (isDebugEnabled) {
          logger.log({
            label: '🟢 onEachSuccessItemData',
            event: data,
            err: null,
          })
        }
        if (!!data.originalResponse) {
          setOutputWorkerErrMsg(null)
          setOutputWorkerData(data.originalResponse)
          if (!!data.message) setOutputWorkerDebugMsg(data.message)
        }
      },
      onFinalError: ({ reason }) => {
        if (isDebugEnabled) {
          logger.log({
            label: '🔴 onFinalError',
            event: null,
            err: { reason },
          })
        }
        setOutputWorkerErrMsg(reason)
      },
    },
    deps: {
      counter,
      jobs,
      activeLogTs: urlSearchParamLastSeenLogTs,
      requiredPage,
      activeFilters,
    },
  })

  const navigate = useNavigate()
  const handleNavigate = useCallback((relativeUrl: string) => () => navigate(relativeUrl), [navigate])
  // const handleCreateNewCallback = useCallback(() =>
  //   handleNavigate(
  //     getFullUrl({ url: '/last-activity', query: { ...queryParams, page: '1' } })
  //   ),
  //   [handleNavigate, queryParams]
  // )
  const [userRouteControls] = useParamsInspectorContextStore((ctx) => ctx.userRouteControls)

  // -- NOTE: [PERF EXP] Modify log texts exp (perf should be tested)
  const users = TopLevelContext.useSelector((s) => s.context.users)
  const currentPageModified2 = useMemo(() => (
    !!outputWorkerData?.currentPage
      ? outputWorkerData?.currentPage.map((item) => ({
        ...item,
        text: getModifiedJobLogText({ text: item.text, jobs, users: users.items }),
      }))
      : []
  ), [jobs, users.items, outputWorkerData?.currentPage])
  // --

  return (
    <>
      <div
        className={baseClasses.stack1}
        style={{
          marginBottom: '16px',
        }}
      >
        <Grid container spacing={2}>
          {/* <Grid size={12}>
            <h1><span style={{ display: 'inline-block', transform: 'rotate(-7deg)' }}>📟</span> LogsPager v2 exp</h1>
          </Grid> */}

          {/* <Grid size={12}>
            <pre
              className={clsx(
                baseClasses.preNormalized,
              )}
              style={{ maxHeight: '300px', overflowY: 'auto' }}
            >
              {JSON.stringify({
                // targetEmployeeCounters,
                _service: outputWorkerData?._partialInput || null,
                // cur: {
                //   pagCurrentPageIndex: outputWorkerData?.pagination.currentPageIndex,
                //   pagCurrentPage: outputWorkerData?.pagination.currentPage,
                // },
                // prev: {
                //   pagPrevPageIndex: outputWorkerData?.pagination.prevPageIndex,
                //   pagPrevPage: outputWorkerData?.pagination.prevPage,
                // },
                // next: {
                //   pagNextPageIndex: outputWorkerData?.pagination.nextPageIndex,
                //   pagNextPage: outputWorkerData?.pagination.nextPage,
                // }
              }, null, 2)}
            </pre>
          </Grid> */}

          {!!outputWorkerErrMsg && (
            <Grid
              size={12}
              className={baseClasses.specialTopContent}
            >
              <Alert severity='error' variant='filled'>
                <div className={baseClasses.stack1}>
                  <b>Error message</b>
                  <span>{outputWorkerErrMsg}</span>
                </div>
              </Alert>
            </Grid>
          )}

          {isDebugEnabled && !!outputWorkerDebugMsg && (
            <Grid size={12}>
              <Alert severity='info' variant='outlined'>
                <div className={baseClasses.stack1}>
                  <b>Debug message</b>
                  <pre className={baseClasses.preNormalized}>{outputWorkerDebugMsg}</pre>
                </div>
              </Alert>
            </Grid>
          )}
          {
            <Grid size={12}>
              <LastActivityPagerAbstracted
                counters={mainCounters}
                // activeLogTs?: number | null;
                // onToggleDrawer?: (isDrawlerOpened: boolean) => ({ jobId }: { jobId: number }) => void;
                modifiedLogs={currentPageModified2}
                // onCreateNew?: () => void;
                subheader='Logs'
                // pageInfo={!!outputWorkerData ? `${getNormalizedPage(outputWorkerData.pagination.currentPageIndex)} / ${outputWorkerData.pagination.totalPages}` : undefined}
                pageInfo={outputWorkerData?.pagination.itemsRangeInfo}
                pagerControlsHardcodedPath='/last-activity'
                key={outputWorkerData?.pagination.currentPage}
              // jobs={outputWorkerData?.currentPage || []}
              // activeJobId={lastSeenJobID}
              // onCreateNew={handleCreateNewCallback}
              // pageInfo={!!outputWorkerData ? `${getNormalizedPage(outputWorkerData.pagination.currentPageIndex)} / ${outputWorkerData.pagination.totalPages}` : undefined}
              // subheader={targetUser.displayName}
              />
            </Grid>

          }
          {/*
            !outputWorkerData?.currentPage && (
              <Grid size={12}>
                <Alert severity='warning' variant='outlined'>
                  <div className={baseClasses.stack1}>
                    <b>Oops...</b>
                    <span>Try another secrh settings</span>
                    <Link to='/last-activity'>Reload</Link>
                  </div>
                </Alert>
              </Grid>
            )
          */}
        </Grid>
      </div>

      {
        !!outputWorkerData?.currentPage && outputWorkerData.pagination.totalPages > 1 && (
          <ResponsiveBlock
            className={clsx(baseClasses.stack1, baseClasses.fadeIn)}
            style={{
              padding: '16px 16px 16px 16px',
              // border: '1px dashed red',
              // boxShadow: '0 -10px 7px -8px rgba(34,60,80,.2)',
              position: 'sticky',
              bottom: '16px',
              backgroundColor: '#fff',
              zIndex: 3,
              marginTop: 'auto',
              // borderRadius: '16px 16px 0px 0px',
              borderRadius: '32px',
              // boxShadow: '0 -10px 7px -8px rgba(34,60,80,.2)',
              // boxShadow: 'rgba(0, 0, 0, 0.35) 0px 5px 15px',
              boxShadow: 'rgba(100, 100, 111, 0.2) 0px 7px 29px 0px',
              marginBottom: '16px',
            }}
          >

            {
              !!userRouteControls.from && (
                <Link
                  to={userRouteControls.from.value}
                  target='_self'
                  className={baseClasses.truncate}
                >
                  <Button
                    sx={{ borderRadius: 4 }}
                    size='small'
                    variant='outlined'
                    startIcon={<ArrowBackIcon />}
                    fullWidth
                    className={baseClasses.truncate}
                  >
                    <span className={baseClasses.truncate}>{userRouteControls.from.uiText}</span>
                  </Button>
                </Link>
              )
            }

            <ResponsiveBlock
              className={clsx(baseClasses.specialActionsAndPagerInfoGrid)}
            >
              <Button
                sx={{ borderRadius: 4 }}
                size='small'
                // variant='outlined'
                variant={outputWorkerData?.pagination.isCurrentPageLast ? 'contained' : 'outlined'}
                fullWidth
                // startIcon={<ArrowBackIosIcon />}
                onClick={
                  handleNavigate(
                    getFullUrl({
                      url: '/last-activity',
                      query: {
                        ...queryParams,
                        page: outputWorkerData?.pagination.prevPage,
                      },
                    })
                  )}
                disabled={outputWorkerData?.pagination.isCurrentPageFirst || typeof outputWorkerData?.pagination.prevPageIndex !== 'number'}
              >
                {/*`Prev${!outputWorkerData?.pagination.isCurrentPageFirst && typeof outputWorkerData?.pagination.currentPageIndex === 'number' ? ` (${getNormalizedPage(outputWorkerData?.pagination.currentPageIndex - 1)} of ${outputWorkerData?.pagination.total})` : ''}`*/}
                <ArrowBackIosIcon sx={{ fontSize: '14px' }} />
              </Button>

              <Button
                sx={{ borderRadius: 4 }}
                size='small'
                // variant='outlined'
                variant={!outputWorkerData?.pagination.isCurrentPageLast ? 'contained' : 'outlined'}
                fullWidth
                // endIcon={<ArrowForwardIosIcon />}
                onClick={
                  handleNavigate(
                    getFullUrl({
                      url: '/last-activity',
                      query: {
                        ...queryParams,
                        page: outputWorkerData?.pagination.nextPage,
                      },
                    })
                  )}
                disabled={outputWorkerData?.pagination.isCurrentPageLast || typeof outputWorkerData?.pagination.nextPageIndex !== 'number'}
              >
                {/*`Next${!outputWorkerData?.pagination.isCurrentPageLast && typeof outputWorkerData?.pagination.currentPageIndex === 'number' ? ` (${getNormalizedPage(outputWorkerData?.pagination.currentPageIndex + 1)} of ${outputWorkerData?.pagination.total})` : ''}`*/}
                <ArrowForwardIosIcon sx={{ fontSize: '14px' }} />
              </Button>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  color: '#959eaa',
                  fontWeight: 'bold',
                }}
              >
                {getNormalizedPage(outputWorkerData.pagination.currentPageIndex)} / {outputWorkerData.pagination.totalPages}
              </div>

              {/* <Link to='/jobs' target='_self'>
                <Button variant='contained' startIcon={<ConstructionIcon />} fullWidth>
                  All Jobs
                </Button>
              </Link>
              <Link to='/' target='_self'>
                <Button variant='contained' fullWidth endIcon={<AppsIcon />}>
                  Home
                </Button>
              </Link> */}
            </ResponsiveBlock>

            {
              !!userRouteControls.to && (
                <Link
                  to={userRouteControls.to.value}
                  target='_self'
                  className={baseClasses.truncate}
                >
                  <Button
                    sx={{ borderRadius: 4 }}
                    size='small'
                    variant='outlined'
                    endIcon={<ArrowForwardIcon />}
                    fullWidth
                    className={baseClasses.truncate}
                  >
                    <span className={baseClasses.truncate}>{userRouteControls.to.uiText}</span>
                  </Button>
                </Link>
              )
            }

            {/* <Button
              variant='outlined'
              fullWidth
              onClick={handleNavigate(pagerControlsHardcodedPath)}
              disabled={outputWorkerData?.pagination.isCurrentPageFirst}
            >
              1st of {outputWorkerData.pagination.totalItems}
            </Button> */}
          </ResponsiveBlock>
        )
      }
    </>
  )
})