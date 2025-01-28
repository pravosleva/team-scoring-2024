import { NTopLevelMachine } from './types'

export const initialState: NTopLevelMachine.TContext = {
  count: 0,
  nestedState: {
    count: 0,
  },
  currentMode: NTopLevelMachine.EMode.REVIEW_MAIN,
  forms: {
    user: {
      state: {
        name: '',
      },
      isReady: false,
    },
    task: {
      state: {
        title: '',
        dates: {},
      },
      isReady: false,
    },
    group: {
      state: {
        title: '',
        taskIds: [],
      },
      isReady: false,
    },
  },
  groups: {},
  tasks: {},
}
