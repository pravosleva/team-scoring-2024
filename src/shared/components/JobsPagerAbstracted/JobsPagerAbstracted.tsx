import { memo, useState, useCallback, useMemo } from 'react'
import baseClasses from '~/App.module.scss'
// import { Layout } from '~/shared/components/Layout'
// import AppsIcon from '@mui/icons-material/Apps'
import { Alert, Button, Grid2 as Grid } from '@mui/material'
import { ResponsiveBlock } from '~/shared/components'
import clsx from 'clsx'
import { useNavigate } from 'react-router-dom'
import { TJob, TopLevelContext } from '~/shared/xstate'
import { useSearchParams } from 'react-router-dom'
import { debugFactory } from '~/shared/utils'
import { useJobsPagerWorker } from './hooks'
import classes from './JobsPagerAbstracted.module.scss'
import { NWService } from '~/shared/utils/wws/types'
// import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
// import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
// import ConstructionIcon from '@mui/icons-material/Construction'
import { JobList2 } from '~/shared/components'
import CircularProgress from '@mui/material/CircularProgress'
import { useParamsInspectorContextStore } from '~/shared/xstate/topLevelMachine/v2/context/ParamsInspectorContextWrapper'
import { getFullUrl } from '~/shared/utils/string-ops'

const logger = debugFactory<NWService.TDataResult<TTargetResultByWorker> | null, { reason: string; } | null>({
  label: '👉 JobsPager EXP',
})
const getNormalizedPage = (index: number): number => index + 1

type TProps = {
  // isDebugEnabled?: boolean;
  pagerControlsHardcodedPath: string;
  _onToggleDrawer?: (isDrawlerOpened: boolean) => ({ jobId }: { jobId: number }) => void;
  _isCreatable?: boolean;
  _isSortable?: boolean;
}
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
  currentPage: TJob[] | null;
  nextPage: TJob[] | null;
  prevPage: TJob[] | null;
}
type TWorkerServiceReport = {
  message?: string;
}

