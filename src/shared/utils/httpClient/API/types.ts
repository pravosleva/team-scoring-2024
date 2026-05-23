/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
// import { AxiosInstance } from 'axios'

// export type TRaxConfig = {
//   // NOTE: Retry 5 times on requests that return a response (500, etc) before giving up. Defaults to 3.
//   retry: number;
//   // NOTE: Milliseconds to delay at first. Defaults to 100. Only considered when backoffType is 'static'
//   retryDelay?: number;
//   // NOTE: You can set the backoff type. Options are 'exponential' (default), 'static' or 'linear'
//   backoffType: 'exponential' | 'static' | 'linear';
//   // NOTE: Retry twice on errors that don't return a response (ENOTFOUND, ETIMEDOUT, etc).
//   noResponseRetries: number;
//   // NOTE: HTTP methods to automatically retry.  Defaults to: ['GET', 'HEAD', 'OPTIONS', 'DELETE', 'PUT']
//   httpMethodsToRetry: ('GET' | 'POST' | 'HEAD' | 'OPTIONS' | 'DELETE' | 'PUT')[];
//   // NOTE: The response status codes to retry.  Supports a double array with a list of ranges.  Defaults to: [[100, 199], [429, 429], [500, 599]]
//   statusCodesToRetry?: number[][];
//   // NOTE: If you are using a non static instance of Axios you need to pass that instance here (const ax = axios.create())
//   instance: AxiosInstance;
//   // NOTE: You can detect when a retry is happening, and figure out how many retry attempts have been made
//   onRetryAttempt: (err: any) => void;
//   currentRetryAttempt?: number;
// }

export type TAPIProps = {
  isDebugEnabled: boolean;
}

// export enum EReqStateCode {
//   Pending = 'pending',
//   RejectedReq = 'rejected_req',
//   RejectedRes = 'rejected_res',
//   Fullfiled = 'fulfilled',
// }
export type TReqStateCode = 'pending' | 'rejected_req' | 'rejected_res' | 'fulfilled';
// export const reqStateCodeCounters = Object.values(EReqStateCode).reduce((acc: any, cur) => {
//   acc[cur] = 0
//   return acc
// }, {})

// const _reqStateCodeCounters: any = {}
// @ts-ignore
// for (const key in EReqStateCode) _reqStateCodeCounters[EReqStateCode[key]] = 0
// export const reqStateCodeCounters = _reqStateCodeCounters

export type TResponseDetailsInfo = {
  status?: number;
  res?: any;
}

export type TRequestDetailsInfo = {
  req?: any;
  comment?: string;
}
