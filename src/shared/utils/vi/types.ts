/* eslint-disable @typescript-eslint/no-namespace */
// import { TReqStateCode, TResponseDetailsInfo, TRequestDetailsInfo } from '~/utils/httpClient/API'

export namespace NViDevtools {
  // export type TNetworkXHR = {
  //   total: {
  //     [key in TReqStateCode]: number;
  //   };
  //   state: {
  //     [key: string]: { // NOTE: url as key
  //       [key: string]: { // NOTE: ts as key
  //         code: TReqStateCode;
  //         __resDetails?: TResponseDetailsInfo;
  //         __reqDetails?: TRequestDetailsInfo;
  //       };
  //     };
  //   };
  // };
  export type TNetwork = {
    __reportsByUserLimit: number;
    isReportsByUserDisabled: boolean;
    socket: {
      __isConnectionIgnoredForUI: boolean,
      __wasThereAFirstConnection: boolean,
      isConnected: boolean;
    };
    // xhr: TNetworkXHR;
  };
}
