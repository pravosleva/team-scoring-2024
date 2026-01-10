/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createActorContext } from '@xstate/react';
import { setup, assign, fromPromise } from 'xstate';
import { getMatchedByAnyString } from '~/shared/utils/string-ops/getMatchedByAnyString';
import { NSMachine } from './types';
import { uploadFile } from './services';

const initialState: NSMachine.TState = {
  counters: {
    ready: 1,
    empty: 0,
    question: 0,
    sendingAttempt: 0,
    sendingError: 0,
    sendingSuccess: 0,
  },
  common: {
    file: null,
    originalResponse: null,
    responseAnalysis: {
      ok: false,
      message: 'Not modified',
    },
    loadedSize: 0,
    dontAllowRetry: false,
    previewUrl: null,
  }
};

export const machine = setup({
  types: {} as NSMachine.TContext,
  actors: { uploadFile: fromPromise(uploadFile), },
})
  .createMachine({
    id: 'multistepScenario',
    initial: NSMachine.EStep.Ready,
    context: initialState,
    states: {
      [NSMachine.EStep.Ready]: {
        on: {
          goSending: {
            target: NSMachine.EStep.Sending,
            actions: assign({
              counters: ({ context }) => ({
                ...context.counters,
                sendingAttempt: context.counters.sendingAttempt + 1,
              }),
            }),
          },
          goQuestion: {
            // guard: ({ context }) => !context.responseAnalysis?.ok,
            target: NSMachine.EStep.Question,
            actions: assign({
              counters: ({ context }) => ({
                ...context.counters,
                question: context.counters.question + 1,
              }),
            }),
          },
          // goDouplicate: {
          //   target: NSMachine.EStep.Douplicate,
          //   actions: assign({
          //     common: ({ context }) => ({
          //       ...context.common,
          //       dontAllowRetry: true,
          //     }),
          //   }),
          // },
          // goEmptySlot: { target: NSMachine.EStep.EmptySlot },
        },
      },
      // [NSMachine.EStep.Douplicate]: {
      //   on: {
      //     goSending: {
      //       target: NSMachine.EStep.Sending,
      //       actions: assign({
      //         counters: ({ context }) => ({
      //           ...context.counters,
      //           sendingAttempt: context.counters.sendingAttempt + 1,
      //         }),
      //       }),
      //     },
      //     goQuestion: {
      //       // guard: ({ context }) => !context.responseAnalysis?.ok,
      //       target: NSMachine.EStep.Question,
      //       actions: assign({
      //         counters: ({ context }) => ({
      //           ...context.counters,
      //           question: context.counters.question + 1,
      //         }),
      //       }),
      //     },
      //     // goEmptySlot: { target: NSMachine.EStep.EmptySlot },
      //   },
      // },
      [NSMachine.EStep.Sending]: {
        invoke: {
          src: 'uploadFile',
          input: ({ context }) => ({ file: context.common.file || null, }),
          onDone: {
            target: NSMachine.EStep.SentOk,
            actions: assign({
              common: ({
                event, context
              }) => ({
                ...context.common,
                originalResponse: event.output?.original || null,
                responseAnalysis: {
                  ok: event.output.ok || false,
                  message: event.output.message || undefined,
                },
                loadedSize: event.output.about.size,
                loadedFileName: event.output.about.fileName,
              }),
            }),
          },
          onError: {
            target: NSMachine.EStep.SentErr,
            actions: assign({
              common: ({
                event, context
              }) => ({
                ...context.common,
                // @ts-ignore
                originalResponse: event.output?.original || null,
                responseAnalysis: {
                  // @ts-ignore
                  ok: event.output?.ok || false,
                  // @ts-ignore
                  message: typeof event.error?.message === 'string'
                    // @ts-ignore
                    ? event.error.message
                    : JSON.stringify(event.error),
                },
                // @ts-ignore
                dontAllowRetry: typeof event.error?.message === 'string'
                  ? getMatchedByAnyString({
                    // @ts-ignore
                    tested: event.error?.message,
                    expected: ['Файл слишком большой!'],
                  })
                  : false,
              }),
            }),
          },
        },

      },
      [NSMachine.EStep.SentErr]: {
        on: {
          // NOTE: Cancel -> Unmount

          // NOTE: Retry
          goSending: {
            target: NSMachine.EStep.Sending,
            actions: assign({
              counters: ({ context }) => ({
                ...context.counters,
                sendingAttempt: context.counters.sendingAttempt + 1,
              }),
            }),
          },
        },
      },
      [NSMachine.EStep.SentOk]: {
        on: {
          goEmptySlot: { target: NSMachine.EStep.EmptySlot },
          goQuestion: {
            // guard: ({ context }) => !context.responseAnalysis?.ok,
            target: NSMachine.EStep.Question,
            actions: assign({
              counters: ({ context }) => ({
                ...context.counters,
                question: context.counters.question + 1,
              }),
            }),
          },
        },
      },
      [NSMachine.EStep.Question]: {
        on: {
          goReady: {
            target: NSMachine.EStep.Ready,
            actions: assign({
              counters: ({ context }) => ({
                ...context.counters,
                ready: context.counters.ready + 1,
              }),
            }),
          },
          goEmptySlot: {
            target: NSMachine.EStep.EmptySlot,
            actions: assign({
              counters: ({ context }) => ({
                ...context.counters,
                empty: context.counters.empty + 1,
              }),
            }),
          },
        },
      },
      [NSMachine.EStep.EmptySlot]: {
        on: {
          goReady: {
            target: NSMachine.EStep.Ready,
            actions: assign({
              counters: ({ context }) => ({
                ...context.counters,
                empty: context.counters.ready + 1,
              }),
            }),
          },
        },
      },
    },
    on: {
      SET_FILE: {
        actions: assign({
          common: ({
            context, event
          }) => ({
            ...context.common,
            file: event.value,
            previewUrl: event.value
              ? URL.createObjectURL(event.value)
              : null,
          })
        }),
      },
    },
  });

export const MultistepFSMScenarioContext = createActorContext(machine);
