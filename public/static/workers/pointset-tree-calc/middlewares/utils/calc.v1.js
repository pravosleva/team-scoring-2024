console.log('[LOADED] pointset-tree-calc/middlewares/utils/calc.v1')

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

importScripts('./middlewares/utils/math-ops/getPercentage.js')

const withTsTreeLibCalcService = async ({ eventData, cb }) => {
  const { __eType, input } = eventData

  if (debugConfig.workerEvs.mwsInternalLogs.isEnabled) log({
    label: '[MW] pointset-tree-calc/middlewares/utils/math-ops/calc.v1',
    msgs: [
      'eventData:',
      eventData,
    ],
  })

  switch (__eType) {
    case NES.Common.WorkerService.CLIENT_TO_WORKER_MESSAGE: {
      if (debugConfig.workerEvs.mwsInternalLogs.isEnabled) log({
        label: '[MW] pointset-tree-calc/middlewares/utils/math-ops/calc.v1 CLIENT_TO_WORKER_MESSAGE',
        msgs: [
          'eventData:',
          eventData,
        ],
      })

      // -- NOTE: Level 2: Different app event types
      switch (eventData?.input.opsEventType) {
        case NES.Common.ClientService.PointsetTreeCalc.EClientToWorkerEvent.GET_POINTSET_TREE_CALC: {
          if (debugConfig.workerEvs.mwsInternalLogs.isEnabled) log({
            label: '[MW] pointset-tree-calc/middlewares/utils/math-ops/calc.v1 GET_POINTSET_TREE_CALC',
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
              label: '[MW] ⭐ pointset-tree-calc/middlewares/utils/math-ops/calc.v1',
              msgs: [
                input.rootPoint.id,
                input.pointset,
                input.statusPack,
              ],
            })

            // -- NOTE: TARGET CALC SRC
            const __pointsMap = new Map()
            for (const point of input.pointset) __pointsMap.set(point.id, point)

            let _c = 0
            const getTreePartById = ({ currentPointData }) => {
              const getNodeDataStandart = (point) => {
                return {
                  model: {
                    id: point.id,
                    title: point.title,
                    ts: point.ts,
                    descr: point.descr,
                    isDone: point.isDone,
                    isDisabled: point.isDisabled,
                    statusCode: point.statusCode,
                    relations: point.relations,
                    _service: {
                      aboutPoint: {
                        existingChildrenNodes: {
                          nodesInfo: !!point.relations?.children
                            ? point.relations?.children
                              .map((id) => ({
                                originalPoint: {
                                  id,
                                  title: __pointsMap.get(id)?.title,
                                  descr: __pointsMap.get(id)?.descr,
                                  isDone: __pointsMap.get(id)?.isDone,
                                  isDisabled: __pointsMap.get(id)?.isDisabled,
                                  statusCode: __pointsMap.get(id)?.statusCode,
                                },
                                nodeId: `point_node_${id}`
                              })) || []
                            : []
                        },
                      },
                      recursionCounter: ++_c,
                      logs: ['Node created'],
                    },
                  },
                  children: !!point.relations.children
                    ? point.relations?.children
                      .map((id) => getNodeDataStandart(__pointsMap.get(id)))
                      .sort((a, b) => b.model.ts.update - a.model.ts.update)
                    : []
                }
              }
              switch (true) {
                case !!currentPointData.relations?.parent:
                  // Выполняем процедуру для родителя
                  // Находим элемент родителя в массиве jobs
                  const parentPoint = __pointsMap.get(currentPointData.relations.parent)
                  if (!parentPoint)
                    throw new Error(`parentPoint with id=${currentPointData.relations.parent} не существует`)
                  if (parentPoint.id === currentPointData.relations.parent)
                    return getTreePartById({ currentPointData: parentPoint })
                default:
                  return getNodeDataStandart(currentPointData)
              }
            }
            const calc = getTreePartById({ currentPointData: { ...input.rootPoint } });
            // --

            output.ok = true
            output.message = [
              'Calculated',
              `getNodeDataStandart called ${_c} times`
            ].join('; ')

            // -- NOTE: REPORT EXP
            const __reportExpTarget = getTreePartById({ currentPointData: { ...input.rootPoint }, noParent: true });
            const getNodeReportChunk = ({
              model, children, level, isLast, levelsInfoMap,
              getHeaderByModel, getDescriptionMessagesByModel, validateFn,
              // __onEacnIteration,
              emoji,
            }) => {
              const header = getHeaderByModel({ model })
              const mainStrChuncks = [
                !isLast
                  ? `├─ ${header.label}`
                  : `└─ ${header.label}`
              ]
              if (level > 0) {
                const fullPrefixChars = []
                let expTargetPerf = []

                for (let i = 0, max = level; i < max; i++) {
                  switch (levelsInfoMap.get(i)) {
                    case true:
                      expTargetPerf.push('   ')
                      break
                    case false:
                      expTargetPerf.push('│  ')
                      break
                    default:
                      break
                  }
                }
                fullPrefixChars.unshift(expTargetPerf.join(''))
                mainStrChuncks.unshift(fullPrefixChars.join(''))
              }

              const final = [
                mainStrChuncks.join(''),
              ]
              const counters = {
                adds: 0,
              }
              const percentage = {
                done: header.readyPercentageVals || [],
              }
              if (typeof getDescriptionMessagesByModel === 'function') {
                const adds = getDescriptionMessagesByModel({
                  model,
                  validateFn,
                  __incCounter: () => counters.adds + 1
                })
                if (adds.length > 0)
                  for (const str of adds) {
                    // final.push(['   '.repeat(level), str].join(`   • ${emoji} `))
                    if (!!emoji) final.push(['    '.repeat(level), str].join(`  ${emoji} `))
                    else final.push(['    '.repeat(level), str].join('  '))
                    counters.adds += 1
                  }
              }

              const subStrChuncks = []
              let _c = 0
              for (const child of children) {
                _c += 1
                const isLast = _c === children.length
                const nodeReport = getNodeReportChunk({
                  emoji,
                  ...child,
                  level: level + 1,
                  isLast,
                  levelsInfoMap: levelsInfoMap.set(level + 1, isLast),
                  getHeaderByModel,
                  getDescriptionMessagesByModel,
                  validateFn,
                })
                subStrChuncks.push(nodeReport.result)
                counters.adds += nodeReport.counters.adds
                for (let c of nodeReport.percentage.done) {
                  percentage.done.push(c)
                }
              }

              const targetReport = [...final, subStrChuncks.join('')].join('\n')

              return {
                result: targetReport,
                counters,
                percentage,
              }
            }
            const __targetTree = getNodeReportChunk({
              model: __reportExpTarget.model,
              children: __reportExpTarget.children,
              level: 0,
              isLast: true,
              levelsInfoMap: new Map([
                [0, true]
              ]),
              getHeaderByModel: ({ model }) => {
                // console.log('--- LABEL: input.statusPack')
                // console.log(input.statusPack)
                // console.log('--- model')
                // console.log(model)
                // console.log('--- input.statusPack[model.statusCode]')
                // console.log(input.statusPack[model.statusCode])
                return {

                  // TODO: label: string; emoji: string;

                  label: clsx(input.statusPack[model.statusCode]?.emoji, model.title, !!input.statusPack[model.statusCode]?.label ? `[${input.statusPack[model.statusCode]?.label}]` : undefined),
                  readyPercentageVals: [],
                }
              },
              getDescriptionMessagesByModel: ({ model, __incCounter }) =>
                // model.logs.items.reduce((acc, cur) => {
                //   if (cur.checklist?.length > 0) {
                //     for (const microtask of cur.checklist) {
                //       if (!microtask.isDone && !microtask.isDisabled) {
                //         const msgs = [
                //           `${microtask.title}`,
                //         ]
                //         if (!!microtask.descr) {
                //           msgs.push(`(${microtask.descr})`)
                //         }
                //         if (typeof __incCounter === 'function') __incCounter()
                //         acc.push(msgs.join(' '))
                //       }
                //     }
                //   }
                //   return acc
                // }, []),
                !!model.descr ? [model.descr] : []
            })
            // --

            output.originalResponse = {
              calc,
              // --- NOTE: Report as text
              report: {
                targetTree: __targetTree.result,
              }
              // ---
            }

            if (typeof cb[eventData?.input?.opsEventType] === 'function') {
              // console.log(eventData?.input?.opsEventType) // NOTE: c-w:news:get-items
              if (debugConfig.workerEvs.mwsInternalLogs.isEnabled) log({
                label: '[MW] ✅ pointset-tree-calc/middlewares/utils/math-ops/calc.v1',
                msgs: [
                  `CODE: c->(worker):port:listener:opsEventType:${eventData?.input?.opsEventType}->[cb]`,
                  'input', input, 'output', output,
                ],
              })
            }
          } catch (err) {
            if (debugConfig.workerEvs.mwsInternalLogs.isEnabled) log({
              label: '[MW] ⛔ pointset-tree-calc/middlewares/utils/math-ops/calc.v1',
              msgs: [
                `CODE: c->(worker):port:listener:opsEventType:${eventData?.input?.opsEventType}->[cb]`,
                'input', input, 'err', err,
              ],
            })
            output.ok = false
            output.message = `Worker error: ${err?.message || 'No message'}; pointset-tree-calc/middlewares/utils/math-ops/calc.v1`
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
            label: '[MW] ⚠️ pointset-tree-calc/middlewares/utils/math-ops/calc.v1 DEFAULT CASE',
            msgs: [
              'eventData?.input.opsEventType',
              `\tEXPECTED: ${NES.Common.ClientService.PointsetTreeCalc.EClientToWorkerEvent.GET_POINTSET_TREE_CALC}`,
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
