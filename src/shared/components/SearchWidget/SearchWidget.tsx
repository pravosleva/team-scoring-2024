import { memo, useState, useCallback, useRef, useEffect, useMemo } from 'react'
import clsx from 'clsx'
// import ExpandLessIcon from '@mui/icons-material/ArrowLeft'
import SearchIcon from '@mui/icons-material/Search'
import WarningIcon from '@mui/icons-material/Warning'
import SearchOffIcon from '@mui/icons-material/SearchOff'
import baseClasses from '~/App.module.scss'
import { Alert, Button, Grid2 as Grid, IconButton, TextField } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { TJob, TLogsItem, TopLevelContext, useSearchWidgetDataLayerContextStore } from '~/shared/xstate'
import { debugFactory, NWService } from '~/shared/utils'
import classes from './SearchWidget.module.scss'
import { useSearchBasicWorker } from './hooks'
import { useParamsInspectorContextStore } from '~/shared/xstate/topLevelMachine/v2/context/ParamsInspectorContextWrapper'
import { useParams } from 'react-router-dom'
// import AccountTreeIcon from '@mui/icons-material/AccountTree'
import CircularProgress from '@mui/material/CircularProgress'
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart'
import { ResponsiveBlock } from '../ResponsiveBlock'
import { CurrentPageGridItem } from './components'
import { getExtractedValues } from '~/shared/utils/string-ops'

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

  filteredJobsLogsMapping?: {
    [key: string]: {
      original: TLogsItem;
      _service: {
        commonMessage?: string;
        logLocalLinks: {
          relativeUrl: string;
          ui: string;
          descr?: string;
          id: number;
          updatedAgo: string;
        }[];
        logExternalLinks: {
          url: string;
          ui: string;
          descr?: string;
          logTs: number;
          jobId: number;
        }[];
      };
    }[];
  };
}
// type TWorkerServiceReport = {
//   message?: string;
// }

const logger = debugFactory<NWService.TDataResult<TTargetResultByWorker> | null, { reason: string; } | null>({
  label: '👉 SearchWidget EXP',
})
const getNormalizedPage = (index: number): number => index + 1

