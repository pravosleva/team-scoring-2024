/* eslint-disable @typescript-eslint/no-namespace */
// import {
//   NSFileTemp,
//   // rules as fileTempoRules,
// } from '~/middleware/context/utils/file_temp';

export namespace NSMachine {
  export enum EStep {
    Ready = 'ready',
    // Init = 'init',
    Sending = 'sending',
    SentErr = 'err',
    SentOk = 'ok',
    // Douplicate = 'douplicate',

    Question = 'question',
    EmptySlot = 'empty-slot',
  }
  export type TState = {
    counters: {
      ready: number;
      empty: number;
      question: number;
      sendingAttempt: number;
      sendingError: number;
      sendingSuccess: number;
    };
    common: {
      file: null | File;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      originalResponse: any | null;
      responseAnalysis: {
        ok: boolean;
        message?: string;
      } | null;
      loadedSize: number;
      dontAllowRetry: boolean;
      previewUrl: null | string;
    };
  }
  export type TContext = {
    context: TState;
    events: { type: 'goReady' }
    | { type: 'goQuestion' }
    | { type: 'goEmptySlot' }
    | { type: 'goSending' }
    | { type: 'goErrored' }
    | { type: 'goSuccess' }
    // | { type: 'goDouplicate' }
    | { type: 'SET_FILE'; value: File | null }
    | { type: 'SET_CUSTOM_ERROR'; yes: boolean; reason?: string };
  };
}
