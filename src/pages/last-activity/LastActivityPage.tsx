import { useMemo, memo } from 'react'
// import { useParams } from 'react-router-dom'
// import { DialogAsButton } from '~/shared/components/Dialog'
import { Button } from '@mui/material'
import Grid from '@mui/material/Grid2'
// import dayjs from 'dayjs'
import {
  // TUser,
  TopLevelContext, TJob, TLogsItem,
} from '~/shared/xstate'
// import { AutoRefreshedJobMuiAva } from '~/shared/components/Job/utils'
// import ConstructionIcon from '@mui/icons-material/Construction'
// import StarBorderIcon from '@mui/icons-material/StarBorder'
// import StarIcon from '@mui/icons-material/Star'
// import { JobResultReviewShort } from '~/pages/jobs/[job_id]/components/JobResultReviewShort'
// import { getJobStatusText } from '~/pages/jobs/[job_id]/utils'
import { CopyToClipboardWrapper, ResponsiveBlock, SimpleCheckList } from '~/shared/components'
import baseClasses from '~/App.module.scss'
import { Link, useSearchParams } from 'react-router-dom'
// import AccountCircleIcon from '@mui/icons-material/AccountCircle'
// import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import ArrowBack from '@mui/icons-material/ArrowBack'
// import { CommentManager } from './components'
import { sort } from '~/shared/utils/object-ops/sort-array-objects@3.0.0'
import dayjs from 'dayjs'
import SportsBasketballIcon from '@mui/icons-material/SportsBasketball'
import {
  getMatchedByAnyString,
  // getTruncated,
} from '~/shared/utils/string-ops'
import clsx from 'clsx'
import lastActivityPageClasses from './LastActivityPage.module.scss'
import { useParamsInspectorContextStore } from '~/shared/xstate/topLevelMachine/v2/context/ParamsInspectorContext'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
// -- TODO: Perf exp
// import { getModifiedJobLogText } from '~/pages/jobs/[job_id]/utils/getModifiedJobLogText'
// const jobs = TopLevelContext.useSelector((s) => s.context.jobs.items)
// const users = TopLevelContext.useSelector((s) => s.context.users)
// getModifiedJobLogText({ text, jobs, users: users.items })
// --

type TJobType = 'default' | 'globalTag'
type TLogBorder = 'default' | 'red'
type TLogBg = 'default' | 'green' | 'warn'

