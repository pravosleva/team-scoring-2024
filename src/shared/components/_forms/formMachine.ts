import { setup, assign } from 'xstate'
import { getValidateResult } from '~/shared/utils/getValidateResult/getValidateResult'
import { NValidate } from '~/shared/utils/getValidateResult/types'

export enum States {
  dataEntry = 'dataEntry',
  awaitingResponse = 'awaitingResponse',
  dataEntryError = 'dataEntryError',
  serviceError = 'serviceError',
  success = 'success',
}

export enum EEvents {
  ENTER_DATA = 'ENTER_DATA',
  BLUR_DATA = 'BLUR_DATA',
  SUBMIT = 'SUBMIT',
  SET_FIELD = 'SET_FIELD',
}
export type TEvent = {
  type: EEvents;
  value: string;
  name: string;
}

export interface FormErrors {
  [field: string]: string;
}

export type FormMachineContext<T> = {
  formState: T;
  dataEntryErrors: FormErrors;
  serviceErrors: FormErrors;
  rules: NValidate.TRules;
  canSubmit: boolean;
}

export interface FormMachineFactoryParams<T> {
  rules: NValidate.TRules;
  onSubmit: ({ context }: {
    context: FormMachineContext<T>;
  }) => Promise<T>;
  onDone: (data: T) => void;
}

export const formMachineFactory = <T>({
  rules,
  // onSubmit,
  // onDone,
}: FormMachineFactoryParams<T>) => setup({
  types: {
    context: {} as FormMachineContext<T>,
    events: {} as TEvent,
  },
  guards: {
    isFormReady: ({ context }) => getValidateResult({ rules: context.rules, event: context.formState }).ok,
    isFieldInvalid: ({ context, event }) => {
      if (!event.value)
        return false

      const targetKey = Object.keys(context.rules).find((key) => key === event.name)
      if (!targetKey)
        throw new Error('Incorrect key')
    
      const field = context.rules[targetKey]
      if (!field)
        return false

      const result: NValidate.TResult = field.validate
        ? field.validate({ value: event.value, event })
        : { ok: true }

      if (!result.ok && !!result.message)
        context.dataEntryErrors[event.name] = result.message

      return result.ok
    },
  }
}).createMachine({
  id: 'form',
  initial: States.dataEntry,
  context: {
    formState: {},
    dataEntryErrors: {},
    serviceErrors: {},
    rules,
    canSubmit: false,
  } as FormMachineContext<T>,
  states: {
    [States.dataEntry]: {
      on: {
        [EEvents.ENTER_DATA]: {
          // actions: Actions.setField,
          // actions: ({ context, event }) => ({
          //   context.serviceErrors[event.name] = event.value,
          // },
          actions: assign({
            formState: ({ context, event }) => ({
              ...context.formState,
              [event.name]: event.value,
            }),
          }),
        },
        [EEvents.BLUR_DATA]: [
          {
            guard: 'isFieldInvalid',
            target: States.dataEntryError,
          },
        ],
        [EEvents.SUBMIT]: {
          guard: 'isFormReady',
          target: States.awaitingResponse,
        },
      },
    },
    // [States.awaitingResponse]: {
      
    //   invoke: {
    //     id: 'submit',
    //     src: ({ context }) => {
    //       return onSubmit(context);
    //     },
    //     onDone: {
    //       target: States.success
    //     },
    //     onError: [
    //       {
    //         actions: (context, event) => {
    //           context.serviceErrors[event.type] = event.data;
    //         },
    //         target: States.serviceError
    //       }
    //     ]
    //   }
    // },
    [States.dataEntryError]: {
      on: {
        [EEvents.ENTER_DATA]: {
          // При вводе данных при ошибке нам нужно как установить данные, так и переключить state
          // actions: Actions.setField,
          target: States.dataEntry,
        },
      }
    },
    [States.serviceError]: {
      on: {
        [EEvents.SUBMIT]: {
          target: States.awaitingResponse
        },
        [EEvents.ENTER_DATA]: {
          // При вводе данных при ошибке нам нужно как установить данные, так и переключить state
          // actions: Actions.setField,
          target: States.dataEntry
        },
      }
    },
    [States.success]: {
      // кидаем done event
      // type: 'final',
      // onDone: {
      //   actions: onDone
      // },
    },
  },
  on: {
    [EEvents.SET_FIELD]: {
      actions: assign({
        formState: ({ context, event }) => ({
          // context.data[event.name] = event.value
          // delete context.dataEntryErrors[event.name]
          // context.canSubmit = getCanSubmit<T>({ context })
          ...context.formState,
          [event.name]: event.value,
        }),
      }),
    },
  },
})
