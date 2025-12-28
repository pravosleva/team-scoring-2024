/* eslint-disable @typescript-eslint/no-explicit-any */

import { useMemo, useState } from 'react'
import baseClasses from '~/App.module.scss'
import { Alert, Button, Grid2 as Grid } from '@mui/material'
import clsx from 'clsx'
import classes from './ReportPagerAbstracted.module.scss'
import { TJob, TopLevelContext, useSearchWidgetDataLayerContextStore } from '~/shared/xstate'
import { useReportPagerWorker } from './hooks'
import { debugFactory, NWService } from '~/shared/utils'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useParamsInspectorContextStore } from '~/shared/xstate/topLevelMachine/v2/context/ParamsInspectorContextWrapper'
// import { getFullUrl } from '~/shared/utils/string-ops'
import { CollapsibleBox, CopyToClipboardWrapper, HighlightedText, ResponsiveBlock } from '~/shared/components'
// import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos'
// import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import CircularProgress from '@mui/material/CircularProgress'
import { JsonEditor as JsonEditorByCarlosNZ } from 'json-edit-react'
import BioTechIcon from '@mui/icons-material/Biotech'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { BrainJsExp, EfficiencyAnalysisExp } from './components'
import { CollapsibleText } from '~/pages/jobs/[job_id]/components/ProjectsTree/components'
import { getArithmeticalMean } from '~/shared/utils/number-ops'
import { BaseProgressBar } from '../ProgressBar/BaseProgressBar'

type TProps = {
  isDebugEnabled?: boolean;
  pagerControlsHardcodedPath: string;
  // _onToggleDrawer?: (isDrawlerOpened: boolean) => ({ jobId }: { jobId: number }) => void;
  // _isCreatable?: boolean;
  // _isSortable?: boolean;
}

