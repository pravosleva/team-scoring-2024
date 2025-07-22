import { createActorContext } from '@xstate/react'
import { topLevelMachine } from '~/shared/xstate/topLevelMachine/v2/topLevelMachine'
import { TJob } from '../types'

let initialStateFromLS
try {
  initialStateFromLS = JSON.parse(
    localStorage.getItem('teamScoring2024:topLevel') as string
  )

  for (let i = 0, max = (initialStateFromLS.context.jobs.items as TJob[]).length; i < max; i++) {
    const job = (initialStateFromLS.context.jobs.items as TJob[])[i]

    if (!job.logs) {
      (initialStateFromLS.context.jobs.items[i] as TJob).logs = {
        limit: 100,
        isEnabled: false,
        items: [
          { ts: job.ts.create, text: 'Created' },
        ]
      }
    }

    if (
      job.forecast?.finish
      && !(initialStateFromLS.context.jobs.items[i] as TJob).completed
    ) {
      (initialStateFromLS.context.jobs.items[i] as TJob).completed = true
    }

    if (typeof job.forecast?.complexity === 'undefined') {
      (initialStateFromLS.context.jobs.items[i] as TJob).forecast.complexity = 0
    }

    if (job.logs.items.length > 0) {
      for (const log of job.logs.items) {
        if (!!log.progress && !log.progress.worst) log.progress.worst = log.progress.estimate
      }
    }

    if (!job.relations) {
      job.relations = {
        parent: null,
        children: [],
      }
    }
    if (typeof job.relations.parent === 'undefined') {
      job.relations.parent = null
    }
    if (typeof job.relations.children === 'undefined') {
      job.relations.children = []
    }
  }

  if (!initialStateFromLS.context.jobs.pinned) {
    initialStateFromLS.context.jobs.pinned = []
  }
} catch (err) {
  console.error(err)
  initialStateFromLS = null
}

export const TopLevelContext = createActorContext(topLevelMachine, {
  state: initialStateFromLS,
})
