import { useMemo, useCallback, memo } from 'react'
import { useParams } from 'react-router-dom'
// import { DialogAsButton } from '~/shared/components/Dialog'
import { Box, Button, Rating } from '@mui/material'
import Grid from '@mui/material/Grid2'
import dayjs from 'dayjs'
import { TJob, TLogsItem, TopLevelContext, TUser, useSearchWidgetDataLayerContextStore } from '~/shared/xstate'
import { AutoRefreshedJobMuiAva } from '~/shared/components/Job/utils'
import ConstructionIcon from '@mui/icons-material/Construction'
import StarBorderIcon from '@mui/icons-material/StarBorder'
import StarIcon from '@mui/icons-material/Star'
import { JobResultReviewShort } from '~/pages/jobs/[job_id]/components/JobResultReviewShort'
import { getJobStatusText } from '~/pages/jobs/[job_id]/utils'
import { FileSteperExample, HighlightedText, ResponsiveBlock, SimpleCheckList, TimeAgo } from '~/shared/components'
import baseClasses from '~/App.module.scss'
import { Link } from 'react-router-dom'
// import AccountCircleIcon from '@mui/icons-material/AccountCircle'
// import { getTruncated } from '~/shared/utils/string-ops'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import ArrowBack from '@mui/icons-material/ArrowBack'
// import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import { useParamsInspectorContextStore } from '~/shared/xstate/topLevelMachine/v2/context/ParamsInspectorContextWrapper'
import { SingleTextManager } from '~/shared/components'
import { CommentManager } from './components'
import { getIsNumeric } from '~/shared/utils/number-ops'
import { getBinarySearchedValueByDotNotation2 } from '~/shared/utils/array-ops/search/getBinarySearchedValueByDotNotation2'

const isNumber = (a: string | undefined | number) => !Number.isNaN(Number(a))

