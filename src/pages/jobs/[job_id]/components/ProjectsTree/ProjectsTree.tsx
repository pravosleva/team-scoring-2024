/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { memo, useState, useMemo, useEffect, useCallback } from 'react'
import { useProjectsTreeCalcWorker } from './hooks/useProjectsTreeCalcWorker'
import { groupLog } from '~/shared/utils'
import { TJob, TopLevelContext } from '~/shared/xstate'
import { Alert, Grid2 as Grid } from '@mui/material'
import { TreeNode } from 'ts-tree-lib'
import CircularProgress from '@mui/material/CircularProgress'
import { ProjectNode, FixedBackToNodeBtn } from './components'
import { TEnchancedJobByWorker } from './types'
import { scrollToIdFactory, blinkNodeIdFactory } from '~/shared/utils/web-api-ops'
import { CSSProperties } from '@mui/material/styles/createMixins'
import { getMatchedByAnyString } from '~/shared/utils/string-ops'
import { getIsNumeric } from '~/shared/utils/number-ops'

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
  timeout: 250,
  offsetTop: 16,
  elementHeightCritery: 550,
})
const specialScrollForSubjobCard = scrollToIdFactory({
  timeout: 0,
  offsetTop: 16,
  elementHeightCritery: 550,
})
const blinkNode = blinkNodeIdFactory({
  timeout: 1500,
  cb: {
    onStart: ({ targetElm }) => {
      const firstChildElm = targetElm.children[0]
      const state: {
        target: {
          oldCSS: Pick<CSSProperties, 'borderColor' | 'backgroundColor'>;
          tmpCSS: Pick<CSSProperties, 'borderColor' | 'backgroundColor'>;
        };
      } = {
        target: {
          oldCSS: {
            borderColor: targetElm.style.borderColor,
            // backgroundColor: targetElm.style.backgroundColor,
          },
          tmpCSS: {
            // borderColor: '#1565c0', // blue
            borderColor: '#02c39a', // green
            // backgroundColor: '#c9fce9',
          },
        },
      }
      for (const prop in state.target.tmpCSS) {
        // @ts-ignore
        targetElm.style[prop] = state.target.tmpCSS[prop]
      }

      // NOTE: 1/2 Exp
      const elms: HTMLCollectionOf<Element> = document.getElementsByClassName('node-blinker-disablable')
      const switcher = {
        on: () => {
          for (let i = 0, max = elms.length; i < max; i++) {
            const elm = elms.item(i)
            // @ts-ignore
            elm.style.visibility = 'hidden'
          }
        },
        off: () => {
          for (let i = 0, max = elms.length; i < max; i++) {
            const elm = elms.item(i)
            // @ts-ignore
            elm.style.visibility = 'visible'
          }
        }
      }
      switcher.on()

      return { state, cb: switcher.off, firstChildElm }
    },
    onEnd: ({ targetElm, specialData }) => {
      const { state, cb } = specialData

      // @ts-ignore
      for (const prop in state.target.oldCSS) targetElm.style[prop] = state.target.oldCSS[prop]

      // NOTE: 2/2 Exp
      cb()
    },
    onError: console.warn,
  },
})

export const ProjectsTree = memo(({ jobId, isDebugEnabled }: TProject) => {
  const jobs = TopLevelContext.useSelector((s) => s.context.jobs.items)
  const targetJob = useMemo<TJob | undefined>(
    () => !!jobId ? jobs.find(({ id }) => id === jobId) : undefined,
    [jobs, jobId]
  )
  const [calc, setCalc] = useState<TreeNode<TEnchancedJobByWorker> | null>(null)
  const isContentReady = !!calc
  const [calcErrMsg, setCalcErrMsg] = useState<string | null>(null)
  // const [calcDebugMsg, setCalcDebugMsg] = useState<string | null>(null)
  useEffect(() => {
    if (!!isContentReady) {
      specialScroll({
        id: `job_node_${jobId}`,
        _cfg: _specialNavigate,
      })
      // blinkNode({ id: `job_node_${jobId}` })
    }
  }, [jobId, isContentReady])

  useProjectsTreeCalcWorker({
    isEnabled: true,
    isDebugEnabled: false,
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

          // @ts-ignore
          setCalc(data.originalResponse)
          // if (!!data.message) setCalcDebugMsg(data.message)
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

  const [backToActiveJob, setBackToActiveJob] = useState<{ jobId: number; jobTitle?: string } | null>(null)

  const handleNavigateToChecklistClick = useCallback(({ checklistUniqueKey, jobId, jobTitle }: {
    checklistUniqueKey: string;
    jobId: number;
    jobTitle?: string;
  }) => (e: any) => {
    if (!!e?.preventDefault) e.preventDefault()
    specialScroll({ id: checklistUniqueKey })
    setBackToActiveJob({ jobId, jobTitle })
  }, [])
  const handleNavigateToActiveNode = useCallback(() => {
    specialScroll({
      id: `job_node_${backToActiveJob?.jobId}`,
      _cfg: _specialNavigate,
    })
    blinkNode({ id: `job_node_${backToActiveJob?.jobId}` })
    setBackToActiveJob(null)
  }, [backToActiveJob?.jobId])
  const handleNavigateToJobNode = useCallback(({ jobId, backToJobId, jobTitle, dontActualizeSubjob }: {
    jobId: number;
    backToJobId?: number;
    jobTitle?: string;
    dontActualizeSubjob?: boolean;
  }) => (e: any) => {
    if (!!e?.preventDefault) e.preventDefault()
    if (!dontActualizeSubjob) specialScrollForSubjobCard({
      id: `subjob-card_${jobId}`,
    })
    specialScroll({
      id: `job_node_${jobId}`,
      _cfg: _specialNavigate,
    })
    if (!!backToJobId) {
      setBackToActiveJob({ jobId: backToJobId, jobTitle })
    }
    blinkNode({ id: `job_node_${jobId}` })
  }, [])
  useEffect(() => {
    setBackToActiveJob(null)
  }, [jobId])
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleScrollToStats = useCallback((ps: {
    jobId: number;
  }) => (e: any) => {
    if (!!e?.preventDefault) e.preventDefault()
    specialScroll({
      id: 'job-stats',
      // _cfg: _specialNavigate,
    })
  }, [])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        width: '100%',
      }}
    >
      {/* !!calc && <pre className={baseClasses.preNormalized}>{JSON.stringify(calc, null, 2)}</pre> */}

      {/*
        !!calcDebugMsg && (
          <Alert
            severity='info'
            variant='outlined'
          >
            {calcDebugMsg}
          </Alert>
        )
      */}

      <FixedBackToNodeBtn
        onClick={handleNavigateToActiveNode}
        isRequired={!!backToActiveJob}
        label={backToActiveJob?.jobTitle}
      />

      {
        !!calc ? (
          <ProjectNode
            projectsTree={calc}
            activeJobId={jobId}
            activeJobName={targetJob?.title}
            level={1}
            onNavigateToChecklistClick={handleNavigateToChecklistClick}
            onNavigateToJobNode={handleNavigateToJobNode}
            onScrollToStats={handleScrollToStats}
          />
        ) : (
          <Grid size={12} sx={{ widht: '100%', display: 'flex', justifyContent: 'center', padding: 6 }}>
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
