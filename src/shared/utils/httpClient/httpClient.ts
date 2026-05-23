import axios, { CancelTokenSource } from 'axios'
import { NSP } from './types'
import { API, TAPIProps } from './API'
import { getRandomString } from '~/shared/utils/string-ops'

class Singleton extends API {
  private static instance: Singleton
  _devPollingKey: string
  exampleRequestCancelTokenSource: CancelTokenSource

  private constructor(ps: TAPIProps) {
    super(ps)
    this._devPollingKey = getRandomString(5)
    this.exampleRequestCancelTokenSource = axios.CancelToken.source()
  }
  public static getInstance(ps: TAPIProps): Singleton {
    if (!Singleton.instance) Singleton.instance = new Singleton(ps)

    return Singleton.instance
  }

  async exampleRequest({ responseValidator }: {
    // inputData: string;
    responseValidator?: ({ res }: { res: unknown }) => boolean;
  }): Promise<NSP.TExampleResponse | NSP.TStandartMinimalResponse> {
    // NOTE: Custom UI error for example
    // if (!IMEI) return Promise.reject({ ok: false, message: 'Заполните IMEI' })

    this.exampleRequestCancelTokenSource.cancel('axios request canceled')
    this.exampleRequestCancelTokenSource = axios.CancelToken.source()

    const data = await this.api({
      url: '/mocks/api/example',
      method: 'GET',
      // data: inputData,
      cancelToken: this.exampleRequestCancelTokenSource.token,
    })
      .then((r) => r)
      .catch((r) => r)

    this.exampleRequestCancelTokenSource.cancel('axios request done')

    switch (true) {
      case !!responseValidator:
        return responseValidator({ res: data })
          ? Promise.resolve(data as NSP.TExampleResponse | NSP.TStandartMinimalResponse)
          : Promise.reject(data)
      default:
        return (data as NSP.TExampleResponse | NSP.TStandartMinimalResponse)?.ok
          ? Promise.resolve(data as NSP.TExampleResponse | NSP.TStandartMinimalResponse)
          : Promise.reject(data)
    }
  }
}

export const httpClient = Singleton.getInstance({ isDebugEnabled: false })
