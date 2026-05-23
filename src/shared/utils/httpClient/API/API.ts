import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse, CancelToken, InternalAxiosRequestConfig } from 'axios'
import clsx from 'clsx'
import * as rax from 'retry-axios' // NOTE: See also https://www.npmjs.com/package/retry-axios
import { counterFactory } from '~/shared/utils/number-ops'
import { vi } from '~/shared/utils/vi'
import { TAPIProps, TReqStateCode, TResponseDetailsInfo, TRequestDetailsInfo } from './types'

const VITE_BASE_API_URL = import.meta.env.VITE_BASE_API_URL
const isDev = process.env.NODE_ENV === 'development'
const isLocalProd = import.meta.env.VITE_LOCAL_PROD === '1'
const isStaging = isDev || isLocalProd
// const isProd = process.env.NODE_ENV === 'production'
const auxFrontHeaderName = '__front_ts'
const counter = counterFactory(1)

// 1. Описываем структуру параметров
interface IApiParams {
  url: string;
  method: 'POST' | 'GET';
  data?: unknown;
  cancelToken?: CancelToken; // Сделал опциональным для гибкости
}

// Предполагаемый интерфейс ответа вашего API
interface IApiResponse {
  ok: boolean;
  [key: string]: unknown;
}

export class API {
  axiosInstance: AxiosInstance
  isDebugEnabled: boolean

