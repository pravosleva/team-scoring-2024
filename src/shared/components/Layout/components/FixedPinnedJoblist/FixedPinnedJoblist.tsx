import { memo, useState, useCallback, useMemo } from 'react'
import clsx from 'clsx'
import baseClasses from '~/App.module.scss'
import { Button } from '@mui/material'
import SportsBasketballIcon from '@mui/icons-material/SportsBasketball'
import ArrowRightIcon from '@mui/icons-material/ArrowRight'
import TurnedInIcon from '@mui/icons-material/TurnedIn'
import classes from './FixedPinnedJoblist.module.scss'
import { TJob, TopLevelContext } from '~/shared/xstate'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { getFullUrl, getMatchedByAnyString } from '~/shared/utils/string-ops'
import { useParamsInspectorContextStore } from '~/shared/xstate/topLevelMachine/v2/context/ParamsInspectorContextWrapper'
import { scrollToIdFactory } from '~/shared/utils/web-api-ops'
import { getIsNumeric } from '~/shared/utils/number-ops'
import { soundManager } from '~/shared/soundManager'
import { UserAva } from '~/shared/components/Job/components'
// import { getJobsIntuitiveSummaryInfo } from '~/shared/components/Job/utils'

type TProps = {
  isOpenedByDefault?: boolean;
}

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
  timeout: 0,
  offsetTop: 16,
  elementHeightCritery: 550,
})

type TPartialModifiedJob = Pick<TJob, 'id' | 'title' | 'forecast' | 'descr'> & { assignedToDisplayName?: string }

