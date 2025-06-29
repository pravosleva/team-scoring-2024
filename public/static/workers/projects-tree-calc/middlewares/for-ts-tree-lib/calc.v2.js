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

            const getNodeData = (job) => ({
              model: {
                id: job.id,
                title: job.title,
                ts: job.ts,
                descr: job.descr,
                completed: job.completed,
                logs: job.logs,
              },
              children: []
            })
            const getTreePartById = (currentJob, existingChild) => {
              let node = getNodeData(currentJob)
              let existingChildId = existingChild?.model.id || 0;

              // Добавляем существующего ребёнка
              if (existingChildId !== 0) {
                node.children.push(existingChild)
              }

              const findJobById = (id) => {
                for (const job of input.jobs) {
                  if (job.id === id) return (job)
                }
              }

              const addAllChildrenToTheNode = (currentJob, node, existingChildId = 0) => {
                // Добавляем всех детей
                if (!!currentJob.relations?.children && currentJob.relations.children.length > 0) {
                  for (const childId of currentJob.relations.children) {
                    let job = findJobById(childId)
                    if (job.id != existingChildId) {
                      let childNode = getNodeData(job)
                      node.children.push(childNode)
                      addAllChildrenToTheNode(job, childNode)
                    }
                  }
                  node.children.sort((a, b) => { return (b.model.ts.update - a.model.ts.update) })
                }
              }

              addAllChildrenToTheNode(currentJob, node, existingChildId)

              // Выполняем процедуру для родителя
              if (!!currentJob.relations?.parent) {
                // Находим элемент родителя в массиве jobs
                let job = findJobById(currentJob.relations.parent)
                if (job.id === currentJob.relations.parent) {
                  return (getTreePartById(job, node))
                }
              }

              return (node);
            }

            const calc = getTreePartById(input.job);
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