  constructor({ isDebugEnabled }: TAPIProps) {
    this.isDebugEnabled = isDebugEnabled
    const axiosInstance = this.axiosInstance = axios.create({
      adapter: 'fetch', // Заставляет Axios использовать fetch, который MSW перехватывает надежнее
      baseURL: VITE_BASE_API_URL || '',
      // timeout: 1000,
      withCredentials: !isStaging,
      // headers: { 'X-Custom-Header': 'foobar' },
      xsrfHeaderName: 'X-CSRFToken',
      xsrfCookieName: 'csrftoken',
    })
    axiosInstance.interceptors.request.use(
      (config) => {
        // NOTE: Do something before request is sent
        const msgs: unknown[] = [config]

        try {
          if (!config) throw new Error(`Incorrect error format! Expected config, received: ${typeof config}`)

          if (!config.headers) throw new Error(`Incorrect error format! Expected config.headers, received: ${typeof config.headers}`)
          else {
            const ts = new Date().getTime() + (counter.next().value || 0) // NOTE: It works!
            config.headers[auxFrontHeaderName] = ts
            msgs.push(`config.headers.${auxFrontHeaderName} -> ${ts}`)

            const _fix2ViOpts: { url: string; code: TReqStateCode; ts: number; __reqDetails?: TRequestDetailsInfo; } = {
              code: 'pending',
              url: config.url || '',
              ts,
            }

            try {
              switch (true) {
                case !!config.data: {
                  try {
                    const mayBeJson = config.data // JSON.parse(config.data)

                    _fix2ViOpts.__reqDetails = {
                      req: mayBeJson,
                      comment: `config.data is ${typeof mayBeJson}`
                    }
                  } catch (err: unknown) {
                    const msgs = [
                      '[wtf?] Неожиданная ошибка при обработке config.data',
                      `config.data is ${typeof config?.data}`,
                      (err as Error).message || 'No _err.message',
                    ]
                    throw new Error(msgs.join(' / '))
                  }
                  break
                }
                default:
                  throw new Error('Объект config.data не найден')
              }
            } catch (err: unknown) {
              _fix2ViOpts.__reqDetails = {
                comment: (err as Error)?.message || 'Failed to log the request input data info',
              }
            }
            vi.__fixRequest(_fix2ViOpts)
          }
        } catch (err) {
          msgs.push(err)
        } finally {
          this.log({ namespace: 'API:axios-interceptor:req', items: msgs })
        }
        return config
      },
      (error) => {
        // NOTE: Do something with request error
        const msgs = [error]
        try {
          const config: InternalAxiosRequestConfig = error.config
          if (!config) throw new Error(`Incorrect error format! Expected config, received: ${typeof config}`)

          const { url, headers } = config
          const ts = headers[auxFrontHeaderName]
          if (!ts) throw new Error(`Incorrect config format! Expected headers.${auxFrontHeaderName}, received: ${typeof ts}`)

          msgs.push(`${url} -> rejected_req`)
          vi.__fixRequest({ code: 'rejected_req', url: url || '', ts })
        } catch (err) {
          msgs.push('Не удалось отследить запрос (DBG Fuckup)')
          msgs.push(err)
        } finally {
          this.log({ namespace: 'API:axios-interceptor:req-err', items: msgs })
        }
        return Promise.reject(error)
      },
    )
    axiosInstance.interceptors.response.use(
      (response) => {
        // NOTE: Any status code that lie within the range of 2xx cause this function to trigger
        // Do something with response data
        const msgs: unknown[] = [response]
        try {
          const config = response.config
          if (!config) throw new Error(`Incorrect response format! Expected config, received: ${typeof config}`)

          const { url, headers } = config
          const ts = headers[auxFrontHeaderName]
          if (!ts) throw new Error(`Incorrect config format! Expected headers.${auxFrontHeaderName}, received: ${typeof ts}`)
          if (!url) throw new Error(`Incorrect config format! Expected url, received: ${typeof url}`)

          msgs.push(`${url || '[No url]'} -> fulfilled`)
          vi.__fixResponse({ code: 'fulfilled', url: url || '', ts, __resDetails: { status: response.status, res: response.data } })
        } catch (err: unknown) {
          msgs.push('Не удалось отследить ответ (DBG Fuckup)')
          msgs.push(err)
        } finally {
          this.log({ namespace: 'API:axios-interceptor:res', items: msgs })
        }
        return response
      },
      (error) => {
        // NOTE: Any status codes that falls outside the range of 2xx cause this function to trigger
        // Do something with response error
        console.log(error.config)
        const msgs = [error]
        try {
          const config: InternalAxiosRequestConfig<unknown> = error.config
          if (!config) throw new Error(`Incorrect error format! Expected config, received: ${typeof config}`)

          const { url, headers } = config
          const ts = headers[auxFrontHeaderName]
          if (!ts) throw new Error(`Incorrect config format! Expected headers.${auxFrontHeaderName}, received: ${typeof ts}`)

          msgs.push(`${url} -> rejected_res`)
          const eventData: {
            code: TReqStateCode;
            url: string;
            ts: number;
            __resDetails?: TResponseDetailsInfo;
          } = {
            code: 'rejected_res',
            url: url || '',
            ts,
          }
          if (error?.status) {
            eventData.__resDetails = { status: error?.status }
            if (error.data) eventData.__resDetails.res = error.data
          }
          vi.__fixResponse(eventData)
        } catch (err) {
          msgs.push('Не удалось отследить ответ (DBG Fuckup)')
          msgs.push(err)
        } finally {
          this.log({ namespace: 'API:axios-interceptor:res-err', items: msgs })
        }
        return Promise.reject(error)
      },
    )

    // NOTE: v1
    // axiosRetry(this.axiosInstance, { retries: 5, retryDelay: axiosRetry.exponentialDelay })

    // NOTE: v2
    axiosInstance.defaults.raxConfig = {
      // instance: axiosInstance,
      // NOTE: You can set the backoff type.
      // options are 'exponential' (default), 'static' or 'linear'
      backoffType: 'exponential',
      // NOTE: Retry 5 times on requests that return a response (500, etc) before giving up. Defaults to 3.
      retry: 5,
      retryDelay: 500,
      // NOTE: Retry twice on errors that don't return a response (ENOTFOUND, ETIMEDOUT, etc).
      // noResponseRetries: 5,
      httpMethodsToRetry: ['GET', 'OPTIONS', 'POST'],
      // NOTE: You can detect when a retry is happening, and figure out how many
      // retry attempts have been made
      onRetryAttempt: (err: AxiosError<unknown, unknown>): Promise<void> => {
        // NOTE: This interceptor has lower priority than axios interceptors
        const raxConfig: rax.RetryConfig | undefined = rax.getConfig(err)
        if (!!raxConfig) {
          const msgs = [`Retry attempt #${raxConfig.currentRetryAttempt}`]

          try {
            const internalAxiosRequestConfig = err.config
            // console.log(internalAxiosRequestConfig?.baseURL)
            if (!internalAxiosRequestConfig?.url)
              throw new Error(`Ожидалось поле url (строка), получено: ${clsx(typeof internalAxiosRequestConfig?.url, `(${typeof internalAxiosRequestConfig?.url})`)}`)
            else
              msgs.push(internalAxiosRequestConfig?.url)
          } catch (err: unknown) {
            msgs.push(`ERR: Не удалось проанализировать попытку запроса: ${(err as Error).message || 'No err.message'}`)
            console.warn(err)
          } finally {
            this.log({ namespace: 'API:rax', items: msgs })
          }
          return Promise.resolve()
        }
        else return Promise.reject()
      },
    };
    // const _interceptorId = rax.attach(axiosInstance)
    // console.log(_interceptorId)
    rax.attach(axiosInstance)

    this.api = this.api.bind(this)
  }