export const SearchWidget = memo((ps: TProps) => {
  // const [isWidgetOpened, setIsWidgetOpened] = useState<boolean>(false)
  const [isWidgetOpened, setSearchWidgetDataLayerContextStore] = useSearchWidgetDataLayerContextStore((s) => s.isWidgetOpened)
  const [searchValueBasic] = useSearchWidgetDataLayerContextStore((s) => s.searchValueBasic)
  const [searchValueEnhanced] = useSearchWidgetDataLayerContextStore((s) => s.searchValueEnhanced)
  const hasAnySearchValue = useMemo(() => !!searchValueBasic || !!searchValueEnhanced, [searchValueBasic, searchValueEnhanced])

  const params = useParams()
  const isSpecificSearchMode = useMemo(() => !!params.job_id || !!params.job_ids || !!params.log_ts, [params.job_id, params.job_ids, params.log_ts])

  const setSearchValueBasic = (v: string) => {
    setSearchWidgetDataLayerContextStore({ searchValueBasic: v })
  }
  const setSearchValueEnhanced = (v: string) => {
    setSearchWidgetDataLayerContextStore({ searchValueEnhanced: v })
  }

  const closeWidget = () => {
    setSearchWidgetDataLayerContextStore({ isWidgetOpened: false })
  }
  const toggleWigget = useCallback(() => {
    setSearchWidgetDataLayerContextStore({ isWidgetOpened: !isWidgetOpened })
  }, [isWidgetOpened])
  // const toggleWigget = useCallback(() => {
  //   setIsWidgetOpened((s) => !s)
  // }, [setIsWidgetOpened])
  // const [searchValue, setSearchValue] = useState('')

  const jobs = TopLevelContext.useSelector((s) => s.context.jobs.items)
  const [activeFilters] = useParamsInspectorContextStore((ctx) => ctx.activeFilters)
  const [outputWorkerData, setOutputWorkerData] = useState<TTargetResultByWorker | null>(null)
  const [outputWorkerErrMsg, setOutputWorkerErrMsg] = useState<string | null>(null)
  const [_outputWorkerDebugMsg, setOutputWorkerDebugMsg] = useState<string | null>(null)

  const preparedWorkerErrorMsg = useMemo(() => {
    if (!outputWorkerErrMsg) return outputWorkerErrMsg

    const specialMsgs = getExtractedValues({
      tested: [outputWorkerErrMsg],
      expectedKey: 'SPECIAL_ERRROR',
      valueType: 'string',
    })
    console.log(specialMsgs)
    return specialMsgs.length > 0 ? specialMsgs[0] : outputWorkerErrMsg
  }, [outputWorkerErrMsg])

  // -- NOTE: Init Search text fields; Update in LS for F5 restore (or target link load)
  // 1. Basic
  // const [qBasicSearchLs, saveQBasicSearchLs] = useLocalStorageState<string | null>({
  //   key: 'teamScoring2024:q_basic_search',
  //   initialValue: null,
  // })
  const qBasicSearchRef = useRef<HTMLInputElement | null>(null)
  // const [searchValueBasic, setSearchValueBasic] = useState(
  //   typeof params.q_basic_search === 'string'
  //     ? decodeURIComponent(params.q_basic_search)
  //     : (qBasicSearchLs || '')
  // )

  // useEffect(() => {
  //   saveQBasicSearchLs(searchValueBasic)
  // }, [searchValueBasic, saveQBasicSearchLs])
  // useEffect(() => {
  //   if (isWidgetOpened && !searchValueBasic) {
  //     qBasicSearchRef.current?.focus()
  //   }
  // }, [isWidgetOpened, searchValueBasic])

  // 2. Enhanced
  // const [qEnhancedSearchLs, saveQEnhancedSearchLs] = useLocalStorageState<string | null>({
  //   key: 'teamScoring2024:q_enhanced_search',
  //   initialValue: null,
  // })
  // const qEnhancedSearchRef = useRef<HTMLInputElement | null>(null)
  // const [searchValueEnhanced, setSearchValueEnhanced] = useState(
  //   typeof params.q_enhanced_search === 'string'
  //     ? decodeURIComponent(params.q_enhanced_search)
  //     : (qEnhancedSearchLs || '')
  // )
  const handleCleanupEnhancedSearch = () => {
    setSearchWidgetDataLayerContextStore({ searchValueEnhanced: '' })

    setOutputWorkerData(null)
    setOutputWorkerErrMsg(null)
    setOutputWorkerDebugMsg(null)
  }
  // useEffect(() => {
  //   saveQEnhancedSearchLs(searchValueEnhanced)
  // }, [searchValueEnhanced, saveQEnhancedSearchLs])
  // --

  const [counter, _setCounter] = useState(0)
  // useEffect(() => {
  //   const listener = (event: CustomEvent<LocalStorageChangeDetail>) => {
  //     switch (event.detail.key) {
  //       // case 'teamScoring2024:q_basic_search':
  //       // case 'teamScoring2024:q_enhanced_search':
  //       case 'teamScoring2024:topLevel':
  //         console.log(`localStorage item "${event.detail.key}" changed in the same tab`)
  //         console.log('New value:', event.detail.newValue)
  //         // Your logic here
  //         setCounter((v) => v + 1)
  //         break
  //       default:
  //         break
  //     }
  //   }
  //   // Listening for our custom event
  //   window.addEventListener('localStorageChange', listener);
  //   return () => {
  //     window.removeEventListener('localStorageChange', listener)
  //   }
  // }, [])

  const handleCleanupAndClose = ({ shouldWidgetBeClosed }: { shouldWidgetBeClosed: boolean }) => () => {
    setSearchWidgetDataLayerContextStore({ searchValueBasic: '' })
    if (shouldWidgetBeClosed) closeWidget()
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
    isEnabled: !!searchValueBasic || !!searchValueEnhanced,
    isDebugEnabled: true,
    deps: {
      searchQuery: {
        basic: searchValueBasic,
        enhanced: searchValueEnhanced,
      },
      jobs: jobs,
      activeFilters,
      activeJobId: !!params.job_id ? Number(params.job_id) : null,
      requiredPage,
      counter,
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

  // const handleNavigate = useCallback((relativeUrl: string) => () => navigate(relativeUrl), [navigate])

  return (
    <>
      <button
        className={clsx(
          classes.toggler,
          // classes.absoluteToggler,
          // 'backdrop-blur--lite',
          classes.fixedToggler,
          {
            [classes.isSimpleSearchModeActive]: hasAnySearchValue && !isSpecificSearchMode,
            [classes.isSpecificSearchModeActive]: hasAnySearchValue && isSpecificSearchMode,
          },
        )}
        onClick={toggleWigget}
      >
        {
          isWidgetOpened
            ? <SearchOffIcon style={{ fontSize: '24px' }} />
            : <SearchIcon style={{ fontSize: '24px' }} />
        }
      </button>
      <>
        <div
          style={{
            backgroundColor: '#FFF'
          }}
          className={clsx(
            classes.wrapper,
            // baseClasses.stack2,
            // classes.fixedBox,
            // baseClasses.backdropBlurLite,
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
                    startAdornment: (!!params.job_id || !!params.job_ids)
                      ? <WarningIcon sx={{ mr: 1 }} htmlColor='gray' />
                      : <SearchIcon sx={{ mr: 1 }} htmlColor='gray' />,
                    enterKeyHint: 'search',
                  },
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 6, fontWeight: 'bold', fontFamily: 'system-ui' } }}
                // NOTE: Deprecated -> InputProps={}
                autoComplete='off'
                // enterKeyHint='search'
                helperText={
                  !!params.job_id
                    ? 'You have search for target single job'
                    : !!params.job_ids
                      ? `You have search for target ${params.job_ids.split(',').length} job${params.job_ids.split(',').length > 1 ? 's' : ''}`
                      : 'Search by title, descr, pointset'
                }
                error={!!searchValueBasic && !!outputWorkerData && !outputWorkerData.currentPage}
                type='text'
                label={
                  !!params.job_id
                    ? `Search for the job #${params.job_id}`
                    : !!params.job_ids
                      ? `Search for the jobs (${params.job_ids.split(',').length})`
                      : 'Search'
                }
                variant='outlined'
                // onKeyUp={(ev: React.KeyboardEvent<HTMLInputElement>) => {
                //   if (ev.key === 'Enter') {
                //     // TODO: send to worker... (ev.target as HTMLInputElement).value
                //     // if (typeof onCreateNew === 'function') onCreateNew()
                //   }
                // }}
                onChange={(ev) => {
                  setSearchValueBasic((ev.target as HTMLInputElement).value)
                }}
                value={searchValueBasic}
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
              }}
            >
              <TextField
                slotProps={{
                  input: {
                    startAdornment: <MonitorHeartIcon htmlColor='gray' sx={{ mr: 1 }} />,
                    enterKeyHint: 'search',
                  },
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 6, fontWeight: 'bold', fontFamily: 'system-ui' } }}
                autoComplete='off'
                // enterKeyHint='search'
                helperText='Search in logs, checklist, links'
                // error={}
                type='text'
                label='Enhanced search'
                variant='outlined'
                // onKeyUp={(ev: React.KeyboardEvent<HTMLInputElement>) => {
                //   if (ev.key === 'Enter') {
                //     // TODO: send to worker... (ev.target as HTMLInputElement).value
                //     // if (typeof onCreateNew === 'function') onCreateNew()
                //   }
                // }}
                onChange={(ev) => setSearchValueEnhanced((ev.target as HTMLInputElement).value)}
                value={searchValueEnhanced}
                size='small'
              />
              {
                !!searchValueEnhanced && (
                  <IconButton sx={{ alignSelf: 'flex-start' }} onClick={handleCleanupEnhancedSearch}>
                    <CloseIcon />
                  </IconButton>
                )
              }
            </Grid>
            {/*
              !!preparedWorkerErrorMsg && (
                <Grid
                  size={12}
                  sx={{ width: '100%', display: 'flex', justifyContent: 'center', pr: 2, pl: 2, color: '#959eaa' }}
                  className={clsx(baseClasses.fadeIn)}
                >
                  <Alert
                    severity='error'
                    variant='filled'
                  >
                    {preparedWorkerErrorMsg}
                  </Alert>
                </Grid>
              )
            */}
            {
              !!preparedWorkerErrorMsg && (
                <Grid className={clsx(baseClasses.fadeIn)} size={12} sx={{ width: '100%', display: 'flex', justifyContent: 'center', pr: 2, pl: 2, color: '#959eaa', fontWeight: 'bold', textAlign: 'center' }}>
                  {preparedWorkerErrorMsg}
                </Grid>
              )
            }
            {
              !preparedWorkerErrorMsg && (
                <>
                  {
                    ((!!searchValueBasic || !!searchValueEnhanced) && !!outputWorkerData && !outputWorkerData.currentPage)
                      ? (
                        <Grid className={clsx(baseClasses.fadeIn)} size={12} sx={{ width: '100%', display: 'flex', justifyContent: 'center', pr: 2, pl: 2, color: '#959eaa', fontWeight: 'bold' }}>
                          NOT FOUND
                        </Grid>
                      )
                      : !!outputWorkerData?.pagination.itemsRangeInfo
                        ? (
                          <Grid className={clsx(baseClasses.fadeIn)} size={12} sx={{ width: '100%', display: 'flex', justifyContent: 'center', pr: 2, pl: 2, color: '#959eaa' }}>
                            <b>{outputWorkerData?.pagination.itemsRangeInfo}</b>
                          </Grid>
                        )
                        : null
                  }
                </>
              )
            }
            {
              (!!searchValueBasic || !!searchValueEnhanced) && !outputWorkerData && (
                <Grid size={12} sx={{ width: '100%', display: 'flex', justifyContent: 'center', padding: 6 }}>
                  <CircularProgress />
                </Grid>
              )
            }
            {
              (!!searchValueBasic || !!searchValueEnhanced) && !!outputWorkerData && (
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
                    sx={{
                      // height: '100%',
                      // alignContent: 'start',
                    }}
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
                              <CurrentPageGridItem
                                testedValue={clsx(searchValueBasic, searchValueEnhanced)}
                                key={j.id}
                                job={j}
                                filteredJobsLogsMappingChunk={outputWorkerData.filteredJobsLogsMapping?.[String(j.id)] || []}
                                onClickCb={toggleWigget}
                              />
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
                      // NOTE: Has pagination obj
                      !!outputWorkerData?.pagination
                      // NOTE: And not disabled prev of next btn
                      && (
                        <>
                          {
                            (
                              !(outputWorkerData?.pagination.isCurrentPageFirst || typeof outputWorkerData?.pagination.prevPageIndex !== 'number')
                              || !(outputWorkerData?.pagination.isCurrentPageLast || typeof outputWorkerData?.pagination.nextPageIndex !== 'number')
                            ) ? (
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
                                  // alignSelf: 'end',
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
                            ) : (
                              <div style={{ borderBottom: '1px solid transparent' }} />
                            )
                          }
                        </>
                      )
                    }
                  </Grid>
                </Grid>
              )
            }
          </Grid>
        </div>
      </>
    </>
  )
})
