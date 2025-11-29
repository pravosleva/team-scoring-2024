import { TPointsetItem } from '~/shared/xstate'

export type TEnchancedPointByWorker = TPointsetItem & {
  _service: {
    recursionCounter: number;
    logs: string[];
    aboutPoint: {
      // existingChecklists: {
      //   uniqueChecklistKey: string;
      //   jobId: number;
      //   logTs: number;
      //   completePercentage: number;
      //   logText: string;
      // }[];
      existingChildrenNodes: {
        nodesInfo: {
          originalPoint: Pick<TPointsetItem, 'title' | 'descr' | 'id' | 'isDone' | 'isDisabled' | 'relations' | 'ts' | 'statusCode'>;
          nodeId: string;
        }[];
      };
    };
  }
}
