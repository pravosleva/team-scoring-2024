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
import dayjs from 'dayjs'
import baseClasses from '~/App.module.scss'
import { TEnchancedJobByWorker } from '~/pages/jobs/[job_id]/components/ProjectsTree/types'
import { getArithmeticalMean } from '~/shared/utils/number-ops'

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
  }) => (e: any) => void
}

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

  return (
    <div
      id={`job_node_${projectsTree.model.id}`}
      className={
        clsx(
          classes.wrapper,
          classes[`borderRadiusLevel${level}`],
          {
            [classes.isActive]: activeJobId === projectsTree.model.id,
            [classes.isCompleted]: projectsTree.model.completed,
            [classes.isntCompleted]: !projectsTree.model.completed && !(activeJobId === projectsTree.model.id),
          }
        )
      }
    >
      {
        projectsTree.model.completed && (
          <div className={classes.absoluteTopRightBadge}>
            Done
          </div>
        )
      }

      {
        activeJobId !== projectsTree.model.id && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '16px',
            }}
            className={baseClasses.truncate}
          >
            <Link
              to={
                [
                  '/jobs',
                  `/${projectsTree.model.id}`,
                  // !!activeJobId
                  //   ? `?from=${encodeURIComponent(`/jobs/${activeJobId}`)}${!!activeJobName ? `&backActionUiText=${activeJobName}` : ''}`
                  //   : '',
                ].join('')
              }
              className={baseClasses.truncate}
            >
              {projectsTree.model.title}{projectsTree.model.relations?.children?.length > 0 ? ` (${projectsTree.model.relations?.children.length} subjobs)` : ''}
            </Link>
            {
              !!projectsTree.model.relations?.parent && (
                <code
                  className={clsx(baseClasses.noBreakWords)}
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
        )
      }
      {
        activeJobId === projectsTree.model.id && (
          <span style={{ lineHeight: 'normal' }}>
            <span
              style={{
                float: 'right',
                // border: '1px solid red',
                marginTop: '6px'
              }}>
              {
                !!projectsTree.model.relations?.parent && (
                  <code
                    className={clsx(baseClasses.noBreakWords)}
                    style={{ display: 'block', fontSize: 'x-small', fontWeight: 'bold', color: '#02c39a', cursor: 'pointer', transform: 'rotate(7deg)' }}
                    onClick={onNavigateToJobNode({
                      jobId: projectsTree.model.relations?.parent,
                      // backToJobId: projectsTree.model.id,
                      // jobTitle: projectsTree.model.title,
                    })}
                  >[ parent ]
                  </code>
                )
              }
            </span>
            <b style={{ fontSize: 'small', wordBreak: 'break-word' }}>{projectsTree.model.title}</b>
          </span>
        )
      }

      {
        !!projectsTree.model.descr && (
          <em style={{ fontSize: 'small', color: 'gray' }} className={classes.descr}>{projectsTree.model.descr}</em>
        )
      }
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
                style={{ fontSize: 'x-small', fontWeight: 'bold' }} onClick={toggleLastActivity}
              >{isLastActivityOpened ? '[ close ]' : '[ open ]'}
              </code>
            </div>
            {
              isLastActivityOpened && (
                <>
                  <span style={{ fontSize: 'small' }} className={classes.lastLog}>
                    {projectsTree.model.logs.items[0].text}
                  </span>
                  {
                    projectsTree.model._service.aboutJob.existingChildrenNodes.nodesInfo.length > 0 && (
                      <>
                        <b>Subjobs ({projectsTree.model._service.aboutJob.existingChildrenNodes.nodesInfo.reduce((acc, { originalJob }) => { if (originalJob.completed) acc += 1; return acc }, 0)} of {projectsTree.model._service.aboutJob.existingChildrenNodes.nodesInfo.length})</b>
                        <ul className={baseClasses.compactList}>
                          {
                            projectsTree.model._service.aboutJob.existingChildrenNodes.nodesInfo
                              .map(({ nodeId, originalJob }) => (
                                <li key={nodeId}>
                                  <a
                                    className={clsx(
                                      baseClasses.truncate,
                                      {
                                        [classes.lastActivityOfCurrentJobLink]: activeJobId === originalJob.id,
                                      },
                                    )}
                                    style={{
                                      fontSize: 'small',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '6px',
                                      cursor: 'pointer',
                                    }}
                                    onClick={onNavigateToJobNode({
                                      jobId: originalJob.id,
                                      backToJobId: projectsTree.model.id,
                                      jobTitle: projectsTree.model.title,
                                    })}
                                  >
                                    <span className={baseClasses.truncate}>{originalJob.completed ? '✅ ' : '⏳ '}{originalJob.title}</span>
                                    <ArrowDownwardIcon sx={{ fontSize: '12px' }} />
                                  </a>
                                </li>
                              ))
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
