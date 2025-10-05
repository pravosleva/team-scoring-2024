// import { TOption } from '~/shared/components/CreatableAutocomplete'

export type TForecast = {
  // employee?: TOption;
  assignedTo?: number;
  _assignedToName?: string;
  estimate?: number | null;
  start?: number | null;
  finish?: number | null;
  complexity: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  comment?: string;
}
export type TLogProgress = {
  estimate: number;
  worst: number;
};
export type TLogLink = {
  id: number;
  url: string;
  title: string;
  descr: string;
};
export type TLogChecklistItem = {
  title: string;
  descr: string;
  isDone: boolean;
  isDisabled: boolean;
  links?: TLogLink[];
  id: number;
  ts: {
    createdAt: number;
    updatedAt: number;
  };
}
export type TLogsItem = {
  ts: number;
  text: string;
  progress?: TLogProgress;
  links?: TLogLink[];
  useTextAsTitle?: boolean;
  checklist?: TLogChecklistItem[];
};
export type TLogs = {
  limit: number;
  isEnabled: boolean;
  items: TLogsItem[];
};

export type TJob = {
  relations: {
    parent: number | null;
    children: number[];
  };
  id: number;
  title: string;
  descr?: string;
  completed: boolean;
  forecast: TForecast;
  ts: {
    create: number;
    update: number;
  };
  logs: TLogs;
  v?: number;
}

export type TUser = {
  id: number;
  displayName: string;
  ts: {
    create: number;
    update: number;
  };
}

export enum EJobsStatusFilter {
  ALL = 'all',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  NEW = 'new'
}

export type TJobForm = Pick<TJob, 'id' | 'title' | 'descr' | 'completed'>
  & TForecast
  // & Pick<TLogs, 'isEnabled'>
  & { isLogsEnabled: boolean }
