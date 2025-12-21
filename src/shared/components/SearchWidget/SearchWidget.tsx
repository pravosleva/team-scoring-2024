import { memo, useState, useCallback, useMemo, useRef, useEffect } from 'react'
import clsx from 'clsx'
// import ExpandLessIcon from '@mui/icons-material/ArrowLeft'
import SearchIcon from '@mui/icons-material/Search'
import SearchOffIcon from '@mui/icons-material/SearchOff'
import baseClasses from '~/App.module.scss'
import { Alert, Button, Grid2 as Grid, IconButton, TextField } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { TJob, TopLevelContext } from '~/shared/xstate'
import { debugFactory, NWService } from '~/shared/utils'
import classes from './SearchWidget.module.scss'
import { useSearchBasicWorker } from './hooks'
import { useParamsInspectorContextStore } from '~/shared/xstate/topLevelMachine/v2/context/ParamsInspectorContextWrapper'
import { CollapsibleText } from '~/pages/jobs/[job_id]/components/ProjectsTree/components'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { delayedCallFactory } from '~/shared/utils/web-api-ops'
import { scrollToIdFactory } from '~/shared/utils/web-api-ops'
import { getMatchedByAnyString } from '~/shared/utils/string-ops'
import { getIsNumeric } from '~/shared/utils/number-ops'
import ConstructionIcon from '@mui/icons-material/Construction'
import AccountTreeIcon from '@mui/icons-material/AccountTree'
import SportsBasketballIcon from '@mui/icons-material/SportsBasketball'
import HiveIcon from '@mui/icons-material/Hive'
import ExtensionIcon from '@mui/icons-material/Extension'
import CircularProgress from '@mui/material/CircularProgress'
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import { SimpleJobPointsetChecker } from '../SimpleJobPointsetChecker'
import { ResponsiveBlock } from '../ResponsiveBlock'
import { useLocalStorageState } from '~/shared/hooks'

