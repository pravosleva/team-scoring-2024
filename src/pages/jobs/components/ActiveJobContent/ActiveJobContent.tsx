import { memo, useCallback, useMemo, useState } from 'react'
import baseClasses from '~/App.module.scss'
import { Button, IconButton } from '@mui/material'
import { TJob, TLogLink, TopLevelContext, TUser } from '~/shared/xstate'
import {
  RadioGroupRating, ResponsiveBlock,
  // SimpleCheckList,
} from '~/shared/components'
import { Link } from 'react-router-dom'
import { JobStats } from '~/shared/components/Job/components'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { getTruncated } from '~/shared/utils/string-ops'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import { JobAdditionalInfo } from '../../components'
// import StarBorderIcon from '@mui/icons-material/StarBorder'
import StarIcon from '@mui/icons-material/Star'
import HistoryIcon from '@mui/icons-material/History'
import { ratingIcons } from '~/shared/components/RadioGroupRating/ratingIcons'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import { CopyToClipboardWrapper } from '~/shared/components'
import dayjs from 'dayjs'
import LinkIcon from '@mui/icons-material/Link'
// import ChecklistIcon from '@mui/icons-material/Checklist';

type TProps = {
  isOpened: boolean;
  job: TJob;
  onToggleDrawer: (val?: boolean) => ({ jobId }: {
    jobId?: number;
  }) => void;
}

// const TopResponsiveBlock = forwardRef<HTMLDivElement, { children: React.ReactNode; style: CSSRuleList }>(({ children, ...props }, ref) => (
//   <ResponsiveBlock ref={ref} {...props}>{children}</ResponsiveBlock>
// ))