export const JobsPagerAbstracted = memo(({
  pagerControlsHardcodedPath,
  _onToggleDrawer,
  _isCreatable,
  _isSortable,
}: TProps) => {
  const [urlSearchParams] = useSearchParams()
  const lastSeenJobID = useMemo<number | null>(() =>
    !!urlSearchParams.get('lastSeenJob') && !Number.isNaN(Number(urlSearchParams.get('lastSeenJob')))
      ? Number(urlSearchParams.get('lastSeenJob'))
      : null,
    [urlSearchParams]
  )
  const requiredPage = useMemo<number | undefined>(() =>
    !!urlSearchParams.get('page') && !Number.isNaN(Number(urlSearchParams.get('page')))
      ? Number(urlSearchParams.get('page'))
      : undefined,
    [urlSearchParams]
  )
  const jobs = TopLevelContext.useSelector((s) => s.context.jobs.items)

  const [outputWorkerData, setOutputWorkerData] = useState<TTargetResultByWorker | null>(null)
  const [outputWorkerErrMsg, setOutputWorkerErrMsg] = useState<string | null>(null)
  const [outputWorkerDebugMsg, setOutputWorkerDebugMsg] = useState<string | null>(null)

  const [isWorkerEnabled, setIsWorkerEnabled] = useState<boolean>(true)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const toggleWorker = () => setIsWorkerEnabled((v) => !v)

  const [counter, setCounter] = useState<number>(0)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const incCounter = useCallback(() => {
    setCounter((v) => v + 1)
  }, [])
  const [activeFilters] = useParamsInspectorContextStore((ctx) => ctx.activeFilters)
  const [queryParams] = useParamsInspectorContextStore((ctx) => ctx.queryParams)
  const [debug] = useParamsInspectorContextStore((ctx) => ctx.debug)
  const isDebugEnabled = debug.filters.isEnabled && debug.filters.level === 1

  useJobsPagerWorker<TTargetResultByWorker, TWorkerServiceReport>({
    isEnabled: isWorkerEnabled,
    isDebugEnabled,
    cb: {
      onEachSuccessItemData: (data) => {
        if (isDebugEnabled) {
          logger.log({
            label: '🟢 onEachSuccessItemData',
            evt: data,
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
            evt: null,
            err: { reason },
          })
        }
        setOutputWorkerErrMsg(reason)
      },
    },
    deps: {
      counter,
      jobs,
      activeJobId: lastSeenJobID,
      requiredPage,
      activeFilters,
    },
  })
  const navigate = useNavigate()
  const handleNavigate = useCallback((relativeUrl: string) => () => navigate(relativeUrl), [navigate])
  const handleCreateNewCallback = useCallback(() => {
    handleNavigate(
      getFullUrl({ url: pagerControlsHardcodedPath, query: { ...queryParams }, queryKeysToremove: ['page', 'lastSeenJob'] })
    )()
  },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [handleNavigate, pagerControlsHardcodedPath, queryParams.page]
  )

  return (
    <>
      <div
        className={baseClasses.stack1}
        style={{
          marginBottom: '24px',
        }}
      >
        <Grid container spacing={2}>

          {/* <Grid size={12}>
            <h1><span style={{ display: 'inline-block', transform: 'rotate(-7deg)' }}>📟</span> JobsPager exp</h1>
          </Grid> */}

          {!!outputWorkerErrMsg && (
            <Grid size={12} className={baseClasses.specialTopContent}>
              <Alert severity='error' variant='filled'>
                <div className={baseClasses.stack1}>
                  <b>Error message</b>
                  <span>{outputWorkerErrMsg}</span>
                </div>
              </Alert>
            </Grid>
          )}

          {
            isDebugEnabled && (
              <Grid size={12}>
                <pre
                  className={clsx(
                    baseClasses.preNormalized,
                    classes.resultWrapper,
                    {
                      [classes.resultWhenWorkerDisabled]: !isWorkerEnabled,
                      [classes.resultWhenWorkerEnabled]: isWorkerEnabled,
                    }
                  )}
                  style={{ maxHeight: '300px', overflowY: 'auto' }}
                >
                  {JSON.stringify({
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
              </Grid>
            )
          }

          {
            !!outputWorkerData && (
              <Grid size={12}>
                <JobList2
                  pagerControlsHardcodedPath={pagerControlsHardcodedPath}
                  isCreatable={_isCreatable}
                  isSortable={_isSortable}
                  key={outputWorkerData?.pagination.currentPage}
                  jobs={outputWorkerData?.currentPage || []}
                  // activeJobId={lastSeenJobID}
                  onCreateNew={handleCreateNewCallback}
                  // pageInfo={!!outputWorkerData ? `${getNormalizedPage(outputWorkerData.pagination.currentPageIndex)} / ${outputWorkerData.pagination.totalPages}` : undefined}
                  pageInfo={outputWorkerData?.pagination.itemsRangeInfo}
                  subheader='Jobs'
                  onToggleDrawer={_onToggleDrawer}
                />
              </Grid>
            )
          }

          {
            !outputWorkerData && (
              <Grid size={12} sx={{ width: '100%', display: 'flex', justifyContent: 'center', padding: 6 }}>
                <CircularProgress />
              </Grid>
            )
          }

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

        </Grid>
      </div>

      {
        !!outputWorkerData?.currentPage && outputWorkerData.pagination.totalPages > 1 && (
          <ResponsiveBlock
            className={clsx(baseClasses.stack1, baseClasses.fadeIn)}
            style={{
              padding: '16px 0 16px 0',
              // border: '1px dashed red',
              boxShadow: '0 -10px 7px -8px rgba(34,60,80,.2)',
              position: 'sticky',
              bottom: 0,
              backgroundColor: '#fff',
              zIndex: 3,
              marginTop: 'auto',
              // borderRadius: '16px 16px 0px 0px',
            }}
          >
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
                      url: pagerControlsHardcodedPath,
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
                variant={!outputWorkerData?.pagination.isCurrentPageLast ? 'contained' : 'outlined'}
                fullWidth
                // endIcon={<ArrowForwardIosIcon />}
                onClick={
                  handleNavigate(
                    getFullUrl({
                      url: pagerControlsHardcodedPath,
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
