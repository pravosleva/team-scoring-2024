console.log('[LOADED] pointset-tree-calc/middlewares/utils/calc.v1')

importScripts('./middlewares/utils/math-ops/getPercentage.js')
importScripts('./middlewares/utils/math-ops/getCondited.js')

const withTsTreeLibCalcService = async ({ eventData, cb }) => {
  const { __eType, input } = eventData
  switch (__eType) {
    case NES.Common.WorkerService.CLIENT_TO_WORKER_MESSAGE: {
      // -- NOTE: Level 2: Different app event types
      switch (eventData?.input.opsEventType) {
        case NES.Common.ClientService.PointsetTreeCalc.EClientToWorkerEvent.GET_POINTSET_TREE_CALC: {
          const output = {
            ok: false,
            message: 'Output data not modified',
          }
          try {
            // -- NOTE: TARGET CALC SRC
            const __pointsMap = new Map()
            for (const point of input.pointset) __pointsMap.set(point.id, point)
            let _c = 0
            const getTreePartById = ({ currentPointData }) => {
              const getNodeDataStandart = (point) => {
                return {
                  model: {
                    id: point.id, title: point.title, ts: point.ts,
                    descr: point.descr, isDone: point.isDone, isDisabled: point.isDisabled, statusCode: point.statusCode,
                    relations: point.relations,
                    _service: {
                      aboutPoint: {
                        existingChildrenNodes: {
                          nodesInfo: !!point.relations?.children
                            ? point.relations?.children
                              .map((id) => ({
                                originalPoint: {
                                  id, title: __pointsMap.get(id)?.title, descr: __pointsMap.get(id)?.descr,
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
                      .filer((id) => __pointsMap.has(id))
                      .map((id) => getNodeDataStandart(__pointsMap.get(id)))
                      .sort((a, b) => b.model.ts.update - a.model.ts.update)
                    : []
                }
              }
              switch (true) {
                case !!currentPointData.relations?.parent:
                  const parentPoint = __pointsMap.get(currentPointData.relations.parent)
                  if (!parentPoint)
                    throw new Error(`parentPoint with id=${currentPointData.relations.parent} не существует`)
                  if (parentPoint?.id === currentPointData.relations.parent)
                    return getTreePartById({ currentPointData: parentPoint })
                default:
                  return getNodeDataStandart(currentPointData)
              }
            }
            const calc = getTreePartById({ currentPointData: { ...input.rootPoint } });
            output.ok = true
            output.message = [
              'Calculated',
              `getNodeDataStandart called ${_c} times`
            ].join('; ')
            const __reportExpTarget = getTreePartById({ currentPointData: { ...input.rootPoint }, noParent: true });
            const counters = { total: 0 }
            const getNodeReportChunk = ({
              model, children, level, isLast, levelsInfoMap,
              getHeaderByModel, getDescriptionMessagesByModel, validateFn,
              emoji,
              counters,
            }) => {
              const header = getHeaderByModel({ model })
              counters.total += 1
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
              const final = [mainStrChuncks.join('')]
              const percentage = { done: header.readyPercentageVals || [] }
              if (typeof getDescriptionMessagesByModel === 'function') {
                const adds = getDescriptionMessagesByModel({ model, validateFn })
                if (adds.length > 0)
                  for (const str of adds) {
                    if (!!emoji) final.push(['   '.repeat(level), str].join(`  ${emoji} `))
                    else final.push(['   '.repeat(level), str].join('   '))
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
                  level: level + 1, isLast,
                  levelsInfoMap: levelsInfoMap.set(level + 1, isLast),
                  getHeaderByModel, getDescriptionMessagesByModel,
                  validateFn, counters,
                })
                subStrChuncks.push(nodeReport.result)
                for (let c of nodeReport.percentage.done) {
                  percentage.done.push(c)
                }
              }
              const targetReport = [...final, subStrChuncks.join('')].join('\n')
              return { result: targetReport, counters, percentage }
            }
            const __targetTree = getNodeReportChunk({
              model: __reportExpTarget.model, children: __reportExpTarget.children,
              level: 0, isLast: true,
              levelsInfoMap: new Map([
                [0, true]
              ]),
              getHeaderByModel: ({ model }) => {
                return {
                  label: clsx(
                    input.statusPack[model.statusCode]?.emoji,
                    model.title,
                    !!input.statusPack[model.statusCode]?.label
                      ? `[${input.statusPack[model.statusCode]?.label}]`
                      : undefined
                  ),
                  readyPercentageVals: [],
                }
              },
              getDescriptionMessagesByModel: ({ model }) =>
                !!model.descr ? [model.descr] : [],
              counters,
            })
            output.originalResponse = {
              calc, report: { targetTree: __targetTree.result },
              etc: {
                counters: {
                  ...__targetTree.counters,
                  analyse: getCondited({ fragments: [{ valueFragment: 'ready*', path: 'statusCode' }], pointset: input.pointset, allowedEmojies: ['✅', '☑️', '🟢'] }).analyse,
                },
                percentage: __targetTree.percentage,
              },
            }
          } catch (err) {
            output.ok = false
            output.message = `Worker error: ${err?.message || 'No message'}; pointset-tree-calc/middlewares/utils/math-ops/calc.v1`
          } finally {
            cb[eventData.input.opsEventType]({ output, input })
          }
          break
        }
        default:
          break
      }
      break
    }
    default:
      break
  }
}
