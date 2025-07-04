console.log('[LOADED] projects-tree-calc/middlewares/for-ts-tree-lib/calc')

// NOTE: See also https://github.com/tfrazzet/ts-tree-lib
/*
const treeData = {
  model: { id: 1, name: 'root', data: { value: 10 } },

  children: [
    { 
     model: { id: 2, name: 'child1', data: { value: 20 } }, 
     children: [] 
     },
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
            if (debugConfig.workerEvs.mwsInternalLogs.isEnabled) log({
              label: '[MW] ⭐ projects-tree-calc/middlewares/for-ts-tree-lib/calc',
              msgs: [
                input.job.id,
                input.jobs,
              ],
            })

            // -- NOTE: TARGET CALC SRC
            const _jobsMap = new Map()
            for (const job of input.jobs) _jobsMap.set(job.id, job)

            let _c = 0

            const getTreePartById = ({ currentJobData, existingChild }) => {
              const getNodeDataStandart = (job) => {
                return {
                  model: {
                    id: job.id,
                    title: job.title,
                    ts: job.ts,
                    descr: job.descr,
                    completed: job.completed,
                    logs: job.logs,
                    relations: job.relations,
                    _service: {
                      recursionCounter: ++_c,
                      logs: ['Node created'],
                    },
                  },
                  children: []
                }
              }
              const node = getNodeDataStandart(currentJobData)
              const hasExistingChild = !!existingChild

              // Добавляем существующего ребёнка
              if (hasExistingChild) node.children.push(existingChild)

              const findJobById = (id) => _jobsMap.get(id)

              const addAllChildrenToTheNode = (currentJobData, node, existingChildId) => {
                // Добавляем всех детей
                if (Array.isArray(currentJobData.relations?.children) && currentJobData.relations.children.length > 0) {
                  for (const childId of currentJobData.relations.children) {
                    const childData = findJobById(childId)
                    if (!childData) {
                      throw new Error(`childData with id=${childId} не существует`)
                    }
                    const subChildNode = getNodeDataStandart(childData)
                    if (!!existingChildId && childData.id !== existingChildId) {
                      node.children.push(subChildNode)
                      node.model._service.logs.unshift(`Child ${subChildNode.model.id} ADDED`)
                      addAllChildrenToTheNode(childData, subChildNode)
                    } else {
                      node.model._service.logs.unshift(`Child ${subChildNode.model.id} IGNORED`)
                    }
                  }
                  node.children = node.children.sort((a, b) => b.model.ts.update - a.model.ts.update)
                } else {
                  node.model._service.logs.unshift('Children is not added')
                }
              }
              addAllChildrenToTheNode(currentJobData, node, existingChild?.model.id)

              // Выполняем процедуру для родителя
              if (!!currentJobData.relations?.parent) {
                // Находим элемент родителя в массиве jobs
                const parentJob = findJobById(currentJobData.relations.parent)
                if (!parentJob) {
                  throw new Error(`parentJob with id=${currentJobData.relations.parent} не существует`)
                }
                if (parentJob.id === currentJobData.relations.parent) {
                  return getTreePartById({ currentJobData: parentJob, existingChild: node })
                }
              }

              return node;
            }

            const calc = getTreePartById({ currentJobData: { ...input.job } });
            // --

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
            setTimeout(() => {
              cb[eventData.input.opsEventType]({
                output,
                input,
                // _service,
              })
            }, 1000)
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
