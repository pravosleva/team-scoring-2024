/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react'
import { TreeNode } from 'ts-tree-lib'
import classes from './ProjectNode.module.scss'
import { Link } from 'react-router-dom'
import clsx from 'clsx'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import KeyboardDoubleArrowUpIcon from '@mui/icons-material/KeyboardDoubleArrowUp'
// import ArrowBack from '@mui/icons-material/ArrowBack'
// import ConstructionIcon from '@mui/icons-material/Construction'
// import TimelapseIcon from '@mui/icons-material/Timelapse'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
// import CheckIcon from '@mui/icons-material/Check'
// import TaskAltIcon from '@mui/icons-material/TaskAlt'
import TimerIcon from '@mui/icons-material/Timer'
import HardwareIcon from '@mui/icons-material/Hardware'
// import NewReleasesIcon from '@mui/icons-material/NewReleases'
import PanoramaFishEyeIcon from '@mui/icons-material/PanoramaFishEye'
import dayjs from 'dayjs'
import baseClasses from '~/App.module.scss'
import { TEnchancedJobByWorker } from '~/pages/jobs/[job_id]/components/ProjectsTree/types'
import { getArithmeticalMean } from '~/shared/utils/number-ops'
import { TJob, TopLevelContext } from '~/shared/xstate'
import { getFullUrl } from '~/shared/utils/string-ops'
import { useParamsInspectorContextStore } from '~/shared/xstate/topLevelMachine/v2/context/ParamsInspectorContextWrapper'
import { CollapsibleText } from '~/pages/jobs/[job_id]/components/ProjectsTree/components/CollapsibleText'
import StarBorderIcon from '@mui/icons-material/StarBorder'
import StarIcon from '@mui/icons-material/Star'
import { AutoRefreshedJobMuiAva } from '~/shared/components/Job/utils'
import { JobResultReviewShort } from '../../JobResultReviewShort'
import { SubjobsExperimentalCards, cardsClasses } from './SubjobsExperimentalCards'
import { UserAva } from '~/shared/components/Job/components'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Button } from '@mui/material'
import SportsBasketballIcon from '@mui/icons-material/SportsBasketball'
// import PushPinIcon from '@mui/icons-material/PushPin'
// import LabelImportantIcon from '@mui/icons-material/LabelImportant'
import BookmarkIcon from '@mui/icons-material/Bookmark'
import QueryStatsIcon from '@mui/icons-material/QueryStats'

type TProps = {
  projectsTree: TreeNode<TEnchancedJobByWorker>;
  activeJobId?: number;
  // currentJobId?: number;
  activeJobName?: string;
  level: number;
  onNavigateToChecklistClick: (ps: {
    checklistUniqueKey: string;
    jobId: number;
    jobTitle?: string;
  }) => (e: any) => void;
  onNavigateToJobNode: ({ jobId }: {
    jobId: number;
    backToJobId?: number;
    jobTitle?: string;
    fromLevel?: number;
    dontActualizeSubjob?: boolean;
  }) => (e: any) => void;
  onScrollToStats: (ps: { jobId: number; }) => (e: any) => void;
}

class JobAnalyzer {
  job: TJob
  constructor(job: TJob) {
    this.job = job
  }
  get isDone() {
    return this.job.completed
  }
  get isNew() {
    return !this.job.forecast?.start
  }
  get isStartedAndEstimated() {
    return !!this.job.forecast?.start && !!this.job.forecast?.estimate
  }
}

const stickyElementHeight = 58

