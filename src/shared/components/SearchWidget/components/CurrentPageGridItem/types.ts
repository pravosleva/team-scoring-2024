import { TLogsItem } from '~/shared/xstate'

export type TFilteredJobsLogsMappingChunk = {
  original: TLogsItem;
  _service: {
    commonMessage?: string;
    logLocalLinks: {
      relativeUrl: string;
      ui: string;
      descr?: string;
      id: number;
      updatedAgo: string;
    }[];
    logExternalLinks: {
      url: string;
      ui: string;
      descr?: string;
      logTs: number;
      jobId: number;
    }[];
  };
};
