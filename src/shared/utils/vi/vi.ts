import { proxy } from 'valtio'
// import {
//   initialStepMachineContextFormat,
//   initialContractFormState,
// } from '../xstate/stepMachine/initialState'
// import { NSP } from '~/utils/httpClient'
// import { TReqStateCode, TResponseDetailsInfo, TRequestDetailsInfo } from '~/utils/httpClient/API'
import { getRandomString } from '~/shared/utils/string-ops'
// import { TStepMachineContextFormat, TContractForm, EStep, EAppModeMenu1, EAppModeMenu2 } from '../xstate/stepMachine/types'
// import { mutateObject } from '~/shared/utils/object-ops'
// import clsx from 'clsx'
import pkg from '../../../../package.json'
// import { TItem } from '../components/tailwind'
// import { NViDevtools } from './types'

// const defaultXHRState: NViDevtools.TNetworkXHR = {
//   total: {
//     pending: 0,
//     rejected_req: 0,
//     rejected_res: 0,
//     fulfilled: 0,
//   },
//   state: {},
// }

class Singleton {
  private static instance: Singleton
  // private _stepMachineState: TStepMachineContextFormat
  // private _contractFormState: TContractForm
  private _contractFormLastEditedFieldInfo: {
    name?: string;
  }
  private _uiDetails: {
    isDemoModeEnabled: boolean;
  }
  private _common: {
    stateValue: string | null;
    app: {
      name: string;
      version: string;
    };
    devtools: {
      isUIEnabled: boolean;
      network: {
        __reportsByUserLimit: number;
        isReportsByUserDisabled: boolean;
        socket: {
          __isConnectionIgnoredForUI: boolean;
          __wasThereAFirstConnection: boolean;
          isConnected: boolean;
        };
        // xhr: NViDevtools.TNetworkXHR;
      };
    };
  }
  public uniquePageLoadKey: string;
  public uniqueUserDataLoadKey: string;
  // NOTE: Etc. 1/4

  private constructor() {
    this.uniquePageLoadKey = getRandomString(5)
    this.uniqueUserDataLoadKey = ''
    // this._stepMachineState = proxy(initialStepMachineContextFormat)
    // this._contractFormState = proxy(initialContractFormState)
    this._contractFormLastEditedFieldInfo = proxy({
      // name: undefined,
    })
    this._uiDetails = proxy({
      isDemoModeEnabled: false,
    })
    this._common = proxy({
      stateValue: null,
      app: {
        name: pkg.name,
        version: pkg.version,
      },
      devtools: {
        isUIEnabled: false,
        network: {
          // -- NOTE: Could be disabled by developer upon app initialization (you can set this value to 0)
          __reportsByUserLimit: 1,
          isReportsByUserDisabled: false, // NOTE: Will be disabled when app version will be legacy
          // --
          socket: {
            // --- NOTE: Dont touch!
            __isConnectionIgnoredForUI: false,
            __wasThereAFirstConnection: false,
            // ---
            isConnected: false,
          },
          // xhr: defaultXHRState,
        },
      },
    })
    // NOTE: Etc. 2/4
  }
  public static getInstance(): Singleton {
    if (!Singleton.instance) Singleton.instance = new Singleton()
    return Singleton.instance
  }

  public setStateValue({ value }: { value: string; }) {
    this._common.stateValue = value
  }

  // -- NOTE: HTTP debug service
  // public enableDebugUI() {
  //   this._common.devtools.isUIEnabled = true
  // }
  // public disableDebugUI() {
  //   this._common.devtools.isUIEnabled = true
  // }
  // public __fixXHRTotalCounters({ code }: { code: TReqStateCode }) {
  //   try {
  //     switch (code) {
  //       case 'pending':
  //         this._common.devtools.network.xhr.total.pending += 1
  //         break
  //       case 'fulfilled':
  //         this._common.devtools.network.xhr.total.pending -= 1
  //         this._common.devtools.network.xhr.total.fulfilled += 1
  //         break
  //       case 'rejected_req':
  //         this._common.devtools.network.xhr.total.pending -= 1
  //         this._common.devtools.network.xhr.total.rejected_req += 1
  //         break
  //       case 'rejected_res':
  //         this._common.devtools.network.xhr.total.pending -= 1
  //         this._common.devtools.network.xhr.total.rejected_res += 1
  //         break
  //       default:
  //         throw new Error(`Incorrect state code: ${code}`)
  //     }
  //   } catch (err) {
  //     console.warn(err)
  //   }
  // }
  // public __fixXHRState({ url, code, ts, __resDetails, __reqDetails }: {
  //   url: string;
  //   code: TReqStateCode;
  //   ts: number;
  //   __resDetails?: TResponseDetailsInfo;
  //   __reqDetails?: TRequestDetailsInfo;
  // }) {
  //   if (!this._common.devtools.network.xhr.state[url]) {
  //     this._common.devtools.network.xhr.state[url] = {
  //       [String(ts)]: {
  //         code,
  //       },
  //     }
  //     if (__resDetails) this._common.devtools.network.xhr.state[url][String(ts)].__resDetails = __resDetails
  //     if (__reqDetails) this._common.devtools.network.xhr.state[url][String(ts)].__reqDetails = __reqDetails
  //   } else {
  //     if (!this._common.devtools.network.xhr.state[url][String(ts)])
  //       this._common.devtools.network.xhr.state[url][String(ts)] = {
  //         code,
  //       }
  //     else this._common.devtools.network.xhr.state[url][String(ts)].code = code

