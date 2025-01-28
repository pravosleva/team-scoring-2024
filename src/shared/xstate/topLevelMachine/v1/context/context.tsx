import { createContext } from 'react'
import { NTopLevelMachine } from '~/shared/xstate/topLevelMachine/v1/types'
import { initialState } from '~/shared/xstate/topLevelMachine/v1/initialState'

// NOTE: See also https://github.com/statelyai/xstate/discussions/1754#discussioncomment-227301

export const ServiceContext = createContext<{
  state: Partial<NTopLevelMachine.TState>;
  send: (arg: NTopLevelMachine.TEvent) => void;
}>({
  state: {
    can: () => false,
    context: initialState,
  },
  send: () => {},
})