type TTargetResultByWorker = {
  _partialInput: any;
  output: {
    modelFullTree: any;
    modelPartialTree: any;
    fullJobsTree: {
      result: string;
      counters: {
        adds: number;
      };
      percentage?: {
        done: number[];
      };
    };
    fullActiveCheckboxesTree: {
      result: string;
      counters: {
        adds: number;
      };
      percentage?: {
        done: number[];
      };
    };
    targetActiveCheckboxTree: {
      result: string;
      counters: {
        adds: number;
      };
      percentage?: {
        done: number[];
      };
    };
    fullDoneLast3MonthsCheckboxesTree?: {
      result: string;
      counters: {
        adds: number;
      };
      percentage?: {
        done: number[];
      };
    };
    fullDoneLast7DaysCheckboxesTree?: {
      result: string;
      counters: {
        adds: number;
      };
      percentage?: {
        done: number[];
      };
    };
    fullDoneLast1DaysCheckboxesTree?: {
      result: string;
      counters: {
        adds: number;
      };
      percentage?: {
        done: number[];
      };
    };
    targetIncompletedWichCreatedEarlyThan1MonthsCheckboxesTree?: {
      result: string;
      counters: {
        adds: number;
      };
      percentage?: {
        done: number[];
      };
    };
  };
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

const logger = debugFactory<NWService.TDataResult<TTargetResultByWorker> | null, { reason: string; } | null>({
  label: '👉 ReportPager EXP',
})
// const getNormalizedPage = (index: number): number => index + 1

export const ReportPagerAbstracted = ({
  isDebugEnabled,
  // pagerControlsHardcodedPath,
}: TProps) => {
  const [urlSearchParams] = useSearchParams()
  // const lastSeenJobID = useMemo<number | null>(() =>
  //   !!urlSearchParams.get('lastSeenJob') && !Number.isNaN(Number(urlSearchParams.get('lastSeenJob')))
  //     ? Number(urlSearchParams.get('lastSeenJob'))
  //     : null,
  //   [urlSearchParams]
  // )
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

  const [isWorkerEnabled, _setIsWorkerEnabled] = useState<boolean>(true)
  const [activeFilters] = useParamsInspectorContextStore((ctx) => ctx.activeFilters)
  // const [queryParams] = useParamsInspectorContextStore((ctx) => ctx.queryParams)

  const params = useParams()

  useReportPagerWorker<TTargetResultByWorker, TWorkerServiceReport>({
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
      counter: 0,
      jobs,
      activeJobId: !!params.job_id ? Number(params.job_id) : null, // lastSeenJobID,
      requiredPage,
      activeFilters,
    },
    debugName: 'useReportPagerWorker',
    workerName: 'report-pager',
  })

  // const navigate = useNavigate()
  // const handleNavigate = useCallback((relativeUrl: string) => () => navigate(relativeUrl), [navigate])
  // const handleCreateNewCallback = useCallback(() => {
  //   handleNavigate(
  //     getFullUrl({ url: pagerControlsHardcodedPath, query: { ...queryParams }, queryKeysToremove: ['page', 'lastSeenJob'] })
  //   )()
  // },
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  //   [handleNavigate, pagerControlsHardcodedPath, queryParams.page]
  // )
  const [userRouteControls] = useParamsInspectorContextStore((ctx) => ctx.userRouteControls)
  const [searchValueBasic] = useSearchWidgetDataLayerContextStore((s) => s.searchValueBasic)
  const [searchValueEnhanced] = useSearchWidgetDataLayerContextStore((s) => s.searchValueEnhanced)

  return (
    <>
      <div
        className={baseClasses.stack1}
        style={{
          marginBottom: '24px',
        }}
      >
        <Grid container spacing={2}>
          <Grid
            size={12}
          // className={baseClasses.specialTopContent}
          >
            <h1 className={baseClasses.inlineH1}>
              <BioTechIcon fontSize='inherit' />
              <span>Report</span>
            </h1>
          </Grid>

          {!!outputWorkerErrMsg && (
            <Grid size={12} className={baseClasses.specialTopContent}>
              <Alert severity='error' variant='filled'>
                <div className={baseClasses.stack1}>
                  <b>Ooops...</b>
                  <span>{outputWorkerErrMsg}</span>
                </div>
              </Alert>
            </Grid>
          )}

          {
            !!outputWorkerData?.output.targetActiveCheckboxTree
            && (
              <>
                <h2 style={{ color: '#959eaa', marginBottom: '0px' }}>Target</h2>

                {
                  !!outputWorkerData.output.targetActiveCheckboxTree.percentage?.done
                  && outputWorkerData.output.targetActiveCheckboxTree.percentage?.done.length > 0 && (
                    <Grid size={12}>
                      <Grid container spacing={0} size={12} sx={{ border: 'none' }}>
                        <Grid size={12}>
                          <BaseProgressBar
                            value={getArithmeticalMean(outputWorkerData.output.targetActiveCheckboxTree.percentage.done)}
                            label={`~${getArithmeticalMean(outputWorkerData.output.targetActiveCheckboxTree.percentage.done).toFixed(0)}%`}
                            connectedOnThe={['bottom']}
                          />
                        </Grid>
                        <Grid size={12}>
                          <CollapsibleBox
                            connectedOnThe={['top']}
                            header='Total detailed progress'
                            text={
                              <em>
                                * Расчет с учетом всех подзадач в любом узле дерева
                              </em>
                            }
                          />
                        </Grid>
                      </Grid>
                    </Grid>
                  )
                }

                <Grid size={12}>
                  <CollapsibleText
                    briefText={`🔥 In progress (${outputWorkerData.output.targetActiveCheckboxTree.counters.adds}) 👉 Checklist sorted by priority`}
                    isClickableBrief
                    contentRender={() => (
                      <>
                        <pre
                          className={clsx(
                            baseClasses.preNormalized,
                            classes.resultWrapper,
                            {
                              [classes.resultWhenWorkerDisabled]: !isWorkerEnabled,
                              [classes.resultWhenWorkerEnabled]: isWorkerEnabled,
                            }
                          )}
                          style={{ overflowY: 'auto' }}
                        >
                          <HighlightedText
                            comparedValue={outputWorkerData.output.targetActiveCheckboxTree.result}
                            testedValue={clsx(searchValueBasic, searchValueEnhanced)}
                          />
                        </pre>
                      </>
                    )}
                  />
                </Grid>
                <Grid size={12}>
                  <CopyToClipboardWrapper
                    text={outputWorkerData.output.targetActiveCheckboxTree.result}
                    uiText='Copy target tree as text'
                    showNotifOnCopy
                  />
                </Grid>
              </>
            )
          }

          {
            !!outputWorkerData?.output.fullDoneLast1DaysCheckboxesTree?.result
            && outputWorkerData?.output.fullDoneLast1DaysCheckboxesTree?.counters.adds > 0
            && (
              <Grid size={12}>
                <CollapsibleBox
                  header={<span>✅ Done last 24 h ({outputWorkerData?.output.fullDoneLast1DaysCheckboxesTree?.counters.adds})</span>}
                  text={(
                    <div className={baseClasses.stack1}>
                      <pre
                        className={clsx(
                          baseClasses.preNormalized,
                          classes.resultWrapper,
                          {
                            [classes.resultWhenWorkerDisabled]: !isWorkerEnabled,
                            [classes.resultWhenWorkerEnabled]: isWorkerEnabled,
                          }
                        )}
                        style={{ overflowY: 'auto' }}
                      >
                        <HighlightedText
                          comparedValue={outputWorkerData.output.fullDoneLast1DaysCheckboxesTree.result}
                          testedValue={clsx(searchValueBasic, searchValueEnhanced)}
                        />
                      </pre>
                      <div>
                        <CopyToClipboardWrapper
                          text={outputWorkerData.output.fullDoneLast1DaysCheckboxesTree?.result}
                          uiText='Copy as text'
                          showNotifOnCopy
                        />
                      </div>
                    </div>
                  )}
                />
              </Grid>
            )
          }

          {
            !!outputWorkerData?.output.fullDoneLast7DaysCheckboxesTree?.result
            && outputWorkerData?.output.fullDoneLast7DaysCheckboxesTree?.counters.adds > 0
            && (
              <Grid size={12}>
                <CollapsibleBox
                  header={<span>✅ Done last 7 days ({outputWorkerData?.output.fullDoneLast7DaysCheckboxesTree?.counters.adds}) 👉 Sorted by priority</span>}
                  text={(
                    <div className={baseClasses.stack1}>
                      <pre
                        className={clsx(
                          baseClasses.preNormalized,
                          classes.resultWrapper,
                          {
                            [classes.resultWhenWorkerDisabled]: !isWorkerEnabled,
                            [classes.resultWhenWorkerEnabled]: isWorkerEnabled,
                          }
                        )}
                        style={{ overflowY: 'auto' }}
                      >
                        <HighlightedText
                          comparedValue={outputWorkerData.output.fullDoneLast7DaysCheckboxesTree.result}
                          testedValue={clsx(searchValueBasic, searchValueEnhanced)}
                        />
                      </pre>
                      <div>
                        <CopyToClipboardWrapper
                          text={outputWorkerData.output.fullDoneLast7DaysCheckboxesTree?.result}
                          uiText='Copy as text'
                          showNotifOnCopy
                        />
                      </div>
                    </div>
                  )}
                />
              </Grid>
            )
          }

          {
            !!outputWorkerData?.output.fullDoneLast3MonthsCheckboxesTree?.result
            && outputWorkerData?.output.fullDoneLast3MonthsCheckboxesTree?.counters.adds > 0
            && (
              <Grid size={12}>
                <CollapsibleBox
                  header={<span>✅ Done last 1 month ({outputWorkerData?.output.fullDoneLast3MonthsCheckboxesTree?.counters.adds})</span>}
                  text={(
                    <div className={baseClasses.stack1}>
                      <pre
                        className={clsx(
                          baseClasses.preNormalized,
                          classes.resultWrapper,
                          {
                            [classes.resultWhenWorkerDisabled]: !isWorkerEnabled,
                            [classes.resultWhenWorkerEnabled]: isWorkerEnabled,
                          }
                        )}
                        style={{ overflowY: 'auto' }}
                      >
                        <HighlightedText
                          comparedValue={outputWorkerData?.output.fullDoneLast3MonthsCheckboxesTree.result}
                          testedValue={clsx(searchValueBasic, searchValueEnhanced)}
                        />
                      </pre>
                      <div>
                        <CopyToClipboardWrapper
                          text={outputWorkerData.output.fullDoneLast3MonthsCheckboxesTree?.result}
                          uiText='Copy as text'
                          showNotifOnCopy
                        />
                      </div>
                    </div>
                  )}
                />
              </Grid>
            )
          }

          {
            !!outputWorkerData?.output.targetIncompletedWichCreatedEarlyThan1MonthsCheckboxesTree?.result
            && outputWorkerData?.output.targetIncompletedWichCreatedEarlyThan1MonthsCheckboxesTree?.counters.adds > 0
            && (
              <Grid size={12}>
                <CollapsibleBox
                  header={<span>💀 Created early than 1 Mo. & incompleted ({outputWorkerData.output.targetIncompletedWichCreatedEarlyThan1MonthsCheckboxesTree.counters.adds})</span>}
                  text={(
                    <div className={baseClasses.stack1}>
                      <pre
                        className={clsx(
                          baseClasses.preNormalized,
                          classes.resultWrapper,
                          // {
                          //   [classes.resultWhenWorkerDisabled]: !isWorkerEnabled,
                          //   [classes.resultWhenWorkerEnabled]: isWorkerEnabled,
                          // }
                        )}
                        style={{
                          overflowY: 'auto',
                          color: '#FFF',
                          backgroundColor: '#000',
                        }}
                      >
                        <HighlightedText
                          comparedValue={outputWorkerData.output.targetIncompletedWichCreatedEarlyThan1MonthsCheckboxesTree.result}
                          testedValue={clsx(searchValueBasic, searchValueEnhanced)}
                        />
                      </pre>
                      <div>
                        <CopyToClipboardWrapper
                          text={outputWorkerData.output.targetIncompletedWichCreatedEarlyThan1MonthsCheckboxesTree.result}
                          uiText='Copy as text'
                          showNotifOnCopy
                        />
                      </div>
                    </div>
                  )}
                />
              </Grid>
            )
          }

          {
            !!outputWorkerData?.output.modelPartialTree && (
              <>
                <Grid size={12}>
                  <EfficiencyAnalysisExp tree={outputWorkerData.output.modelPartialTree} />
                </Grid>
                <Grid size={12}>
                  <CopyToClipboardWrapper
                    text={JSON.stringify(outputWorkerData.output.modelPartialTree, null, 2)}
                    uiText='Copy partial jobs tree (target)'
                    showNotifOnCopy
                  />
                </Grid>
                <Grid size={12}>
                  <BrainJsExp tree={outputWorkerData.output.modelPartialTree} />
                </Grid>
              </>
            )
          }

          {
            !!outputWorkerData?.output.fullActiveCheckboxesTree.result
            && (
              <>
                <h2 style={{ color: '#959eaa', marginBottom: '0px' }}>Full tree</h2>

                <Grid size={12}>
                  <CollapsibleBox
                    header={<span>🔥 In progress ({outputWorkerData?.output.fullActiveCheckboxesTree.counters.adds})</span>}
                    text={(
                      <div className={baseClasses.stack1}>
                        <pre
                          className={clsx(
                            baseClasses.preNormalized,
                            classes.resultWrapper,
                            {
                              [classes.resultWhenWorkerDisabled]: !isWorkerEnabled,
                              [classes.resultWhenWorkerEnabled]: isWorkerEnabled,
                            }
                          )}
                          style={{ overflowY: 'auto' }}
                        >
                          <HighlightedText
                            comparedValue={outputWorkerData.output.fullActiveCheckboxesTree.result}
                            testedValue={clsx(searchValueBasic, searchValueEnhanced)}
                          />
                        </pre>
                        <div>
                          <CopyToClipboardWrapper
                            text={outputWorkerData.output.fullActiveCheckboxesTree.result}
                            uiText='Copy as text'
                            showNotifOnCopy
                          />
                        </div>
                      </div>
                    )}
                  />
                </Grid>

                {/* <Grid size={12}>
                  <CopyToClipboardWrapper
                    text={outputWorkerData.}
                    uiText='Copy as model'
                    showNotifOnCopy
                  />
                </Grid> */}
                {
                  !!outputWorkerData?.output.modelFullTree && (
                    <Grid size={12}>
                      <CopyToClipboardWrapper
                        text={JSON.stringify(outputWorkerData.output.modelFullTree, null, 2)}
                        uiText='Copy full jobs tree'
                        showNotifOnCopy
                      />
                    </Grid>
                  )
                }
                {
                  jobs.length > 0 && (
                    <Grid size={12}>
                      <CopyToClipboardWrapper
                        text={JSON.stringify(jobs, null, 2)}
                        uiText='Copy total jobs array json'
                        showNotifOnCopy
                      />
                    </Grid>
                  )
                }
              </>
            )
          }

          {
            !!outputWorkerData?.output.fullJobsTree.result && (
              <>
                <h2 style={{ color: '#959eaa', marginBottom: '0px' }}>Full tree (ids)</h2>

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
                    style={{ overflowY: 'auto' }}
                  >
                    <HighlightedText
                      comparedValue={outputWorkerData.output.fullJobsTree.result}
                      testedValue={clsx(searchValueBasic, searchValueEnhanced)}
                    />
                  </pre>
                </Grid>
              </>
            )
          }

          {/*
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
                  style={{
                    // maxHeight: '300px',
                    overflowY: 'auto',
                  }}
                >
                  {JSON.stringify({
                    // reportText: outputWorkerData.reportText,
                    // outputTargetActiveCheckboxTree: outputWorkerData?.outputTargetActiveCheckboxTree || null,
                    _service: outputWorkerData?.output.modelFullTree || null,
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
          */}

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
            !!outputWorkerData && (
              <Grid size={12}>
                <JsonEditorByCarlosNZ
                  className={baseClasses.preNormalized}
                  viewOnly
                  data={outputWorkerData}
                  enableClipboard={false}
                  collapse={2}
                  theme={{
                    displayName: 'Default',
                    fragments: { edit: 'rgb(42, 161, 152)' },
                    styles: {
                      container: {
                        backgroundColor: '#f6f6f6',
                        fontFamily: 'monospace',
                        fontSize: '13px',
                        zIndex: 0,
                      },
                      collection: {},
                      collectionInner: {},
                      collectionElement: {},
                      dropZone: {},
                      property: '#292929',
                      bracket: { color: 'rgb(0, 43, 54)', fontWeight: 'bold', },
                      itemCount: { color: 'rgba(0, 0, 0, 0.3)', fontStyle: 'italic' },
                      string: 'rgb(203, 75, 22)',
                      number: 'rgb(38, 139, 210)',
                      boolean: 'green',
                      null: { color: 'rgb(220, 50, 47)', fontVariant: 'small-caps', fontWeight: 'bold' },
                      input: [
                        '#292929',
                        {
                          // fontSize: '90%',
                          // caretColor: 'red',
                          // caretShape: 'block',
                          backgroundColor: '#000',
                          color: '#fff',
                          minWidth: '80px',
                          fontFamily: 'monospace',
                          fontWeight: 'bold',
                          padding: '8px',
                          borderRadius: '8px 0px 0px 8px',
                          boxShadow: 'rgba(100, 100, 111, 0.2) 0px 7px 29px 0px',
                        }],
                      inputHighlight: '#b3d8ff',
                      error: { fontSize: '0.8em', color: 'red', fontWeight: 'bold' },
                      iconCollection: 'rgb(0, 43, 54)',
                      iconEdit: 'edit',
                      iconDelete: 'rgb(203, 75, 22)',
                      iconAdd: 'edit',
                      iconCopy: 'rgb(38, 139, 210)',
                      iconOk: 'green',
                      iconCancel: 'rgb(203, 75, 22)',
                    },
                  }}
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

        </Grid>
      </div>

      {

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
          {/*
            !!outputWorkerData?.currentPage && outputWorkerData.pagination.totalPages > 1 && (
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
              </ResponsiveBlock>
            )
          */}
        </ResponsiveBlock>

      }
    </>
  )
}