export const LastActivityPage = memo(() => {
  // const params = useParams()
  // const users = TopLevelContext.useSelector((s) => s.context.users.items)
  const jobs = TopLevelContext.useSelector((s) => s.context.jobs.items)
  const allLogs = useMemo(() => sort(
    jobs.reduce((jobsAcc: (TLogsItem & { jobId: number; jobTitle: string; logBorder: TLogBorder; logBg: TLogBg; jobType: TJobType; logUniqueKey: string; jobTsUpdate: number })[], curJob: TJob) => {
      let jobType: TJobType = 'default'
      // NOTE: 1. Job type
      switch (true) {
        case getMatchedByAnyString({
          tested: curJob.title,
          expected: ['#global'],
        }):
          jobType = 'globalTag'
          break
        default:
          break
      }
      for (const log of curJob.logs.items) {
        let logBorder: TLogBorder = 'default'
        let logBg: TLogBg = 'default'
        // NOTE 2: Log border
        switch (true) {
          case getMatchedByAnyString({
            tested: log.text,
            expected: ['📣'],
          }):
            logBorder = 'red'
            break
          default:
            break
        }
        // NOTE 3: Log bg
        switch (true) {
          case getMatchedByAnyString({
            tested: log.text,
            expected: ['✅'],
          }):
            logBg = 'green'
            break
          case getMatchedByAnyString({
            tested: log.text,
            expected: ['☝️'],
          }):
            logBg = 'warn'
            break
          default:
            break
        }
        jobsAcc.push({ ...log, jobId: curJob.id, jobTitle: curJob.title, logBorder, logBg, jobType, logUniqueKey: `job-${curJob.id}-log-${log.ts}`, jobTsUpdate: curJob.ts.update })
      }
      return jobsAcc
    }, []),
    ['ts'],
    -1
  ), [jobs])

  const [urlSearchParams] = useSearchParams()
  const urlSearchParamLastSeenLog = useMemo(() => urlSearchParams.get('lastSeenLogKey'), [urlSearchParams])
  const urlSearchParamLastSeenJob = useMemo(() => urlSearchParams.get('lastSeenJob'), [urlSearchParams])
  const jobsActorRef = TopLevelContext.useActorRef()
  const [userRouteControls] = useParamsInspectorContextStore((ctx) => ctx.userRouteControls)

  return (
    <Grid container spacing={2}>

      <Grid
        size={12}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        <h1 style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
          <SportsBasketballIcon />
          <span>Last activity</span>
        </h1>
        <em>Extracted from logs of jobs.</em>
      </Grid>

      {
        allLogs.length > 0 ? (
          <Grid
            size={12}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
            }}
          >
            {
              allLogs.map((log, i) => {
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
                      lastActivityPageClasses.mainWrapper,
                      {
                        // NOTE: JOB TYPE
                        // bg
                        // [baseClasses.stripedGrayLight]: log.jobType === 'globalTag',
                        // border, outline, color
                        [lastActivityPageClasses.defaultWrapper]: log.jobType === 'default',
                        [baseClasses.stripedYellow]: log.jobType === 'globalTag',
                        [lastActivityPageClasses.warningDashedBorder]: log.jobType === 'globalTag',

                        // NOTE: LOG BG & BORDER
                        [lastActivityPageClasses.whiteColor]:
                          log.logBg === 'green'
                          || log.jobType === 'globalTag'
                          || log.logBg === 'warn',
                        [baseClasses.stripedGreenHard]: log.logBg === 'green',
                        [baseClasses.stripedYellowLite4]: log.logBg === 'warn',
                        // outline, color
                        [lastActivityPageClasses.redSolidBorder]: log.logBorder === 'red',

                        // NOTE: Active (from url search params)
                        [lastActivityPageClasses.activeDashedBorder]: log.logUniqueKey === urlSearchParamLastSeenLog,
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
                        className={lastActivityPageClasses.date}
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
                          isEditable={true}
                          // onDeleteChecklist={console.info}
                          onCreateNewChecklistItem={({ state }) => {
                            jobsActorRef.send({ type: 'todo.addChecklistItemInLog', value: { jobId: log.jobId, logTs: log.ts, state } })
                          }}
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
          </Grid>
        ) : (
          <Grid
            size={12}
          >
            NO LOGS
          </Grid>
        )
      }

      {/* <Grid
        size={12}
      >
        <pre
          style={{
            // fontSize: '13px',
            // maxHeight: '150px',
            // backgroundColor: 'lightgray',
          }}
          className={baseClasses.preNormalized}
        >{JSON.stringify(targetLog?.links || [], null, 2)}</pre>
      </Grid> */}

      {/*
        !!targetJob && Array.isArray(targetLog?.links) && targetLog?.links.length > 0
        && (
          <Grid
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
            size={12}
          >
            {
              targetLog?.links.map((link) => (
                <CommentManager
                  key={link.id}
                  initialState={{
                    url: link.url,
                    title: link.title,
                    descr: link.descr,
                  }}
                  onSuccess={({ state }) => {
                    // console.log(`-> save target link id=${link.id} for log ts=${params.log_ts} in job id=${params.job_id}`)
                    // console.log(arg)
                    jobsActorRef.send({ type: 'todo.editLinkInLog', value: { jobId: targetJob.id, logTs: targetLog.ts, linkId: link.id, state } })
                  }}
                  onDelete={() => {
                    jobsActorRef.send({ type: 'todo.deleteLinkInLog', value: { jobId: targetJob.id, logTs: targetLog.ts, linkId: link.id } })
                  }}
                  isEditable
                />
              ))
            }
          </Grid>
        )
      */}

      <Grid
        // className={baseClasses.backdropBlurLite}
        size={12}
        sx={{
          position: 'sticky',
          bottom: '16px',
          backgroundColor: '#fff',
          zIndex: 3,
          marginTop: 'auto',
          borderRadius: '16px',
          // boxShadow: '0 -10px 7px -8px rgba(34,60,80,.2)',
          boxShadow: 'rgba(0, 0, 0, 0.35) 0px 5px 15px',
          marginBottom: '16px',
        }}
      >
        <ResponsiveBlock
          className={baseClasses.specialActionsGrid}
          style={{
            padding: '16px 16px 16px 16px',
            // border: '1px dashed red',

            // borderRadius: '16px 16px 0px 0px',
          }}
        >
          {/*
            !!targetJob.forecast.assignedTo && (
              <Link
                to={`/employees/${targetJob.forecast.assignedTo}?lastSeenJob=${targetJob.id}`}
                target='_self'
              >
                <Button
                  variant='outlined'
                  startIcon={<AccountCircleIcon />}
                  fullWidth
                  // className={baseClasses.truncate}
                >
                  {getTruncated(targetUser?.displayName || 'Employee', 11)}
                </Button>
              </Link>
            )
          */}

          {
            !!userRouteControls.from && (
              <Link
                to={userRouteControls.from.value}
                target='_self'
                className={baseClasses.truncate}
              >
                <Button
                  variant='contained'
                  startIcon={<ArrowBackIcon />}
                  fullWidth
                  className={baseClasses.truncate}
                >
                  <span className={baseClasses.truncate}>{userRouteControls.from.uiText}</span>
                </Button>
              </Link>
            )
          }
          {
            !userRouteControls.from && (
              <Link
                to={`/jobs${!!urlSearchParamLastSeenJob ? `?lastSeenJob=${urlSearchParamLastSeenJob}` : ''}`}
                target='_self'
              >
                <Button
                  color={!!urlSearchParamLastSeenJob ? 'primary' : 'gray'}
                  variant='outlined'
                  startIcon={<ArrowBack />}
                  fullWidth
                >
                  Jobs
                </Button>
              </Link>
            )
          }
        </ResponsiveBlock>
      </Grid>

    </Grid>
  )
})
