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

importScripts('./middlewares/for-ts-tree-lib/utils/getPercentage.js')

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

            // console.log(Object.fromEntries(_jobsMap))

            let _c = 0
            const getTreePartById = ({ currentJobData }) => {
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
                    forecast: job.forecast,
                    _service: {
                      aboutJob: {
                        existingChildrenNodes: {
                          nodesInfo: !!job.relations?.children
                            ? job.relations?.children
                              .map((id) => ({
                                originalJob: {
                                  id,
                                  title: _jobsMap.get(id)?.title,
                                  completed: _jobsMap.get(id)?.completed,
                                  forecast: _jobsMap.get(id)?.forecast,
                                },
                                nodeId: `job_node_${id}`
                              })) || []
                            : []
                        },
                        existingChecklists: job.logs.items.reduce((acc, cur) => {
                          if (cur.checklist?.length > 0) {
                            acc.push({
                              uniqueChecklistKey: `job-${job.id}-log-${cur.ts}-checklist`,
                              jobId: job.id,
                              logTs: cur.ts,
                              completePercentage: getPercentage({
                                x: cur.checklist
                                  .reduce((acc, cur) => {
                                    if (cur.isDone || cur.isDisabled) acc += 1
                                    return acc
                                  }, 0),
                                sum: cur.checklist.length,
                              }),
                            })
                          }

                          return acc
                        }, [])
                      },
                      recursionCounter: ++_c,
                      logs: ['Node created'],
                    },
                  },
                  children: !!job.relations.children
                    ? job.relations?.children
                      .map((id) => getNodeDataStandart(_jobsMap.get(id)))
                      .sort((a, b) => b.model.ts.update - a.model.ts.update)
                    : []
                }
              }
              switch (true) {
                case !!currentJobData.relations?.parent:
                  // Выполняем процедуру для родителя
                  // Находим элемент родителя в массиве jobs
                  const parentJob = _jobsMap.get(currentJobData.relations.parent)
                  if (!parentJob)
                    throw new Error(`parentJob with id=${currentJobData.relations.parent} не существует`)
                  if (parentJob.id === currentJobData.relations.parent)
                    return getTreePartById({ currentJobData: parentJob })
                default:
                  return getNodeDataStandart(currentJobData)
              }
            }
            const calc = getTreePartById({ currentJobData: { ...input.job } });
            // --

            output.ok = true
            output.message = [
              'Calculated',
              `getNodeDataStandart called ${_c} times`
            ].join('; ')
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
            // setTimeout(() => {
            cb[eventData.input.opsEventType]({
              output,
              input,
              // _service,
            })
            // }, 1000)
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
