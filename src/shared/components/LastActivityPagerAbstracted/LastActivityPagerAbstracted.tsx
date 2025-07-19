import { memo, useEffect, useCallback, useMemo } from 'react'
import { TLogsItem, EJobsStatusFilter } from '~/shared/xstate/topLevelMachine/v2'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Box, Button } from '@mui/material'
import Grid from '@mui/material/Grid2'
import { TCountersPack, useParamsInspectorContextStore } from '~/shared/xstate/topLevelMachine/v2/context/ParamsInspectorContextWrapper'
import baseClasses from '~/App.module.scss'
import { scrollToIdFactory } from '~/shared/utils/web-api-ops'
import { CopyToClipboardWrapper, SimpleCheckList } from '~/shared/components'
import { scrollTopExtra } from '~/shared/components/Layout/utils'
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff'
import FilterAltIcon from '@mui/icons-material/FilterAlt'
import HiveIcon from '@mui/icons-material/Hive'
import NewReleasesIcon from '@mui/icons-material/NewReleases'
import TaskAltIcon from '@mui/icons-material/TaskAlt'
import ThumbUpIcon from '@mui/icons-material/ThumbUp'
import ThumbDownIcon from '@mui/icons-material/ThumbDown'
import { getFullUrl as _getFullUrl } from '~/shared/utils/string-ops'
import classes from './LastActivityPagerAbstracted.module.scss'
import clsx from 'clsx'
import dayjs from 'dayjs'

type TJobType = 'default' | 'globalTag'
type TLogBorder = 'default' | 'red'
type TLogBg = 'default' | 'green' | 'warn'

type TProps = {
  counters?: TCountersPack;
  // activeLogTs?: number | null;
  // onToggleDrawer?: (isDrawlerOpened: boolean) => ({ jobId }: { jobId: number }) => void;
  modifiedLogs: (TLogsItem & { jobId: number; jobTitle: string; logBorder: TLogBorder; logBg: TLogBg; jobType: TJobType; logUniqueKey: string; jobTsUpdate: number })[];
  // onCreateNew?: () => void;
  subheader: string;
  pageInfo?: string;
  pagerControlsHardcodedPath: string;
}
const specialScroll = scrollToIdFactory({
  timeout: 200,
  offsetTop: 16,
  elementHeightCritery: 550,
})