  //     if (__resDetails) this._common.devtools.network.xhr.state[url][String(ts)].__resDetails = __resDetails
  //     if (__reqDetails) this._common.devtools.network.xhr.state[url][String(ts)].__reqDetails = __reqDetails
  //   }
  // }
  // public __fixRequest({ url, code, ts, __reqDetails }: { url: string; code: TReqStateCode; ts: number; __reqDetails?: TRequestDetailsInfo; }) {
  //   try {
  //     if (!url) throw new Error(`Incorrect url! expected: not empty string. received: ${clsx(url || 'empty', `(${typeof url})`)}`)
  //     this.__fixXHRState({ url, code, ts, __reqDetails })
  //     this.__fixXHRTotalCounters({ code })
  //   } catch (err: any) {
  //     console.warn(err?.message || 'Что-то пошло не так...')
  //     console.warn(err)
  //   }
  // }
  // public __fixResponse({ url, code, ts, __resDetails }: {
  //   url: string;
  //   code: TReqStateCode;
  //   ts: number;
  //   __resDetails?: TResponseDetailsInfo;
  // }) {
  //   try {
  //     if (!url) throw new Error(`Incorrect url! expected: not empty string. received: ${clsx(url || 'empty', `(${typeof url})`)}`)
  //     this.__fixXHRState({ url, code, ts, __resDetails })
  //     this.__fixXHRTotalCounters({ code })
  //   } catch (err: any) {
  //     console.warn(err?.message || 'Что-то пошло не так...')
  //     console.warn(err)
  //   }
  // }
  // private __resetXHRStates() {
  //   mutateObject({
  //     target: this._common.devtools.network.xhr,
  //     source: defaultXHRState,
  //     removeIfUndefined: true,
  //   })
  // }
  // --

  // public setAppMode(value: EAppModeMenu1 | null) {
  //   this._stepMachineState.appMode.currentMode = value
  // }
  // public resetAppModeState() {
  //   this.setAppMode(null)
  // }
  // public setAppMode2(value: EAppModeMenu2 | null) {
  //   this._stepMachineState.appMode2.currentMode = value
  // }
  // public resetAppMode2State() {
  //   this.setAppMode2(null)
  // }
  // public setUserDataResponse({ res, reqState }: {
  //   res: NSP.TUserDataResponse | null;
  //   reqState: 'stopped' | 'pending' | 'success' | 'error';
  // }) {
  //   this.uniqueUserDataLoadKey = getRandomString(7)
  //   this._stepMachineState.initApp.response = res
  //   this._stepMachineState.initApp.result.state = reqState

  //   this._stepMachineState.initApp.result.isLogged = res?.ok || false
  // }
  // public setCheckDeviceChargeItem({ item, _data }: {
  //   item: TItem;
  //   _data: { diag_key: string };
  // }) {
  //   this._stepMachineState.checkDeviceCharge.form
  //   if (!this._stepMachineState.checkDeviceCharge.form.state)
  //     this._stepMachineState.checkDeviceCharge.form.state = { [_data.diag_key]: item.value }
  //   else this._stepMachineState.checkDeviceCharge.form.state[_data.diag_key] = item.value

  //   // TODO?: isReady is unnecessary yet...
  // }
  // public setImeiStepResponse({ res, reqState }: {
  //   res: NSP.TImeiResponse | null;
  //   reqState: 'stopped' | 'pending' | 'success' | 'error';
  // }) {
  //   this._stepMachineState.imei.response = res
  //   this._stepMachineState.imei.result.state = reqState
  // }
  // public setCheckByEmployeeStepItem({ item, _data, expectedPropsLen }: {
  //   item: TItem;
  //   _data: { diag_key: string };
  //   expectedPropsLen: number;
  // }) {
  //   if (!this._stepMachineState.checkByEmployee.form.state)
  //     this._stepMachineState.checkByEmployee.form.state = { [_data.diag_key]: item.value }
  //   else this._stepMachineState.checkByEmployee.form.state[_data.diag_key] = item.value
  //   this._stepMachineState.checkByEmployee.form.isReady = expectedPropsLen === Object.keys(this._stepMachineState.checkByEmployee.form.state).length
  // }
  // public setCheckDeviceStepItem({ item, _data, expectedPropsLen }: {
  //   item: TItem;
  //   _data: { check_device_key: string };
  //   expectedPropsLen: number;
  // }) {
  //   if (!this._stepMachineState.checkDevice.form.state)
  //     this._stepMachineState.checkDevice.form.state = { [_data.check_device_key]: item.value }
  //   else this._stepMachineState.checkDevice.form.state[_data.check_device_key] = item.value

