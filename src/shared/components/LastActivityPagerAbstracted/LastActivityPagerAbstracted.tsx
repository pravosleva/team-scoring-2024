import { memo, useEffect, useCallback, useMemo } from 'react'
import { TLogsItem, EJobsStatusFilter, TopLevelContext, useSearchWidgetDataLayerContextStore } from '~/shared/xstate/topLevelMachine/v2'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Box, Button } from '@mui/material'
import Grid from '@mui/material/Grid2'
import { TCountersPack, useParamsInspectorContextStore } from '~/shared/xstate/topLevelMachine/v2/context/ParamsInspectorContextWrapper'
import baseClasses from '~/App.module.scss'
import { scrollToIdFactory } from '~/shared/utils/web-api-ops'
import { CopyToClipboardWrapper, FileSteperExample, HighlightedText, SimpleCheckList } from '~/shared/components'
import { scrollTopExtra } from '~/shared/components/Layout/utils'
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff'
import FilterAltIcon from '@mui/icons-material/FilterAlt'
import HiveIcon from '@mui/icons-material/Hive'
import NewReleasesIcon from '@mui/icons-material/NewReleases'
import TaskAltIcon from '@mui/icons-material/TaskAlt'
import ThumbUpIcon from '@mui/icons-material/ThumbUp'
import ThumbDownIcon from '@mui/icons-material/ThumbDown'
import { getFullUrl as _getFullUrl } from '~/shared/utils/string-ops'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import ArrowBack from '@mui/icons-material/ArrowBack'
import classes from './LastActivityPagerAbstracted.module.scss'
import clsx from 'clsx'
import dayjs from 'dayjs'
// -- EXP
import __TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en'
import ru from 'javascript-time-ago/locale/ru'
import { CollapsibleText } from '~/pages/jobs/[job_id]/components/ProjectsTree/components'
import { PhotoProvider, PhotoView } from 'react-photo-view'
import { getUniqueKey } from '~/shared/utils/indexed-db-ops'
// --

__TimeAgo.addDefaultLocale(en)
__TimeAgo.addLocale(ru)

const timeAgo = new __TimeAgo('en-US')

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

type TProps = {
  counters?: TCountersPack;
  // activeLogTs?: number | null;
  // onToggleDrawer?: (isDrawlerOpened: boolean) => ({ jobId }: { jobId: number }) => void;
  modifiedLogs: TModifiedLog[];
  // onCreateNew?: () => void;
  subheader: string;
  contentDescription?: string | React.ReactNode;
  pageInfo?: string;
  pagerControlsHardcodedPath: string;
  noFilters?: boolean;
  // getPrevLogLink?: (ps: (TLogsItem & Pick<TModifiedLog, 'jobId' | 'jobTitle' | 'jobType' | 'logUniqueKey'>)) => string;
}
const specialScroll = scrollToIdFactory({
  timeout: 200,
  offsetTop: 16,
  elementHeightCritery: 550,
})

