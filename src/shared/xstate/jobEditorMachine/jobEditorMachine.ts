import { assign, setup } from 'xstate'
import { TJob } from '~/shared/xstate/topLevelMachine/v2'

export const jobEditorMachine = setup({
  types: {
    context: {} as {
      initialTitle: string;
      title: string;
    },
    events: {} as
      { type: 'edit' }
      | { type: 'blur' }
      | { type: 'cancel' }
      | {
          type: 'change';
          value: string;
        },
    input: {} as { job: TJob }
  },
  actions: {
    focusInput: () => {},
    onCommit: () => {}
  }
}).createMachine({
  id: 'job',
  initial: 'reading',
  context: ({ input }) => ({
    initialTitle: input.job.title,
    title: input.job.title
  }),
  states: {
    reading: {
      on: {
        edit: {
          target: 'editing',
        }
      }
    },
    editing: {
      entry: [
        assign({
          initialTitle: ({ context }) => context.title
        }),
        { type: 'focusInput' }
      ],
      on: {
        blur: {
          target: 'reading',
          actions: 'onCommit'
        },
        cancel: {
          target: 'reading',
          actions: assign({
            title: ({ context }) => context.initialTitle
          })
        },
        change: {
          actions: assign({
            title: ({ event }) => {
              console.log(event)
              return event.value
            }
          })
        }
      }
    }
  }
})
