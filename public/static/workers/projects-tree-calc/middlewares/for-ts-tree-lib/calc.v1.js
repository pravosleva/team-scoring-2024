console.log('[LOADED] projects-tree-calc/middlewares/for-ts-tree-lib/calc')

// NOTE: See also https://github.com/tfrazzet/ts-tree-lib
/*
const treeData = {
  model: { id: 1, name: 'root', data: { value: 10 } },
  children: [
    { model: { id: 2, name: 'child1', data: { value: 20 } }, children: [] },
    { model: { id: 3, name: 'child2', data: { value: 30} }, children: [
        { model: { id: 4, name: 'child3', data: { value: 40 } }, children: [] },
        { model: { id: 5, name: 'child4', data: { value: 50 } }, children: [
            { model: { id: 6, name: 'child5', data: { value: 60 } }, children: [] },
            { model: { id: 7, name: 'child6', data: { value: 70 } }, children: [] },
        ] },
    ] },
  ],
};
*/

const withTsTreeLibCalcService = async ({ eventData, cb }) => {
  const { __eType, input } = eventData

  if (debugConfig.workerEvs.mwsInternalLogs.isEnabled) log({
    label: '[MW] projects-tree-calc/middlewares/for-ts-tree-lib/calc',
    msgs: [
      'eventData:',
      eventData,
    ],
  })

  switch (__eType) {
    case NES.Common.WorkerService.CLIENT_TO_WORKER_MESSAGE: {
      if (debugConfig.workerEvs.mwsInternalLogs.isEnabled) log({
        label: '[MW] projects-tree-calc/middlewares/for-ts-tree-lib/calc CLIENT_TO_WORKER_MESSAGE',
        msgs: [
          'eventData:',
          eventData,
        ],
      })

      // -- NOTE: Level 2: Different app event types
      switch (eventData?.input.opsEventType) {
        case NES.Common.ClientService.ProjectsTreeCalc.EClientToWorkerEvent.GET_PROJECTS_TREE_CALC: {
          if (debugConfig.workerEvs.mwsInternalLogs.isEnabled) log({
            label: '[MW] projects-tree-calc/middlewares/for-ts-tree-lib/calc GET_PROJECTS_TREE_CALC',
            msgs: [
              'eventData:',
              eventData,
            ],
          })

          const output = {
            ok: false,
            message: 'Output data not modified',
          }

          try {
            let _topParentJobId = null
            const _relationsMap = new Map()
            for (const job of input.jobs) {
              _relationsMap.set(
                job.id,
                {
                  relations: job.relations,
                  targetData: {
                    id: job.id,
                    relations: job.relations,
                    title: job.title,
                  },
                }
              )
            }
            let _c = 0
            const getModelDataRecursive = (id) => {
              return {
                model: _relationsMap.get(id)?.targetData,
                children: _relationsMap.get(id)?.relations?.children?.map(getModelDataRecursive),
                _service: `recursive exp ${++_c}`,
              }
            }
            
            const targetJob = getModelDataRecursive(input.job.id)
            let initialTreeState = {
              model: targetJob.targetData,
              children: Array.isArray(input.job.relations?.children)
                ? input.job.relations.children.map(getModelDataRecursive)
                : [],
              _service: {
                _message: 'initial object for the Job',
              },
            }

            const calc = input.jobs.reduce((acc, cur) => {
              // -- NOTE: Нас интересует { id number; relations: { children: number[]; parent: number } }
              // const originalData = {
              //   parent: cur.relations?.parent,
              //   hasParent: !!cur.relations?.parent,
              //   isTopParent: cur.id === _topParentJobId,
              //   isChildOfTopParent: cur.relations?.parent === _topParentJobId,
              //   children: cur.relations?.children,
              // }
              const isParentOfTopParent = Array.isArray(cur.relations?.children)
                && cur.relations?.children.includes(_topParentJobId)

              if (!_topParentJobId) {
                // console.log('- first case')
                const jobData = _relationsMap.get(cur.id)
                _topParentJobId = cur.id
                acc.model = jobData.targetData
                acc.children = Array.isArray(jobData.relations?.children)
                  ? jobData.relations.children.map(getModelDataRecursive)
                  : []
              }

              switch (true) {
                case isParentOfTopParent:
                  // console.log('- target case')
                  acc.model = _relationsMap.get(cur.id).targetData
                  acc.children = Array.isArray(cur.relations?.children)
                    ? cur.relations.children.map(getModelDataRecursive)
                    : [],
                  _topParentJobId = cur.id
                  break
                default:
                  break
              }
              // --
              return acc
            }, initialTreeState)

            // calc._service._relationsMap = Object.fromEntries(_relationsMap)

            output.ok = true
            output.message = 'Calculated'
            output.originalResponse = calc

            if (typeof cb[eventData?.input?.opsEventType] === 'function') {
              // console.log(eventData?.input?.opsEventType) // NOTE: c-w:news:get-items
              if (debugConfig.workerEvs.mwsInternalLogs.isEnabled) log({
                label: '[MW] ✅ projects-tree-calc/middlewares/for-ts-tree-lib/calc',
                msgs: [
                  `CODE: c->(worker):port:listener:opsEventType:${eventData?.input?.opsEventType}->[cb]`,
                  'input', input, 'output', output,
                ],
              })
            }
          } catch (err) {
            if (debugConfig.workerEvs.mwsInternalLogs.isEnabled) log({
              label: '[MW] ⛔ projects-tree-calc/middlewares/for-ts-tree-lib/calc',
              msgs: [
                `CODE: c->(worker):port:listener:opsEventType:${eventData?.input?.opsEventType}->[cb]`,
                'input', input, 'err', err,
              ],
            })
            output.ok = false
            output.message = `Worker error: ${err?.message || 'No message'}; projects-tree-calc/middlewares/for-ts-tree-lib/calc`
          } finally {
            cb[eventData.input.opsEventType]({
              output,
              input,
              // _service,
            })
          }

          break
        }
        default:
          if (debugConfig.workerEvs.mwsInternalLogs.isEnabled) log({
            label: '[MW] ⚠️ projects-tree-calc/middlewares/for-ts-tree-lib/calc DEFAULT CASE',
            msgs: [
              'eventData?.input.opsEventType',
              `\tEXPECTED: ${NES.Common.ClientService.ProjectsTreeCalc.EClientToWorkerEvent.GET_PROJECTS_TREE_CALC}`,
              `\tRECEIVED: ${eventData?.input.opsEventType}`,
              `__eType: ${__eType}`,
              'eventData?.input.opsEventType',
              eventData?.input?.opsEventType
            ],
          })  
          break
      }
      // --

      break
    }
    default:
      if (debugConfig.workerEvs.mwsInternalLogs.isEnabled) log({
        label: `[DBG] UNKNOWN CASE! Проверте __eType! c->(worker):port:listener:opsEventType:${eventData?.input?.opsEventType}->[switch (__eType)]`,
        msgs: [
          `__eType: ${__eType}`,
          'eventData?.input.opsEventType',
          eventData?.input?.opsEventType
        ],
      })
      break
  }
}