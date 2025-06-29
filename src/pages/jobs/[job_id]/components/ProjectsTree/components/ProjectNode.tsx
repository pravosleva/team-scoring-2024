import { TJob } from '~/shared/xstate'
import { TreeNode } from 'ts-tree-lib'
import classes from './ProjectNode.module.scss'
import { Link } from 'react-router-dom'
import clsx from 'clsx'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
// import ArrowBack from '@mui/icons-material/ArrowBack'
// import ConstructionIcon from '@mui/icons-material/Construction'
import dayjs from 'dayjs'

type TProps = {
  projectsTree: TreeNode<TJob>;
  currentJobId?: number;
  currentJobName?: string;
}

export const ProjectNode = ({
  projectsTree,
  currentJobId,
  currentJobName,
}: TProps) => {
  return (
    <div
      // id={!!currentJobId ? `job_list_item_${currentJobId}` : undefined}
      className={clsx(classes.wrapper, {
        [classes.isActive]: currentJobId === projectsTree.model.id,
        [classes.isCompleted]: projectsTree.model.completed,
      })}
    >
      {/* !!currentJobId && <b style={{ color: 'red' }}>{currentJobId}</b> */}
      {/* <b>{projectsTree.model.id}</b> */}
      {
        currentJobId === projectsTree.model.id
          ? (
            <b style={{ fontSize: 'small' }}>{projectsTree.model.title}</b>
          ) : (
            <Link
              // style={{
              //   display: 'inline-flex',
              //   alignItems: 'flex-start',
              //   gap: '6px',
              // }}
              to={
                [
                  '/jobs',
                  `/${projectsTree.model.id}`,
                  // !!currentJobId
                  //   ? `?from=${encodeURIComponent(`/jobs/${currentJobId}`)}${!!currentJobName ? `&backActionUiText=${currentJobName}` : ''}`
                  //   : '',
                ].join('')
              }
            >
              {projectsTree.model.title}
            </Link>
          )
      }
      {
        !!projectsTree.model.descr && (
          <em style={{ color: 'gray', fontSize: 'small' }}>{projectsTree.model.descr}</em>
        )
      }
      {
        projectsTree.model.logs.items.length > 0 && (
          <>
            {
              currentJobId === projectsTree.model.id
                ? (
                  <Link
                    style={{
                      textDecoration: 'underline dashed',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                    to={
                      [
                        '/last-activity',
                        // !!currentJobId
                        //   ? `?from=${encodeURIComponent(`/jobs/${currentJobId}`)}${!!currentJobName ? `&backActionUiText=${currentJobName}` : ''}`
                        //   : '',
                        [
                          '?',
                          [
                            `lastSeenLogKey=job-${currentJobId}-log-${projectsTree.model.logs.items[0].ts}`,
                            `lastSeenJob=${currentJobId}`,
                            !!currentJobName
                              ? [
                                `from=${encodeURIComponent(
                                  [
                                    `/jobs/${currentJobId}`,
                                    // '?',
                                    // `from=${!!currentJobName ? `backActionUiText=${currentJobName}` : ''}`
                                  ].join('')
                                )}`,
                                !!currentJobName ? `backActionUiText=${currentJobName}` : '',
                              ].join('&')
                              : '',
                          ].join('&')
                        ].join('')
                      ].join('')
                    }
                  >
                    <span>Last activity {dayjs(projectsTree.model.ts.update).format('DD.MM.YYYY HH:mm')}</span>
                    <ArrowForwardIcon sx={{ fontSize: '12px' }} />
                  </Link>
                ) : (
                  <b style={{ fontSize: 'small', color: 'gray' }}>Last activity {dayjs(projectsTree.model.ts.update).format('DD.MM.YYYY HH:mm')}</b>
                )
            }
            <span style={{ color: 'gray', fontSize: 'small' }}>
              {projectsTree.model.logs.items[0].text}
            </span>
          </>
        )
      }
      {
        projectsTree.children.length > 0 && (
          <>
            {
              projectsTree.children.map((child) => (
                <div style={{ paddingLeft: '0px' }} key={child.model.id}>
                  <ProjectNode
                    projectsTree={child}
                    currentJobId={currentJobId}
                    currentJobName={currentJobName}
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