export const FixedPinnedJoblist = memo((ps: TProps) => {
  const [isOpened, setIsOpened] = useState<boolean>(ps.isOpenedByDefault || false)
  const handleOpenToggle = useCallback(
    () => {

      const wasOpened = isOpened
      if (wasOpened) {
        soundManager.playDelayedSoundConfigurable({
          soundCode: 'mech-78-step', // 'mech-73-robots-moving-2',
          delay: {
            before: 0,
            after: 500,
          },
        })
      } else {
        soundManager.playDelayedSoundConfigurable({
          soundCode: 'mech-74-robots-big-cyber-moving',
          delay: {
            before: 0,
            after: 1000,
          },
        })
      }
      setIsOpened((s) => !s)
    },
    [isOpened]
  )

  const topLevelActorRef = TopLevelContext.useActorRef()
  const { send } = topLevelActorRef
  const pinnedJobsIds = TopLevelContext.useSelector((s) => s.context.jobs.pinned)
  const handleUnpinJob = useCallback(({ jobId }: { jobId: number }) => () => {
    send({ type: 'todo.unpin', value: { jobId } })
  }, [send])
  const allJobs = TopLevelContext.useSelector((s) => s.context.jobs.items)
  const users = TopLevelContext.useSelector((s) => s.context.users.items)

  const modifiedPinnedJobs: { [key: string]: TPartialModifiedJob } = useMemo(
    () => pinnedJobsIds.reduce((acc: { [key: string]: TPartialModifiedJob }, curId) => {
      const targetJob = allJobs.find(({ id }) => id === curId)
      if (!!targetJob) acc[String(curId)] = {
        id: curId,
        title: targetJob.title,
        descr: targetJob.descr,
        forecast: targetJob.forecast,
        assignedToDisplayName: !!targetJob.forecast.assignedTo
          ? users.find((u) => u.id === targetJob.forecast.assignedTo)?.displayName
          : undefined
      }
      else acc[String(curId)] = { id: curId, title: 'Not found', forecast: { complexity: 0 } }
      return acc
    }, {}),
    [pinnedJobsIds, allJobs, users]
  )

  const [queryParams] = useParamsInspectorContextStore((ctx) => ctx.queryParams)
  const params = useParams()
  const navigate = useNavigate()
  const handleNavigate = useCallback(({ pinnedJobId, relativeUrl }: {
    pinnedJobId?: number;
    relativeUrl: string;
  }) => () => {
    if (!!pinnedJobId && Number(params.job_id) === pinnedJobId) {
      specialScroll({
        id: `job_node_${pinnedJobId}`,
        _cfg: _specialNavigate,
      })
      // NOTE: UX exp
      handleOpenToggle()
    } else {
      navigate(relativeUrl)
      handleOpenToggle()
    }
  }, [navigate, params.job_id, handleOpenToggle])
  const hasPinnedCurrentJob = !!params.job_id && pinnedJobsIds.includes(Number(params.job_id))
  const location = useLocation()

  // const summaryInfo = useMemo(() => getJobsIntuitiveSummaryInfo({ jobs:  }), [])

  if (location.pathname === `/last-activity/${Object.keys(modifiedPinnedJobs).join(',')}`)
    return null

  return (
    <>
      {
        typeof window !== 'undefined' && pinnedJobsIds.length > 0 && (
          <div
            className={clsx(
              baseClasses.fadeIn,
              classes.wrapper,
              classes.fixed,
              baseClasses.stack1,
              // baseClasses.backdropBlurLite,
              {
                // [classes.isRequired]: isMoreThan2Screens,
                // [classes.isClosed]: !isBrowserMemoryMonitorEnabled,
                [classes.isOpened]: isOpened,
                [classes.isClosed]: !isOpened,
              },
              // classes.isRequired,
              classes.rightSideCenterTop,
            )}
            style={{
              // border: '1px solid red',
              // width: '300px',
              alignItems: 'flex-start',
            }}
          >
            {
              Object.keys(modifiedPinnedJobs).map((id) => (
                <div
                  key={id}
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    gap: '8px',
                    fontWeight: 'bold',
                    // border: '1px solid red',
                    // padding: '8px',
                    width: '100%',
                  }}
                // className={baseClasses.truncate}
                >
                  <div
                    style={{
                      // border: '1px solid red',
                      maxWidth: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      fontSize: 'small',
                    }}
                  >
                    <code
                      style={{
                        fontSize: 'small',
                        // wordBreak: 'keep-all',
                        whiteSpace: 'nowrap',
                        // paddingTop: '1px',
                        transform: 'translateY(-2px)',
                      }}
                      onClick={handleUnpinJob({ jobId: Number(id) })}
                    >[ x ]</code>
                    {

                    }
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'flex-start',
                      gap: '8px',
                      fontWeight: 'bold',
                      // border: '1px solid red',
                      // padding: '8px',
                      width: '100%',
                    }}
                  // className={baseClasses.truncate}
                  >
                    <div
                      style={{
                        // border: '1px solid red',
                        maxWidth: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0px',
                        fontSize: 'x-small',

                        wordBreak: 'break-word',
                      }}
                      className={clsx(baseClasses.rowsLimited3)}
                    >
                      <a
                        style={{
                          textDecoration: 'none',
                          fontSize: 'x-small',
                          color: Number(params.job_id) === Number(id)
                            ? 'red' // '#00a47d'
                            : undefined
                        }}
                        // to={}
                        // target='_self'
                        onClick={handleNavigate({
                          relativeUrl: getFullUrl({
                            url: `/jobs/${id}`,
                            query: { ...queryParams },
                            // queryKeysToremove,
                          }),
                          pinnedJobId: Number(id),
                        })}
                        // baseClasses.truncate
                        className={clsx(baseClasses.rowsLimited3)}
                      >{modifiedPinnedJobs[id].title}</a>
                      {/* !!modifiedPinnedJobs[id].descr && (
                        <span
                          style={{
                            fontSize: 'x-small',
                            color: '#959eaa'
                          }}
                          className={clsx(baseClasses.rowsLimited1)}
                        >{modifiedPinnedJobs[id].descr}</span>
                      ) */}
                    </div>

                    {
                      !!modifiedPinnedJobs[id].assignedToDisplayName && (
                        <div
                          style={{
                            marginLeft: 'auto',
                            display: 'inline-flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            fontSize: 'small'
                            // border: '1px solid red',
                          }}
                        >
                          <UserAva
                            name={modifiedPinnedJobs[id].assignedToDisplayName}
                            size={30}
                          />
                        </div>
                      )
                    }
                  </div>
                </div>

              ))
            }

            {
              location.pathname !== `/last-activity/${Object.keys(modifiedPinnedJobs).join(',')}` && (
                <Button
                  size='small'
                  onClick={handleNavigate({
                    relativeUrl: getFullUrl({
                      url: `/last-activity/${Object.keys(modifiedPinnedJobs).join(',')}`,
                      query: {
                        ...queryParams,
                        from: location.pathname,
                      },
                      // queryKeysToremove,
                    }),
                  })}
                  fullWidth
                  variant='outlined'
                  startIcon={<SportsBasketballIcon />}
                // sx={{ borderRadius: 4 }}
                >Last activity</Button>
              )
            }

            <button
              className={clsx(
                classes.absoluteToggler,
                // 'backdrop-blur--lite',
              )}
              onClick={handleOpenToggle}
            >
              {
                isOpened
                  ? <ArrowRightIcon style={{ fontSize: '24px' }} />
                  : <TurnedInIcon htmlColor={hasPinnedCurrentJob ? 'red' : 'inherit'} style={{ fontSize: '24px' }} />
              }
              {/*
                isBrowserMemoryMonitorEnabled
                  ? <ExpandLessIcon style={{ fontSize: '24px' }} />
                  : <MemoryIcon style={{ fontSize: '24px' }} />
              */}
              {/* <ExpandLessIcon style={{ fontSize: '16px' }} /> */}
              {/* <span style={{ paddingRight: '8px' }}>Memory</span> */}
              <span className={classes.counter}>
                {pinnedJobsIds.length}
              </span>
            </button>
          </div>
        )
      }
    </>
  )
})