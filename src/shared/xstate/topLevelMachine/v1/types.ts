/* eslint-disable @typescript-eslint/no-namespace */
import {
  ActorRefFrom,
  ActorLogicFrom,
  SnapshotFrom,
  StateFrom,
} from 'xstate'
import { topLevelMachine } from './topLevelMachine'

export namespace NTopLevelMachine {
  export enum EMode {
    REVIEW_MAIN = 'review:main',
    // REVIEW_TASK_LIST = 'review:task-list',
    // REVIEW_USER_LIST = 'review:user-list',
    CREATE_USER_FORM = 'create:user[form]',
    // CREATE_USER_FETCH = 'create:user[fetch]',
    // CREATE_USER_LOADING = 'create:user[loading]',
    // CREATE_USER_OK = 'create:user[ok]',
    // CREATE_USER_ERROR = 'create:user[error]',
    // EDIT_USER_FORM = 'edit:user[form]',
    // CREATE_TASK_FORM = 'create:task[form]',
    // EDIT_TASK_FORM = 'edit:task[form]',
    // CREATE_TASK_GROUP_FORM = 'create:task-group[form]',
    // EDIT_TASK_GROUP_FORM = 'edit:task-group[form]',
  }
  export type TContext = {
    count: number;
    nestedState: {
      count: number;
    };
    currentMode: EMode;
    forms: {
      user: TForm<TUserFormat>;
      task: TForm<TTaskFormat>;
      group: TForm<TTaskGroupFormat>;
    };
    groups: {
      [key: string]: TTaskGroupFormat;
    };
    tasks: {
      [key: string]: TTaskFormat;
    };
  };

  export type TForm<T> = {
    state: T;
    commit?: T;
    isReady: boolean;
  }
  export type TUserFormat = {
    name: string;
    tg?: {
      nickname: string;
      chat_id?: string;
    };
  }
  export type TTaskFormat = {
    id?: number;
    title: string;
    descr?: string;
    dates: {
      estimate?: number;
      start?: number;
      finish?: number;
    };
  }
  export type TTaskGroupFormat = {
    title: string;
    descr?: string;
    taskIds: number[];
  }
  
  export type TEvent =
    { type: 'setMode'; value: EMode }
    | { type: 'goCreateUser' }
    | { type: 'submit:create-user' }
    | { type: 'cancel:create-user' }
    | { type: 'loading:create-user' }
    | { type: 'error:create-user' }
    | { type: 'done:create-user' }
  export type TActorRef = ActorRefFrom<typeof topLevelMachine>
  export type TSnapshot = SnapshotFrom<typeof topLevelMachine>
  export type TActorLogic = ActorLogicFrom<typeof topLevelMachine>
  export type TMeta = ActorLogicFrom<typeof topLevelMachine>
  export type TState = StateFrom<typeof topLevelMachine>
}
