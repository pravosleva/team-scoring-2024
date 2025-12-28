// importScripts('./middlewares/for-ts-tree-lib/calc.v4.js')
importScripts('../../../static/workers/utils/math-ops/getArithmeticalMean.js')
importScripts('../../../static/workers/utils/math-ops/getLinear.js')
importScripts('../../../static/workers/utils/math-ops/getPercentage.js')
importScripts('../../../static/workers/utils/time-ops/getTimeAgo.js')

console.log('[LOADED] report-pager/middlewares/withRootMW')

const compose = (fns, arg) => {
  return fns.reduce(
    (acc, fn) => {
      fn(arg)
      acc += 1
      return acc
    },
    0
  )
}

const withRootMW = (arg) => compose([
  // NOTE: You can add your middlewares below...

  // - NOTE: For example
  ({ eventData, cb }) => {
    const { __eType, input } = eventData

    if (debugConfig.workerEvs.mwsInternalLogs.isEnabled) log({
      label: 'report-pager/middlewares/withRootMW [MW] exp',
      msgs: [
        'eventData:',
        eventData,
      ],
    })

    switch (__eType) {
      case NES.Common.WorkerService.CLIENT_TO_WORKER_MESSAGE: {

        // -- NOTE: Level 2: Different app event types
        switch (eventData?.input.opsEventType) {
          case NES.Common.ClientService.SortedReportPager.EClientToWorkerEvent.PING_GET: {
            const output = {
              ok: false,
              message: 'Output data not modified',
            }

            try {
              // --- NOTE: Your code here
              const isFiltersRequired = !!eventData?.input?._activeFilters && eventData.input._activeFilters.isAnyFilterActive
              const filteredJobs = isFiltersRequired
                ? getFilteredJobs({
                  jobs: eventData?.input?.jobs || [],
                  activeFilters: eventData?.input?._activeFilters,
                }).items
                : (eventData?.input?.jobs || [])
              const targetJobIndex = getBinarySearchedIndexByDotNotation({
                items: filteredJobs,
                sorted: 'DESC',
                target: {
                  value: eventData?.input?.activeJobId,
                  propPath: 'ts.create',
                },
              })
              const _pagerCalc = getSplittedArrayAsPager({
                pageLimit: 10,
                list: filteredJobs,
                options: {
                  // NOTE: One of two options (requiredPage in main priority)
                  requiredPageIndex: eventData?.input?.requiredPage >= 1 ? eventData?.input?.requiredPage - 1 : undefined,
                  requiredCurrentIndex: targetJobIndex === -1 ? 0 : targetJobIndex,
                  // First page by default
                },
              })
              const pagerData = _pagerCalc.result

              // ---- NOTE: Get report text tree
              // Мы имеем отфильтрованный список работ,
              // теперь все работы нужно сложить в дерево

              const _jobsMap = new Map()
              for (const job of filteredJobs) _jobsMap.set(job.id, job)

              let _c = 0
              const getTreePartById = ({ currentJobData, noParent }) => {
                const getNodeDataStandart = (job) => ({
                  model: {
                    id: job.id,
                    title: job.title,
                    ts: job.ts,
                    descr: job.descr,
                    completed: job.completed,
                    logs: job.logs,
                    relations: job.relations,
                    forecast: job.forecast,
                    // header: `${'│  '.repeat(level)}├─ ${job.title}`,
                    _service: {
                      aboutJob: {
                        existingChildrenNodes: {
                          nodesInfo: !!job.relations?.children
                            ? job.relations?.children
                              .map((id) => ({
                                originalJob: {
                                  id,
                                  title: _jobsMap.get(id)?.title,
                                  descr: _jobsMap.get(id)?.descr,
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
                              logText: cur.text,
                            })
                          }
                          return acc
                        }, [])
                      },
                      recursionCounter: ++_c,
                      logs: ['Node created'],
                    },
                  },
                  children: !!job.relations?.children
                    ? job.relations?.children
                      .map((id) => getNodeDataStandart(_jobsMap.get(id)))
                      .sort((a, b) => b.model.ts.update - a.model.ts.update)
                    : []
                })

                switch (true) {
                  case !!currentJobData.relations?.parent:
                    // Выполняем процедуру для родителя
                    // Находим элемент родителя в массиве jobs
                    const parentJob = _jobsMap.get(currentJobData.relations.parent)
                    if (!parentJob)
                      throw new Error(`parentJob with id=${currentJobData.relations.parent} не существует`)
                    if (
                      parentJob.id === currentJobData.relations.parent &&
                      !noParent
                    )
                      return getTreePartById({ currentJobData: parentJob })
                  default:
                    console.log(currentJobData)
                    return getNodeDataStandart(currentJobData)
                }
              }
              const __reportExp = getTreePartById({ currentJobData: { ...input.jobs[targetJobIndex] } });
              const __reportExpTarget = getTreePartById({ currentJobData: { ...input.jobs[targetJobIndex] }, noParent: true });

              /*
├─ (BSD-2-Clause OR MIT OR Apache-2.0)
│  ├─ rc@1.1.6
│  │  ├─ URL: https://github.com/dominictarr/rc.git
│  │  ├─ VendorName: Dominic Tarr
│  │  └─ VendorUrl: dominictarr.com
│  └─ rc@1.2.5
│     ├─ URL: https://github.com/dominictarr/rc.git
│     ├─ VendorName: Dominic Tarr
│     └─ VendorUrl: dominictarr.com
              */

              // -- NOTE: Minimal data exp
              const getMinimalTreePartById = ({ currentJobData, noParent }) => {
                const getNodeDataStandart = (job) => ({
                  model: {
                    id: job.id,
                    title: job.title,
                    ts: job.ts,
                    descr: job.descr,
                    completed: job.completed,
                    // logs: job.logs,
                    relations: job.relations,
                    forecast: job.forecast,
                  },
                  children: !!job.relations?.children
                    ? job.relations?.children
                      .map((id) => getNodeDataStandart(_jobsMap.get(id)))
                      .sort((a, b) => b.model.ts.update - a.model.ts.update)
                    : []
                })

                switch (true) {
                  case !!currentJobData.relations?.parent:
                    // Выполняем процедуру для родителя
                    // Находим элемент родителя в массиве jobs
                    const parentJob = _jobsMap.get(currentJobData.relations.parent)
                    if (!parentJob)
                      throw new Error(`parentJob with id=${currentJobData.relations.parent} не существует`)
                    if (
                      parentJob.id === currentJobData.relations.parent &&
                      !noParent
                    )
                      return getTreePartById({ currentJobData: parentJob })
                  default:
                    console.log(currentJobData)
                    return getNodeDataStandart(currentJobData)
                }
              }
              const __reportExpTargetMinimal = getMinimalTreePartById({ currentJobData: { ...input.jobs[targetJobIndex] }, noParent: true });
              // --

              const getNodeReportChunk = ({
                model, children, level, isLast, levelsInfoMap,
                getHeaderByModel, getDescriptionMessagesByModel, validateFn,
                // __onEacnIteration,
                emoji = '🔥',
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
                      final.push(['   '.repeat(level), str].join(`   • ${emoji} `))
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

              const __otputFullJobsTree = getNodeReportChunk({
                model: __reportExp.model,
                children: __reportExp.children,
                level: 0,
                isLast: true,
                levelsInfoMap: new Map([
                  [0, true]
                ]),
                getHeaderByModel: ({ model }) => ({ label: model.id }),
              })

              const otputFullJobsTree = __otputFullJobsTree

              const __otputFullActiveCheckboxesTree = getNodeReportChunk({
                model: __reportExp.model,
                children: __reportExp.children,
                level: 0,
                isLast: true,
                levelsInfoMap: new Map([
                  [0, true]
                ]),
                getHeaderByModel: ({ model }) => {
                  const readyPercentage = model.logs.items.reduce((acc, cur) => {
                    if (cur.checklist?.length > 0) {
                      acc.isEnabled = true
                      acc.vals.push(getPercentage({
                        // Ready
                        x: cur.checklist
                          .reduce((acc, microtask) => {
                            if (microtask.isDone || microtask.isDisabled) acc += 1
                            return acc
                          }, 0),
                        // Total
                        sum: cur.checklist.length,
                      }))
                    }
                    return acc
                  }, { vals: [], isEnabled: false })
                  return {
                    label: `${readyPercentage.isEnabled ? `${getArithmeticalMean(readyPercentage.vals).toFixed(0)}% ` : ''}${model.title}`,
                    readyPercentageVals: readyPercentage.isEnabled ? readyPercentage.vals : [],
                  }
                },
                getDescriptionMessagesByModel: ({ model }) =>
                  model.logs.items.reduce((acc, cur) => {
                    if (cur.checklist?.length > 0) {
                      for (const checklist of cur.checklist) {
                        if (!checklist.isDone && !checklist.isDisabled) {
                          const msgs = [`${checklist.title}`]
                          if (!!checklist.descr) {
                            msgs.push(`(${checklist.descr})`)
                          }
                          acc.push(msgs.join(' '))
                        }
                      }
                    }
                    return acc
                  }, []),
                // __onEacnIteration: ({ modelId, targetReportText }) => {
                //   console.log({
                //     modelId,
                //     activeJobId: eventData?.input?.activeJobId
                //   })
                //   if (modelId === eventData?.input?.activeJobId) {
                //     __targetActiveCheckboxTree = targetReportText
                //   }
                // }
              })

              // -- NOTE: Active tree
              const __targetActiveCheckboxTree = getNodeReportChunk({
                model: __reportExpTarget.model,
                children: __reportExpTarget.children,
                level: 0,
                isLast: true,
                levelsInfoMap: new Map([
                  [0, true]
                ]),
                getHeaderByModel: ({ model }) => {
                  const readyPercentage = model.logs.items.reduce((acc, cur) => {
                    if (cur.checklist?.length > 0) {
                      acc.isEnabled = true
                      acc.vals.push(getPercentage({
                        x: cur.checklist
                          .reduce((acc, cur) => {
                            if (cur.isDone || cur.isDisabled) acc += 1
                            return acc
                          }, 0),
                        sum: cur.checklist.length,
                      }))
                    }
                    return acc
                  }, { vals: [], isEnabled: false })
                  return {
                    label: `${readyPercentage.isEnabled ? `${getArithmeticalMean(readyPercentage.vals).toFixed(0)}% ` : ''}${model.title}`,
                    readyPercentageVals: readyPercentage.isEnabled ? readyPercentage.vals : [],
                  }
                },
                getDescriptionMessagesByModel: ({ model, __incCounter }) =>
                  model.logs.items
                    .reduce((acc, cur) => {
                      if (cur.checklist?.length > 0) {
                        for (const microtask of cur.checklist) {
                          if (!microtask.isDone && !microtask.isDisabled) {
                            const msgs = [
                              `${microtask.title}`,
                            ]
                            if (!!microtask.descr) {
                              msgs.push(`(${microtask.descr})`)
                            }
                            if (typeof __incCounter === 'function') __incCounter()
                            acc.push({ msg: msgs.join(' '), order: microtask.order || 0 })
                          }
                        }
                      }
                      return acc
                    }, [])
                    .sort((e1, e2) => ((e2.order || 0) - (e1.order || 0)))
                    .map(({ msg }) => msg),
              })
              // --
              // -- NOTE: Aux info
              // 1. Done last 1 month tree
              const limit1Months = 1
              const nowDateTs = new Date().getTime()
              const __target3mTs = new Date(nowDateTs - 1000 * 60 * 60 * 24 * 30 * limit1Months).getTime()

              const __outputFullDoneLast3MonthsCheckboxesTree = getNodeReportChunk({
                emoji: '✅',
                model: __reportExpTarget.model,
                children: __reportExpTarget.children,
                level: 0,
                isLast: true,
                levelsInfoMap: new Map([
                  [0, true]
                ]),
                validateFn: (microtask) => {
                  return (
                    microtask.isDone
                    && !microtask.isDisabled
                    && microtask.ts.updatedAt > __target3mTs
                  )
                },
                getHeaderByModel: ({ model }) => {
                  const readyPercentage = model.logs.items.reduce((acc, cur) => {
                    if (cur.checklist?.length > 0) {
                      acc.isEnabled = true
                      acc.vals.push(getPercentage({
                        x: cur.checklist
                          .reduce((acc, cur) => {
                            if (cur.isDone || cur.isDisabled) acc += 1
                            return acc
                          }, 0),
                        sum: cur.checklist.length,
                      }))
                    }
                    return acc
                  }, { vals: [], isEnabled: false })
                  return {
                    label: `${readyPercentage.isEnabled ? `${getArithmeticalMean(readyPercentage.vals).toFixed(0)}% ` : ''}${model.title}`
                  }
                },
                getDescriptionMessagesByModel: ({ model, validateFn, __incCounter }) =>
                  model.logs.items.reduce((acc, cur) => {
                    if (cur.checklist?.length > 0) {
                      for (const microtask of cur.checklist) {
                        if (typeof validateFn === 'function' && validateFn(microtask)) {
                          const msgs = [
                            `[${getTimeAgo({ dateInput: microtask.ts.updatedAt })}]`,
                            `${microtask.title}`,
                          ]
                          if (!!microtask.descr) {
                            msgs.push(`(${microtask.descr})`)
                          }
                          if (typeof __incCounter === 'function') __incCounter()
                          acc.push(msgs.join(' '))
                        }
                      }
                    }
                    return acc
                  }, []),
              })

              // 2. Done last week
              const limit1DaysAgo = 7
              const __target7dNoEarlyTs = new Date(nowDateTs - 1000 * 60 * 60 * 24 * limit1DaysAgo).getTime()
              const __outputFullDoneLast7DaysCheckboxesTree = getNodeReportChunk({
                emoji: '✅',
                model: __reportExpTarget.model,
                children: __reportExpTarget.children,
                level: 0,
                isLast: true,
                levelsInfoMap: new Map([
                  [0, true]
                ]),
                validateFn: (microtask) => (
                  microtask.isDone
                  && !microtask.isDisabled
                  && microtask.ts.updatedAt >= __target7dNoEarlyTs
                ),
                getHeaderByModel: ({ model }) => {
                  const readyPercentage = model.logs.items.reduce((acc, cur) => {
                    if (cur.checklist?.length > 0) {
                      acc.isEnabled = true
                      acc.vals.push(getPercentage({
                        x: cur.checklist
                          .reduce((acc, cur) => {
                            if (cur.isDone || cur.isDisabled) acc += 1
                            return acc
                          }, 0),
                        sum: cur.checklist.length,
                      }))
                    }
                    return acc
                  }, { vals: [], isEnabled: false })
                  return {
                    label: `${readyPercentage.isEnabled ? `${getArithmeticalMean(readyPercentage.vals).toFixed(0)}% ` : ''}${model.title}`
                  }
                },
                getDescriptionMessagesByModel: ({ model, validateFn, __incCounter }) =>
                  model.logs.items
                    .reduce((acc, cur) => {
                      if (cur.checklist?.length > 0) {
                        for (const microtask of cur.checklist) {
                          if (typeof validateFn === 'function' && validateFn(microtask)) {
                            const msgs = [
                              `[${getTimeAgo({ dateInput: microtask.ts.updatedAt })}]`,
                              `${microtask.title}`,
                            ]
                            if (!!microtask.descr) {
                              msgs.push(`(${microtask.descr})`)
                            }
                            if (typeof __incCounter === 'function') __incCounter()
                            acc.push({ msg: msgs.join(' '), order: microtask.order || 0 })
                          }
                          // else {
                          //   acc.push([
                          //     'DEBUG:',
                          //     `validateFn is ${typeof validateFn}`,
                          //     `validateFn -> ${validateFn(microtask)}`,
                          //   ].join(' '))
                          // }
                        }
                      }
                      return acc
                    }, [])
                    .sort((e1, e2) => ((e2.order || 0) - (e1.order || 0)))
                    .map(({ msg }) => msg),
              })

              // 3. Created eary than 1 month ago and not completed
              const limit2Months = 1
              const __target1mNoEarlyTs = new Date(nowDateTs - 1000 * 60 * 60 * 24 * 30 * limit2Months).getTime()

              const __outputTargetIncompletedWichCreatedEarlyThan1MonthsCheckboxesTree = getNodeReportChunk({
                emoji: '💀',
                model: __reportExpTarget.model,
                children: __reportExpTarget.children,
                level: 0,
                isLast: true,
                levelsInfoMap: new Map([
                  [0, true]
                ]),
                validateFn: (microtask) => {
                  return (
                    !microtask.isDone
                    && !microtask.isDisabled
                    && microtask.ts.createdAt <= __target1mNoEarlyTs
                  )
                },
                getHeaderByModel: ({ model }) => {
                  const readyPercentage = model.logs.items.reduce((acc, cur) => {
                    if (cur.checklist?.length > 0) {
                      acc.isEnabled = true
                      acc.vals.push(getPercentage({
                        x: cur.checklist
                          .reduce((acc, cur) => {
                            if (cur.isDone || cur.isDisabled) acc += 1
                            return acc
                          }, 0),
                        sum: cur.checklist.length,
                      }))
                    }
                    return acc
                  }, { vals: [], isEnabled: false })
                  return {
                    label: `${readyPercentage.isEnabled ? `${getArithmeticalMean(readyPercentage.vals).toFixed(0)}% ` : ''}${model.title}`
                  }
                },
                getDescriptionMessagesByModel: ({ model, validateFn, __incCounter }) =>
                  model.logs.items.reduce((acc, cur) => {
                    if (cur.checklist?.length > 0) {
                      for (const microtask of cur.checklist) {
                        if (typeof validateFn === 'function' && validateFn(microtask)) {
                          const msgs = [
                            `[${getTimeAgo({ dateInput: microtask.ts.createdAt })}]`,
                            `${microtask.title}`,
                          ]
                          if (!!microtask.descr) {
                            msgs.push(`(${microtask.descr})`)
                          }
                          if (typeof __incCounter === 'function') __incCounter()
                          acc.push(msgs.join(' '))
                        }
                      }
                    }
                    return acc
                  }, []),
              })
              // --

              // --
              // 4. Done last day
              const limit3DaysAgo = 1
              const __target1dNoEarlyTs = new Date(nowDateTs - 1000 * 60 * 60 * 24 * limit3DaysAgo).getTime()
              const __outputFullDoneLast1DaysCheckboxesTree = getNodeReportChunk({
                emoji: '✅',
                model: __reportExpTarget.model,
                children: __reportExpTarget.children,
                level: 0,
                isLast: true,
                levelsInfoMap: new Map([
                  [0, true]
                ]),
                validateFn: (microtask) => (
                  microtask.isDone
                  && !microtask.isDisabled
                  && microtask.ts.updatedAt >= __target1dNoEarlyTs
                ),
                getHeaderByModel: ({ model }) => {
                  const readyPercentage = model.logs.items.reduce((acc, cur) => {
                    if (cur.checklist?.length > 0) {
                      acc.isEnabled = true
                      acc.vals.push(getPercentage({
                        x: cur.checklist
                          .reduce((acc, cur) => {
                            if (cur.isDone || cur.isDisabled) acc += 1
                            return acc
                          }, 0),
                        sum: cur.checklist.length,
                      }))
                    }
                    return acc
                  }, { vals: [], isEnabled: false })
                  return {
                    label: `${readyPercentage.isEnabled ? `${getArithmeticalMean(readyPercentage.vals).toFixed(0)}% ` : ''}${model.title}`
                  }
                },
                getDescriptionMessagesByModel: ({ model, validateFn, __incCounter }) =>
                  model.logs.items.reduce((acc, cur) => {
                    if (cur.checklist?.length > 0) {
                      for (const microtask of cur.checklist) {
                        if (typeof validateFn === 'function' && validateFn(microtask)) {
                          const msgs = [
                            `[${getTimeAgo({ dateInput: microtask.ts.updatedAt })}]`,
                            `${microtask.title}`,
                          ]
                          if (!!microtask.descr) {
                            msgs.push(`(${microtask.descr})`)
                          }
                          if (typeof __incCounter === 'function') __incCounter()
                          acc.push(msgs.join(' '))
                        }
                      }
                    }
                    return acc
                  }, []),
              })
              // --
              // ----

              const calc = {
                binarySearchedIndex: targetJobIndex,
                // splitTest: pagerData.pager,
                pagination: pagerData.pagination,
                currentPage: pagerData.currentPage,
                nextPage: pagerData.nextPage,
                prevPage: pagerData.prevPage,
                message: [
                  _pagerCalc.message,
                  _pagerCalc.logs.join('\n')
                ].join('\n'),
                _partialInput: {
                  _activeFilters: eventData?.input?._activeFilters,
                  _reportExp: __reportExp,
                },
                output: {
                  fullJobsTree: {
                    result: otputFullJobsTree.result,
                    counters: otputFullJobsTree.counters,
                  },
                  fullActiveCheckboxesTree: {
                    ...__otputFullActiveCheckboxesTree,
                  },
                  targetActiveCheckboxTree: {
                    ...__targetActiveCheckboxTree,
                  },
                  fullDoneLast3MonthsCheckboxesTree: {
                    ...__outputFullDoneLast3MonthsCheckboxesTree,
                  },
                  fullDoneLast7DaysCheckboxesTree: {
                    ...__outputFullDoneLast7DaysCheckboxesTree,
                  },
                  fullDoneLast1DaysCheckboxesTree: {
                    ...__outputFullDoneLast1DaysCheckboxesTree,
                  },
                  targetIncompletedWichCreatedEarlyThan1MonthsCheckboxesTree: {
                    ...__outputTargetIncompletedWichCreatedEarlyThan1MonthsCheckboxesTree,
                  },
                  modelFullTree: __reportExp,
                  modelPartialTree: __reportExpTargetMinimal,
                },
              }

              // ---
              output.ok = true
              output.message = calc.message // `Random string: ${getRandomString(5)}`
              output.originalResponse = calc

              if (typeof cb[eventData?.input?.opsEventType] === 'function') {
                // console.log(eventData?.input?.opsEventType) // NOTE: c-w:news:get-items
                if (debugConfig.workerEvs.mwsInternalLogs.isEnabled) log({
                  label: `c->(worker):port:listener:opsEventType:${eventData?.input?.opsEventType}->[cb]`,
                  msgs: ['input', input, 'output', output],
                })
              }
            } catch (err) {
              output.ok = false
              output.message = `Worker error: ${err?.message || 'No message'}; report-pager/middlewares/withRootMW`

              if (debugConfig.workerEvs.mwsInternalLogs.isEnabled) log({
                label: `c->(worker):port:listener:opsEventType:${eventData?.input?.opsEventType}->[cb]`,
                msgs: ['input', input, 'err', err],
              })
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
            console.log('[DEBUG] Default case')
            break
        }
        // --

        break
      }
      default:
        if (debugConfig.workerEvs.mwsInternalLogs.isEnabled) log({
          label: `[DBG] UNKNOWN CASE! Проверьте __eType! c->(worker):port:listener:opsEventType:${eventData?.input?.opsEventType}->[switch (__eType)]`,
          msgs: [
            `__eType: ${__eType}`,
            'eventData?.input.opsEventType',
            eventData?.input?.opsEventType
          ],
        })
        break
    }
  },
  // -
], arg)