export const LogPage = memo(() => {
  const params = useParams()
  const [userRouteControls] = useParamsInspectorContextStore((ctx) => ctx.userRouteControls)

  const users = TopLevelContext.useSelector((s) => s.context.users.items)
  const jobs = TopLevelContext.useSelector((s) => s.context.jobs.items)
  // const targetJob = useMemo<TJob | null>(() => jobs
  //   .filter((j) => String(j.id) === params.job_id)?.[0] || null, [jobs, params.job_id])
  const targetJob = useMemo(() => getIsNumeric(params.job_id) ? getBinarySearchedValueByDotNotation2<TJob, TJob>({
    items: jobs,
    target: {
      path: '',
      critery: {
        path: 'id',
        value: Number(params.job_id),
      },
    },
    sorted: 'DESC',
  }).result || null : null, [jobs, params.job_id])
  const targetUser = useMemo<TUser | null>(() => {
    const userId = Number(targetJob?.forecast.assignedTo)
    return users?.find(({ id }) => id === userId) || null
  }, [users, targetJob])
  const statusText = useMemo(() => getJobStatusText({
    job: targetJob,
    user: targetUser,
  }), [targetJob, targetUser])
  const targetLog = useMemo<TLogsItem | undefined>(() => {
    switch (true) {
      case !targetJob || !params.log_ts || !params.job_id:
        return undefined
      case isNumber(params.log_ts):
        return targetJob.logs.items.find(({ ts }) => ts === Number(params.log_ts))
      default:
        return undefined
    }
  }, [targetJob, params.log_ts, params.job_id])

  const jobsActorRef = TopLevelContext.useActorRef()

  const handleEditLog = useCallback(({ text }: { text: string; }) => {
    if (!!targetJob?.id && !!targetLog?.ts) {
      jobsActorRef.send({
        type: 'todo.editLog',
        value: {
          jobId: targetJob.id,
          logTs: targetLog.ts,
          text,
        },
      })
    }
  }, [targetJob?.id, targetLog?.ts, jobsActorRef])
  const [searchValueBasic] = useSearchWidgetDataLayerContextStore((s) => s.searchValueBasic)

  return (
    <Grid container spacing={2}>
      <Grid
        size={12}
        sx={{
          borderBottom: '1px solid lightgray',
          position: 'sticky',
          top: 0,
          backgroundColor: '#fff',
          zIndex: 2,
          pt: 2,
          pb: 2,
        }}
      >
        <div
          style={{
            width: '100%', display: 'flex', flexDirection: 'column', gap: '8px',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            {
              !!targetJob
                ? (
                  <AutoRefreshedJobMuiAva job={targetJob} delay={1000} />
                ) : (
                  <ConstructionIcon />
                )
            }
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}
            >
              {
                !targetJob && (
                  <div style={{ fontWeight: 'bold' }}>Ooops! Job not found...</div>
                )
              }
              {
                !!targetJob && (
                  <Rating
                    size='small'
                    name='rating-view'
                    value={targetJob.forecast.complexity}
                    readOnly
                    icon={<StarIcon htmlColor='gray' fontSize='inherit' />}
                    emptyIcon={<StarBorderIcon fontSize='inherit' />}
                    max={targetJob.forecast.complexity > 5 ? targetJob.forecast.complexity : 5}
                  />
                )
              }
              {!!targetJob && <JobResultReviewShort job={targetJob} />}
            </div>
          </Box>
          <em style={{ fontSize: 'small' }}>Status: {statusText}</em>

          <div
            style={{
              fontSize: 'x-small',
              width: '100%',
              display: 'flex',
              flexDirection: 'row',
              gap: '8px',
              justifyContent: 'space-between',
              color: 'gray',
            }}
          >
            <em>Created at {dayjs(targetJob?.ts.create).format('DD.MM.YYYY')}</em>
            <em>Updated at {dayjs(targetJob?.ts.update).format('DD.MM.YYYY')}</em>
          </div>
        </div>
      </Grid>

      {/* NOTE: About job */}
      <Grid size={12}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <HighlightedText
            comparedValue={targetJob?.title || `Job not found #${params.job_id}`}
            testedValue={searchValueBasic}
            className={baseClasses.truncate}
            style={{ display: 'block', fontWeight: 'bold' }}
          />
          {
            !!targetJob?.ts.create && (
              <TimeAgo
                date={targetJob?.ts.create}
                style={{ color: '#959eaa', fontStyle: 'italic', fontSize: 'small' }}
                prefix='Created'
              />
            )
          }
          {
            !!targetJob && (
              // TODO: <SingleTextManager buttonText='Edit job description'
              <HighlightedText
                comparedValue={targetJob.descr || 'No description'}
                testedValue={searchValueBasic}
                style={{ fontSize: 'small', color: '#959eaa', fontWeight: 'bold' }}
              />
            )
          }
        </Box>
      </Grid>

      {/* NOTE: About log */}
      {
        !!targetLog && (
          <Grid size={12}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              <div style={{ fontWeight: 'bold' }}>Log #{params.log_ts} | {dayjs(targetLog?.ts).format('DD.MM.YYYY HH:mm')}</div>
              {
                !!targetLog?.ts && (
                  <TimeAgo
                    date={targetLog?.ts}
                    style={{ color: '#959eaa', fontStyle: 'italic', fontSize: 'small' }}
                  // prefix='Created'
                  />
                )
              }
              <SingleTextManager
                key={`log-text-${params.job_id}--${params.log_ts}`}
                infoLabel='Log text'
                buttonText='Add log text'
                initialState={{ text: targetLog?.text || '' }}
                isEditable
                isDeletable={false}
                onDelete={({ cleanup }) => {
                  cleanup()
                }}
                onSuccess={({ state }) => {
                  handleEditLog({ text: state.text })
                }}
              />
              {
                !!targetJob && !!targetLog && (
                  <SimpleCheckList
                    key={`checklist-${params.job_id}--${params.log_ts}--${targetJob.ts.update}`}
                    // _additionalInfo={{ message: 'No helpful info' }}
                    isMiniVariant
                    items={targetLog.checklist || []}
                    infoLabel='Checklist'
                    createBtnLabel='Create checklist'
                    isCreatable
                    isDeletable
                    isEditable
                    onDeleteChecklist={() => {
                      jobsActorRef.send({ type: 'todo.deleteChecklistFromLog', value: { jobId: targetJob.id, logTs: targetLog.ts } })
                    }}
                    onCreateNewChecklistItem={({ state }) => {
                      jobsActorRef.send({ type: 'todo.addChecklistItemInLog', value: { jobId: targetJob.id, logTs: targetLog.ts, state } })
                    }}
                    onEditChecklistItem={({ state, checklistItemId, cleanup }) => {
                      jobsActorRef.send({
                        type: 'todo.editChecklistItemInLog',
                        value: {
                          jobId: targetJob.id,
                          logTs: targetLog.ts,
                          checklistItemId,
                          state,
                        },
                      })
                      cleanup()
                    }}
                    onDeleteChecklistItem={({ checklistItemId, cleanup }) => {
                      jobsActorRef.send({
                        type: 'todo.deleteChecklistItemFromLog',
                        value: {
                          jobId: targetJob.id,
                          logTs: targetLog.ts,
                          checklistItemId,
                        },
                      })
                      cleanup()
                    }}
                    onChecklistItemOrderInc={({ checklistItemId }) => {
                      jobsActorRef.send({
                        type: 'todo.editChecklistItemInLog.orderInc',
                        value: {
                          jobId: targetJob.id,
                          logTs: targetLog.ts,
                          checklistItemId,
                        },
                      })
                    }}
                    onChecklistItemOrderDec={({ checklistItemId }) => {
                      jobsActorRef.send({
                        type: 'todo.editChecklistItemInLog.orderDec',
                        value: {
                          jobId: targetJob.id,
                          logTs: targetLog.ts,
                          checklistItemId,
                        },
                      })
                    }}
                  />
                )
              }
            </Box>
          </Grid>
        )
      }

      {
        !!params.job_id && !!params.log_ts && (
          <Grid size={12}>
            <FileSteperExample isEditable={true} idbKey={`job_id-${params.job_id}--log_ts-${params.log_ts}`} />
          </Grid>
        )
      }

      {
        !!targetJob && !!targetLog && (
          <Grid size={12}>
            <CommentManager
              infoLabel='Link'
              initialState={{
                url: '',
                title: '',
                descr: '',
              }}
              onSuccess={(arg) => {
                jobsActorRef.send({ type: 'todo.addLinkToLog', value: { jobId: targetJob.id, logTs: targetLog.ts, state: arg.state } })
                arg.cleanup()
              }}
              onDelete={({ cleanup }) => {
                // jobsActorRef.send({ type: 'todo.deleteLinkInLog', value: { jobId: targetJob.id, logTs: targetLog.ts, linkId: link.id } })
                cleanup()
              }}
              isEditable
            />
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

      {
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
                  infoLabel='Link'
                  key={link.id}
                  initialState={{
                    url: link.url,
                    title: link.title,
                    descr: link.descr,
                  }}
                  onSuccess={({ state }) => {
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
      }

      <Grid size={12}>
        <pre
          className={baseClasses.preNormalized}
        >{JSON.stringify({ userRouteControls, params }, null, 2)}</pre>
      </Grid>

      {
        !!targetJob && (
          <Grid
            // className={baseClasses.backdropBlurLite}
            size={12}
            sx={{
              position: 'sticky',
              bottom: 0,
              backgroundColor: '#fff',
              zIndex: 3,
              marginTop: 'auto',
              // borderRadius: '16px 16px 0px 0px',
              borderRadius: 0,
            }}
          >
            <ResponsiveBlock
              className={baseClasses.specialActionsGrid}
              style={{
                padding: '16px 0px 16px 0px',
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
              {
                !!userRouteControls.from
                  ? (
                    <Link
                      to={userRouteControls.from.value}
                      target='_self'
                    >
                      <Button variant='contained' startIcon={<ArrowBack />} fullWidth>
                        {userRouteControls.from.uiText}
                      </Button>
                    </Link>
                  )
                  : (
                    <Link
                      to={
                        !!targetLog
                          ? `/jobs?lastSeenJob=${targetJob.id}&from=${encodeURIComponent(
                            `/jobs/${targetJob.id}/logs/${targetLog.ts}?from=/last-activity?lastSeenJob=${targetJob.id}&lastSeenLogKey=job-${targetJob.id}-log-${targetLog.ts}&backActionUiText=Last Activity`
                            // `/jobs/${targetJob.id}/logs/${targetLog.ts}`
                          )
                          }&backActionUiText=${encodeURIComponent('Log page')}`
                          : '/jobs'
                      }
                      target='_self'
                    >
                      <Button
                        variant='outlined'
                        color='salmon'
                        startIcon={<ArrowBack />}
                        fullWidth
                      >
                        {!!targetLog ? 'Jobs pager' : 'All Jobs'}
                      </Button>
                    </Link>
                  )
              }

              {
                !!userRouteControls.to && (
                  <Link
                    to={userRouteControls.to.value}
                    target='_self'
                    className={baseClasses.truncate}
                  >
                    <Button variant='contained' startIcon={<ArrowForwardIcon />} fullWidth className={baseClasses.truncate}>
                      <span className={baseClasses.truncate}>{userRouteControls.to.uiText}</span>
                    </Button>
                  </Link>
                )
                // : !!targetJob && !!targetLog && (
                //   <Link
                //     to={`/jobs${!!targetJob ? `?lastSeenJob=${targetJob.id}` : ''}`}
                //     target='_self'
                //   >
                //     <Button color={!!targetJob ? 'primary' : 'gray'} variant='outlined' endIcon={<ArrowForwardIcon />} fullWidth>
                //       Jobs
                //     </Button>
                //   </Link>
                // )
              }

            </ResponsiveBlock>
          </Grid>
        )
      }

    </Grid>
  )
})
