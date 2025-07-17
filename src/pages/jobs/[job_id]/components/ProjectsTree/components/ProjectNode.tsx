/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react'
import { TreeNode } from 'ts-tree-lib'
import classes from './ProjectNode.module.scss'
import { Link } from 'react-router-dom'
import clsx from 'clsx'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
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
import { TJob } from '~/shared/xstate'
import { getFullUrl } from '~/shared/utils/string-ops'
import { useParamsInspectorContextStore } from '~/shared/xstate/topLevelMachine/v2/context/ParamsInspectorContext'
import { CollapsibleText } from '~/pages/jobs/[job_id]/components/ProjectsTree/components/CollapsibleText'
import StarBorderIcon from '@mui/icons-material/StarBorder'
import StarIcon from '@mui/icons-material/Star'
import { JobResultReviewShort } from '../../JobResultReviewShort'

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
  }) => (e: any) => void
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
}: TProps) => {
  const [isLastActivityOpened, setIsLastActivityOpened] = useState(false)
  const toggleLastActivity = () => setIsLastActivityOpened((s) => !s)
  const [queryParams] = useParamsInspectorContextStore((ctx) => ctx.queryParams)
  const isActiveNode = activeJobId === projectsTree.model.id
  const isCompleted = projectsTree.model.completed

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
            className={clsx(classes.stickyTop)}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
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
                  query: { ...queryParams },
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
                    style={{ fontSize: 'x-small', fontWeight: 'bold', color: 'lightgray', cursor: 'pointer' }}
                    onClick={onNavigateToJobNode({
                      jobId: projectsTree.model.relations?.parent,
                      // backToJobId: projectsTree.model.id,
                      // jobTitle: projectsTree.model.title,
                    })}
                  >[ parent ]
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
            className={clsx(classes.stickyTop)}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '8px',
              }}
              className={baseClasses.truncate}
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
                        // transform: 'rotate(7deg)',
                        // zIndex: 50 - level + 1,
                      }}
                      onClick={onNavigateToJobNode({
                        fromLevel: level,
                        jobId: projectsTree.model.relations?.parent,
                        // backToJobId: projectsTree.model.id,
                        // jobTitle: projectsTree.model.title,
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

      <CollapsibleText
        briefText='Details'
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

          </>
        )}
      />

      {
        projectsTree.model.logs.items.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              wordBreak: 'break-word',
              fontSize: 'small',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              {
                activeJobId === projectsTree.model.id
                  ? (
                    <Link
                      className={clsx(
                        classes.lastActivityOfCurrentJobLink,
                        baseClasses.underlineSolid,
                        baseClasses.truncate,
                      )}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                      to={
                        [
                          '/last-activity',
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
                      <span className={baseClasses.truncate}>Last activity {dayjs(projectsTree.model.logs.items[0].ts).format('DD.MM.YYYY HH:mm')}</span>
                      <ArrowForwardIcon sx={{ fontSize: '12px' }} />
                    </Link>
                  ) : (
                    <b className={baseClasses.underlineDashed} style={{ fontSize: 'small' }}>Last activity {dayjs(projectsTree.model.ts.update).format('DD.MM.YYYY HH:mm')}</b>
                  )
              }
              <code
                className={baseClasses.noBreakWords}
                style={{ fontSize: 'x-small', fontWeight: 'bold', cursor: 'pointer' }}
                onClick={toggleLastActivity}
              >{isLastActivityOpened ? '[ close ]' : '[ open ]'}
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
                  {
                    projectsTree.model._service.aboutJob.existingChildrenNodes.nodesInfo.length > 0 && (
                      <>
                        <b>Subjobs ({projectsTree.model._service.aboutJob.existingChildrenNodes.nodesInfo.reduce((acc, { originalJob }) => { if (originalJob.completed) acc += 1; return acc }, 0)} of {projectsTree.model._service.aboutJob.existingChildrenNodes.nodesInfo.length})</b>
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
                                      <span style={{ paddingTop: '2px', marginLeft: 'auto' }}>
                                        <ArrowDownwardIcon sx={{ fontSize: 'inherit' }} />
                                      </span>
                                    </a>
                                  </li>
                                )
                              }
                              )
                          }
                        </ul>
                      </>
                    )
                  }
                  {
                    projectsTree.model._service.aboutJob.existingChecklists.length > 0 && (
                      <>
                        <b>Checklists ({projectsTree.model._service.aboutJob.existingChecklists.length}) | Completed {getArithmeticalMean(projectsTree.model._service.aboutJob.existingChecklists.map(({ completePercentage }) => completePercentage)).toFixed(0)}%</b>
                        <ul className={baseClasses.compactList}>
                          {
                            projectsTree.model._service.aboutJob.existingChecklists
                              .map(({ uniqueChecklistKey, logTs, completePercentage }) => (
                                <li key={uniqueChecklistKey}>
                                  <span
                                    style={{
                                      // whiteSpace: 'pre-wrap',
                                      fontSize: 'small',
                                      fontWeight: 'bold',
                                      // paddingTop: '3px',
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
                                            <span>Checklist created at {dayjs(logTs).format('DD.MM.YYYY')}</span>
                                            <ArrowDownwardIcon sx={{ fontSize: '12px' }} />
                                          </a>
                                        ) : (
                                          <span style={{ fontSize: 'small' }}>Checklist created at {dayjs(logTs).format('DD.MM.YYYY')}</span>
                                        )
                                    }
                                    <b style={{ color: completePercentage === 0 ? 'red' : completePercentage < 100 ? 'black' : 'lightgray' }}>{completePercentage.toFixed(0)}%</b>
                                  </span>
                                </li>
                              ))
                          }
                        </ul>
                      </>
                    )
                  }
                </>
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
    </div>
  )
}
