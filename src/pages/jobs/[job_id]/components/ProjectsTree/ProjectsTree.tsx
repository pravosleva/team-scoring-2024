import { memo, useState, useMemo } from 'react'
import { useProjectsTreeCalcWorker } from './hooks/useProjectsTreeCalcWorker'
import { groupLog } from '~/shared/utils'
import { TJob, TopLevelContext } from '~/shared/xstate'
// import baseClasses from '~/App.module.scss'
import { Alert, Grid2 as Grid } from '@mui/material'
import { TreeNode } from 'ts-tree-lib'
import CircularProgress from '@mui/material/CircularProgress'
import { ProjectNode } from './components'

export type TProject = {
  jobId: number;
  isDebugEnabled?: boolean;
}

// NOTE: See also https://github.com/tfrazzet/ts-tree-lib
/*
const treeData = {
  model: { id: 1, name: 'root', data: { value: 10 } },
  children: [
    { model: { id: 2, name: 'child1', data: { value: 20 } }, children: [] },
    {
      model: { id: 3, name: 'child2', data: { value: 30 } }, children: [
        { model: { id: 4, name: 'child3', data: { value: 40 } }, children: [] },
        {
          model: { id: 5, name: 'child4', data: { value: 50 } }, children: [
            { model: { id: 6, name: 'child5', data: { value: 60 } }, children: [] },
            { model: { id: 7, name: 'child6', data: { value: 70 } }, children: [] },
          ]
        },
      ]
    },
  ],
};

// Create a new Tree instance
const tree = new Tree<any>(treeData);

// Log tree structure
console.log("Tree :>> ", tree);
*/

// type TProjectsTreeNodeModel = TJob
// type TProjectsTree = {
//   model: TProjectsTreeModel;
//   children: TProjectsTreeModel[];
// }

export const ProjectsTree = memo(({ jobId, isDebugEnabled }: TProject) => {
  const jobs = TopLevelContext.useSelector((s) => s.context.jobs.items)
  const targetJob = useMemo<TJob | undefined>(
    () => !!jobId ? jobs.find(({ id }) => id === jobId) : undefined,
    [jobs, jobId]
  )

  const [calc, setCalc] = useState<TreeNode<TJob> | null>(null)
  const [calcErrMsg, setCalcErrMsg] = useState<string | null>(null)

  useProjectsTreeCalcWorker({
    isEnabled: true,
    isDebugEnabled: true,
    cb: {
      onEachSuccessItemData: (data) => {
        if (isDebugEnabled)
          groupLog({
            namespace: '[debug] useProjectsTreeCalcWorker:onEachNewsItemData -> data',
            items: [
              data
            ],
          })
        if (!!data.originalResponse) {
          setCalcErrMsg(null)
          setCalc(data.originalResponse)
        }
      },
      onFinalError: ({ id, reason }) => {
        if (isDebugEnabled)
          groupLog({
            namespace: '[debug] useProjectsTreeCalcWorker:onFinalError -> id, reason',
            items: [
              id,
              reason
            ],
          })
        setCalcErrMsg(reason)
      },
    },
    deps: {
      job: targetJob,
      jobs,
    },
  })
  return (
    <div
      style={{
        // border: '2px dashed red',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        // padding: '8px',
        // borderRadius: '16px',
        width: '100%',
      }}
    >
      {/* !!calc && <pre className={baseClasses.preNormalized}>{JSON.stringify(calc, null, 2)}</pre> */}

      {
        !!calc ? (
          <ProjectNode
            projectsTree={calc}
            currentJobId={jobId}
            currentJobName={targetJob?.title}
          />
        ) : (
          <Grid size={12} sx={{ widht: '100%', display: 'flex', justifyContent: 'center', padding: 2 }}>
            <CircularProgress />
          </Grid>
        )
      }

      {!!calcErrMsg && (
        <Alert
          severity='error'
          variant='filled'
        >
          {calcErrMsg}
        </Alert>
      )}
    </div>
  )
})
