import { assign, setup } from 'xstate'
import { EJobsStatusFilter, TJob, TLogsItem, TUser, TLogProgress } from './types'
import { getCurrentPercentage } from '~/shared/utils'
import { getWorstCalc } from '~/shared/utils/team-scoring'
import { getRounded } from '~/shared/utils/number-ops'
import dayjs from 'dayjs'
import { soundManager } from '~/shared/soundManager'

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
  }
}).createMachine({
  id: 'topLevel',
  context: {
    todo: '',
    jobs: {
      items: [],
      filter: EJobsStatusFilter.ALL,
    },
    users: {
      items: [],
    },
  },
  on: {
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
            title: event.value.title.trim().replace(/\s+/g,' '),
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
          }

          // if (!!newTodo.descr) newTodo.descr = event.value.descr.trim().replace(/\s+/g,' ')

          soundManager.playSound({ soundCode: 'plop-1' })

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
              soundManager.playSound({ soundCode: 'plop-3' })
              newUsers.unshift({
                id: !Number.isNaN(Number(jobToUpdate.forecast.assignedTo))
                  ? Number(jobToUpdate.forecast.assignedTo)
                  : updateTime,
                displayName: !!jobToUpdate.forecast._assignedToName
                  ? jobToUpdate.forecast._assignedToName.trim().replace(/\s+/g,' ') : 'NoName',
                ts: {
                  create: updateTime,
                  update: updateTime,
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

          const parentId = jobToUpdate.relations?.parent
          const _newMsgsForParent = new Set()

          return {
            ...context.jobs,
            items: context.jobs.items.map((todo, i, a) => {
              switch (true) {
                // -- NOTE: Update children list for parent job
                case typeof parentId === 'number' && todo.id === parentId: {
                  let childWasAlreadyAdded = false
                  switch (true) {
                    case !!todo.relations:
                      if (Array.isArray(todo.relations.children)) {
                        childWasAlreadyAdded = todo.relations?.children?.includes(jobToUpdate.id)
                        todo.relations.children = [...new Set([jobToUpdate.id, ...todo.relations.children])]
                      }
                      else
                        todo.relations.children = [jobToUpdate.id]
                      break
                    default:
                      todo.relations = {
                        children: [jobToUpdate.id]
                      }
                      break
                  }

                  if (!childWasAlreadyAdded) {
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
                  
                  break
                }
                // --
                case (todo.id === jobToUpdate.id): {
                  if (!!todo.relations?.children) {
                    if (!jobToUpdate.relations) {
                      jobToUpdate.relations = {
                        children: todo.relations?.children,
                      }
                    }
                  }
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
                  if (!!todo.relations?.parent && !jobToUpdate.relations?.parent) {
                    // console.log('- [1] parent should be removed')
                    shouldChildBeRemovedFromParent.doIt = true
                    shouldChildBeRemovedFromParent.targetChildId = jobToUpdate.id
                    if (shouldChildBeRemovedFromParent.doIt) {
                      // console.log('- [1.1] parent should be removed')
                      const parentIndex = a.findIndex(({ id }) => id === todo.relations?.parent)
                      if (parentIndex !== -1 && Array.isArray(a[parentIndex].relations?.children)) {
                        // console.log(`- [1.1.1] old childs arr: ${JSON.stringify(a[parentIndex].relations.children)}`)
                        a[parentIndex].relations.children = a[parentIndex].relations.children.filter((id) => id !== shouldChildBeRemovedFromParent.targetChildId)
                        
                        if (a[parentIndex].logs.items.length >= a[parentIndex].logs.limit)
                          a[parentIndex].logs.items.pop()

                        a[parentIndex].logs.items.unshift({
                          ts: updateTime,
                          text: `Child job removed: [job=${shouldChildBeRemovedFromParent.targetChildId}]`,
                        })
                        // console.log(`- [1.1.2] new childs arr: ${JSON.stringify(a[parentIndex].relations.children)}`)
                      } // else console.log(`- [1.2] parentIndex=${parentIndex} NOT FOUND`)
                    } // else console.log('- [2] parent should NOT be removed')
                  }
                  // --

                  const { ts: { create } } = todo
                  jobToUpdate.ts.create = create
  
                  const normalizedTitle = jobToUpdate.title.trim().replace(/\s+/g,' ')
                  const normalizedDescr = !!jobToUpdate.descr ? jobToUpdate.descr.trim().replace(/\s+/g,' ') : ''
  
                  if (jobToUpdate.title !== normalizedTitle) jobToUpdate.title = normalizedTitle
                  if (jobToUpdate.descr !== normalizedDescr) jobToUpdate.descr = normalizedDescr
  
                  delete jobToUpdate.forecast._assignedToName
  
                  jobToUpdate.logs.items = todo.logs?.items || []
  
                  const _newMsgs = new Set()
  
                  switch (true) {
                    case !todo.logs.isEnabled && jobToUpdate.logs.isEnabled:
                      if (jobToUpdate.logs.items.length >= jobToUpdate.logs.limit) jobToUpdate.logs.items.pop()
                      
                      _newMsgs.add(`Logs enabled (detailed with your comments). ${comment || 'No comment'}`)
                      break
                    case todo.logs.isEnabled && !jobToUpdate.logs.isEnabled: {
                      if (jobToUpdate.logs.items.length >= jobToUpdate.logs.limit) jobToUpdate.logs.items.pop()
                      
                      _newMsgs.add('Logs disabled (minimal)')
                      break
                    }
                    case (
                      (todo.logs.isEnabled && jobToUpdate.logs.isEnabled)
                      || (!todo.logs.isEnabled && !jobToUpdate.logs.isEnabled)
                    ):
                      if (jobToUpdate.logs?.isEnabled) {
                        if (jobToUpdate.logs.items.length >= jobToUpdate.logs.limit) jobToUpdate.logs.items.pop()
                        
                        const normalizedComment = !!comment ? comment.trim().replace(/\s+/g,' ') : ''
                        _newMsgs.add(normalizedComment || 'No comment')
                      }
                      break
                    default:
                      break
                  }
  
                  // NOTE: Reassigned
                  const hasOldUser = !!todo.forecast.assignedTo
                  const hasNewUser = !!jobToUpdate.forecast.assignedTo
                  const hasReassigned = hasOldUser && hasNewUser && hasOldUser !== hasNewUser
                  const hasReassignedToNobody = hasOldUser && !hasNewUser
                  const hasAssignedFromNobody = !hasOldUser && hasNewUser
                  // let targetNewUser: TUser | undefined
                  // if (hasNewUser) {
                  //   targetNewUser = context.users.items.find((u) => u.id === jobToUpdate.forecast.assignedTo)
                  // }
                  // let targetOldUser: TUser | undefined
                  // if (hasOldUser) {
                  //   targetOldUser = context.users.items.find((u) => u.id === todo.forecast.assignedTo)
                  // }
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
                    soundManager.playSound({ soundCode: 'mech-3' })
                  } else {
                    delete jobToUpdate.v
                    soundManager.playSound({ soundCode: 'click-1' })
                  }
                  // --
  
                  const newLog: TLogsItem = {
                    ts: updateTime,
                    text: _newMsgs.size > 0 ? [..._newMsgs].join(' // ') : 'Updated', // •
                  }
                  if (!!progress) newLog.progress = progress
  
                  jobToUpdate.logs.items.unshift(newLog)
  
                  // console.log('-- jobToUpdate (2)')
                  // console.log(jobToUpdate)
                  // console.log('--')
                  soundManager.playSound({ soundCode: 'click-12' })
  
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

              todo.ts.update = updateTime

              if (todo.logs?.isEnabled) {
                if (todo.logs.items.length >= todo.logs.limit) todo.logs.items.pop()
                
                todo.logs.items.unshift({ ts: updateTime, text: 'Dates cleared' })
              }

              // console.log('-- clearDates: updated')
              // console.log(todo)
              // console.log('--')
              soundManager.playSound({ soundCode: 'click-27' })
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

              if (todo.logs?.isEnabled) {
                if (todo.logs.items.length >= todo.logs.limit)
                  todo.logs.items.pop()

                const normalizedComment = !!comment ? comment.trim().replace(/\s+/g,' ') : ''
                msgs.push(normalizedComment || 'No comment')
              }

              if (msgs.length > 0)
                todo.logs.items.unshift({ ts: updateTime, text: msgs.join(' // ') })

              // console.log('-- clearDates: updated')
              // console.log(todo)
              // console.log('--')
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
          const targetJobIndex = context.jobs.items.findIndex(({ id }) => id)
          const targetParentId = targetJobIndex !== -1
            ? context.jobs.items[targetJobIndex].relations?.parent
            : null
          if (!!targetParentId) {
            // console.log('- [1] parent should be removed')
            shouldChildBeRemovedFromParent.doIt = true
            shouldChildBeRemovedFromParent.targetChildId = id
            if (shouldChildBeRemovedFromParent.doIt) {
              // console.log('- [1.1] parent should be removed')
              const parentIndex = context.jobs.items.findIndex(({ id }) => id === targetParentId)
              if (parentIndex !== -1 && Array.isArray(context.jobs.items[parentIndex].relations?.children)) {
                // console.log(`- [1.1.1] old childs arr: ${JSON.stringify(a[parentIndex].relations.children)}`)
                context.jobs.items[parentIndex].relations.children = context.jobs.items[parentIndex].relations.children.filter((id) => id !== shouldChildBeRemovedFromParent.targetChildId)
                
                if (context.jobs.items[parentIndex].logs.items.length >= context.jobs.items[parentIndex].logs.limit)
                  context.jobs.items[parentIndex].logs.items.pop()

                const targetChildTitle = context.jobs.items.find(({ id }) => id === shouldChildBeRemovedFromParent.targetChildId)?.title
                const _parentMsgs = [`Child job deleted [job=${shouldChildBeRemovedFromParent.targetChildId}]`]
                if (!!targetChildTitle) _parentMsgs.push(`(${targetChildTitle})`)
                context.jobs.items[parentIndex].logs.items.unshift({
                  ts: updateTime,
                  text: _parentMsgs.join(' '),
                })
                // console.log(`- [1.1.2] new childs arr: ${JSON.stringify(a[parentIndex].relations.children)}`)
              } // else console.log(`- [1.2] parentIndex=${parentIndex} NOT FOUND`)
            } // else console.log('- [2] parent should NOT be removed')
          }
          // --

          if (context.jobs.items.some((todo) => todo.id === id))
            soundManager.playSound({ soundCode: 'fail-41' })

          return {
            ...context.jobs,
            items: context.jobs.items.filter((todo) => todo.id !== id),
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
                  soundManager.playSound({ soundCode: 'mech-3' })
                  newTodo.forecast.finish = updateTime
                  _msgs.push('Finish date was set to update time')

                  const v = getSpeed(newTodo)
                  newTodo.v = v
                  _msgs.push(`v= ${v}`)
                } else if (!!newTodo.forecast?.finish) {
                  soundManager.playSound({ soundCode: 'click-1' })
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
            displayName: event.value.displayName.trim().replace(/\s+/g,' '),
            ts: {
              create: createDate,
              update: createDate,
            }
          }

          soundManager.playSound({ soundCode: 'plop-1' })

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
  }
})