export const LastActivityPagerAbstracted = memo(({
  counters: _counters,
  pageInfo,
  pagerControlsHardcodedPath,
  modifiedLogs,
  subheader,
  contentDescription,
  noFilters,
  // getPrevLogLink,
}: TProps) => {
  const [activeFilters] = useParamsInspectorContextStore((ctx) => ctx.activeFilters)

  // -- NOTE: 2/3 Совершенно необязательный механизм
  const [urlSearchParams, setSearchParams] = useSearchParams()
  const urlSearchParamLastSeenLogKey = useMemo(() => urlSearchParams.get('lastSeenLogKey'), [urlSearchParams])
  // const urlSearchParamCurrentPage = useMemo(() => urlSearchParams.get('page'), [urlSearchParams])
  // const [lastSeenJobId, setLastSeenJobId] = useState<number | null>(null)
  // useLayoutEffect(() => {
  //   // const idToScroll = urlSearchParams.get('lastSeenJob')
  //   if (!!urlSearchParamLastSeenLogKey && !Number.isNaN(Number(urlSearchParamLastSeenLogKey))) setLastSeenJobId(Number(idToScroll))
  // }, [urlSearchParamLastSeenLogKey])
  const [queryParams] = useParamsInspectorContextStore((ctx) => ctx.queryParams)

  const location = useLocation()
  useEffect(() => {
    scrollTopExtra()
  }, [location.pathname])

  // -- NOTE: exp
  // NOTE: deps exp: urlSearchParamLastSeenLogKey, location.pathname
  useEffect(() => {
    if (!!urlSearchParamLastSeenLogKey) {
      specialScroll({ id: `log_list_item_${urlSearchParamLastSeenLogKey}` })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParams.page])
  // --

  const [_mainCounters] = useParamsInspectorContextStore((ctx) => ctx.counters.main)
  const counters = useMemo(() => _counters || _mainCounters, [_mainCounters, _counters])
  const navigate = useNavigate()

  const getFullUrl = useCallback(({ url, query, queryKeysToremove }: {
    url: string;
    query?: { [key: string]: string | null | number; };
    queryKeysToremove?: string[];
  }) => _getFullUrl({ url, query: { ...queryParams, ...(query || {}) }, queryKeysToremove }), [queryParams])

  const goPage = useCallback(({ url, query, queryKeysToremove }: {
    url: string;
    query?: { [key: string]: string | null | number; };
    queryKeysToremove?: string[];
  }) =>
    () => {
      // NOTE: Условный переход
      // 1.Если запрошена текущая страница и такой элемент уже есть на странице -> скролл
      if (
        url === pagerControlsHardcodedPath
        && !!query?.lastSeenLogKey
      ) {
        specialScroll({
          id: `log_list_item_${query.lastSeenLogKey}`,
          cb: {
            onSuccess: () => {
              console.log(`onSuccess: lastSeenLogKey -> ${query.lastSeenLogKey}`)
              urlSearchParams.set('lastSeenLogKey', String(query.lastSeenLogKey))
              setSearchParams(urlSearchParams)
            },
            onErr: ({ reason }) => {
              console.log(reason)
              // 2. Иначе переход на другую страницу
              navigate(getFullUrl({ url, query, queryKeysToremove }))
            },
          },
        })
      } else navigate(getFullUrl({ url, query, queryKeysToremove }))
    },
    [navigate, getFullUrl, pagerControlsHardcodedPath, urlSearchParams, setSearchParams]
  )

  const jobsActorRef = TopLevelContext.useActorRef()

  const [searchValueBasic] = useSearchWidgetDataLayerContextStore((s) => s.searchValueBasic)
  const [searchValueEnhanced] = useSearchWidgetDataLayerContextStore((s) => s.searchValueEnhanced)

  return (
    <Grid container spacing={2}>
      {/* <Grid
        size={12}
      >
        <pre className={baseClasses.preNormalized}>{JSON.stringify(counters, null, 2)}</pre>
      </Grid> */}
      <Grid
        size={12}
        sx={{
          borderBottom: '1px solid lightgray',
          // position: 'sticky',
          // top: 0,
          backgroundColor: '#fff',
          zIndex: 2,
          pb: !noFilters && Object.values(counters).some((v) => v > 0) ? 2 : 0,
        }}
      >

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            // justifyContent: 'space-between',
            gap: '24px', // NOTE: Between main header and target joblist
            // alignItems: 'center'
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              // justifyContent: 'space-between',
              gap: '16px',
              alignItems: 'center'
            }}
          >

            <h2
              className={baseClasses.truncate}
              style={{
                display: 'inline-flex',
                gap: '16px',
                alignItems: 'center',
                marginBottom: '0px',
              }}
            >
              <span className={baseClasses.truncate}>{subheader}</span>
              {!!pageInfo && <span style={{ color: '#959eaa', fontSize: 'small' }}>{pageInfo}</span>}
            </h2>

          </div>
          {!!contentDescription && (
            <div
              style={{
                color: '#959eaa',
                fontWeight: 'bold',
                wordBreak: 'break-word',
              }}
            >
              {contentDescription}
            </div>
          )}
        </div>

        {
          !noFilters && Object.values(counters).some((v) => v > 0) && (
            <div className={baseClasses.stack2}>
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 1,
                }}
              >
                {
                  counters.allNew > 0 && (
                    <Link
                      to={getFullUrl({
                        url: pagerControlsHardcodedPath,
                        query: {
                          jobStatusFilter: 'new',
                        },
                        queryKeysToremove: activeFilters.values.jobStatusFilter === EJobsStatusFilter.NEW
                          ? ['jobStatusFilter', 'page']
                          : ['page', 'estimateReached']
                      })}
                    // to={`${pagerControlsHardcodedPath}?jobStatusFilter=new${!!lastSeenJobId ? `&lastSeenJob=${lastSeenJobId}` : ''}`}
                    >
                      <Button sx={{ borderRadius: 4 }} size='small'
                        variant={
                          activeFilters.values.jobStatusFilter === EJobsStatusFilter.NEW
                            ? 'contained' : 'outlined'}
                        startIcon={<NewReleasesIcon />}>
                        New ({counters.allNew})
                      </Button>
                    </Link>
                  )
                }
                {
                  counters.allActive > 0 && (
                    <Link
                      // to={`${pagerControlsHardcodedPath}?jobStatusFilter=active${!!lastSeenJobId ? `&lastSeenJob=${lastSeenJobId}` : ''}`}
                      to={getFullUrl({
                        url: pagerControlsHardcodedPath,
                        query: { jobStatusFilter: 'active' },
                        queryKeysToremove:
                          activeFilters.values.jobStatusFilter === EJobsStatusFilter.ACTIVE
                            ? activeFilters.estimateReached
                              ? ['estimateReached', 'page']
                              : ['jobStatusFilter', 'estimateReached', 'page']
                            : ['estimateReached', 'page']
                      })}
                    >
                      <Button sx={{ borderRadius: 4 }} size='small'
                        variant={
                          activeFilters.values.jobStatusFilter === EJobsStatusFilter.ACTIVE
                            && !activeFilters.estimateReached
                            ? 'contained' : 'outlined'}
                        startIcon={<FilterAltIcon />}>
                        Active ({counters.allActive})
                      </Button>
                    </Link>
                  )
                }
                {
                  counters.allCompleted > 0 && (
                    <Link
                      // to={`${pagerControlsHardcodedPath}?jobStatusFilter=completed${!!lastSeenJobId ? `&lastSeenJob=${lastSeenJobId}` : ''}`}
                      to={getFullUrl({
                        url: pagerControlsHardcodedPath,
                        query: { jobStatusFilter: 'completed' },
                        queryKeysToremove: activeFilters.values.jobStatusFilter === EJobsStatusFilter.COMPLETED
                          ? ['jobStatusFilter', 'estimateReached', 'page']
                          : ['page', 'estimateReached'],
                      })}
                    >
                      <Button
                        sx={{ borderRadius: 4 }}
                        size='small'
                        color='gray'
                        variant={
                          activeFilters.values.jobStatusFilter === EJobsStatusFilter.COMPLETED
                            && !activeFilters.estimateReached
                            ? 'contained' : 'outlined'}
                        startIcon={<TaskAltIcon />}
                      >
                        Completed ({counters.allCompleted})
                      </Button>
                    </Link>
                  )
                }
                {
                  counters.estimateNotReached > 0 && (
                    <Link
                      // to={`${pagerControlsHardcodedPath}?jobStatusFilter=active&estimateReached=0${!!lastSeenJobId ? `&lastSeenJob=${lastSeenJobId}` : ''}`}
                      to={getFullUrl({
                        url: pagerControlsHardcodedPath,
                        query: { jobStatusFilter: 'active', estimateReached: '0' },
                        queryKeysToremove:
                          activeFilters.values.jobStatusFilter === EJobsStatusFilter.ACTIVE
                            ? activeFilters.values.estimateReached === 0
                              ? ['jobStatusFilter', 'estimateReached', 'page']
                              : ['page']
                            : ['page']
                      })}
                    >
                      <Button
                        sx={{ borderRadius: 4 }}
                        size='small'
                        color='success'
                        variant={
                          activeFilters.values.jobStatusFilter === EJobsStatusFilter.ACTIVE
                            && activeFilters.values.estimateReached === 0
                            ? 'contained' : 'outlined'}
                        startIcon={<ThumbUpIcon />}
                      >
                        Active Forecast ({counters.estimateNotReached})
                      </Button>
                    </Link>
                  )
                }
                {
                  counters.estimateReached > 0 && (
                    <Link
                      // to={`${pagerControlsHardcodedPath}?jobStatusFilter=active&estimateReached=1${!!lastSeenJobId ? `&lastSeenJob=${lastSeenJobId}` : ''}`}
                      to={getFullUrl({
                        url: pagerControlsHardcodedPath,
                        query: { jobStatusFilter: 'active', estimateReached: '1' },
                        queryKeysToremove:
                          activeFilters.values.jobStatusFilter === EJobsStatusFilter.ACTIVE
                            ? activeFilters.values.estimateReached === 1
                              ? ['estimateReached', 'page']
                              : ['page']
                            : ['page']
                      })}
                    >
                      <Button sx={{ borderRadius: 4 }} size='small' color='error'
                        variant={
                          activeFilters.values.jobStatusFilter === EJobsStatusFilter.ACTIVE
                            && activeFilters.values.estimateReached === 1
                            ? 'contained' : 'outlined'} startIcon={<ThumbDownIcon />}>
                        Active Fuckups ({counters.estimateReached})
                      </Button>
                    </Link>
                  )
                }
                {
                  counters.allProjects > 0 && (
                    <Link
                      // to={`${pagerControlsHardcodedPath}?isProject=1`}
                      to={getFullUrl({
                        url: pagerControlsHardcodedPath,
                        query: { isProject: '1' },
                        queryKeysToremove:
                          activeFilters.isProject
                            ? ['isProject', 'page']
                            : ['page']
                      })}
                    >
                      <Button
                        sx={{ borderRadius: 4 }} size='small' color='info'
                        variant={
                          activeFilters.values.isProject === 1
                            ? 'contained' : 'outlined'
                        }
                        startIcon={<HiveIcon />}
                      >
                        Projects ({counters.allProjects})
                      </Button>
                    </Link>
                  )
                }
                {
                  activeFilters.isAnyFilterActive && !activeFilters.assignedTo && (
                    <Button
                      sx={{ borderRadius: 4 }}
                      size='small'
                      color='inherit'
                      variant='outlined'
                      startIcon={<FilterAltOffIcon />}
                      onClick={goPage({ url: pagerControlsHardcodedPath, queryKeysToremove: ['isProject', 'jobStatusFilter', 'estimateReached'] })}
                    >
                      Reset
                    </Button>
                  )
                }
              </Box>
            </div>
          )
        }
      </Grid>

      {
        modifiedLogs.length > 0 ? (
          <>
            <Grid size={12}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                }}
              >
                {
                  modifiedLogs.map((log, i) => {
                    return (
                      <div
                        id={`log_list_item_job-${log.jobId}-log-${log.ts}`}
                        key={`${log.ts}-${i}`}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '16px',
                          padding: '8px',
                          borderRadius: '16px',
                        }}
                        className={clsx(
                          classes.mainWrapper,
                          {
                            // NOTE: JOB TYPE
                            // bg
                            // [baseClasses.stripedGrayLight]: log.jobType === 'globalTag',
                            // border, outline, color
                            [classes.defaultWrapper]: log.jobType === 'default',
                            [baseClasses.stripedYellow]: log.jobType === 'globalTag',
                            [classes.warningDashedBorder]: log.jobType === 'globalTag',

                            // NOTE: LOG BG & BORDER
                            [classes.whiteColor]:
                              log.logBg === 'green'
                              || log.jobType === 'globalTag'
                              || log.logBg === 'warn',
                            [baseClasses.stripedGreenHard]: log.logBg === 'green',
                            [baseClasses.stripedYellowLite4]: log.logBg === 'warn',
                            // outline, color
                            [classes.redSolidBorder]: log.logBorder === 'red',

                            // NOTE: Active (from url search params)
                            [classes.activeDashedBorder]: log.logUniqueKey === urlSearchParamLastSeenLogKey,
                          },
                        )}
                      >
                        <div
                          style={{
                            color: 'gray',
                            // whiteSpace: 'pre-wrap',
                            fontSize: 'x-small',
                            fontWeight: 'bold',
                            // paddingTop: '3px',
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            gap: '8px',
                          }}
                          className={baseClasses.truncate}
                        >
                          <span
                            style={{
                              display: 'inline-flex',
                              flexDirection: 'row',
                              justifyContent: 'flex-start',
                              alignItems: 'center',
                              gap: '6px',
                            }}
                            className={clsx(classes.date, baseClasses.truncate)}
                          >
                            {/*
                              !!log.__prevLog?.ts && (
                                <span
                                  style={{
                                    color: '#FFF',
                                    borderRadius: '16px',
                                    padding: '1px 6px',
                                    // backgroundColor: 'black',
                                  }}
                                  className={baseClasses.backdropBlurDark}
                                >
                                  +{dayjs(log.ts).diff(log.__prevLog.ts, 'days')}d
                                </span>
                              )
                            */}
                            <span
                              style={{
                                color: '#FFF',
                                borderRadius: '16px',
                                padding: '1px 6px',
                                // backgroundColor: 'black',
                                lineHeight: '16px',
                              }}
                              className={clsx(classes.date, baseClasses.backdropBlurDark)}
                            >
                              {dayjs(log.ts).format('DD MMM YYYY HH:mm')}
                            </span>
                            <span className={baseClasses.truncate}>
                              ({timeAgo.format(log.ts)})
                            </span>
                          </span>
                          <span
                            style={{
                              display: 'flex',
                              flexDirection: 'row',
                              gap: '8px',
                              justifyContent: 'flex-start',
                              alignItems: 'center',
                            }}
                          >
                            {/* <a style={{ textDecoration: 'underline', color: 'blue', cursor: 'pointer' }} onClick={handleOpenLogEditor({ logTs: ts, text })}>EDIT</a>
                          <a style={{ textDecoration: 'underline', color: 'blue', cursor: 'pointer' }} onClick={handleDeleteLog({ logTs: ts, text })}>DELETE</a> */}
                            {/* <a style={{ textDecoration: 'underline', color: 'blue', cursor: 'pointer' }} onClick={goToLogPage({ ts })}>GO LOG PAGE ➡️</a> */}
                            <Link
                              to={
                                [
                                  `/jobs/${log.jobId}/logs/${log.ts}`,
                                  '?',
                                  [
                                    `from=${encodeURIComponent(
                                      [
                                        pagerControlsHardcodedPath, // '/last-activity',
                                        '?',
                                        [
                                          `lastSeenLogKey=job-${log.jobId}-log-${log.ts}`,
                                          `lastSeenJob=${log.jobId}`,
                                        ].join('&')
                                      ].join('')
                                    )}`,
                                    `backActionUiText=${encodeURIComponent('Last activity')}`,
                                    // `to=${encodeURIComponent(
                                    //   [
                                    //     '/jobs',
                                    //     `?lastSeenJob=${log.jobId}`,
                                    //   ].join('')
                                    // )}`,
                                    // `forwardActionUiText=${encodeURIComponent('Joblist')}`,
                                  ].join('&')
                                ].join('')
                              }
                              style={{
                                display: 'inline-flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: 'small',
                              }}
                            >
                              <span>LOG</span>
                              <ArrowForwardIcon fontSize='inherit' />
                            </Link>
                          </span>
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                          }}
                        >
                          <div style={{ fontSize: '14px' }}>
                            <HighlightedText
                              comparedValue={log.text}
                              testedValue={clsx(searchValueEnhanced)}
                            />
                          </div>
                          <FileSteperExample
                            isEditable={false}
                            // idbKey={`job_id-${log.jobId}--log_ts-${log.ts}`}
                            idbKey={getUniqueKey({ jobId: log.jobId, logTs: log.ts })}
                            renderer={({ counter, documents }) => counter === 0 ? null : (
                              <CollapsibleText
                                briefPrefix='└─'
                                briefText={`Local images (${counter})`}
                                isClickableBrief
                                contentRender={() => (
                                  <PhotoProvider>
                                    <div
                                      className={baseClasses.galleryWrapperGrid1}
                                    // style={{ paddingRight: '24px' }}
                                    >
                                      {documents.map((item, index) => (
                                        <PhotoView key={index} src={item.preview}>
                                          <img
                                            src={item.preview}
                                            style={{ objectFit: 'cover' }}
                                            alt=""
                                          />
                                        </PhotoView>
                                      ))}
                                    </div>
                                  </PhotoProvider>
                                )}
                              />
                            )}
                          />
                        </div>
                        {
                          Array.isArray(log.links) && log.links?.length > 0 && (
                            log.links.map((link) => (
                              <div
                                key={link.id}
                                style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}
                              >
                                <div style={{ fontSize: 'small' }}>
                                  <CopyToClipboardWrapper
                                    text={link.url}
                                    uiText={link.title}
                                    showNotifOnCopy
                                  />
                                </div>
                                {!!link.descr && (
                                  <em style={{ fontSize: 'small', textAlign: 'right' }}>
                                    <HighlightedText
                                      comparedValue={link.descr}
                                      testedValue={clsx(searchValueEnhanced)}
                                    />
                                  </em>
                                )}
                              </div>
                            ))
                          )
                        }

                        <button
                          onClick={goPage({
                            url: `/jobs/${log.jobId}`,
                            query: {
                              to: [
                                '/last-activity',
                                '?',
                                [
                                  `lastSeenLogKey=job-${log.jobId}-log-${log.ts}`,
                                  `lastSeenJob=${log.jobId}`,
                                ].join('&')
                              ].join(''),
                              forwardActionUiText: 'Last activity',
                            },
                            // queryKeysToremove: ['isProject', 'jobStatusFilter', 'estimateReached']
                          })}
                          className={classes.btnAsLink}
                        >
                          <HighlightedText
                            comparedValue={log.jobTitle}
                            testedValue={clsx(searchValueBasic)}
                          />
                        </button>

                        {
                          !!log.checklist && log.checklist?.length > 0 && (
                            <SimpleCheckList
                              isCopiable
                              key={log.jobTsUpdate}
                              // _additionalInfo={{ message: 'No helpful info' }}
                              isMiniVariant
                              items={log.checklist || []}
                              infoLabel='Checklist'
                              createBtnLabel='Create checklist'
                              isCreatable={false}
                              isDeletable={false}
                              isEditable={false}
                              jobId={log.jobId}
                              logTs={log.ts}
                              // onDeleteChecklist={console.info}
                              // onCreateNewChecklistItem={({ state }) => {
                              //   jobsActorRef.send({ type: 'todo.addChecklistItemInLog', value: { jobId: log.jobId, logTs: log.ts, state } })
                              // }}
                              onEditChecklistItem={({ state, checklistItemId, cleanup }) => {
                                jobsActorRef.send({
                                  type: 'todo.editChecklistItemInLog',
                                  value: {
                                    jobId: log.jobId,
                                    logTs: log.ts,
                                    checklistItemId,
                                    state,
                                  },
                                })
                                cleanup()
                              }}
                              onChecklistItemOrderInc={({ checklistItemId }) => {
                                jobsActorRef.send({
                                  type: 'todo.editChecklistItemInLog.orderInc',
                                  value: {
                                    jobId: log.jobId,
                                    logTs: log.ts,
                                    checklistItemId,
                                  },
                                })
                              }}
                              onChecklistItemOrderDec={({ checklistItemId }) => {
                                jobsActorRef.send({
                                  type: 'todo.editChecklistItemInLog.orderDec',
                                  value: {
                                    jobId: log.jobId,
                                    logTs: log.ts,
                                    checklistItemId,
                                  },
                                })
                              }}
                            />
                          )
                        }

                        {/* <FileSteperExample isEditable={false} idbKey={getUniqueKey({ jobId: log.jobId, logTs: log.ts })} /> */}

                        {/* <Link
                          // to={`/jobs/${log.jobId}?from=${encodeURIComponent(`/last-activity?lastSeenLogKey=job-${log.jobId}-log-${log.ts}`)}&backActionUiText=${encodeURIComponent('Last activity')}`}
                          to={
                            [
                              `/jobs/${log.jobId}`,
                              '?',
                              [
                                `to=${encodeURIComponent(
                                  [
                                    '/last-activity',
                                    '?',
                                    [
                                      `lastSeenLogKey=job-${log.jobId}-log-${log.ts}`,
                                      `lastSeenJob=${log.jobId}`,
                                    ].join('&')
                                  ].join('')
                                )}`,
                                `forwardActionUiText=${encodeURIComponent('Last activity')}`,
                              ].join('&')
                            ].join('')
                          }
                          style={{
                            wordBreak: 'break-word',
                            fontSize: 'small',
                            fontWeight: 'bold',
                          }}
                        >
                          {log.jobTitle}
                        </Link> */}

                        {
                          (!!log.__prevLog || !!log.__nextLog) && (
                            <div
                              style={{
                                // display: 'flex',
                                // flexDirection: 'row',
                                gap: '8px',

                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                              }}
                            >
                              {
                                !!log.__nextLog && (
                                  <div
                                    className={clsx(baseClasses.stack1, baseClasses.backdropBlurSuperLite)}
                                    style={{
                                      fontSize: 'small',
                                      // border: '1px solid lightgray',
                                      boxShadow: 'rgba(0, 0, 0, 0.5) 0px 0px 4px 0px',
                                      padding: '8px',
                                      borderRadius: '8px',
                                      width: '100%',
                                    }}
                                  >
                                    <HighlightedText
                                      className={baseClasses.rowsLimited3}
                                      comparedValue={log.__nextLog.text}
                                      testedValue={clsx(searchValueEnhanced)}
                                    />
                                    {/* <Link
                                      to={getFullUrl({
                                        url: pagerControlsHardcodedPath,
                                        query: {
                                          lastSeenLogKey: log.__nextLog.logUniqueKey,
                                          lastSeenJob: log.__nextLog.jobId,
                                          to: [
                                            pagerControlsHardcodedPath,
                                            '?',
                                            [
                                              `lastSeenLogKey=job-${log.jobId}-log-${log.ts}`,
                                              `lastSeenJob=${log.jobId}`,
                                            ].join('&')
                                          ].join(''),
                                          forwardActionUiText: `Go to ${dayjs(log.__nextLog.ts).diff(log.ts, 'days')}d before`,
                                        },
                                        queryKeysToremove: ['from', 'backActionUiText', 'page'],
                                      })}
                                      // http://localhost:3001/#/last-activity/1752276422152,1751310188735,1752139850755?from=%252Flast-activity%252F1752276422152%252C1751310188735%252C1752139850755%253FlastSeenLogKey%253Djob-1751310188735-log-1753434607595%2526lastSeenJob%253D1751310188735&backActionUiText=Go%2520to%25208d%2520after
                                      style={{
                                        marginTop: 'auto',
                                        display: 'flex',
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                        flexWrap: 'wrap',
                                        alignItems: 'center',
                                        gap: '8px',
                                        textDecoration: 'none',
                                      }}
                                    > */}
                                    <button
                                      onClick={goPage({
                                        url: pagerControlsHardcodedPath,
                                        query: {
                                          lastSeenLogKey: log.__nextLog.logUniqueKey,
                                          lastSeenJob: log.__nextLog.jobId,
                                          to: [
                                            pagerControlsHardcodedPath,
                                            '?',
                                            [
                                              `lastSeenLogKey=job-${log.jobId}-log-${log.ts}`,
                                              `lastSeenJob=${log.jobId}`,
                                            ].join('&')
                                          ].join(''),
                                          forwardActionUiText: `Go to ${dayjs(log.__nextLog.ts).diff(log.ts, 'days')}d before`,
                                        },
                                        queryKeysToremove: ['from', 'backActionUiText', 'page'],
                                      })}
                                      className={classes.btnAsLink}
                                      style={{
                                        marginTop: 'auto',
                                        display: 'flex',
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                        flexWrap: 'wrap',
                                        alignItems: 'center',
                                        gap: '8px',
                                        textDecoration: 'none',
                                        width: '100%',
                                      }}
                                    >
                                      <span
                                        style={{
                                          display: 'inline-flex',
                                          flexDirection: 'row',
                                          justifyContent: 'flex-start',
                                          alignItems: 'center',
                                          gap: '8px',
                                          textDecoration: 'none',
                                        }}
                                        className={baseClasses.truncate}
                                      >
                                        <ArrowBack fontSize='inherit' />
                                        <span style={{ textDecoration: 'underline' }} className={baseClasses.truncate}>+{dayjs(log.__nextLog.ts).diff(log.ts, 'days')}d after</span>
                                      </span>
                                      <span
                                        style={{
                                          color: '#FFF',
                                          borderRadius: '16px',
                                          padding: '1px 6px',
                                          // backgroundColor: 'black',
                                          fontSize: 'x-small',
                                          fontWeight: 'bold',
                                          borderTopRightRadius: '0px',
                                          borderBottomRightRadius: '0px',
                                          transform: 'translateX(8px)',
                                        }}
                                        className={baseClasses.backdropBlurDark}
                                      >
                                        {dayjs(log.__nextLog.ts).format('DD MMM')}
                                      </span>
                                    </button>
                                    {/* </Link> */}
                                  </div>
                                )
                              }
                              {
                                !!log.__prevLog && (
                                  <div
                                    className={clsx(baseClasses.stack1, baseClasses.backdropBlurSuperLite)}
                                    style={{
                                      fontSize: 'small',

                                      // border: '1px solid lightgray',
                                      // boxShadow: 'rgba(100, 100, 111, 0.2) 0px 0px 8px 0px',
                                      boxShadow: 'rgba(0, 0, 0, 0.5) 0px 0px 4px 0px',
                                      padding: '8px',
                                      borderRadius: '8px',
                                      width: '100%',
                                      gridColumnStart: 2,
                                      // textAlign: 'right',
                                    }}
                                  >
                                    <HighlightedText
                                      className={baseClasses.rowsLimited3}
                                      comparedValue={log.__prevLog.text}
                                      testedValue={clsx(searchValueEnhanced)}
                                    />
                                    {/* <Link
                                      style={{
                                        marginTop: 'auto',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        flexWrap: 'wrap',
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        gap: '8px',
                                        textDecoration: 'none',
                                      }}
                                      to={getFullUrl({
                                        url: pagerControlsHardcodedPath,
                                        query: {
                                          lastSeenLogKey: log.__prevLog.logUniqueKey,
                                          lastSeenJob: log.__prevLog.jobId,
                                          from: [
                                            pagerControlsHardcodedPath,
                                            '?',
                                            [
                                              `lastSeenLogKey=job-${log.jobId}-log-${log.ts}`,
                                              `lastSeenJob=${log.jobId}`,
                                            ].join('&')
                                          ].join(''),
                                          backActionUiText: `${dayjs(log.ts).diff(log.__prevLog.ts, 'days')}d after`,
                                        },
                                        queryKeysToremove: ['to', 'forwardActionUiText', 'page'],
                                      })}
                                    // className={baseClasses.truncate}
                                    // http://localhost:3001/#/last-activity/1752276422152,1751310188735,1752139850755?from=%252Flast-activity%252F1752276422152%252C1751310188735%252C1752139850755%253FlastSeenLogKey%253Djob-1751310188735-log-1753434607595%2526lastSeenJob%253D1751310188735&backActionUiText=Go%2520to%25208d%2520after
                                    > */}
                                    <button
                                      onClick={goPage({
                                        url: pagerControlsHardcodedPath,
                                        query: {
                                          lastSeenLogKey: log.__prevLog.logUniqueKey,
                                          lastSeenJob: log.__prevLog.jobId,
                                          to: [
                                            pagerControlsHardcodedPath,
                                            '?',
                                            [
                                              `lastSeenLogKey=job-${log.jobId}-log-${log.ts}`,
                                              `lastSeenJob=${log.jobId}`,
                                            ].join('&')
                                          ].join(''),
                                          forwardActionUiText: `Go to ${dayjs(log.__prevLog.ts).diff(log.ts, 'days')}d before`,
                                        },
                                        queryKeysToremove: ['from', 'backActionUiText', 'page'],
                                      })}
                                      className={classes.btnAsLink}
                                      style={{
                                        marginTop: 'auto',
                                        display: 'flex',
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                        flexWrap: 'wrap',
                                        alignItems: 'center',
                                        gap: '8px',
                                        textDecoration: 'none',
                                        width: '100%',
                                      }}
                                    >
                                      <div
                                        style={{
                                          color: '#FFF',
                                          borderRadius: '16px',
                                          padding: '1px 6px',
                                          // backgroundColor: 'black',
                                          fontSize: 'x-small',
                                          fontWeight: 'bold',
                                          borderTopLeftRadius: '0px',
                                          borderBottomLeftRadius: '0px',
                                          transform: 'translateX(-8px)',
                                        }}
                                        className={baseClasses.backdropBlurDark}
                                      >{dayjs(log.__prevLog.ts).format('DD MMM')}</div>
                                      <span
                                        style={{
                                          display: 'inline-flex',
                                          flexDirection: 'row',
                                          justifyContent: 'flex-start',
                                          alignItems: 'center',
                                          gap: '8px',
                                          textDecoration: 'none',
                                        }}
                                        className={baseClasses.truncate}
                                      >
                                        <span style={{ textDecoration: 'underline' }} className={baseClasses.truncate}>-{dayjs(log.ts).diff(log.__prevLog.ts, 'days')}d before</span>
                                        <ArrowForwardIcon fontSize='inherit' />
                                      </span>
                                    </button>
                                    {/* </Link> */}
                                  </div>
                                )
                              }
                            </div>
                          )
                        }
                      </div>
                    )
                  })
                }
              </Box>
            </Grid>
          </>
        ) : (
          <Grid size={12}>
            <em className={baseClasses.fadeIn}>No items yet...</em>
          </Grid>
        )
      }
    </Grid>
  )
})