  log(_ps: unknown) {
    // if (this.isDebugEnabled) groupLog(ps)
    // console.log(ps)
  }

  universalAxiosResponseHandler(validator: (res: AxiosResponse<IApiResponse>) => boolean) {
    return (axiosRes: AxiosResponse<IApiResponse>) => {
      try {
        if (!validator(axiosRes)) {
          // console.log('- case 1: axiosRes')
          // console.log(axiosRes)
          return { isOk: false, res: axiosRes.data }
        }
        // console.log('- case 2: axiosRes')
        // console.log(axiosRes)
        return { isOk: true, res: axiosRes.data }
      } catch (err: unknown) {
        // console.log('- case 3: axiosRes')
        // console.log(axiosRes)
        return { isOk: false, res: axiosRes?.data || err, message: (err as Error)?.message || 'No err.message' }
      }
    }
  }

  // getErrorMsg(data: any) {
  //   return data?.message ? data?.message : 'Извините, что-то пошло не так'
  // }

  async api({ url, method, data, cancelToken }: IApiParams): Promise<unknown> {
    const axioOpts: AxiosRequestConfig = {
      method,
      url,
      // mode: 'cors',
      cancelToken,
    }
    if (data) axioOpts.data = data

    const result = await this.axiosInstance(axioOpts)
      // .then((res: any) => res)
      .then(
        this.universalAxiosResponseHandler((res: AxiosResponse<IApiResponse>) => {
          const { data } = res
          return data?.ok === true || data?.ok === false // NOTE: API like smartprice
        })
      )
      .catch((err: unknown) => {
        let _msg
        try {
          _msg = err?.toString()
        } catch (er: unknown) {
          _msg = `ERR: ${(err as Error)?.message || (er as Error)?.message || 'No er.message'}`
        }

        if (axios.isCancel(err)) {
          console.log('Request canceled', err.message)
        } else {
          // console.dir({ config: err?.response?.config })
          switch (true) {
            case err instanceof AxiosError:
              // console.log(err?.response)
              // return { isOk: false, message: err.message, res: err?.response?.data || { ok: false, message: _msg } }
              return {
                isOk: false,
                message: err.message,
                res: {
                  ok: false,
                  message: err.message,
                  url: err?.response?.config.url,
                },
              }
            default:
              return {
                isOk: false,
                message: (err as Error)?.message,
                res: {
                  ok: false,
                  message: (err as Error)?.message,
                  ...(err || { ok: false, message: _msg }),
                },
              }
          }
        }
        return {
          isOk: false,
          message: err.message || 'No err.message',
          res: {
            ...(err || { ok: false, message: _msg }),
          },
        }
      })

    // NOTE: Exp
    // console.log(result) // { isOk: true, res: { ok: true, _originalBody: { username: 'pravosleva' } } }

    return result.isOk ? Promise.resolve(result.res) : Promise.reject(result.res)
  }
}
