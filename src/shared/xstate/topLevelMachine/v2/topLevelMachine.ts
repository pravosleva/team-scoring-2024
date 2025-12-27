import { assign, setup } from 'xstate'
import { EJobsStatusFilter, TJob, TLogsItem, TUser, TLogProgress, TLogLink, TLogChecklistItem, TPointsetItem } from './types'
import { getCurrentPercentage } from '~/shared/utils'
import { getWorstCalc } from '~/shared/utils/team-scoring'
import { getRounded } from '~/shared/utils/number-ops'
import dayjs from 'dayjs'
import { soundManager } from '~/shared/soundManager'
import { getBinarySearchedIndexByDotNotation } from '~/shared/utils/array-ops'
import { getNestedValue, setNestedValue } from '~/shared/utils/object-ops'

const getSpeed = (job: TJob): number =>
  (
    typeof job.forecast.start === 'number'
    && typeof job.forecast.estimate === 'number'
    && typeof job.forecast.finish === 'number'
  )
    ? getRounded((job.forecast.estimate / 1000 - job.forecast.start / 1000) / (job.forecast.finish / 1000 - job.forecast.start / 1000), 4)
    : 0

export const topLevelMachine = setup({
  types: {} as {
    context: {
      todo: string;
      jobs: {
        pinned: number[];
        items: TJob[];
        // filter: EJobsStatusFilter;
      };
      users: {
        items: TUser[];
      };
    };
    events:
    | { type: 'newTodo.change'; value: string }
    | { type: 'newTodo.commit'; value: Pick<TJob, 'title'>; }
    | { type: 'todo.commit'; job: TJob; comment?: string; }
    | { type: 'todo.clearDates'; id: number }
    | { type: 'todo.addTimeToFinishDate'; id: number; hours: number; comment?: string; }
    | { type: 'todo.delete'; id: number }
    // | { type: 'filter.jobStatus.change'; filter: EJobsStatusFilter }
    // | { type: 'filter.assignedTo.change'; filter: number }
    // | { type: 'filter.jobEstimateReached.change'; filter: 0 | 1 }
    | { type: 'todo.mark'; id: number; mark: 'active' | 'completed' }
    | { type: 'todo.markAll'; mark: 'active' | 'completed' }
    | { type: 'todos.clearCompleted' }
    | { type: 'user.commit'; value: { displayName: string; value?: number; } }
    | { type: 'user.delete'; value: { id: number; } }
    | { type: 'todo.editLog'; value: { jobId: number; logTs: number; text: string } }
    | { type: 'todo.deleteLog'; value: { jobId: number; logTs: number } }
    | { type: 'todo.addLinkToLog'; value: { jobId: number; logTs: number; state: Pick<TLogLink, 'url' | 'title' | 'descr'> } }
    | { type: 'todo.deleteLinkInLog'; value: { jobId: number; logTs: number; linkId: number } }
    | { type: 'todo.editLinkInLog'; value: { jobId: number; logTs: number; linkId: number; state: Pick<TLogLink, 'url' | 'title' | 'descr'> } }
    | { type: 'todo.addChecklistItemInLog'; value: { jobId: number; logTs: number; state: Pick<TLogChecklistItem, 'title' | 'descr'> } }
    | { type: 'todo.editChecklistItemInLog'; value: { jobId: number; logTs: number; checklistItemId: number; state: Pick<TLogChecklistItem, 'title' | 'descr' | 'isDisabled' | 'isDone'> } }
    | { type: 'todo.editChecklistItemInLog.orderInc'; value: { jobId: number; logTs: number; checklistItemId: number; } }
    | { type: 'todo.editChecklistItemInLog.orderDec'; value: { jobId: number; logTs: number; checklistItemId: number; } }
    | { type: 'todo.deleteChecklistFromLog'; value: { jobId: number; logTs: number } }
    | { type: 'todo.deleteChecklistItemFromLog'; value: { jobId: number; logTs: number; checklistItemId: number; } }
    | { type: 'todo.pin'; value: { jobId: number; } }
    | { type: 'todo.unpin'; value: { jobId: number; } }
    | { type: 'todo.pointset:create-item'; value: { jobId: number; title: string; descr?: string; initialStatusCode: string; relations?: { parent?: number; } } }
    | { type: 'todo.pointset:update-item'; value: { jobId: number; pointId: number; title: string; descr?: string; statusCode: string; relations?: { parent?: number; } } }
    | { type: 'todo.pointset:delete-item'; value: { jobId: number; pointId: number; } }
  }
}).createMachine({
  id: 'topLevel',
  context: {
    todo: '',
    jobs: {
      pinned: [],
      items: [],
      filter: EJobsStatusFilter.ALL,
    },
    users: {
      items: [],
    },
  },
  on: {
    'todo.pin': {
      actions: assign({
        jobs: ({ context, event }) => {
          const targetJob = context.jobs.items.find(({ id }) => id === event.value.jobId)
          if (!targetJob) {
            return context.jobs
          }

          const newPinnedList = [...context.jobs.pinned]
          const limit = 100
          if (newPinnedList.length >= limit) {
            newPinnedList.pop()
          }
          newPinnedList.unshift(event.value.jobId)
          return {
            ...context.jobs,
            pinned: [...new Set([...newPinnedList])],
          }
        },
      }),
    },
    'todo.unpin': {
      actions: assign({
        jobs: ({ context, event }) => {
          return {
            ...context.jobs,
            pinned: context.jobs.pinned.filter((id) => event.value.jobId !== id)
          }
        },
      }),
    },
    'newTodo.change': {
      actions: assign({
        todo: ({ event }) => event.value
      })
    },
    'newTodo.commit': {
      guard: ({ event }) => event.value.title.trim().length > 0,
      actions: assign({
        todo: '',
        jobs: ({ context, event }) => {
          const createTime = new Date().getTime()
          const newTodo: TJob = {
            ...event.value,
            title: event.value.title.trim().replace(/\s+/g, ' '),
            completed: false,
            id: createTime,
            forecast: {
              complexity: 0,
            },
            ts: {
              create: createTime,
              update: createTime,
            },
            logs: {
              limit: 100,
              isEnabled: false,
              items: [
                {
                  ts: createTime,
                  text: 'Created'
                },
              ],
            },
            relations: {
              parent: null,
              children: [],
            },
          }

          // if (!!newTodo.descr) newTodo.descr = event.value.descr.trim().replace(/\s+/g,' ')

          soundManager.playDelayedSound({ soundCode: 'plop-1' })

          return ({
            ...context.jobs,
            items: [newTodo, ...context.jobs.items]
          })
        }
      })
    },
    'todo.editLog': {
      actions: assign({
        jobs: ({ context, event }) => {
          const targetJob = context.jobs.items.find(({ id }) => id === event.value.jobId)
          if (!targetJob) {
            return context.jobs
          }

          return {
            ...context.jobs,
            items: context.jobs.items.map((todo) => {
              if (todo.id === event.value.jobId) {
                const targetLogIndex = todo.logs.items.findIndex((log) => log.ts === event.value.logTs)
                if (targetLogIndex !== -1) {
                  todo.logs.items[targetLogIndex].text = event.value.text
                  soundManager.playDelayedSoundConfigurable({
                    soundCode: 'mech-78-step',
                    _debug: { msg: 'Log edited' },
                    delay: {
                      before: 0,
                      after: 1000,
                    },
                  })
                }
              }
              return todo
            })
          }
        },
      }),
    },
    'todo.deleteLog': {
      actions: assign({
        jobs: ({ context, event }) => {
          const targetJob = context.jobs.items.find(({ id }) => id === event.value.jobId)
          if (!targetJob) {
            return context.jobs
          }

          return {
            ...context.jobs,
            items: context.jobs.items.map((todo) => {
              if (todo.id === event.value.jobId) {
                todo.logs.items = todo.logs.items.filter(({ ts }) => ts !== event.value.logTs)
                soundManager.playDelayedSoundConfigurable({
                  soundCode: 'switch-3-epic',
                  _debug: { msg: 'Log deleted' },
                  delay: {
                    before: 0,
                    after: 250,
                  },
                })
              }
              return todo
            })
          }
        },
      }),
    },
    'todo.addLinkToLog': {
      actions: assign({
        jobs: ({ context, event }) => {
          const targetJob = context.jobs.items.find(({ id }) => id === event.value.jobId)
          if (!targetJob) {
            return context.jobs
          }

          const limit = 100
          return {
            ...context.jobs,
            items: context.jobs.items.map((todo) => {
              if (todo.id === event.value.jobId) {
                todo.logs.items = todo.logs.items.map((log) => {
                  if (log.ts === event.value.logTs) {
                    // NOTE: Add link for log
                    if (!log.links) log.links = []
                    const ts = new Date().getTime()
                    const newLink: TLogLink = { ...event.value.state, id: ts }
                    if (log.links.length >= limit) log.links.pop()

                    log.links.unshift(newLink)
                  }
                  return log
                })
              }
              return todo
            })
          }
        },
      }),
    },
    'todo.addChecklistItemInLog': {
      actions: assign({
        jobs: ({ context, event }) => {
          const targetJob = context.jobs.items.find(({ id }) => id === event.value.jobId)
          if (!targetJob) {
            return context.jobs
          }

          const checklistItemsLimit = 100
          return {
            ...context.jobs,
            items: context.jobs.items.map((todo) => {
              if (todo.id === event.value.jobId) {
                todo.logs.items = todo.logs.items.map((log) => {
                  if (log.ts === event.value.logTs) {
                    // NOTE: Add link to log
                    // if (!log.links) log.links = []
                    // const ts = new Date().getTime()
                    // const newLink: TLogLink = { ...event.value.state, id: ts }
                    // if (log.links.length >= limit) {
                    //   log.links.pop()
                    // }
                    // log.links.unshift(newLink)

                    // NOTE: Add checklist to log
                    if (!log.checklist) log.checklist = []
                    const tsCreate = new Date().getTime()
                    const newChecklistItem: TLogChecklistItem = {
                      id: tsCreate,
                      isDone: false,
                      isDisabled: false,
                      links: [],
                      title: event.value.state.title.trim().replace(/\s+/g, ' '),
                      descr: event.value.state.descr.trim().replace(/\s+/g, ' '),
                      ts: {
                        createdAt: tsCreate,
                        updatedAt: tsCreate,
                      },
                      order: log.checklist.length,
                    }
                    if (log.checklist.length >= checklistItemsLimit) log.checklist.pop()

                    log.checklist.unshift(newChecklistItem)
                    todo.ts.update = tsCreate
                  }
                  return log
                })
              }
              return todo
            })
          }
        },
      }),
    },
    'todo.editChecklistItemInLog': {
      actions: assign({
        jobs: ({ context, event }) => {
          const targetJob = context.jobs.items.find(({ id }) => id === event.value.jobId)
          if (!targetJob) {
            return context.jobs
          }

          const tsUpdate = new Date().getTime()

          return {
            ...context.jobs,
            items: context.jobs.items.map((todo) => {
              if (todo.id === event.value.jobId) {
                todo.logs.items = todo.logs.items.map((log) => {
                  if (log.ts === event.value.logTs) {
                    // NOTE: Add link to log
                    // if (!log.links) log.links = []
                    // const ts = new Date().getTime()
                    // const newLink: TLogLink = { ...event.value.state, id: ts }
                    // if (log.links.length >= limit) {
                    //   log.links.pop()
                    // }
                    // log.links.unshift(newLink)

                    // NOTE: Add checklist to log
                    // if (!log.checklist) log.checklist = []
                    // const tsCreate = new Date().getTime()
                    // const newChecklistItem: TLogChecklistItem = {
                    //   id: tsCreate,
                    //   isDone: false,
                    //   isDisabled: false,
                    //   links: [],
                    //   title: event.value.state.title.trim().replace(/\s+/g,' '),
                    //   descr: event.value.state.descr.trim().replace(/\s+/g,' '),
                    //   ts: {
                    //     createdAt: tsCreate,
                    //     updatedAt: tsCreate,
                    //   },
                    // }
                    // if (log.checklist.length >= checklistItemsLimit) log.checklist.pop()

                    // log.checklist.unshift(newChecklistItem)

                    // NOTE: Edit
                    if (!log.checklist) log.checklist = []
                    log.checklist = log.checklist.map((checklistItem) => {
                      switch (true) {
                        case checklistItem.id === event.value.checklistItemId: {

                          checklistItem.title = event.value.state.title
                          checklistItem.descr = event.value.state.descr
                          checklistItem.isDisabled = event.value.state.isDisabled

                          // console.log(`UPD before: checklistItem.isDone -> ${checklistItem.isDone} (event.value.state.isDone === ${event.value.state.isDone})`)

                          checklistItem.isDone = event.value.state.isDone

                          // NOTE: Sound
                          if (checklistItem.isDone) soundManager.playDelayedSoundConfigurable({
                            soundCode: 'mech-56-single-short-hit-in-space',
                            _debug: { msg: 'Checklist item isDone' },
                            delay: {
                              before: 0,
                              after: 1000,
                            },
                          })
                          else soundManager.playDelayedSoundConfigurable({
                            soundCode: 'plop-1', // 'mech-54-short-far-single-hit',
                            _debug: { msg: 'Checklist item !isDone' },
                            delay: {
                              before: 0,
                              after: 1000,
                            },
                          })

                          // console.log(`UPD: checklistItem.isDone -> ${checklistItem.isDone} (event.value.state.isDone === ${event.value.state.isDone})`)

                          checklistItem.ts.updatedAt = tsUpdate
                          todo.ts.update = tsUpdate

                          return checklistItem
                        }
                        default:
                          return checklistItem
                      }
                    })
                  }
                  return log
                })
              }
              return todo
            })
          }
        },
      }),
    },
    'todo.editChecklistItemInLog.orderInc': {
      actions: assign({
        jobs: ({ context, event }) => {
          const modifiedJobsItems = [...context.jobs.items]
          const { jobId, checklistItemId, logTs } = event.value
          const targetJobIndex = getBinarySearchedIndexByDotNotation({
            items: modifiedJobsItems,
            target: {
              value: jobId,
              propPath: 'id',
            },
            sorted: 'DESC',
          })
          if (targetJobIndex !== -1) {
            const targetJob = modifiedJobsItems[targetJobIndex]
            const targetLogList = targetJob.logs.items
            const targetLogIndex = getBinarySearchedIndexByDotNotation({
              items: targetLogList,
              target: {
                value: logTs,
                propPath: 'ts',
              },
              sorted: 'DESC',
            })
            if (targetLogIndex !== -1) {
              const targetLog = targetLogList[targetLogIndex]
              const targetChecklist = targetLog.checklist
              if (!!targetChecklist) {
                const targetChecklistItemIndex = targetChecklist.findIndex((e) => e.id === checklistItemId)
                if (targetChecklistItemIndex !== -1) {
                  const mutatedChecklistItem = targetChecklist[targetChecklistItemIndex]
                  const currentOrder = mutatedChecklistItem.order || 0
                  console.log(`-- [+] NEW TARGET ORDER: ${getNestedValue({ source: mutatedChecklistItem, path: 'order' })}`)
                  const nextOrderElementIndex = targetChecklist.findIndex((e) => e.order === currentOrder + 1 || 0)
                  if (nextOrderElementIndex !== -1) {
                    const mutatedNextChecklistItem = targetChecklist[nextOrderElementIndex]
                    setNestedValue({ target: mutatedNextChecklistItem, path: 'order', value: currentOrder })
                    targetChecklist[nextOrderElementIndex] = mutatedNextChecklistItem
                    soundManager.playDelayedSoundConfigurable({
                      soundCode: 'click-33',
                      _debug: { msg: 'Checklist item order inc' },
                      delay: {
                        before: 0,
                        after: 1000,
                      },
                    })
                  }
                  // -- NOTE: Update state
                  setNestedValue({ target: mutatedChecklistItem, path: 'order', value: currentOrder + 1 })
                  targetChecklist[targetChecklistItemIndex] = mutatedChecklistItem
                  targetLog.checklist = targetChecklist
                  targetLogList[targetLogIndex] = targetLog
                  targetJob.logs.items = targetLogList
                  modifiedJobsItems[targetJobIndex] = targetJob
                  // --
                } else console.log(`-- [+] CHECKLIST ITEM NOT FOUND`)
              } else console.log(`-- [+] CHECKLIST NOT FOUND`)
            } else console.log(`-- [+] LOG NOT FOUND`)
          } else console.log(`-- [+] JOB NOT FOUND`)
          return { ...context.jobs, items: modifiedJobsItems }
        },
      }),
    },
    'todo.editChecklistItemInLog.orderDec': {
      actions: assign({
        jobs: ({ context, event }) => {
          const modifiedJobsItems = [...context.jobs.items]
          const { jobId, checklistItemId, logTs } = event.value
          const targetJobIndex = getBinarySearchedIndexByDotNotation({
            items: modifiedJobsItems,
            target: {
              value: jobId,
              propPath: 'id',
            },
            sorted: 'DESC',
          })
          if (targetJobIndex !== -1) {
            const targetJob = modifiedJobsItems[targetJobIndex]
            const targetLogList = targetJob.logs.items
            const targetLogIndex = getBinarySearchedIndexByDotNotation({
              items: targetLogList,
              target: {
                value: logTs,
                propPath: 'ts',
              },
              sorted: 'DESC',
            })
            if (targetLogIndex !== -1) {
              const targetLog = targetLogList[targetLogIndex]
              const targetChecklist = targetLog.checklist
              if (!!targetChecklist) {
                const targetChecklistItemIndex = targetChecklist.findIndex((e) => e.id === checklistItemId)
                if (targetChecklistItemIndex !== -1) {
                  const mutatedChecklistItem = targetChecklist[targetChecklistItemIndex]
                  const currentOrder = mutatedChecklistItem.order || 0
                  const prevOrderElementIndex = targetChecklist.findIndex((e) => e.order === currentOrder - 1 || 0)
                  if (prevOrderElementIndex !== -1) {
                    const mutatedPrevChecklistItem = targetChecklist[prevOrderElementIndex]
                    setNestedValue({ target: mutatedPrevChecklistItem, path: 'order', value: currentOrder })
                    targetChecklist[prevOrderElementIndex] = mutatedPrevChecklistItem
                    soundManager.playDelayedSoundConfigurable({
                      soundCode: 'click-34',
                      _debug: { msg: 'Checklist item order dec' },
                      delay: {
                        before: 0,
                        after: 1000,
                      },
                    })
                  }
                  // -- NOTE: Update state
                  setNestedValue({ target: mutatedChecklistItem, path: 'order', value: currentOrder - 1 })
                  targetChecklist[targetChecklistItemIndex] = mutatedChecklistItem
                  targetLog.checklist = targetChecklist
                  targetLogList[targetLogIndex] = targetLog
                  targetJob.logs.items = targetLogList
                  modifiedJobsItems[targetJobIndex] = targetJob
                  // --
                }
              }
            }
          }
          return { ...context.jobs, items: modifiedJobsItems }
        },
      }),
    },
    'todo.deleteChecklistFromLog': {
      actions: assign({
        jobs: ({ context, event }) => {
          const targetJob = context.jobs.items.find(({ id }) => id === event.value.jobId)
          if (!targetJob) {
            return context.jobs
          }

          const tsUpdate = new Date().getTime()

          return {
            ...context.jobs,
            items: context.jobs.items.map((todo) => {
              if (todo.id === event.value.jobId) {
                todo.logs.items = todo.logs.items.map((log) => {
                  if (log.ts === event.value.logTs) {
                    // NOTE: Add link to log
                    // if (!log.links) log.links = []
                    // const ts = new Date().getTime()
                    // const newLink: TLogLink = { ...event.value.state, id: ts }
                    // if (log.links.length >= limit) {
                    //   log.links.pop()
                    // }
                    // log.links.unshift(newLink)

                    // NOTE: Add checklist to log
                    // if (!log.checklist) log.checklist = []
                    // const tsCreate = new Date().getTime()
                    // const newChecklistItem: TLogChecklistItem = {
                    //   id: tsCreate,
                    //   isDone: false,
                    //   isDisabled: false,
                    //   links: [],
                    //   title: event.value.state.title.trim().replace(/\s+/g,' '),
                    //   descr: event.value.state.descr.trim().replace(/\s+/g,' '),
                    //   ts: {
                    //     createdAt: tsCreate,
                    //     updatedAt: tsCreate,
                    //   },
                    // }
                    // if (log.checklist.length >= checklistItemsLimit) log.checklist.pop()

                    // log.checklist.unshift(newChecklistItem)

                    // NOTE: Edit
                    // if (!log.checklist) log.checklist = []
                    delete log.checklist

                    soundManager.playDelayedSoundConfigurable({
                      soundCode: 'switch-3-epic',
                      _debug: { msg: 'Checklist deleted from log' },
                      delay: {
                        before: 0,
                        after: 250,
                      },
                    })

                    todo.ts.update = tsUpdate
                  }
                  return log
                })
              }
              return todo
            })
          }
        },
      }),
    },
    'todo.deleteChecklistItemFromLog': {
      actions: assign({
        jobs: ({ context, event }) => {
          const targetJob = context.jobs.items.find(({ id }) => id === event.value.jobId)
          if (!targetJob) {
            return context.jobs
          }

          const tsUpdate = new Date().getTime()

          return {
            ...context.jobs,
            items: context.jobs.items.map((todo) => {
              if (todo.id === event.value.jobId) {
                todo.logs.items = todo.logs.items.map((log) => {
                  if (log.ts === event.value.logTs) {
                    log.checklist = log.checklist?.filter(({ id }) => id !== event.value.checklistItemId) || []
                    if (log.checklist.length === 0) delete log.checklist

                    todo.ts.update = tsUpdate
                  }
                  return log
                })
              }
              return todo
            })
          }
        },
      }),
    },
    'todo.deleteLinkInLog': {
      actions: assign({
        jobs: ({ context, event }) => {
          const targetJob = context.jobs.items.find(({ id }) => id === event.value.jobId)
          if (!targetJob) {
            return context.jobs
          }

          return {
            ...context.jobs,
            items: context.jobs.items.map((todo) => {
              if (todo.id === event.value.jobId) {
                todo.logs.items = todo.logs.items.map((log) => {
                  if (log.ts === event.value.logTs) {
                    // NOTE: Remove link
                    if (!log.links) log.links = []
                    log.links = log.links.filter((link) => link.id !== event.value.linkId)
                  }
                  return log
                })
              }
              return todo
            })
          }
        },
      }),
    },
    'todo.editLinkInLog': {
      actions: assign({
        jobs: ({ context, event }) => {
          const targetJob = context.jobs.items.find(({ id }) => id === event.value.jobId)
          if (!targetJob) {
            return context.jobs
          }

          return {
            ...context.jobs,
            items: context.jobs.items.map((todo) => {
              if (todo.id === event.value.jobId) {
                todo.logs.items = todo.logs.items.map((log) => {
                  if (log.ts === event.value.logTs) {
                    // NOTE: Add link for log
                    if (!log.links) log.links = []

                    log.links = log.links.map((oldLink) => {
                      if (oldLink.id === event.value.linkId) {
                        return {
                          ...oldLink,
                          ...event.value.state,
                        }
                      }
                      return oldLink
                    })
                  }
                  return log
                })
              }
              return todo
            })
          }
        },
      }),
    },
    'todo.commit': {
      actions: assign({
        users: ({ context, event }) => {
          const { job: jobToUpdate } = event
          const updateTime = new Date().getTime()

          const newUsers = [...context.users.items]
          if (!!jobToUpdate.forecast?.assignedTo) {
            // if (!!jobToUpdate.forecast.assignedTo) {
            //   jobToUpdate.forecast.employee.value = String(jobToUpdate.forecast.employee._id)
            //   jobToUpdate.forecast.assignedTo = jobToUpdate.forecast.employee._id
            // }

            // NOTE: Check if exists
            const users = context.users
            const targetUser = users.items.find(({ id }) => id === jobToUpdate.forecast.assignedTo)
            if (!targetUser) {
              const displayName = !!jobToUpdate.forecast._assignedToName
                ? jobToUpdate.forecast._assignedToName.trim().replace(/\s+/g, ' ') : 'NoName'
              newUsers.unshift({
                id: !Number.isNaN(Number(jobToUpdate.forecast.assignedTo))
                  ? Number(jobToUpdate.forecast.assignedTo)
                  : updateTime,
                displayName,
                ts: {
                  create: updateTime,
                  update: updateTime,
                },
              })
              soundManager.playDelayedSoundConfigurable({
                soundCode: 'plop-1',
                _debug: {
                  msg: `User [${displayName}] will be created`,
                },
                delay: {
                  after: 250,
                  before: 0,
                },
              })
              delete jobToUpdate.forecast._assignedToName
            }
          }

          return {
            ...context.users,
            items: newUsers,
          }
        },
        jobs: ({ context, event }) => {
          const { job: jobToUpdate, comment } = event
          const updateTime = new Date().getTime()
          jobToUpdate.ts.update = updateTime

          // const targetJobIndex = context.jobs.items.findIndex(({ id }) => id)

          // if (!!jobToUpdate.forecast.employee) {
          //   if (!!jobToUpdate.forecast.employee._id) {
          //     jobToUpdate.forecast.employee.value = String(jobToUpdate.forecast.employee._id)
          //     jobToUpdate.forecast.assignedTo = jobToUpdate.forecast.employee._id
          //   }
          // }

          // console.log('-- jobToUpdate (1)')
          // console.log(jobToUpdate)
          // console.log('--')

          // if (!jobToUpdate.title.trim().length) return context.todos.filter((todo) => todo.id !== jobToUpdate.id)

          const newParentId = jobToUpdate.relations?.parent
          const _newMsgsForParent = new Set()

          return {
            ...context.jobs,
            items: context.jobs.items.map((todo, i, a) => {
              switch (true) {
                case typeof newParentId === 'number' && todo.id === newParentId: {
                  // NOTE: NEW PARENT JOB
                  console.log('- /NEW PARENT JOB')

                  // -- NOTE: Update children list for parent job
                  todo.relations.children = [...new Set([jobToUpdate.id, ...(todo.relations.children || [])])]
                  // console.log('Children updated: [1]')

                  // --- Info
                  let _childWasAlreadyAdded = false
                  switch (true) {
                    case todo.relations.children.length > 0:
                      _childWasAlreadyAdded = todo.relations?.children?.includes(jobToUpdate.id)
                      break
                    default:
                      break
                  }
                  if (!_childWasAlreadyAdded) {
                    _newMsgsForParent.add(`Child job added: [job=${jobToUpdate.id}]`)
                  }
                  if (_newMsgsForParent.size > 0) {
                    if (todo.logs.items.length >= todo.logs.limit) todo.logs.items.pop()

                    const newLog: TLogsItem = {
                      ts: updateTime,
                      text: _newMsgsForParent.size > 0 ? [..._newMsgsForParent].join(' // ') : 'Updated', // •
                    }
                    todo.logs.items.unshift(newLog)
                  }

                  // if (targetJobIndex !== -1) {
                  //   if (a[targetJobIndex].logs.items.length >= a[targetJobIndex].logs.limit)
                  //     a[targetJobIndex].logs.items.pop()
                  //   const _msgs = [
                  //     `Parent set & updated: [job=${parentId}]`,
                  //   ]
                  //   a[targetJobIndex].logs.items.unshift({
                  //     ts: updateTime + 1,
                  //     text: _msgs.join(' // '),
                  //   })
                  // }
                  // ---
                  // --
                  console.log('- /')
                  break
                }
                case (todo.id === jobToUpdate.id): {

                  // NOTE: TARGET JOB
                  console.log('- /TARGET JOB')

                  console.log('- before jobToUpdate.pointset')
                  console.log(jobToUpdate.pointset)
                  if (!!todo.pointset) {
                    jobToUpdate.pointset = [...todo.pointset]
                  }
                  console.log('- after jobToUpdate.pointset')
                  console.log(jobToUpdate.pointset)

                  soundManager.playDelayedSoundConfigurable({
                    soundCode: 'mech-81-step-hydraulic-robot',
                    _debug: { msg: `Target job detected: ${jobToUpdate.id}` },
                    delay: { before: 0, after: 1500 },
                  })

                  // console.log('-- jobToUpdate (1)')
                  // console.log(jobToUpdate)
                  // console.log('--')

                  // -- NOTE: Remove child from parent if necessary
                  const shouldChildBeRemovedFromParent: {
                    doIt: boolean;
                    targetChildId?: number;
                  } = {
                    doIt: false,
                    targetChildId: undefined,
                  }

                  // soundManager.playDelayedSound({ soundCode: 'gong-6', _debug: { msg: 'EXP' } })
                  // console.log(`${todo.relations?.parent} -> ${jobToUpdate.relations?.parent}`)
                  // console.log(`NEW PARENT: ${jobToUpdate.relations?.parent}`)

                  const isParentJobRemoved = !!todo.relations?.parent && !jobToUpdate.relations?.parent
                  const isParentJobSet = !!jobToUpdate.relations?.parent
                  const hasOldParentJob = !!todo.relations?.parent

                  switch (true) {
                    case isParentJobRemoved: {
                      // NOTE: Parent job removed!
                      console.log('-- /Parent job removed!')

                      // console.log('- [1] parent should be removed')
                      shouldChildBeRemovedFromParent.doIt = true
                      shouldChildBeRemovedFromParent.targetChildId = jobToUpdate.id
                      if (shouldChildBeRemovedFromParent.doIt) {
                        // console.log('- [1.1] parent should be removed')
                        const parentIndex = a.findIndex(({ id }) => id === todo.relations?.parent)
                        if (parentIndex !== -1 && Array.isArray(a[parentIndex].relations?.children)) {
                          console.log('--- OLD PARENT JOB')
                          // console.log(todo.relations.parent)
                          // console.log(`- [1.1.1] old childs arr: ${JSON.stringify(a[parentIndex].relations.children)}`)
                          if (typeof a[parentIndex].relations === 'undefined') {
                            a[parentIndex].relations = {
                              parent: null,
                              children: [],
                            }
                          }
                          a[parentIndex].relations.children = a[parentIndex].relations?.children
                            .filter((id) => id !== shouldChildBeRemovedFromParent.targetChildId)
                          // console.log(`--- children updated:`)
                          // console.log(a[parentIndex].relations.children)
                          soundManager.playDelayedSoundConfigurable({
                            soundCode: 'ojing-eo-geim_player-excluded',
                            _debug: {
                              msg: '[1:isParentJobRemoved] Child job removed in old parent job (old parent affected)'
                            },
                            delay: { before: 0, after: 1000 },
                          })

                          if (a[parentIndex].logs.items.length >= a[parentIndex].logs.limit)
                            a[parentIndex].logs.items.pop()

                          a[parentIndex].logs.items.unshift({
                            ts: updateTime + 1,
                            text: `Child job removed (case 1): [job=${shouldChildBeRemovedFromParent.targetChildId}]`,
                          })
                          // console.log(`- [1.1.2] new childs arr: ${JSON.stringify(a[parentIndex].relations.children)}`)
                        } // else console.log(`- [1.2] parentIndex=${parentIndex} NOT FOUND`)
                      } // else console.log('- [2] parent should NOT be removed')

                      // Remove parent
                      if (!todo.relations) {
                        todo.relations = {
                          parent: null,
                          children: [],
                        }
                      }
                      todo.relations.parent = null
                      // jobToUpdate.relations.children = todo.relations.children || []
                      console.log('-- /')
                      break
                    }
                    case isParentJobSet: {
                      // NOTE: Set new parent!
                      console.log('-- /Set new parent!')
                      // soundManager.playDelayedSound({
                      //   soundCode: 'plop-1',
                      //   _debug: { msg: 'New parent will be set' },
                      // })

                      switch (true) {
                        case hasOldParentJob:
                          // NOTE: Has old parent
                          console.log('--- /Has old parent')

                          if (todo.relations.parent !== jobToUpdate.relations.parent) {
                            // NOTE: Remove child from old parent
                            shouldChildBeRemovedFromParent.doIt = true
                            shouldChildBeRemovedFromParent.targetChildId = jobToUpdate.id
                            const parentIndex = a.findIndex(({ id }) => id === todo.relations.parent)
                            if (parentIndex !== -1 && Array.isArray(a[parentIndex].relations.children)) {
                              a[parentIndex].relations.children = a[parentIndex].relations.children
                                .filter((id) => id !== shouldChildBeRemovedFromParent.targetChildId)

                              soundManager.playDelayedSoundConfigurable({
                                soundCode: 'ojing-eo-geim_player-excluded',
                                _debug: {
                                  msg: [
                                    '[2:isParentJobSet:hasOldParentJob]',
                                    'Child job removed in old parent job (parent affected)',
                                  ].join(' ')
                                },
                                delay: { before: 0, after: 1000 },
                              })
                            }
                            if (a[parentIndex].logs.items.length >= a[parentIndex].logs.limit)
                              a[parentIndex].logs.items.pop()

                            a[parentIndex].logs.items.unshift({
                              ts: updateTime + 1,
                              text: `Child job removed (case 2): [job=${shouldChildBeRemovedFromParent.targetChildId}]`,
                            })
                          } else if (!!jobToUpdate.relations.parent && jobToUpdate.relations.parent === todo.relations.parent) {
                            // NOTE: old parent already set (need to update info in parent)
                            const parentIndex = a.findIndex(({ id }) => id === todo.relations.parent)
                            if (parentIndex !== -1) {
                              a[parentIndex].relations.children = [...new Set([jobToUpdate.id, ...(a[parentIndex].relations.children || [])])]
                            }

                            // a[targetJobIndex].relations.children = [...new Set([, ...(a[targetJobIndex].relations.children || [])])]
                            // Nothing: Parent already set
                            // if (targetJobIndex !== -1) {
                            //   if (a[targetJobIndex].logs.items.length >= a[targetJobIndex].logs.limit)
                            //     a[targetJobIndex].logs.items.pop()
                            //   a[targetJobIndex].logs.items.unshift({
                            //     ts: updateTime + 1,
                            //     text: `SPECIAL LOG: Parent already set: [job=${parentId}]`,
                            //   })
                            // }
                          }
                          todo.relations.parent = jobToUpdate.relations.parent

                          console.log('[1] CURRENT todo.relations.children')
                          console.log(todo.relations.children)
                          // jobToUpdate.relations.children = todo.relations.children || []
                          console.log('--- /')
                          break
                        case !todo.relations?.parent: {
                          // NOTE: Hasnt parent yet but will be set!
                          console.log('--- /Hasnt parent yet but will be set!')

                          // Add child to parent
                          const parentIndex = a.findIndex(({ id }) => id === jobToUpdate.relations.parent)
                          if (parentIndex !== -1 && Array.isArray(a[parentIndex].relations.children)) {
                            a[parentIndex].relations.children = [...new Set([jobToUpdate.id, ...(a[parentIndex].relations.children || [])])]
                            soundManager.playDelayedSoundConfigurable({
                              soundCode: 'click-8',
                              _debug: {
                                msg: 'Hasnt parent yet: Child added to parent',
                              },
                              delay: { before: 0, after: 1000 },
                            })
                            if (a[parentIndex].logs.items.length >= a[parentIndex].logs.limit)
                              a[parentIndex].logs.items.pop()

                            a[parentIndex].logs.items.unshift({
                              ts: updateTime + 1,
                              text: `Child job added (case 3): [job=${jobToUpdate.id}]`,
                            })
                          }

                          // Add parent to child
                          if (!todo.relations) {
                            todo.relations = {
                              parent: null,
                              children: [],
                            }
                          }
                          todo.relations.parent = jobToUpdate.relations.parent
                          // todo.relations.children = 
                          // console.log('[2] CURRENT todo.relations.children')
                          // console.log(todo.relations.children)
                          // jobToUpdate.relations.children = todo.relations.children || []
                          console.log('--- /')
                          break
                        }
                        default:
                          console.log('--- /Default')
                          soundManager.playDelayedSound({
                            soundCode: 'fail-11',
                            _debug: { msg: 'Unknown case' },
                          })

                          if (!todo.relations) {
                            todo.relations = {
                              parent: null,
                              children: [],
                            }
                          }
                          todo.relations.parent = jobToUpdate.relations.parent
                          // jobToUpdate.relations.children = todo.relations.children || []
                          console.log('--- /')
                          break
                      }
                      // Nothing: Parent already set
                      console.log('-- /')
                      break
                    }
                    default:
                      console.log('-- /DEFAULT CASE!')
                      console.log('-- /')
                      break
                  }
                  // --

                  // NOTE: Tested
                  jobToUpdate.relations = todo.relations

                  const { ts: { create } } = todo
                  jobToUpdate.ts.create = create

                  const normalizedTitle = jobToUpdate.title.trim().replace(/\s+/g, ' ')
                  const normalizedDescr = !!jobToUpdate.descr ? jobToUpdate.descr.trim().replace(/\s+/g, ' ') : ''

                  if (jobToUpdate.title !== normalizedTitle) jobToUpdate.title = normalizedTitle
                  if (jobToUpdate.descr !== normalizedDescr) jobToUpdate.descr = normalizedDescr

                  delete jobToUpdate.forecast._assignedToName

                  jobToUpdate.logs.items = todo.logs?.items || []

                  const _newMsgs = new Set()

                  switch (true) {
                    case !todo.logs.isEnabled && jobToUpdate.logs.isEnabled: {
                      if (jobToUpdate.logs.items.length >= jobToUpdate.logs.limit) jobToUpdate.logs.items.pop()

                      const normalizedComment = !!comment ? comment.trim().replace(/\s+/g, ' ') : ''
                      if (!!normalizedComment) {
                        _newMsgs.add(comment)
                      }

                      _newMsgs.add('Logs enabled (will ask your comment for each activity)')
                      break
                    }
                    case todo.logs.isEnabled && !jobToUpdate.logs.isEnabled: {
                      if (jobToUpdate.logs.items.length >= jobToUpdate.logs.limit) jobToUpdate.logs.items.pop()

                      _newMsgs.add('Logs disabled (minimal history)')
                      break
                    }
                    case (
                      (todo.logs.isEnabled && jobToUpdate.logs.isEnabled)
                      || (!todo.logs.isEnabled && !jobToUpdate.logs.isEnabled)
                    ):
                      if (jobToUpdate.logs?.isEnabled) {
                        if (jobToUpdate.logs.items.length >= jobToUpdate.logs.limit) jobToUpdate.logs.items.pop()

                        const normalizedComment = !!comment ? comment.trim().replace(/\s+/g, ' ') : ''
                        _newMsgs.add(normalizedComment || 'No comment')
                      }
                      break
                    default:
                      break
                  }

                  // NOTE: Reassigned
                  const hasOldUser = !!todo.forecast.assignedTo
                  const hasNewUser = !!jobToUpdate.forecast.assignedTo
                  const hasAssignedToNobody = !hasNewUser
                  const hasReassigned = hasOldUser && hasNewUser && hasOldUser !== hasNewUser
                  const hasReassignedToNobody = hasOldUser && hasAssignedToNobody
                  const hasAssignedFromNobody = !hasOldUser && hasNewUser
                  // let targetNewUser: TUser | undefined
                  // if (hasNewUser) {
                  //   targetNewUser = context.users.items.find((u) => u.id === jobToUpdate.forecast.assignedTo)
                  // }
                  // let targetOldUser: TUser | undefined
                  // if (hasOldUser) {
                  //   targetOldUser = context.users.items.find((u) => u.id === todo.forecast.assignedTo)
                  // }

                  if (hasAssignedToNobody) {
                    soundManager.playDelayedSoundConfigurable({
                      soundCode: 'ojing-eo-geim_player-excluded',
                      _debug: { msg: 'Job has assigned to nobody' },
                      delay: { before: 0, after: 900 },
                    })
                    // delete todo.forecast.assignedTo
                  }

                  switch (true) {
                    case hasAssignedFromNobody:
                      _newMsgs.add(`Assigned: to [user=${jobToUpdate.forecast.assignedTo}]`)
                      break
                    case hasReassignedToNobody:
                      _newMsgs.add(`UnAssigned: from [user=${todo.forecast.assignedTo}] to nobody`)
                      break
                    case hasReassigned:
                      _newMsgs.add(`ReAssigned: from [user=${todo.forecast.assignedTo}] to [user=${jobToUpdate.forecast.assignedTo}]`)
                      break
                    default:
                      break
                  }

                  // NOTE: Set new parent
                  const hasOldParent = !!todo.relations?.parent
                  const hasNewParent = !!jobToUpdate.relations?.parent
                  const hasParentReplaced = hasOldParent && hasNewParent && todo.relations?.parent !== jobToUpdate.relations?.parent
                  const hasParentRemoved = hasOldParent && !hasNewParent
                  const hasNewParentSetFromNothing = !hasOldParent && hasNewParent
                  switch (true) {
                    case hasNewParentSetFromNothing:
                      _newMsgs.add(`Parent job set: [job=${jobToUpdate.relations?.parent}]`)
                      break
                    case hasParentRemoved:
                      _newMsgs.add(`Parent job removed: [job=${jobToUpdate.relations?.parent}]`)
                      break
                    case hasParentReplaced:
                      _newMsgs.add(`Parent job replaced: from [job=${todo.relations?.parent}] to [job=${jobToUpdate.relations?.parent}]`)
                      break
                    default:
                      break
                  }

                  // NOTE: complexity updated
                  if (todo.forecast.complexity !== jobToUpdate.forecast.complexity) {
                    _newMsgs.add(`Complexity ${todo.forecast.complexity} -> ${jobToUpdate.forecast.complexity}`)
                  }

                  // NOTE: completed flag
                  const wasCompleted = todo.completed
                  if (!wasCompleted) {
                    if (!todo.forecast.finish) {
                      if (!!jobToUpdate.forecast.finish) {
                        jobToUpdate.completed = true
                        _newMsgs.add('Job finished, so set to completed')
                      } else jobToUpdate.completed = false
                    } else {
                      jobToUpdate.completed = true
                    }
                  }
                  jobToUpdate.completed = !!jobToUpdate.forecast.finish

                  let progress: null | TLogProgress = null

                  // -- NOTE: Progress
                  soundManager.playDelayedSoundConfigurable({
                    soundCode: 'electro-2',
                    _debug: { msg: 'Experimental (progress)' },
                    delay: { before: 0, after: 500 },
                  })
                  switch (true) {
                    // NOTE: 1. (Finish date was removed | updated) | Estimate | complexity updated
                    case (
                      (!!todo.forecast.finish && !jobToUpdate.forecast.finish)
                      || (!!todo.forecast.finish && todo.forecast.finish !== jobToUpdate.forecast.finish)
                      || jobToUpdate.forecast.estimate !== todo.forecast.estimate
                      || jobToUpdate.forecast.complexity !== todo.forecast.complexity
                    ):
                      switch (true) {
                        // NOTE: 1.1 Estimate | complexity updated
                        case (
                          jobToUpdate.forecast.estimate !== todo.forecast.estimate
                          || jobToUpdate.forecast.complexity !== todo.forecast.complexity
                        ): {
                            // NOTE: 1.1.1 Estimate & start exists & job assigned
                            if (
                              !!jobToUpdate.forecast.estimate
                              && !!jobToUpdate.forecast.start
                              && !!jobToUpdate.forecast.assignedTo
                            ) {
                              const targetUserJobs = context.jobs.items
                                .filter(({ forecast }) => forecast.assignedTo === jobToUpdate.forecast.assignedTo)
                              const otherUserJobsForAnalysis = targetUserJobs
                                .filter(({ forecast }) =>
                                  forecast.estimate
                                  && forecast.start
                                  && forecast.finish
                                  && forecast.assignedTo !== jobToUpdate.forecast.assignedTo
                                  && forecast.complexity === jobToUpdate.forecast.complexity
                                )
                              const worstDate = otherUserJobsForAnalysis.length > 0
                                ? getWorstCalc({
                                  theJobList: otherUserJobsForAnalysis,
                                  ts: {
                                    testStart: jobToUpdate.forecast.start,
                                    testDiff: jobToUpdate.forecast.estimate - jobToUpdate.forecast.start,
                                  },
                                }).date100
                                : 0
                              const worstProgress = getCurrentPercentage({
                                targetDateTs: worstDate,
                                startDateTs: jobToUpdate.forecast.start,
                              })
                              const estimateProgress = getCurrentPercentage({
                                targetDateTs: jobToUpdate.forecast.estimate,
                                startDateTs: jobToUpdate.forecast.start,
                              })

                              progress = {
                                worst: otherUserJobsForAnalysis.length
                                  ? Math.round(worstProgress)
                                  : Math.round(estimateProgress),
                                estimate: Math.round(estimateProgress),
                              }

                              _newMsgs.add('Progress updated')
                            }
                            break
                          }
                        default:
                          break
                      }
                      break
                    default:
                      break
                  }

                  if (jobToUpdate.completed) {
                    const v = getSpeed(jobToUpdate)
                    jobToUpdate.v = v
                    _newMsgs.add(`v= ${v}`)
                    soundManager.playDelayedSoundConfigurable({
                      soundCode: 'mech-3', _debug: { msg: 'Job completed' },
                      delay: { before: 0, after: 750 },
                    })
                  } else {
                    delete jobToUpdate.v
                    soundManager.playDelayedSoundConfigurable({
                      soundCode: 'click-1',
                      _debug: {
                        msg: 'Job not completed'
                      },
                      delay: { before: 0, after: 750 },
                    })
                  }
                  // --

                  const newLog: TLogsItem = {
                    ts: updateTime,
                    text: _newMsgs.size > 0 ? [..._newMsgs].join(' • ') : 'Updated', // •
                  }
                  if (!!progress) newLog.progress = progress

                  jobToUpdate.logs.items.unshift(newLog)

                  // soundManager.playDelayedSound({ soundCode: 'click-12', _debug: { msg: 'Done: updated jod will be saved.' } })

                  return jobToUpdate
                }
                default:
                  break
              }

              return todo
            })
          }
        }
      })
    },
    'todo.clearDates': {
      actions: assign({
        jobs: ({ context, event }) => {
          const { id } = event
          const newTodos: TJob[] = []

          for (const todo of context.jobs.items) {
            if (todo.id === id) {
              const updateTime = new Date().getTime()

              delete todo.forecast.start
              delete todo.forecast.estimate
              delete todo.forecast.finish
              delete todo.v

              todo.completed = false
              todo.ts.update = updateTime

              if (todo.logs?.isEnabled) {
                if (todo.logs.items.length >= todo.logs.limit) todo.logs.items.pop()

                todo.logs.items.unshift({ ts: updateTime, text: 'Dates cleared' })
              }
              soundManager.playDelayedSound({ soundCode: 'click-27' })
            }
            newTodos.push(todo)
          }

          return {
            ...context.jobs,
            items: newTodos,
          }
        }
      })
    },
    'todo.addTimeToFinishDate': {
      actions: assign({
        jobs: ({ context, event }) => {
          const { id, comment, hours } = event
          const newTodos: TJob[] = []

          for (const todo of context.jobs.items) {
            if (todo.id === id) {
              const updateTime = new Date().getTime()
              const msgs: string[] = []

              // -- NOTE: Modify here
              // 0. Add comment
              if (todo.logs?.isEnabled) {
                if (todo.logs.items.length >= todo.logs.limit)
                  todo.logs.items.pop()

                const normalizedComment = !!comment ? comment.trim().replace(/\s+/g, ' ') : ''
                if (!!normalizedComment) msgs.push(normalizedComment)
              }

              // 1. If exists -> add hrs
              if (!!todo.forecast.finish) {
                msgs.push(`+${hours}h to finish time`)
                const oldTs = todo.forecast.finish
                const newTs = todo.forecast.finish + (hours * 60 * 60 * 1000)
                msgs.push(`${dayjs(oldTs).format('DD.MM.YYYY HH:mm')} -> ${dayjs(newTs).format('DD.MM.YYYY HH:mm')}`)
                todo.forecast.finish = newTs
              }
              // 2. Recalc v if necessary
              if (todo.completed) {
                const v = getSpeed(todo)
                todo.v = v
                msgs.push(`v= ${v}`)
              } else delete todo.v
              // --

              todo.ts.update = updateTime

              if (msgs.length > 0)
                todo.logs.items.unshift({ ts: updateTime, text: msgs.join(' // ') })
            }
            newTodos.push(todo)
          }

          return {
            ...context.jobs,
            items: newTodos,
          }
        }
      })
    },
    'todo.delete': {
      actions: assign({
        jobs: ({ context, event }) => {
          const { id } = event
          const updateTime = new Date().getTime()
          const targetJobIndex = context.jobs.items.findIndex(({ id }) => id)

          // if (context.jobs.items.some((todo) => todo.id === id))
          //   soundManager.playDelayedSound({ soundCode: 'fail-41' })

          return {
            ...context.jobs,
            items: context.jobs.items.map((todo, i, jobItems) => {
              switch (true) {
                case !!todo.relations.children && todo.relations.children.includes(id): {
                  // NOTE: PARENT JOB
                  // -- NOTE: Remove child from parent if necessary
                  const shouldChildBeRemovedFromParent: {
                    doIt: boolean;
                    targetChildId?: number;
                    targetChildTitle?: string;
                  } = {
                    doIt: false,
                    targetChildId: undefined,
                    targetChildTitle: undefined,
                  }
                  const parentId = targetJobIndex !== -1
                    ? jobItems[targetJobIndex].relations.parent
                    : null
                  if (!!parentId) {
                    // console.log('- [1] parent should be removed')
                    shouldChildBeRemovedFromParent.doIt = true
                    shouldChildBeRemovedFromParent.targetChildId = id
                    if (shouldChildBeRemovedFromParent.doIt) {
                      // console.log('- [1.1] parent should be removed')
                      const parentIndex = i
                      if (parentIndex !== -1 && Array.isArray(jobItems[parentIndex].relations?.children)) {
                        // console.log(`- [1.1.1] old childs arr: ${JSON.stringify(a[parentIndex].relations.children)}`)
                        jobItems[parentIndex].relations.children = jobItems[parentIndex].relations.children.filter((id) => id !== shouldChildBeRemovedFromParent.targetChildId)

                        if (jobItems[parentIndex].logs.items.length >= jobItems[parentIndex].logs.limit)
                          jobItems[parentIndex].logs.items.pop()

                        const targetChildTitle = jobItems.find(({ id }) => id === shouldChildBeRemovedFromParent.targetChildId)?.title
                        const _parentMsgs = [`Child job deleted (affected) [job=${shouldChildBeRemovedFromParent.targetChildId}]`]
                        if (!!targetChildTitle) _parentMsgs.push(`(${targetChildTitle})`)
                        jobItems[parentIndex].logs.items.unshift({
                          ts: updateTime,
                          text: _parentMsgs.join(' '),
                        })
                        // console.log(`- [1.1.2] new childs arr: ${JSON.stringify(a[parentIndex].relations.children)}`)
                      } // else console.log(`- [1.2] parentIndex=${parentIndex} NOT FOUND`)
                    } // else console.log('- [2] parent should NOT be removed')
                  }
                  // --
                  break
                }
                case todo.relations.parent === id: {
                  // NOTE: CHILD JOB
                  // -- NOTE: Remove parent from child if necessary
                  // case typeof parentId === 'number' && todo.id === parentId: {
                  const children = targetJobIndex !== -1
                    ? jobItems[targetJobIndex].relations.children
                    : []
                  if (children.length > 0) {
                    for (const childId of children) {
                      const targetChildIndex = jobItems.findIndex(({ id }) => id === childId)
                      if (targetChildIndex !== -1) {
                        jobItems[targetChildIndex].relations.parent = null

                        if (jobItems[targetChildIndex].logs.items.length >= jobItems[targetChildIndex].logs.limit)
                          jobItems[targetChildIndex].logs.items.pop()

                        jobItems[targetChildIndex].logs.items.unshift({
                          ts: updateTime,
                          text: `Parent job deleted (affected): [job=${id}]`,
                        })
                      }
                    }
                  }
                  // --
                  break
                }
                case todo.id === id: {
                  // NOTE: TARGET JOB
                  soundManager.playDelayedSound({ soundCode: 'fail-41' })
                  // Nothing
                  break
                }
                default:
                  break
              }

              return todo
            }).filter((todo) => todo.id !== id),
          }
        }
      })
    },
    // 'filter.jobStatus.change': {
    //   actions: assign({
    //     jobs: ({ context, event }) => ({
    //       ...context.jobs,
    //       filter: event.filter,
    //     }),
    //   })
    // },
    'todo.mark': {
      actions: assign({
        jobs: ({ context, event }) => {
          const { mark } = event
          const isCompleted = mark === 'completed'
          const updateTime = new Date().getTime()

          return {
            ...context.jobs,
            items: context.jobs.items.map((todo) => {
              if (todo.id === event.id) {
                const _msgs: string[] = []

                _msgs.push(`Job status set to ${event.mark}`)

                const newTodo = {
                  ...todo,
                  completed: isCompleted,
                  forecast: {
                    ...todo.forecast,
                  },
                  ts: {
                    ...todo.ts,
                    update: updateTime,
                  },
                }

                if (isCompleted) {
                  soundManager.playDelayedSound({ soundCode: 'mech-3' })
                  newTodo.forecast.finish = updateTime
                  _msgs.push('Finish date was set to update time')

                  const v = getSpeed(newTodo)
                  newTodo.v = v
                  _msgs.push(`v= ${v}`)
                } else if (!!newTodo.forecast?.finish) {
                  soundManager.playDelayedSound({ soundCode: 'click-1' })
                  _msgs.push(`Finish date [${dayjs(newTodo.forecast.finish).format('DD.MM.YYYY HH:mm')}] removed`)
                  delete newTodo.forecast.finish
                  delete newTodo.v
                }

                newTodo.logs.items
                  .unshift({ ts: updateTime, text: _msgs.join(' // ') })

                return newTodo
              }

              return todo
            })
          }
        }
      })
    },
    'todo.markAll': {
      actions: assign({
        jobs: ({ context, event }) => {
          const { mark } = event
          const updateTime = new Date().getTime()

          return {
            ...context.jobs,
            items: context.jobs.items.map((todo) => {
              if (todo.logs?.isEnabled) todo.logs.items.unshift({ ts: updateTime, text: `Marked as ${mark}` })
              return {
                ...todo,
                completed: mark === 'completed',
              }
            })
          }
        }
      })
    },
    'todos.clearCompleted': {
      actions: assign({
        jobs: ({ context }) => {
          return {
            ...context.jobs,
            items: context.jobs.items.filter((todo) => !todo.completed)
          }
        }
      })
    },
    'user.commit': {
      actions: assign({
        users: ({ context, event }) => {
          const createDate = new Date().getTime()
          const user: TUser = {
            id: event.value.value || createDate,
            displayName: event.value.displayName.trim().replace(/\s+/g, ' '),
            ts: {
              create: createDate,
              update: createDate,
            }
          }

          soundManager.playDelayedSound({ soundCode: 'plop-1' })

          return {
            ...context.users,
            items: [user, ...context.users.items]
          }
        }
      })
    },
    'user.delete': {
      actions: assign({
        users: ({ context, event }) => {
          return {
            ...context.users,
            items: context.users.items.filter(({ id }) => id !== event.value.id)
          }
        }
      })
    },
    'todo.pointset:create-item': {
      actions: assign({
        jobs: ({ context, event }) => {
          return {
            ...context.jobs,
            // items: context.users.items.filter(({ id }) => id !== event.value.id)
            items: context.jobs.items.map((todo) => {
              const isTargetJob = event.value.jobId === todo.id
              switch (isTargetJob) {
                case true: {
                  // NOTE mutate todo!
                  const createTime = new Date().getTime()
                  const newPoint: TPointsetItem = {
                    id: createTime,
                    isDisabled: false,
                    isDone: false,
                    title: event.value.title,
                    descr: event.value.descr,
                    statusCode: event.value.initialStatusCode,
                    ts: {
                      created: createTime,
                      updated: createTime,
                    },
                    relations: {
                      children: [],
                      parent: event.value.relations?.parent || null,
                    },
                  }
                  const isPointsetExists = !!todo.pointset && Array.isArray(todo.pointset)
                  switch (true) {
                    case isPointsetExists: {
                      // NOTE: Modify target pointset
                      const pointsLimit = 100
                      if ((todo.pointset as TPointsetItem[]).length >= pointsLimit) {
                        (todo.pointset as TPointsetItem[]).pop()
                      }
                      (todo.pointset as TPointsetItem[]).unshift(newPoint)
                      break
                    }
                    default: {
                      // NOTE: Create first pointset
                      todo.pointset = [newPoint]
                      break
                    }
                  }
                  if (!!event.value.relations?.parent) {
                    // NOTE: Add child to new parent
                    const newParentId = event.value.relations?.parent
                    const targetNewParentIndex = (todo.pointset as TPointsetItem[]).findIndex((p) => p.id === newParentId)
                    if (targetNewParentIndex !== -1) {
                      const targetNewParent = { ...(todo.pointset as TPointsetItem[])[targetNewParentIndex] }
                      targetNewParent.relations.children = [...new Set([...(targetNewParent.relations.children || []), createTime])]
                    }
                  }
                  todo.ts.update = createTime
                  return todo
                }
                default:
                  return todo
              }
            })
          }
        }
      })
    },
    // -- TODO: DEL!
    // NOTE: Check all items -> remove child if nes
    // NOTE: Check all items -> remove parent if nes
    'todo.pointset:delete-item': {
      actions: assign({
        jobs: ({ context, event }) => {
          return {
            ...context.jobs,
            items: context.jobs.items.map((todo) => {
              const isTargetJob = event.value.jobId === todo.id
              switch (isTargetJob) {
                case true: {
                  const updateTime = new Date().getTime()
                  const isPointsetExists = !!todo.pointset && Array.isArray(todo.pointset)

                  switch (true) {
                    case isPointsetExists: {
                      const targetPointIndex = (todo.pointset as TPointsetItem[]).findIndex((p) => p.id === event.value.pointId)
                      if (targetPointIndex !== -1) {
                        const pointForDelete: TPointsetItem = { ...(todo.pointset as TPointsetItem[])[targetPointIndex] }
                        const oldParentId = pointForDelete.relations.parent
                        const targetOldParentIndex = (todo.pointset as TPointsetItem[]).findIndex((p) => p.id === oldParentId)

                        if (!!oldParentId && targetOldParentIndex !== -1) {
                          const targetOldParent = { ...(todo.pointset as TPointsetItem[])[targetOldParentIndex] }
                          targetOldParent.relations.children = targetOldParent.relations.children.filter((c) => c !== event.value.pointId)
                          targetOldParent.ts.updated = updateTime
                            ; (todo.pointset as TPointsetItem[])[targetOldParentIndex] = targetOldParent
                        }
                        if ((pointForDelete.relations.children.length > 0)) {
                          for (const childId of pointForDelete.relations.children) {
                            const targetChildPointIndex = (todo.pointset as TPointsetItem[]).findIndex((p) => p.id === childId)
                            if (targetChildPointIndex !== -1) {
                              (todo.pointset as TPointsetItem[])[targetChildPointIndex].relations.parent = null
                                ; (todo.pointset as TPointsetItem[])[targetChildPointIndex].ts.updated = updateTime
                            }
                          }
                        }

                        todo.pointset = todo.pointset?.filter((p) => p.id !== event.value.pointId)
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

              return todo
            }),
          }
        },
      }),
    },
    // --
    'todo.pointset:update-item': {
      actions: assign({
        jobs: ({ context, event }) => {
          return {
            ...context.jobs,
            // items: context.users.items.filter(({ id }) => id !== event.value.id)
            items: context.jobs.items.map((todo) => {
              const isTargetJob = event.value.jobId === todo.id
              switch (isTargetJob) {
                case true: {
                  // NOTE mutate todo!
                  const updateTime = new Date().getTime()
                  // const newPoint: TPointsetItem = {
                  //   id: updateTime,
                  //   isDisabled: false,
                  //   isDone: false,
                  //   title: event.value.title,
                  //   descr: event.value.descr,
                  //   statusCode: event.value.statusCode,
                  //   ts: {
                  //     created: updateTime,
                  //     updated: updateTime,
                  //   },
                  //   relations: {
                  //     children: event.value.relations?.children || [],
                  //     parent: event.value.relations?.parent || null,
                  //   },
                  // }
                  const isPointsetExists = !!todo.pointset && Array.isArray(todo.pointset)
                  switch (true) {
                    case isPointsetExists: {
                      // NOTE: Modify target pointset
                      console.log('0 - Modify target pointset')
                      const targetPointIndex = (todo.pointset as TPointsetItem[]).findIndex((p) => p.id === event.value.pointId)
                      if (targetPointIndex !== -1) {
                        console.log('0.1 - targetPointIndex !== -1')
                        const modifiedPoint: TPointsetItem = { ...(todo.pointset as TPointsetItem[])[targetPointIndex] }
                        const oldParentId = modifiedPoint.relations.parent
                        const targetOldParentIndex = (todo.pointset as TPointsetItem[]).findIndex((p) => p.id === oldParentId)

                        const newParentId = event.value.relations?.parent
                        const targetNewParentIndex = (todo.pointset as TPointsetItem[]).findIndex((p) => p.id === newParentId)

                        if (modifiedPoint.title !== event.value.title)
                          modifiedPoint.title = event.value.title
                        if (modifiedPoint.descr !== event.value.descr)
                          modifiedPoint.descr = event.value.descr
                        if (modifiedPoint.statusCode !== event.value.statusCode) {
                          console.log('0.1.1 - modifiedPoint.statusCode !== event.value.statusCode')
                          modifiedPoint.statusCode = event.value.statusCode
                        } else {
                          console.log('0.1.2 - modifiedPoint.statusCode === event.value.statusCode')
                          console.log(modifiedPoint.statusCode, event.value.statusCode)
                        }
                        if (!!event.value.relations) {
                          // NOTE: New relations received
                          switch (true) {
                            case !event.value.relations.parent: {
                              console.log('1 - NO NEW PARENT')
                              // NOTE: NO NEW PARENT
                              if (!!oldParentId) {
                                console.log('1.1 - Remove child (if its cur) from previus parent')
                                // NOTE: Remove child (if its cur) from previus parent
                                if (targetOldParentIndex !== -1) {
                                  console.log('1.1.1 - 🟢 found: targetOldParentIndex & targetOldParent children filtered (!== event.value.pointId)')
                                  const targetOldParent = { ...(todo.pointset as TPointsetItem[])[targetOldParentIndex] }
                                  targetOldParent.relations.children = targetOldParent.relations.children.filter((c) => c !== event.value.pointId)
                                  targetOldParent.ts.updated = updateTime
                                    ; (todo.pointset as TPointsetItem[])[targetOldParentIndex] = targetOldParent
                                }
                              }
                              console.log('1.2 - Remove parent')
                              // NOTE: Remove parent
                              modifiedPoint.relations.parent = null
                              modifiedPoint.ts.updated = updateTime
                              break
                            }
                            default: {
                              console.log('2 - NEW PARENT SHOULD BE SET')
                              // NOTE: NEW PARENT SHOULD BE SET
                              // NOTE: 1. Check old parent -> IF WAS: Remove child if new another parent
                              if (!!oldParentId) {
                                console.log('2.1 - HAS OLD PARENT')
                                // NOTE: HAS OLD PARENT
                                if (oldParentId !== event.value.relations.parent) {
                                  console.log('2.1.1 - Parent updated')
                                  // NOTE: Parent updated
                                  if (targetOldParentIndex !== -1) {
                                    console.log('2.1.1.1 - 🟢 Remove child (current elm) from old parent & targetOldParent children filtered (!== event.value.pointId)')
                                    // NOTE: Remove child (current elm) from old parent
                                    const targetOldParent = { ...(todo.pointset as TPointsetItem[])[targetOldParentIndex] }
                                    targetOldParent.relations.children = targetOldParent.relations.children.filter((c) => c !== event.value.pointId)
                                    targetOldParent.ts.updated = updateTime
                                      ; (todo.pointset as TPointsetItem[])[targetOldParentIndex] = targetOldParent
                                  } else {
                                    console.log('2.1.1.2 - Parent not found?')
                                    // NOTE: Parent not found?
                                  }
                                } else {
                                  console.log('2.1.2 - Parent not modified')
                                  // NOTE: Parent not modified
                                }
                              }

                              if (!oldParentId) {
                                console.log('2.2 - HASNT OLD PARENT')
                                // NOTE: HASNT OLD PARENT
                                if (!!newParentId) {
                                  console.log('2.2.1 - YES: newParentId')
                                  if (targetNewParentIndex !== -1) {
                                    console.log('2.2.1.1 - 🟢 found: targetNewParentIndex & targetNewParent children modified: curr added')
                                    const targetNewParent = (todo.pointset as TPointsetItem[])[targetNewParentIndex]
                                    targetNewParent.relations.children = [...new Set([...targetNewParent.relations.children || [], event.value.pointId])]

                                    if (
                                      targetNewParent.relations.parent === event.value.pointId
                                    ) {
                                      targetNewParent.relations.parent = null
                                    }

                                    targetNewParent.ts.updated = updateTime

                                      ; (todo.pointset as TPointsetItem[])[targetNewParentIndex] = targetNewParent
                                  } else {
                                    console.log('2.2.1.2 - not found: targetNewParentIndex')
                                  }
                                } else {
                                  console.log('2.2.2 - NO: newParentId')
                                }
                              }

                              // NOTE: BUG! Remove child (from crrent elm) if its new parent
                              if (!!newParentId && targetOldParentIndex !== -1) {
                                console.log('3. - Remove child (from crrent elm) if its new parent')
                                const targetOldParent = (todo.pointset as TPointsetItem[])[targetOldParentIndex]
                                if (!!targetOldParent && modifiedPoint.relations.children.includes(newParentId)) {
                                  console.log('3.1 - 🟢 found targetOldParent + has in children of current elm & curr children modified (!==newParentId)')
                                  modifiedPoint.relations.children = modifiedPoint.relations.children.filter((c) => c !== newParentId)
                                } else {
                                  console.log('3.2 - 🟡 children of current elm will not modified')
                                }
                              } else {
                                console.log('3.3 - 🟡 !(newParentId and found targetOldParentIndex) & children of current elm will not modified')
                              }

                              // const targetNewParent = (todo.pointset as TPointsetItem[])[targetNewParentIndex]
                              // if (!!targetNewParent && targetNewParent.relations.children.includes(newParentId)) {
                              //   targetNewParent.relations.children = targetNewParent.relations.children.filter((c) => c !== newParentId)
                              //   targetNewParent.ts.updated = updateTime
                              //     ; (todo.pointset as TPointsetItem[])[targetNewParentIndex] = targetNewParent
                              // }

                              // NOTE: Remove parent (if its current) from old parent
                              console.log('4. - Remove parent (if its current) from old parent')
                              if (!!newParentId && targetOldParentIndex !== -1) {
                                console.log('4.1 - !!newParentId and found targetOldParentIndex')
                                const targetOldParent = (todo.pointset as TPointsetItem[])[targetOldParentIndex]
                                if (!!targetOldParent && targetOldParent.relations.parent === newParentId) {
                                  console.log('4.1.1 - 🟢 targetOldParent + targetOldParent.relations.parent === newParentId & targetOldParent -> null')
                                  targetOldParent.relations.parent = null
                                  targetOldParent.ts.updated = updateTime
                                    ; (todo.pointset as TPointsetItem[])[targetOldParentIndex] = targetOldParent
                                } else {
                                  console.log('4.1.2 - 🟡 !(targetOldParent + targetOldParent.relations.parent === newParentId) & targetOldParent.relations.parent not updated')
                                }
                              } else {
                                console.log('4.2 - 🟡 !(newParentId and found targetOldParentIndex) & targetOldParent.relations.parent not updated')
                              }

                              // NOTE: BUG! Remove old child (from current elm) if its new parent
                              console.log('5. - Remove old child (from current elm) if its new parent')
                              if (!!newParentId && modifiedPoint.relations.children.includes(newParentId)) {
                                console.log(`5.1 - !!newParentId & curr children has newParentId & current children filtered (!== newParentId=${newParentId})`)
                                modifiedPoint.relations.children = modifiedPoint.relations.children.filter((c) => c !== newParentId)
                              } else {
                                console.log('5.2 - 🟡 current children not modified')
                              }

                              // NOTE: BUG! Remove old child (from old parent) if its new child?
                              // console.log('6.')

                              // NOTE: Set parent to child
                              console.log(`6. - 🟢 current parent modified -> ${newParentId || null}`)
                              modifiedPoint.relations.parent = newParentId || null
                              modifiedPoint.ts.updated = updateTime

                              // NOTE: Set child to new parent if necessary
                              console.log('7. - Set child to new parent if necessary')
                              if (!!newParentId && newParentId !== oldParentId) {
                                console.log('7.1 - !!newParentId && newParentId !== oldParentId')
                                // NOTE: Set child to new parent
                                if (targetNewParentIndex !== -1) {
                                  console.log(`7.1.1 - 🟢 found targetNewParentIndex -> targetNewParent children modified (added event.value.pointId=${event.value.pointId})`)
                                  const targetNewParent = (todo.pointset as TPointsetItem[])[targetNewParentIndex]
                                  targetNewParent.relations.children = [...new Set([...targetNewParent.relations.children || [], event.value.pointId])]
                                  targetNewParent.ts.updated = updateTime

                                    ; (todo.pointset as TPointsetItem[])[targetNewParentIndex] = targetNewParent
                                } else {
                                  console.log('7.1.2 - 🟡 targetNewParent children not modified')
                                }
                              } else {
                                console.log('7.2 - 🟡 targetNewParent children not modified')
                              }
                              break
                            }
                          }
                        } else {
                          console.log('0.2 - targetPointIndex === -1')
                        }
                        (todo.pointset as TPointsetItem[])[targetPointIndex] = modifiedPoint
                      }
                      break
                    }
                    default: {
                      // NOTE: Err?
                      console.log('- Не попали в блок isPointsetExists')
                      break
                    }
                  }
                  todo.ts.update = updateTime
                  return todo
                }
                default:
                  return todo
              }
            })
          }
        }
      })
    },
  }
})
