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
import { CopyToClipboardWrapper, ResponsiveBlock } from '~/shared/components'
import baseClasses from '~/App.module.scss'
import { Link, useSearchParams } from 'react-router-dom'
// import AccountCircleIcon from '@mui/icons-material/AccountCircle'
// import { getTruncated } from '~/shared/utils/string-ops'
// import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import ArrowBack from '@mui/icons-material/ArrowBack'
// import { CommentManager } from './components'
import { sort } from '~/shared/utils/object-ops/sort-array-objects@3.0.0'
import dayjs from 'dayjs'
import SportsBasketballIcon from '@mui/icons-material/SportsBasketball'
import { getMatchedByAnyString } from '~/shared/utils/string-ops'
import clsx from 'clsx'
import lastActivityPageClasses from './LastActivityPage.module.scss'
// -- TODO: Perf exp
// import { getModifiedJobLogText } from '~/pages/jobs/[job_id]/utils/getModifiedJobLogText'
// const jobs = TopLevelContext.useSelector((s) => s.context.jobs.items)
// const users = TopLevelContext.useSelector((s) => s.context.users)
// getModifiedJobLogText({ text, jobs, users: users.items })
// --

type TJobType = 'default' | 'globalTag'
type TLogType = 'default' | 'forSpeech' | 'hasLocalSuccess'

export const LastActivityPage = memo(() => {
  // const params = useParams()
  // const users = TopLevelContext.useSelector((s) => s.context.users.items)
  const jobs = TopLevelContext.useSelector((s) => s.context.jobs.items)
  const allLogs = useMemo(() => sort(
    jobs.reduce((jobsAcc: (TLogsItem & { jobId: number; jobTitle: string; logType: TLogType; jobType: TJobType; logUniqueKey: string })[], curJob: TJob) => {
      let jobType: TJobType = 'default'
      switch (true) {
        case getMatchedByAnyString({
            tested: curJob.title,
            expected: ['#global'],
          }):
          jobType = 'globalTag'
          break
        // case getMatchedByAnyString({
        //     tested: curJob.title,
        //     expected: ['📣'],
        //   }):
        //   logType = 'forSpeech'
        //   break
        default:
          break
      }

      for (const log of curJob.logs.items) {
        let logType: TLogType = 'default'
        switch (true) {
          case getMatchedByAnyString({
              tested: log.text,
              expected: ['📣'],
            }):
            logType = 'forSpeech'
            break
          case getMatchedByAnyString({
              tested: log.text,
              expected: ['✅'],
            }):
            logType = 'hasLocalSuccess'
            break
          default:
            break
        }
        jobsAcc.push({ ...log, jobId: curJob.id, jobTitle: curJob.title, logType, jobType, logUniqueKey: `job-${curJob.id}-log-${log.ts}` })
      }
      return jobsAcc
    }, []),
    ['ts'],
    -1
  ), [jobs])

  // const jobsActorRef = TopLevelContext.useActorRef()

  const [urlSearchParams] = useSearchParams()
  const urlSearchParamLastSeenLog = useMemo(() => urlSearchParams.get('lastSeenLog'), [urlSearchParams])

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

                        // NOTE: LOG TYPE
                        // bg
                        // [baseClasses.stripedYellow]: log.logType === 'forSpeech',
                        [lastActivityPageClasses.whiteColor]: log.logType === 'hasLocalSuccess' || log.jobType === 'globalTag',
                        [baseClasses.stripedGreenHard]: log.logType === 'hasLocalSuccess',
                        // outline, color
                        [lastActivityPageClasses.redSolidBorder]: log.logType === 'forSpeech',

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
                        {dayjs(log.ts).format('YYYY.MM.DD HH:mm')}
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
                          to={`/jobs/${log.jobId}/logs/${log.ts}?from=${encodeURIComponent(`/last-activity?lastSeenLog=job-${log.jobId}-log-${log.ts}`)}&backActionUiText=${encodeURIComponent('Last activity')}`}
                        >LOG PAGE ➡️</Link>
                      </span>
                    </em>
                    <div
                      style={{ fontSize: '14px'}}
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
                              />
                            </div>
                            {!!link.descr && <em style={{ fontSize: 'small', textAlign: 'right' }}>{link.descr}</em>}
                          </div>
                        ))
                      )
                    }
                    <Link
                      to={`/jobs/${log.jobId}?from=${encodeURIComponent(`/last-activity?lastSeenLog=job-${log.jobId}-log-${log.ts}`)}&backActionUiText=${encodeURIComponent('Last activity')}`}
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
          bottom: 0,
          backgroundColor: '#fff',
          zIndex: 3,
          marginTop: 'auto',
          borderRadius: '16px 16px 0px 0px',
        }}
      >
        <ResponsiveBlock
          className={baseClasses.specialActionsGrid}
          style={{
            padding: '16px 16px 16px 16px',
            // border: '1px dashed red',
            boxShadow: '0 -10px 7px -8px rgba(34,60,80,.2)',
            
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
                  {getTruncated(targetUser?.displayName || 'Employee', 10)}
                </Button>
              </Link>
            )
          */}
          <Link
            to='/jobs'
            target='_self'
          >
            <Button variant='outlined' startIcon={<ArrowBack />} fullWidth>
              Jobs
            </Button>
          </Link>
        </ResponsiveBlock>
      </Grid>

    </Grid>
  )
})