export const ActiveJobContent = memo(({
  isOpened,
  job,
  onToggleDrawer,
}: TProps) => {
  const users = TopLevelContext.useSelector((s) => s.context.users.items)
  const activeJobEmployee = useMemo<TUser | null>(() => {
    if (!job || !job.forecast.assignedTo) return null
    const targetUser = users.find((u) => u.id === job.forecast.assignedTo)
    return targetUser || null
  }, [job, users])
  const [expressAppraiserStars, setExpressAppraiserStars] = useState<number>(job.forecast.complexity)
  const resetExpressAppraiserStars = useCallback(() => {
    setExpressAppraiserStars(job.forecast.complexity)
  }, [job.forecast.complexity])
  const isNeedToReset = useMemo(() =>
    job.forecast.complexity !== expressAppraiserStars,
    [job.forecast.complexity, expressAppraiserStars]
  )
  const scrollTop = useCallback(() => {
    const targetElm = document.getElementById('topBox')
    if (!!targetElm) targetElm?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])
  const scrollLog = useCallback(() => {
    const targetElm = document.getElementById('logBoxHeader')
    if (!!targetElm) targetElm?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    })
  }, [])
  const scrollLinks = useCallback(() => {
    const targetElm = document.getElementById('linkBoxHeader')
    if (!!targetElm) targetElm?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    })
  }, [])

  const linksFromLogs = useMemo<(TLogLink & { logTs: number })[]>(() => job?.logs.items.reduce((acc: (TLogLink & { logTs: number })[], cur) => {
    if (!!cur.links && Array.isArray(cur.links) && cur.links?.length > 0) {
      for (const link of cur.links) acc.push({ ...link, logTs: cur.ts })
    }
    return acc
  }, []), [job?.logs.items])

  // const allChecklistItems = useMemo<{ [key: string]: { logText: string; checklist: TLogChecklistItem[]; jobTsUpdate: number } }>(() =>
  //   job.logs.items.reduce(
  //     (acc: { [key: string]: { logText: string; checklist: TLogChecklistItem[]; jobTsUpdate: number } }, cur) => {
  //       if (!!cur.checklist) {
  //         if (!acc[String(cur.ts)]) {
  //           acc[String(cur.ts)] = {
  //             logText: cur.text,
  //             checklist: cur.checklist,
  //             jobTsUpdate: job.ts.update,
  //           }
  //         }
  //       }

  //       return acc
  //     },
  //     {}
  //   ),
  //   [job?.logs.items, job.ts.update]
  // )

  // const logTsToChecklistIdMapping = useMemo<{ [key: string]: number[] }>(() => job.logs.items.reduce((acc: { [key: string]: number[] }, cur) => {
  //   if (!acc[String(cur.ts)]) acc[String(cur.ts)] = []
  //   if (!!cur.checklist) {
  //     for (const checklistItem of cur.checklist) {
  //       if (!acc[String(cur.ts)].includes(checklistItem.id)) {
  //         acc[String(cur.ts)].push(checklistItem.id)
  //       }
  //     }
  //   }

  //   return acc
  // }, {}), [job?.logs.items, job.ts.update])

  // const jobsActorRef = TopLevelContext.useActorRef()
  // const handleEditChecklistItem = useCallback(({ state, checklistItemId, _additionalInfo, cleanup }: any) => {
  //   // console.log('- wip EDIT: ActiveJobContent')
  //   // console.log(state)
  //   // console.log(_additionalInfo)
  //   let targetLogTs: number | undefined
  //   for (const logTsAsString in logTsToChecklistIdMapping) {
  //     if (logTsToChecklistIdMapping[logTsAsString].includes(checklistItemId)) {
  //       targetLogTs = Number(logTsAsString)
  //     }
  //   }

  //   if (typeof targetLogTs === 'number' && !!_additionalInfo?.jobId) {
  //     // console.log(targetLogTs)
  //     // console.log(_additionalInfo?.jobId)
  //     // console.log(checklistItemId)
  //     console.log(state)
  //     jobsActorRef.send({
  //       type: 'todo.editChecklistItemInLog',
  //       value: {
  //         jobId: _additionalInfo.jobId,
  //         logTs: targetLogTs,
  //         checklistItemId,
  //         state,
  //       },
  //     })
  //     cleanup()
  //   }
  // }, [jobsActorRef])

  return (
    <>
      <div
        className={baseClasses.stack0}
        style={{
          minHeight: '100dvh',
          maxHeight: '100dvh',
        }}
      >
        <ResponsiveBlock>
          <ResponsiveBlock
            style={{
              padding: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
              gap: '16px',
              // borderBottom: '1px solid lightgray',
              position: 'sticky',
              top: 0,
              backgroundColor: '#fff',
              zIndex: 2,
            }}
            className={baseClasses.boxShadowBottom}
            id='topBox'
          >
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <code><b>#{job.id}</b></code>
              <StarIcon fontSize='inherit' />
              <code>{job.forecast.complexity}</code>
            </span>
            <IconButton
              color='inherit'
              aria-label='Close drawer'
              onClick={() => onToggleDrawer(false)({})}
              edge='start'
              sx={[
                !isOpened && { display: 'none' },
              ]}
            >
              <ChevronLeftIcon />
            </IconButton>
          </ResponsiveBlock>
        </ResponsiveBlock>

        <ResponsiveBlock>
          <ResponsiveBlock
            style={{
              // padding: '16px 16px 16px 16px',
              position: 'sticky',
              top: 0,
              backgroundColor: '#fff',
              zIndex: 2,
              // borderBottom: '1px solid lightgray',
              // border: '1px solid red',
              height: '30px',
              display: 'flex',
              flexDirection: 'row',
              gap: '1px',
            }}
          >
            <div
              style={{
                backgroundColor: 'gray',
                color: '#fff',
                padding: '4px',
                display: 'flex',
                justifyContent: 'center',
                gap: '8px',
                alignItems: 'center',
                width: '100%',
                cursor: 'pointer',
                fontSize: 'small',
              }}
              onClick={scrollLog}
              className={baseClasses.stripedBlue}
            >
              <span>LOGS</span>
              <ArrowDownwardIcon fontSize='small' />
            </div>
            {
              linksFromLogs.length > 0 && (
                <div
                  style={{
                    backgroundColor: 'gray',
                    color: '#fff',
                    padding: '4px',
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '8px',
                    alignItems: 'center',
                    width: '100%',
                    cursor: 'pointer',
                    fontSize: 'small',
                  }}
                  onClick={scrollLinks}
                  className={baseClasses.stripedBlue}
                >
                  <span>LINKS</span>
                  <ArrowDownwardIcon fontSize='small' />
                </div>
              )
            }
          </ResponsiveBlock>

          <ResponsiveBlock
            style={{
              padding: '16px 16px 16px 16px',
              position: 'sticky',
              top: '30px',
              backgroundColor: '#fff',
              zIndex: 2,
              borderBottom: '1px solid lightgray',
            }}
          >
            <h2
              style={{
                display: 'inline-flex',
                gap: '6px',
                alignItems: 'center',
              }}>
              {
                !job.forecast.finish
                  ? <>
                    <span>[ Scenario variants</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center' }}>{ratingIcons[expressAppraiserStars].icon}</span>
                    <span>]</span>
                  </>
                  : '[ Details ]'
              }
            </h2>
          </ResponsiveBlock>

          <ResponsiveBlock
            style={{
              padding: '16px 16px 16px 16px',
            }}
          >
            <div className={baseClasses.stack2}>
              <div
                className={baseClasses.stack1}
              >
                <div
                  style={{
                    fontWeight: 'bold',
                    // wordBreak: 'break-all',
                    overflowWrap: 'break-word',
                  }}
                >{job.title}</div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                    minHeight: '32px',
                  }}
                >
                  <RadioGroupRating
                    size='large'
                    name='rating-view'
                    value={expressAppraiserStars}
                    // icon={<StarIcon htmlColor='gray' fontSize='inherit' />}
                    // emptyIcon={<StarBorderIcon fontSize='inherit' />}
                    // max={job.forecast.complexity > 5 ? job.forecast.complexity : 5}
                    max={6}
                    // disabled
                    // aria-readonly
                    // readOnly
                    onChange={(_e, value) => {
                      setExpressAppraiserStars(value || 0)
                    }}
                  />
                  {
                    isNeedToReset && (
                      <Button
                        color='error'
                        variant='text'
                        size='small'
                        endIcon={<HistoryIcon />}
                        // fullWidth
                        // className={baseClasses.truncate}
                        onClick={resetExpressAppraiserStars}
                      >
                        Reset
                      </Button>
                    )
                  }
                </div>
                <div>Grade: {ratingIcons[expressAppraiserStars].label}</div>
                {
                  !!job.descr && (
                    <div
                      style={{
                        color: 'gray',
                        fontSize: 'small',
                        wordBreak: 'break-word',
                      }}
                    >
                      {job.descr}
                    </div>
                  )
                }
              </div>
              <JobStats
                job={{
                  ...job,
                  forecast: {
                    ...job.forecast,
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    complexity: expressAppraiserStars,
                  },
                }}
              />
            </div>
          </ResponsiveBlock>
        </ResponsiveBlock>

        <ResponsiveBlock>
          <ResponsiveBlock
            style={{
              // padding: '16px 16px 16px 16px',
              position: 'sticky',
              top: 0,
              backgroundColor: '#fff',
              zIndex: 2,
              // borderBottom: '1px solid lightgray',
              // border: '1px solid red',
              height: '30px',
              display: 'flex',
              flexDirection: 'row',
              gap: '1px',
            }}
          >
            <div
              style={{
                backgroundColor: 'black',
                color: '#fff',
                padding: '4px',
                display: 'flex',
                gap: '8px',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                cursor: 'pointer',
                fontSize: 'small',
              }}
              onClick={scrollTop}
            >
              <span>TOP</span>
              <ArrowUpwardIcon fontSize='small' />
            </div>
          </ResponsiveBlock>

          <ResponsiveBlock
            style={{
              padding: '16px 16px 16px 16px',
              position: 'sticky',
              top: '30px',
              backgroundColor: '#fff',
              zIndex: 2,
              borderBottom: '1px solid lightgray',
            }}
          >
            <h2>[ Active job info ]</h2>
          </ResponsiveBlock>

          {
            linksFromLogs.length > 0 && (
              <ResponsiveBlock
                style={{
                  padding: '16px 16px 16px 16px',
                }}
              >
                <h3 id='linkBoxHeader' style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                  <span>[ All links: {linksFromLogs.length}</span>
                  <LinkIcon />
                  <span>]</span>
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {
                    linksFromLogs.map((link) => (
                      <div
                        key={link.id}
                        style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}
                      >
                        <em style={{ fontSize: 'small', color: '#959eaa', fontWeight: 'bold' }}>{dayjs(link.logTs).format('DD.MM.YYYY HH:mm')}</em>
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
                  }
                </div>
              </ResponsiveBlock>
            )
          }

          {
            !!job && (
              <ResponsiveBlock
                style={{
                  paddingBottom: '24px',
                }}
              >
                <JobAdditionalInfo job={job} />
              </ResponsiveBlock>
            )
          }
        </ResponsiveBlock>

        <ResponsiveBlock
          className={baseClasses.specialActionsGrid}
          style={{
            padding: '16px',
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
            !!job.forecast.assignedTo && (
              <Link
                to={
                  [
                    `/employees/${job.forecast.assignedTo}`,
                    '?',
                    [
                      `lastSeenJob=${job.id}`,
                      `from=${encodeURIComponent(`/jobs?lastSeenJob=${job.id}&backActionUiText=Jobs`)}`
                    ].join('&'),
                  ].join('')
                }
                target='_self'
              >
                <Button
                  variant='outlined'
                  startIcon={<AccountCircleIcon />}
                  fullWidth
                // className={baseClasses.truncate}
                >
                  {getTruncated(activeJobEmployee?.displayName || 'Employee', 11)}
                </Button>
              </Link>
            )
          }
          <Link to={`/jobs/${job.id}`} target='_self'>
            <Button variant='contained' endIcon={<ArrowForwardIcon />} fullWidth>
              <span className={baseClasses.truncate}>{`Job | ${job.title}`}</span>
            </Button>
          </Link>
        </ResponsiveBlock>
      </div>
    </>
  )
})