export const ProjectNode = ({
  projectsTree,
  activeJobId,
  // currentJobId,
  activeJobName,
  level,
  onNavigateToChecklistClick,
  onNavigateToJobNode,
  onScrollToStats,
}: TProps) => {
  const [isLastActivityOpened, setIsLastActivityOpened] = useState(false)
  const toggleLastActivity = () => setIsLastActivityOpened((s) => !s)
  const [queryParams] = useParamsInspectorContextStore((ctx) => ctx.queryParams)
  const isActiveNode = activeJobId === projectsTree.model.id
  const isCompleted = projectsTree.model.completed

  const users = TopLevelContext.useSelector((s) => s.context.users.items)
  const getUserById = (_id: number) => users.find(({ id }) => id === _id)?.displayName || 'NoName'

  const pinnedJobs = TopLevelContext.useSelector((s) => s.context.jobs.pinned)
  const isPinned = pinnedJobs.includes(projectsTree.model.id)
  const topLevelActorRef = TopLevelContext.useActorRef()
  const { send } = topLevelActorRef
  const handlePin = () => send({ type: 'todo.pin', value: { jobId: projectsTree.model.id } })

  return (
    <div
      id={`job_node_${projectsTree.model.id}`}
      className={
        clsx(
          `projects-tree-level_${level}`,
          classes.wrapper,
          classes[`borderRadiusLevel${level}`],
          {
            [classes.isActive]: isActiveNode,
            [classes.isCompleted]: isCompleted,
            [classes.isntCompleted]: !projectsTree.model.completed && !(activeJobId === projectsTree.model.id),
          },
        )
      }
    // style={{
    //   boxShadow: level === 2 ? '0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 0px 8px 0px rgba(0, 0, 0, 0.12)' : 'none',
    // }}
    >
      {/*
        projectsTree.model.completed && (
          <div
            className={classes.absoluteTopRightBadge}
            style={{
              zIndex: 50 - level,
            }}
          >
            Done
          </div>
        )
      */}

      {
        activeJobId !== projectsTree.model.id && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: '2px',

              // border: '1px solid red',
              // borderTopLeftRadius: 'inherit',
              // borderTopRightRadius: 'inherit',

              paddingRight: '8px',

              position: 'sticky',
              top: `${level === 1 ? 0 : (level - 1) * stickyElementHeight}px`,
              height: `${stickyElementHeight}px`,

              backgroundColor: isCompleted
                ? '#EFF0F1'
                : isActiveNode
                  ? '#ffecec'
                  : '#FFF',
              zIndex: 50 - level,
            }}
            className={clsx(classes.stickyTop)}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'flex-start',
                alignItems: 'center',
                gap: '8px',
              }}
              className={baseClasses.truncate}
            >
              <Link
                // to={
                //   [
                //     '/jobs',
                //     `/${projectsTree.model.id}`,
                //     // !!activeJobId
                //     //   ? `?from=${encodeURIComponent(`/jobs/${activeJobId}`)}${!!activeJobName ? `&backActionUiText=${activeJobName}` : ''}`
                //     //   : '',
                //   ].join('')
                // }
                style={{
                  textDecoration: 'none',
                }}
                to={getFullUrl({
                  url: `/jobs/${projectsTree.model.id}`,
                  query: {
                    ...queryParams,
                  },
                  // queryKeysToremove,
                })}
                className={baseClasses.truncate}
              >
                {projectsTree.model.title}{projectsTree.model.relations?.children?.length > 0 ? ` (${projectsTree.model.relations?.children.length} subjobs)` : ''}
              </Link>
              {
                !!projectsTree.model.relations?.parent && (
                  <code
                    className={clsx(baseClasses.noBreakWords, 'node-blinker-disablable')}
                    style={{ fontSize: 'x-small', fontWeight: 'bold', color: '#959eaa', cursor: 'pointer', marginLeft: 'auto' }}
                    onClick={onNavigateToJobNode({
                      jobId: projectsTree.model.relations?.parent,
                      // backToJobId: projectsTree.model.id,
                      // jobTitle: projectsTree.model.title,
                    })}
                  >[ <KeyboardDoubleArrowUpIcon fontSize='inherit' /> ]
                  </code>
                )
              }
            </div>

            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'small' }}>
              <code>{projectsTree.model.forecast.complexity}</code>
              {
                projectsTree.model.forecast.complexity > 0
                  ? <StarIcon fontSize='inherit' />
                  : <StarBorderIcon fontSize='inherit' />
              }
              <JobResultReviewShort job={projectsTree.model} />
            </span>
            {/* <span>WIP</span> */}
          </div>
        )
      }
      {
        activeJobId === projectsTree.model.id && (
          <span
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: '2px',

              paddingRight: '8px',

              // border: '1px solid red',

              position: 'sticky',
              height: `${stickyElementHeight}px`,
              top: `${level === 1 ? 0 : (level - 1) * stickyElementHeight}px`,

              backgroundColor: isCompleted
                ? '#EFF0F1'
                : isActiveNode
                  ? '#ffecec'
                  : '#FFF',
              zIndex: 50 - level,
            }}
            className={clsx(classes.stickyTop, 'projects-tree-wrapper-sticky-part')}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '8px',
              }}
              className={clsx(baseClasses.truncate, 'indicator')}
            >
              <b
                style={{
                  fontSize: 'small',
                  // wordBreak: 'break-word',
                }}
                className={baseClasses.truncate}
              >
                {projectsTree.model.title}
              </b>
              <span
                style={{
                  // float: 'right',
                  // marginTop: '6px',
                }}>
                {
                  !!projectsTree.model.relations?.parent && (
                    <code
                      className={clsx(baseClasses.noBreakWords, 'node-blinker-disablable')}
                      style={{
                        display: 'block',
                        fontSize: 'x-small',
                        fontWeight: 'bold',
                        color: '#02c39a',
                        cursor: 'pointer',
                        transform: 'rotate(7deg)',
                        // zIndex: 50 - level + 1,
                      }}
                      onClick={onNavigateToJobNode({
                        fromLevel: level,
                        jobId: projectsTree.model.relations?.parent,
                        // backToJobId: projectsTree.model.id,
                        // jobTitle: projectsTree.model.title,
                        dontActualizeSubjob: true,
                      })}
                    >[ parent ]
                    </code>
                  )
                }
              </span>
            </div>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'small' }}>
              <code>{projectsTree.model.forecast.complexity}</code>
              {
                projectsTree.model.forecast.complexity > 0
                  ? <StarIcon fontSize='inherit' />
                  : <StarBorderIcon fontSize='inherit' />
              }
              <JobResultReviewShort job={projectsTree.model} />
            </span>
          </span>
        )
      }

      <div
        style={{
          paddingRight: '8px',
        }}
      >
        <CollapsibleText
          briefText={
            <span
              style={{
                display: 'inline-flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>Details</span>
              {!isPinned && (
                <code
                  // style={{ fontSize: 'x-small', cursor: 'pointer' }}
                  style={{
                    cursor: 'pointer',
                    fontSize: 'x-small',
                    fontWeight: 'bold',
                    display: 'inline-flex',
                    flexDirection: 'row',
                    gap: '5px',
                    alignItems: 'center',
                    // border: '1px solid red'
                  }}
                  onClick={handlePin}
                >
                  <span>[</span>
                  {/* <span>Pin</span> */}
                  <BookmarkIcon fontSize='small' />
                  <span>]</span>
                </code>
              )}
            </span>
          }
          // isOpenedByDefault={true}
          targetText={projectsTree.model.descr}
          contentRender={({ targetText }) => (
            <>
              <b
                style={{
                  // fontSize: 'normal',
                  wordBreak: 'break-word',
                }}
                className={baseClasses.specialText}
              >{projectsTree.model.title}</b>
              {!!projectsTree.model.descr && (<div className={classes.descr}>{targetText}</div>)}
              {/*
              !isPinned && (
                <Button
                  variant='outlined'
                  onClick={handlePin}
                  size='small'
                  startIcon={<PushPinIcon />}
                >
                  Pin
                </Button>
              )
            */}
            </>
          )}
        />
      </div>

      {
        projectsTree.model.logs.items.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              wordBreak: 'break-word',
              fontSize: 'small',

              paddingRight: '8px',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'flex-start',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  gap: '2px',
                }}
              >
                {
                  activeJobId === projectsTree.model.id && (
                    <Button
                      // disabled={!projectsTree.model.completed}
                      size='small'
                      // endIcon={<ArrowForwardIcon /*sx={{ fontSize: '12px' }}*/ />}
                      color='salmon'
                      variant='outlined'
                      sx={
                        {
                          borderTopLeftRadius: '16px',
                          borderTopRightRadius: 0,
                          borderBottomRightRadius: 0,
                          borderBottomLeftRadius: '16px',
                        }
                      }
                      // startIcon={<SportsBasketballIcon />}
                      onClick={onScrollToStats({ jobId: projectsTree.model.id })}
                    >
                      {/* <span className={baseClasses.truncate}>Stats</span> */}
                      <QueryStatsIcon sx={{ fontSize: '23px' }} />
                    </Button>
                  )
                }
                {
                  activeJobId === projectsTree.model.id
                    ? (
                      <Link
                        className={clsx(
                          // classes.lastActivityOfCurrentJobLink,
                          // baseClasses.underlineSolid,
                          baseClasses.truncate,
                        )}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          textDecoration: 'none'
                        }}
                        to={
                          [
                            `/last-activity/${projectsTree.model.id}`,
                            // !!activeJobId
                            //   ? `?from=${encodeURIComponent(`/jobs/${activeJobId}`)}${!!activeJobName ? `&backActionUiText=${activeJobName}` : ''}`
                            //   : '',
                            [
                              '?',
                              [
                                `lastSeenLogKey=job-${activeJobId}-log-${projectsTree.model.logs.items[0].ts}`,
                                `lastSeenJob=${activeJobId}`,
                                !!activeJobName
                                  ? [
                                    `from=${encodeURIComponent(
                                      [
                                        `/jobs/${activeJobId}`,
                                        // '?',
                                        // `from=${!!activeJobName ? `backActionUiText=${activeJobName}` : ''}`
                                      ].join('')
                                    )}`,
                                    !!activeJobName ? `backActionUiText=${encodeURIComponent(activeJobName)}` : '',
                                  ].join('&')
                                  : '',
                              ].join('&')
                            ].join('')
                          ].join('')
                        }
                      >
                        <Button
                          size='small'
                          endIcon={<ArrowForwardIcon /*sx={{ fontSize: '12px' }}*/ />}
                          variant='outlined'
                          sx={
                            {
                              borderTopLeftRadius: 0,
                              borderTopRightRadius: '16px',
                              borderBottomRightRadius: '16px',
                              borderBottomLeftRadius: 0,
                            }
                          }
                          startIcon={<SportsBasketballIcon />}
                        >
                          <span className={baseClasses.truncate}>{dayjs(projectsTree.model.logs.items[0].ts).format('DD.MM.YYYY HH:mm')}</span>
                        </Button>
                      </Link>
                    ) : (
                      <b
                        onClick={toggleLastActivity}
                        className={baseClasses.underlineDashed}
                        style={{ fontSize: 'small' }}
                      >Last activity {dayjs(projectsTree.model.ts.update).format('DD.MM.YYYY HH:mm')}</b>
                    )
                }
              </div>
              <code
                className={baseClasses.noBreakWords}
                // style={{ fontSize: 'x-small', fontWeight: 'bold', cursor: 'pointer' }}
                style={{
                  marginLeft: 'auto',
                  cursor: 'pointer',
                  fontSize: 'x-small',
                  fontWeight: 'bold',
                  display: 'inline-flex',
                  flexDirection: 'row',
                  gap: '5px',
                  alignItems: 'center',
                  // border: '1px solid red'
                }}
                onClick={toggleLastActivity}
              >
                {/* <span>[</span> */}
                {
                  isLastActivityOpened
                    ? (
                      <ExpandLessIcon sx={{ fontSize: '20px' }} />
                    )
                    : (
                      <ExpandMoreIcon sx={{ fontSize: '20px' }} />
                    )
                }
                {/* <span>]</span> */}
              </code>
            </div>
            {
              isLastActivityOpened && (
                <>
                  <span
                    style={{ fontSize: 'small' }}
                    className={classes.lastLog}
                  >
                    {projectsTree.model.logs.items[0].text}
                  </span>
                </>
              )
            }

            {
              projectsTree.model._service.aboutJob.existingChecklists.length > 0 && (
                <CollapsibleText
                  isClickableBrief
                  briefText={`Checklist (${projectsTree.model._service.aboutJob.existingChecklists.length}) | Done ${getArithmeticalMean(projectsTree.model._service.aboutJob.existingChecklists.map(({ completePercentage }) => completePercentage)).toFixed(0)}%`}
                  targetText='(render-props)'
                  contentRender={() => (
                    <ul className={baseClasses.compactList}>
                      {
                        projectsTree.model._service.aboutJob.existingChecklists
                          .map(({ logText, uniqueChecklistKey, logTs, completePercentage }) => (
                            <li
                              key={uniqueChecklistKey}
                            >
                              <span
                                style={{
                                  // border: '1px solid red',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '4px',
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: 'small',
                                    fontWeight: 'bold',
                                    display: 'flex',
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                  }}
                                >
                                  {
                                    activeJobId === projectsTree.model.id
                                      ? (
                                        <a
                                          style={{
                                            fontSize: 'small',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            cursor: 'pointer',
                                          }}
                                          onClick={onNavigateToChecklistClick({
                                            checklistUniqueKey: uniqueChecklistKey,
                                            jobId: projectsTree.model.id,
                                            jobTitle: projectsTree.model.title,
                                          })}
                                        >
                                          <span>{dayjs(logTs).format('DD.MM.YYYY HH:mm')}</span>
                                          <ArrowDownwardIcon sx={{ fontSize: '12px' }} />
                                        </a>
                                      ) : (
                                        <span style={{ fontSize: 'small' }}>{dayjs(logTs).format('DD.MM.YYYY HH:mm')}</span>
                                      )
                                  }
                                  <b style={{ color: completePercentage === 0 ? 'red' : completePercentage < 100 ? 'black' : 'lightgray' }}>{completePercentage.toFixed(0)}%</b>
                                </span>
                                <span>{logText}</span>
                              </span>
                            </li>
                          ))
                      }
                    </ul>
                  )}
                />
              )
            }

            {
              projectsTree.model._service.aboutJob.existingChildrenNodes.nodesInfo.length > 0 && (
                <CollapsibleText
                  isClickableBrief
                  briefText={`Subjobs (${projectsTree.model._service.aboutJob.existingChildrenNodes.nodesInfo.reduce((acc, { originalJob }) => { if (originalJob.completed) acc += 1; return acc }, 0)} of ${projectsTree.model._service.aboutJob.existingChildrenNodes.nodesInfo.length})`}
                  targetText='(render-props)'
                  contentRender={() => (
                    <ul
                      className={baseClasses.compactList}
                      style={{ listStyle: 'none', paddingLeft: '0px' }}
                    >
                      {
                        projectsTree.model._service.aboutJob.existingChildrenNodes.nodesInfo
                          .map(({ nodeId, originalJob }) => {
                            const analyzed = new JobAnalyzer(originalJob as any)
                            return (
                              <li key={nodeId}>
                                <a
                                  className={clsx(
                                    // baseClasses.truncate,
                                    {
                                      [classes.lastActivityOfCurrentJobLink]: activeJobId === originalJob.id,
                                    },
                                  )}
                                  style={{
                                    fontSize: 'small',
                                    width: '100%',
                                    display: 'inline-flex',
                                    flexDirection: 'row',
                                    // border: '1px solid red',
                                    alignItems: 'flex-start',
                                    gap: '6px',
                                    cursor: 'pointer',
                                    opacity: analyzed.isDone ? 0.5 : 1,
                                  }}
                                  onClick={onNavigateToJobNode({
                                    jobId: originalJob.id,
                                    backToJobId: projectsTree.model.id,
                                    jobTitle: projectsTree.model.title,
                                  })}
                                >
                                  <span style={{ paddingTop: '2px' }}>
                                    {
                                      analyzed.isDone
                                        ? <CheckCircleIcon sx={{ fontSize: 'inherit' }} />
                                        : analyzed.isNew
                                          ? <PanoramaFishEyeIcon sx={{ fontSize: 'inherit' }} />
                                          : analyzed.isStartedAndEstimated
                                            ? <TimerIcon sx={{ fontSize: 'inherit' }} />
                                            : <HardwareIcon sx={{ fontSize: 'inherit' }} />
                                    }
                                  </span>
                                  <span
                                  // className={baseClasses.truncate}
                                  >{originalJob.title}</span>
                                  <span
                                    style={{
                                      paddingRight: '3px',
                                      paddingTop: '2px', marginLeft: 'auto'
                                    }}
                                  >
                                    <ArrowDownwardIcon sx={{ fontSize: 'inherit' }} />
                                  </span>
                                </a>
                              </li>
                            )
                          }
                          )
                      }
                    </ul>
                  )}
                />
              )
            }
            {
              projectsTree.model._service.aboutJob.existingChildrenNodes.nodesInfo.length > 0 && (
                <SubjobsExperimentalCards
                  // wrapperStyles={{
                  //   // boxShadow: '0px 0px 4px 4px rgba(34, 60, 80, 0.2) inset',
                  //   // boxShadow: projectsTree.model.completed
                  //   //   ? '16px 0px 8px -8px rgba(239, 240, 241, 0.5) inset, -16px 0 8px -8px rgba(239, 240, 241, 0.5) inset'
                  //   //   : '16px 0px 8px -8px rgba(255, 255, 255, 0.5) inset, -16px 0 8px -8px rgba(255, 255, 255, 0.5) inset',

                  // }}
                  items={projectsTree.model._service.aboutJob.existingChildrenNodes.nodesInfo}
                  cardRenderer={({ itemData }) => (
                    <div
                      id={`subjob-card_${itemData.originalJob.id}`}
                      className={cardsClasses.card}
                      style={{
                        // boxShadow: itemData.originalJob.completed
                        //   ? '0px 5px 10px 2px rgba(34, 60, 80, 0.2) inset'
                        //   : '0px 5px 10px 2px rgba(34, 60, 80, 0.2) inset',
                        backgroundColor: itemData.originalJob.completed
                          ? '#EFF0F1'
                          : '#FFF',
                        // isActiveNode
                        //   ? '#ffecec'
                        //   : '#FFF',
                        // border: '1px solid red',
                      }}
                    >
                      <div
                        style={{
                          fontSize: 'x-small',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px',
                          wordBreak: 'break-word',

                          width: '100%',
                          height: '100%',
                          // border: '1px solid red',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: '8px',
                            // height: '100%',
                            // border: '1px solid red',
                          }}
                        >
                          <AutoRefreshedJobMuiAva job={itemData.originalJob as TJob} delay={1000} />
                          <b className={baseClasses.rowsLimited3}>{itemData.originalJob.title}</b>
                          {
                            !!itemData.originalJob.forecast.assignedTo && (
                              <span
                                style={{ marginLeft: 'auto', fontSize: '16px' }}
                              >
                                <UserAva name={getUserById(itemData.originalJob.forecast.assignedTo)} size={40} />
                                {/* {itemData.originalJob.forecast.assignedTo} */}
                              </span>
                            )
                          }
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: '8px',
                            // height: '100%',
                            // border: '1px solid red',
                            marginTop: 'auto',
                          }}
                        >
                          {
                            !!itemData.originalJob.descr && (
                              <span
                                // style={{ border: '1px solid red' }}
                                className={baseClasses.rowsLimited1}
                              >
                                {itemData.originalJob.descr}
                              </span>
                            )
                          }
                          <a
                            style={{
                              // border: '1px solid red',
                              wordBreak: 'keep-all',
                              display: 'inline-flex',
                              flexDirection: 'row',

                              marginLeft: 'auto',

                              alignItems: 'center',
                              gap: '8px',
                              cursor: 'pointer',
                            }}
                            onClick={onNavigateToJobNode({
                              jobId: itemData.originalJob.id,
                              backToJobId: projectsTree.model.id,
                              jobTitle: projectsTree.model.title,
                              dontActualizeSubjob: true,
                            })}
                          >
                            <span>Go</span>
                            <ArrowDownwardIcon sx={{ fontSize: 'inherit' }} />
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                  getItemKey={(item) => String(item.originalJob.id)}
                />
              )
            }
          </div>
        )
      }
      {/*
        !!projectsTree.model._service && (
          <pre className={baseClasses.preNormalized} style={{ fontSize: 'x-small', borderRadius: 0 }}>
            {JSON.stringify({
              // _service: projectsTree.model._service,
              relations: projectsTree.model.relations,
            }, null, 2)}
          </pre>
        )
      */}
      {
        projectsTree.children.length > 0 && (
          <>
            {
              projectsTree.children.map((child) => (
                <div style={{ paddingLeft: '0px' }} key={child.model.id}>
                  <ProjectNode
                    onScrollToStats={onScrollToStats}
                    onNavigateToJobNode={onNavigateToJobNode}
                    onNavigateToChecklistClick={onNavigateToChecklistClick}
                    projectsTree={child}
                    activeJobId={activeJobId}
                    // currentJobId={child.model.id}
                    activeJobName={activeJobName}
                    level={level + 1}
                  />
                </div>
              ))
            }
          </>
        )
      }
    </div >
  )
}
