import { TJob } from '~/shared/xstate'

export type TEnchancedJobByWorker = TJob & {
  _service: {
    recursionCounter: number;
    logs: string[];
    aboutJob: {
      existingChecklists: {
        uniqueChecklistKey: string;
        jobId: number;
        logTs: number;
        completePercentage: number;
      }[];
      existingChildrenNodes: {
        nodesInfo: {
          originalJob: Pick<TJob, 'title' | 'descr' | 'id' | 'completed' | 'forecast'>;
          nodeId: string;
        }[];
      };
    };
  }
}