type TProps = {
  position: 'left-side-center-bottom';
}
type TTargetResultByWorker = {
  _partialInput: any;
  output: {
    [key: string]: any;
  };
  message?: string;
  // binarySearchedIndex: number;
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
// type TWorkerServiceReport = {
//   message?: string;
// }

const logger = debugFactory<NWService.TDataResult<TTargetResultByWorker> | null, { reason: string; } | null>({
  label: '👉 SearchWidget EXP',
})
const getNormalizedPage = (index: number): number => index + 1

const stickyElementHeight2 = 58
const _specialNavigate = {
  getOffsetTop: ({ targetElm }: { targetElm: HTMLElement }) => {
    const classList = targetElm.className.split(' ')
    const informativeClass = classList.find((val) => getMatchedByAnyString({ tested: val, expected: ['projects-tree-level_'] }))
    if (!!informativeClass) {
      const level = informativeClass.split('_')[1]
      if (typeof level !== 'undefined' && getIsNumeric(level)) {
        const normalizedLevel = Number(level)
        return normalizedLevel === 1
          ? 0 + 16
          : normalizedLevel === 2
            ? (normalizedLevel - 1) * stickyElementHeight2 + 8
            : (normalizedLevel - 1) * stickyElementHeight2
      }
      return undefined
    }
  },
}
const specialScroll = scrollToIdFactory({
  timeout: 250,
  offsetTop: 16,
  elementHeightCritery: 550,
})

export const SearchWidget = memo((ps: TProps) => {
  const [isWidgetOpened, setIsWidgetOpened] = useState<boolean>(false)
  const toggleWigget = useCallback(() => {
    setIsWidgetOpened((s) => !s)
  }, [setIsWidgetOpened])
  // const [searchValue, setSearchValue] = useState('')
  const params = useParams()
  const jobs = TopLevelContext.useSelector((s) => s.context.jobs.items)
  const [activeFilters] = useParamsInspectorContextStore((ctx) => ctx.activeFilters)
  const [outputWorkerData, setOutputWorkerData] = useState<TTargetResultByWorker | null>(null)
  const [outputWorkerErrMsg, setOutputWorkerErrMsg] = useState<string | null>(null)
  const [_outputWorkerDebugMsg, setOutputWorkerDebugMsg] = useState<string | null>(null)

  // -- NOTE: Init basic search text; Update in LS for F5 restore (or target link load)
  const [qBasicSearch, saveQBasicSearch] = useLocalStorageState<string | null>({
    key: 'teamScoring2024:q_basic_search',
    initialValue: null,
  })
  const qBasicSearchRef = useRef<HTMLInputElement | null>(null)
  const [searchValueBasic, setSearchValueBasic] = useState(
    typeof params.q_basic_search === 'string'
      ? decodeURIComponent(params.q_basic_search)
      : (qBasicSearch || '')
  )
  useEffect(() => {
    saveQBasicSearch(searchValueBasic)
  }, [searchValueBasic])
  useEffect(() => {
    if (isWidgetOpened && !searchValueBasic) {
      qBasicSearchRef.current?.focus()
    }
  }, [isWidgetOpened, searchValueBasic])
  // --

  const handleCleanupAndClose = ({ shouldWidgetBeClosed }: { shouldWidgetBeClosed: boolean }) => () => {
    setSearchValueBasic('')
    if (shouldWidgetBeClosed) setIsWidgetOpened(false)
    else qBasicSearchRef.current?.focus()

    setOutputWorkerData(null)
    setOutputWorkerErrMsg(null)
    setOutputWorkerDebugMsg(null)
  }

  const [requiredPage, setRequiredPage] = useState<null | number>(null)
  useEffect(() => {
    setRequiredPage(null)
  }, [searchValueBasic])
  useEffect(() => {
    setOutputWorkerData(null)
    setOutputWorkerErrMsg(null)
    setOutputWorkerDebugMsg(null)
  }, [requiredPage])

  useSearchBasicWorker<TTargetResultByWorker, any>({
    debugName: 'SearchWidget',
    isEnabled: !!searchValueBasic,
    isDebugEnabled: true,
    deps: {
      searchQuery: searchValueBasic,
      jobs: jobs,
      activeFilters,
      activeJobId: !!params.job_id ? Number(params.job_id) : null,
      requiredPage,
    },
    cb: {
      onEachSuccessItemData: (data) => {
        logger.log({
          label: '🟢 onEachSuccessItemData',
          evt: data as any,
          err: null,
        })
        if (!!data.originalResponse) {
          setOutputWorkerErrMsg(null)
          setOutputWorkerData(data.originalResponse)
          if (!!data.message) setOutputWorkerDebugMsg(data.message)
        }
      },
      onFinalError: ({ reason }) => {
        logger.log({
          label: '🔴 onFinalError',
          evt: null,
          err: { reason },
        })
        setOutputWorkerErrMsg(reason)
      },
    },
    workerName: 'search-pager-basic',
  })

  // const navigate = useNavigate()
  // const handleNavigate = useCallback((relativeUrl: string) => () => navigate(relativeUrl), [navigate])

  return (
    <>
      <button
        className={clsx(
          classes.toggler,
          // classes.absoluteToggler,
          // 'backdrop-blur--lite',
          classes.fixedToggler,
        )}
        onClick={toggleWigget}
      >
        {
          isWidgetOpened
            ? <SearchOffIcon style={{ fontSize: '24px' }} />
            : <SearchIcon style={{ fontSize: '24px' }} />
        }
      </button>
      <div
        className={clsx(
          classes.wrapper,
          // baseClasses.stack2,
          // classes.fixedBox,
          baseClasses.backdropBlurLite,
          {
            [classes.leftSideCenterBottom]: ps.position === 'left-side-center-bottom',
            [classes.isClosed]: !isWidgetOpened,
            [classes.isOpened]: isWidgetOpened,
          },
          // classes.backdropBlur,
        )}
      >
        <Grid
          container
          spacing={2}
        >
          <Grid
            size={12}
            sx={{
              position: 'sticky',
              top: '0px',
              display: 'flex',
              flexDirection: 'row',
              gap: '8px',
              pr: 2,
              pl: 2,
              // pb: !outputWorkerData?.pagination ? 4 : 0,
            }}
          >
            <TextField
              slotProps={{
                input: {
                  startAdornment: <SearchIcon />,
                },
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 6 } }}
              // NOTE: Deprecated -> InputProps={}
              autoComplete='off'
              enterKeyHint='search'
              helperText={
                !!params.job_id
                  ? 'You have search for target single job'
                  : !!params.job_ids
                    ? `You have search for target ${params.job_ids.split(',').length} job${params.job_ids.split(',').length > 1 ? 's' : ''}`
                    : 'Search by title, descr, pointset'
              }
              error={!!searchValueBasic && !!outputWorkerData && !outputWorkerData.currentPage}
              type='text'
              // ref={inputRef}
              // placeholder='Search'
              label={
                !!params.job_id
                  ? `Search for the job #${params.job_id}`
                  : !!params.job_ids
                    ? `Search for the jobs (${params.job_ids.split(',').length})`
                    : 'Search'
              }
              variant='outlined'
              // error={!!__errsState[key]}
              // helperText={__errsState[key] || undefined}
              onKeyUp={(ev: React.KeyboardEvent<HTMLInputElement>) => {
                if (ev.key === 'Enter') {
                  // TODO: send to worker... (ev.target as HTMLInputElement).value
                  // if (typeof onCreateNew === 'function') onCreateNew()
                }
              }}
              onChange={(ev) => {
                setSearchValueBasic((ev.target as HTMLInputElement).value)
              }}
              value={searchValueBasic}
              // defaultValue={params.q_basic_search}
              size='small'
              ref={qBasicSearchRef}
            />
            {
              !!searchValueBasic && (
                <IconButton sx={{ alignSelf: 'flex-start' }} onClick={handleCleanupAndClose({ shouldWidgetBeClosed: false })}>
                  <CloseIcon />
                </IconButton>
              )
            }
          </Grid>
          {
            !!outputWorkerErrMsg && (
              <Grid size={12} sx={{ pr: 2, pl: 2 }} className={baseClasses.fadeIn}>
                <Alert
                  severity='error'
                  variant='filled'
                >
                  {outputWorkerErrMsg}
                </Alert>
              </Grid>

            )
          }
          {
            !!searchValueBasic && !!outputWorkerData && !outputWorkerData.currentPage
              ? (
                <Grid size={12} sx={{ width: '100%', display: 'flex', justifyContent: 'center', pr: 2, pl: 2, color: '#959eaa' }}>
                  <b>NOT FOUND</b>
                </Grid>
              )
              : !!outputWorkerData?.pagination.itemsRangeInfo
                ? (
                  <Grid size={12} sx={{ width: '100%', display: 'flex', justifyContent: 'center', pr: 2, pl: 2, color: '#959eaa' }}>
                    <b>{outputWorkerData?.pagination.itemsRangeInfo}</b>
                  </Grid>
                )
                : null
          }
          {
            !!searchValueBasic && !outputWorkerData && (
              <Grid size={12} sx={{ width: '100%', display: 'flex', justifyContent: 'center', padding: 6 }}>
                <CircularProgress />
              </Grid>
            )
          }
          {
            !!searchValueBasic && !!outputWorkerData && (
              <Grid
                size={12}
                sx={{
                  // pt: 2,
                  // pr: 2,
                }}
                className={clsx(
                  classes.contentLimited,
                  // baseClasses.boxShadowTop
                )}
              >
                <Grid
                  container
                  spacing={4}
                  sx={{ height: '100%' }}
                >
                  {/*
                    !!outputWorkerDebugMsg && (
                      <Grid size={12}>
                        <Alert
                          severity='info'
                          variant='outlined'
                        >
                          <pre
                            className={clsx(
                              baseClasses.preNormalized,
                            )}
                          >
                            {outputWorkerDebugMsg}
                          </pre>
                        </Alert>
                      </Grid>
                    )
                  */}
                  {
                    !!outputWorkerData?.currentPage && outputWorkerData.currentPage.length > 0 && (
                      <>
                        {
                          outputWorkerData.currentPage.map((j) => (
                            <Grid
                              key={j.id}
                              size={12}
                              sx={{
                                // padding: '8px',
                                // border: '1px solid red',
                                pl: 2,
                                pr: 2,
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
                                      <b
                                        style={{
                                          color: !!params.job_id && Number(params.job_id) === j.id ? 'red' : 'inherit',
                                        }}
                                      >{j.title}</b>
                                    </div>
                                    {
                                      !!j.descr && (
                                        <div>
                                          <b style={{ color: '#959eaa' }}>{j.descr}</b>
                                        </div>
                                      )
                                    }
                                    <div
                                      style={{ display: 'flex', flexDirection: 'row', gap: '16px', flexWrap: 'wrap' }}
                                    >
                                      <Link to={`/last-activity/${j.id}?q_basic_search=${encodeURIComponent(searchValueBasic)}`}>
                                        <Button sx={{ borderRadius: 4 }} size='small'
                                          variant='outlined'
                                          // startIcon={<NewReleasesIcon />}
                                          // onClick={() => navigate(`/last-activity/${j.id}`)}
                                          startIcon={<SportsBasketballIcon />}
                                        >
                                          Activity
                                        </Button>
                                      </Link>
                                      <Link to={`/jobs/${j.id}?q_basic_search=${encodeURIComponent(searchValueBasic)}`}>
                                        <Button sx={{ borderRadius: 4 }} size='small'
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
                                          disabled={!!params.job_id && Number(params.job_id) === j.id}
                                        >
                                          Job
                                        </Button>
                                      </Link>
                                    </div>
                                  </div>
                                </div>
                                {
                                  !!j.pointset && j.pointset.length > 0 && (
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
                              </div>
                            </Grid>
                          ))
                        }
                      </>
                    )
                  }
                  {/*
                    !!outputWorkerData && (
                      <Grid
                        size={12}
                        sx={{
                          position: 'sticky',
                          bottom: '0px',
                          border: '1px solid red',
                          backgroundColor: '#FFF',
                        }}
                        className={baseClasses.boxShadowTop}
                      >
                        <CollapsibleText
                          briefText={
                            !!params.job_id
                              ? `Search for the job #${params.job_id}`
                              : !!params.job_ids
                                ? `Search for the jobs: ${params.job_ids.split(',').join(', ')}`
                                : 'Search'}
                          isClickableBrief
                          contentRender={() => (
                            <>
                              <pre
                                className={clsx(
                                  baseClasses.preNormalized,
                                  // classes.resultWrapper,
                                  // {
                                  //   [classes.resultWhenWorkerDisabled]: !isWorkerEnabled,
                                  //   [classes.resultWhenWorkerEnabled]: isWorkerEnabled,
                                  // }
                                )}
                              // style={{ overflowY: 'auto' }}
                              >
                                {JSON.stringify({
                                  _partialInput: outputWorkerData?._partialInput,
                                  pagination: outputWorkerData?.pagination,
                                  currentPage: !!outputWorkerData?.currentPage ? `Ar.len -> ${outputWorkerData?.currentPage?.length}` : typeof outputWorkerData?.currentPage,
                                }, null, 2)}
                              </pre>
                            </>
                          )}
                        />
                      </Grid>
                    )
                  */}
                  {
                    !!outputWorkerData?.pagination && (
                      <ResponsiveBlock
                        className={clsx(baseClasses.stack1, baseClasses.fadeIn)}
                        style={{
                          padding: '16px 16px 16px 16px',
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
                            color='gray'
                            variant={outputWorkerData?.pagination.isCurrentPageLast ? 'contained' : 'outlined'}
                            fullWidth
                            // startIcon={<ArrowBackIosIcon />}
                            onClick={() => setRequiredPage(outputWorkerData?.pagination?.prevPage)}
                            disabled={outputWorkerData?.pagination.isCurrentPageFirst || typeof outputWorkerData?.pagination.prevPageIndex !== 'number'}
                          >
                            {/*`Prev${!outputWorkerData?.pagination.isCurrentPageFirst && typeof outputWorkerData?.pagination.currentPageIndex === 'number' ? ` (${getNormalizedPage(outputWorkerData?.pagination.currentPageIndex - 1)} of ${outputWorkerData?.pagination.total})` : ''}`*/}
                            <ArrowBackIosIcon sx={{ fontSize: '14px' }} />
                          </Button>

                          <Button
                            sx={{ borderRadius: 4 }}
                            size='small'
                            color='gray'
                            variant={!outputWorkerData?.pagination.isCurrentPageLast ? 'contained' : 'outlined'}
                            fullWidth
                            // endIcon={<ArrowForwardIosIcon />}
                            onClick={() => setRequiredPage(outputWorkerData?.pagination?.nextPage)}
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
                              color: 'gray',
                              fontWeight: 'bold',
                            }}
                          >
                            {getNormalizedPage(outputWorkerData.pagination.currentPageIndex)} / {outputWorkerData.pagination.totalPages}
                          </div>
                        </ResponsiveBlock>
                      </ResponsiveBlock>
                    )
                  }
                </Grid>
              </Grid>
            )
          }
        </Grid>
      </div>
    </>
  )
})