  //   this._stepMachineState.checkDevice.form.isReady = expectedPropsLen === Object.keys(this._stepMachineState.checkDevice.form.state).length
  // }
  // public setCheckDeviceDefectsStepItem({ item, _data, expectedPropsLen }: {
  //   item: TItem;
  //   _data: { diag_key: string };
  //   expectedPropsLen: number;
  // }) {
  //   if (!this._stepMachineState.checkDeviceDefects.form.state)
  //     this._stepMachineState.checkDeviceDefects.form.state = { [_data.diag_key]: item.value }
  //   else this._stepMachineState.checkDeviceDefects.form.state[_data.diag_key] = item.value

  //   this._stepMachineState.checkDeviceDefects.form.isReady = expectedPropsLen === Object.keys(this._stepMachineState.checkDeviceDefects.form.state).length
  // }
  // public setPickUpDeviceStepItem({ item, _data, expectedPropsLen }: {
  //   item: TItem;
  //   _data: { key_name: string };
  //   expectedPropsLen: number;
  // }) {
  //   if (!this._stepMachineState.pickUpDevice.form.state)
  //     this._stepMachineState.pickUpDevice.form.state = { [_data.key_name]: item.value }
  //   else this._stepMachineState.pickUpDevice.form.state[_data.key_name] = item.value

  //   this._stepMachineState.pickUpDevice.form.isReady = expectedPropsLen === Object.keys(this._stepMachineState.pickUpDevice.form.state).length
  // }
  // public setCheckFMIPResponse({ res, reqState }: {
  //   res: NSP.TCheckFMIPResponse | null;
  //   reqState: 'stopped' | 'pending' | 'success' | 'error';
  // }) {
  //   this._stepMachineState.checkFMIP.response = res
  //   this._stepMachineState.checkFMIP.result.state = reqState
  // }
  // public setPhotoStatusResponse({ res, reqState }: {
  //   res: NSP.TPhotoStatusResponse | null;
  //   reqState: 'stopped' | 'pending' | 'success' | 'error';
  // }) {
  //   this._stepMachineState.photoStatus.response = res
  //   this._stepMachineState.photoStatus.result.state = reqState
  // }
  // public setContractStepResponse(res: NSP.TStandartMinimalResponse | null) {
  //   this._stepMachineState.contract.response = res
  // }
  // public setPhoneCheckResponse(res: NSP.TCheckPhoneResponse | null) {
  //   this._stepMachineState.checkPhone.response = res
  // }
  // public setAcceptResponse({ res, reqState }: {
  //   res: NSP.TAcceptResponse | null;
  //   reqState: 'stopped' | 'pending' | 'success' | 'error';
  // }) {
  //   this._stepMachineState.accept.response = res
  //   this._stepMachineState.accept.result.state = reqState
  // }
  // public resetState() {
  //   try {
  //     // TODO: Doesnt work -> this._stepMachineState = initialStepMachineContextFormat
  //     // this._stepMachineState.imei.value = ''
  //     for (const key in this._contractFormState) delete this._contractFormState[key]
  //     // this._contractFormLastEditedFieldInfo.name = null
  //     // this._stepMachineState.appMode.currentMode = null
  //     // this._stepMachineState.photoStatus = initialStepMachineContextFormat.photoStatus
  //     // this._stepMachineState.appMode2.currentMode = null
  //     // this._stepMachineState.checkPhone = initialStepMachineContextFormat.checkPhone
  //     // this._stepMachineState.checkFMIP = initialStepMachineContextFormat.checkFMIP
  //     // this._stepMachineState.imei = initialStepMachineContextFormat.imei
  //     // this._stepMachineState.checkDeviceCharge = initialStepMachineContextFormat.checkDeviceCharge
  //     // this._stepMachineState.checkByEmployee = initialStepMachineContextFormat.checkByEmployee
  //     // this._stepMachineState.contract = initialStepMachineContextFormat.contract
  //     // this._stepMachineState.photoLink = initialStepMachineContextFormat.photoLink
  //     // NOTE: Etc. 4/4

  //     // NOTE: Exp
  //     mutateObject({
  //       target: this._stepMachineState,
  //       source: initialStepMachineContextFormat,
  //     })

  //     // this.__resetXHRStates()
  //   } catch (err) {
  //     console.log(err)
  //   }
  // }

  // get smState() {
  //   return this._stepMachineState
  // }
  // get contractForm() {
  //   return this._contractFormState
  // }
  get contractFormLastEditedFieldInfo() {
    return this._contractFormLastEditedFieldInfo
  }
  get common() {
    return this._common
  }
  get uiDetails() {
    return this._uiDetails
  }
  // NOTE: Etc. 3/4
}

// NOTE: Valtio Instance (external proxy based multistore)
export const vi = Singleton.getInstance()

// NOTE: Also u can mutate vi.state if necessary
// For example: vi.state.imei.result.state = 'success'
