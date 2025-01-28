import { setup, assign } from 'xstate'
// import { useMachine } from '@xstate/react'
// import { createStore } from '@xstate/store'
// import { useSelector } from '@xstate/store/react'
// import { createBrowserInspector } from '@statelyai/inspect'
import { NTopLevelMachine } from './types'
import { initialState } from './initialState'

// const inspector = createBrowserInspector()

export const topLevelMachine = setup({
  types: {
    context: {} as NTopLevelMachine.TContext,
    events: {} as NTopLevelMachine.TEvent,
  },
  guards: {
    isReadyForCreateUser: ({ context }) => !!context.forms.user.isReady,
  }
  // ...далее, не отходя от кассы, создаем стейт машину.
}).createMachine({
  id: 'topLevelMachine',
  context: initialState,
  initial: NTopLevelMachine.EMode.REVIEW_MAIN,
  states: {
    [NTopLevelMachine.EMode.REVIEW_MAIN]: {
      on: {
        goCreateUser: {
          target: NTopLevelMachine.EMode.CREATE_USER_FORM,
          actions: assign({
            // NOTE: For example
            count: ({ context }) => context.count + 1,
            nestedState: ({ context }) => ({
              ...context.nestedState,
              count: context.nestedState.count + 1,
            }),
          }),
        },
      },
    },
    [NTopLevelMachine.EMode.CREATE_USER_FORM]: {
      on: {
        // 'submit:create-user': {
        //   target: NTopLevelMachine.EMode.CREATE_USER_FETCH,
        //   guard: 'isReadyForCreateUser',
        // },
        // 'cancel:create-user': {
        //   target: NTopLevelMachine.EMode.REVIEW_MAIN,
        // },
      },
    },
    // [NTopLevelMachine.EMode.CREATE_USER]: {},
  },
  on: {
    setMode: {
      actions: assign({
        currentMode: ({ event }) => event.value,
      }),
    },
  }
})

// Machine instance with internal state
// export const topLevelService = createActor(topLevelMachine, {})

// modesMachine.inspect(inspector.inspect)