export const LastActivityPagerAbstracted = memo(({ counters: _counters, pageInfo, pagerControlsHardcodedPath, modifiedLogs, subheader }: TProps) => {
  const [activeFilters] = useParamsInspectorContextStore((ctx) => ctx.activeFilters)

  // -- NOTE: 2/3 Совершенно необязательный механизм
  const [urlSearchParams] = useSearchParams()
  const urlSearchParamLastSeenLogKey = useMemo(() => urlSearchParams.get('lastSeenLogKey'), [urlSearchParams])
  // const urlSearchParamCurrentPage = useMemo(() => urlSearchParams.get('page'), [urlSearchParams])
  // const [lastSeenJobId, setLastSeenJobId] = useState<number | null>(null)
  // useLayoutEffect(() => {
  //   // const idToScroll = urlSearchParams.get('lastSeenJob')
  //   if (!!urlSearchParamLastSeenLogKey && !Number.isNaN(Number(urlSearchParamLastSeenLogKey))) setLastSeenJobId(Number(idToScroll))
  // }, [urlSearchParamLastSeenLogKey])
  const [queryParams] = useParamsInspectorContextStore((ctx) => ctx.queryParams)
  useEffect(() => {
    // console.log(`- EFF - page=${currentPage} | ${urlSearchParamLastSeenLogKey}`)
    // console.log(urlSearchParamLastSeenLogKey)
    scrollTopExtra()
    if (!!urlSearchParamLastSeenLogKey) {
      specialScroll({ id: `log_list_item_${urlSearchParamLastSeenLogKey}` })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlSearchParamLastSeenLogKey, location.pathname])
  // --urlSearchParamLastSeenLogKey
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
  }) => () => navigate(getFullUrl({ url, query, queryKeysToremove })), [navigate, getFullUrl])

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
          pb: Object.values(counters).some((v) => v > 0) ? 2 : 0,
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
            style={{ display: 'inline-flex', gap: '16px', alignItems: 'center' }}
          >
            <span className={baseClasses.truncate}>{subheader}</span>
            {!!pageInfo && <span style={{ color: '#959eaa', fontSize: 'small' }}>{pageInfo}</span>}
          </h2>
        </div>

        {
          Object.values(counters).some((v) => v > 0) && (
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

      {modifiedLogs.length > 0 ? (
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
                        gap: '8px',
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
                        }
                      )}
                    >
                      <em
                        style={{
                          color: 'gray',
                          // whiteSpace: 'pre-wrap',
                          fontSize: 'x-small',
                          fontWeight: 'bold',
                          // paddingTop: '3px',
                          display: 'flex',
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}
                      >
                        <em
                          // style={{ fontSize: 'small', color: 'gray', fontWeight: 'bold' }}
                          className={classes.date}
                        >
                          {dayjs(log.ts).format('DD.MM.YYYY HH:mm')}
                        </em>
                        <span
                          style={{
                            display: 'flex',
                            flexDirection: 'row',
                            gap: '8px',
                            justifyContent: 'flex-start',
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
                                      '/last-activity',
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
                          >EDIT LOG ➡️</Link>
                        </span>
                      </em>
                      <div
                        style={{ fontSize: '14px' }}
                      >{log.text}</div>
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
                              {!!link.descr && <em style={{ fontSize: 'small', textAlign: 'right' }}>{link.descr}</em>}
                            </div>
                          ))
                        )
                      }

                      {
                        !!log.checklist && log.checklist?.length > 0 && (
                          <SimpleCheckList
                            key={log.jobTsUpdate}
                            // _additionalInfo={{ message: 'No helpful info' }}
                            isMiniVariant
                            items={log.checklist || []}
                            infoLabel='Checklist'
                            createBtnLabel='Create checklist'
                            isCreatable={false}
                            isDeletable={false}
                            isEditable={false}
                          // onDeleteChecklist={console.info}
                          // onCreateNewChecklistItem={({ state }) => {
                          //   jobsActorRef.send({ type: 'todo.addChecklistItemInLog', value: { jobId: log.jobId, logTs: log.ts, state } })
                          // }}
                          // onEditChecklistItem={({ state, checklistItemId, cleanup }) => {
                          //   jobsActorRef.send({
                          //     type: 'todo.editChecklistItemInLog',
                          //     value: {
                          //       jobId: log.jobId,
                          //       logTs: log.ts,
                          //       checklistItemId,
                          //       state,
                          //     },
                          //   })
                          //   cleanup()
                          // }}
                          />
                        )
                      }

                      <Link
                        // to={`/jobs/${log.jobId}?from=${encodeURIComponent(`/last-activity?lastSeenLogKey=job-${log.jobId}-log-${log.ts}`)}&backActionUiText=${encodeURIComponent('Last activity')}`}
                        to={
                          [
                            `/jobs/${log.jobId}`,
                            '?',
                            [
                              `from=${encodeURIComponent(
                                [
                                  '/last-activity',
                                  '?',
                                  [
                                    `lastSeenLogKey=job-${log.jobId}-log-${log.ts}`,
                                    `lastSeenJob=${log.jobId}`,
                                  ].join('&')
                                ].join('')
                              )}`,
                              `backActionUiText=${encodeURIComponent('Last activity')}`,
                            ].join('&')
                          ].join('')
                        }
                        style={{
                          wordBreak: 'break-word',
                          fontSize: 'small',
                          fontWeight: 'bold',
                        }}
                      >{log.jobTitle}</Link>
                    </div>
                  )
                })
              }
            </Box>
          </Grid>
        </>
      ) : (
        <Grid size={12}>
          <em>No items yet</em>
        </Grid>
      )}
    </Grid>
  )
})
