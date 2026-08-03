
// import PromiseWorker from 'promise-worker'
import { getSplittedCamelCase } from '~/shared/utils/string-ops'
import { groupLog } from '~/shared/utils/groupLog'
import { NWService } from './types'
// import packageJson from '../../../../package.json'
// -- NOTE: убрали query-параметры ?v=...,
// чтобы файлы успешно подхватывались настроенным ранее плагином VitePWA из оффлайн-кэша.
// --

const PUBLIC_URL = import.meta.env.VITE_PUBLIC_URL

type TProps = {
  noSharedWorkers?: boolean;
  isDebugEnabled?: boolean;
}
type TTsListItem = {
  label: string;
  descr: string;
  p: number;
  ts: number;
}

class Singleton {
  private static instance: Singleton
  private workers: {
    [key: string]: SharedWorker | Worker;
  };
  private subscribersOnData: {
    [key: string]: {
      [key: string]: boolean;
    }
  };
  private noSharedWorkers: boolean | undefined;
  private isDebugEnabled: boolean | undefined;

  private constructor({ noSharedWorkers, isDebugEnabled }: TProps) {
    this.noSharedWorkers = noSharedWorkers
    this.isDebugEnabled = isDebugEnabled
    this.workers = {}
    this.subscribersOnData = {}

    this.initWorker({ wName: 'taro-worst-calc' })
    // NOTE: Other workers could be loaded and used...
  }

  private initWorker({ wName }: {
    wName: string;
  }): Promise<{
    ok: boolean;
    message?: string;
  }> {
    const result: { ok: boolean; message?: string; } = { ok: true }

    const firstWord = getSplittedCamelCase(wName)[0]
    if (!firstWord) {
      result.ok = false
      result.message = `Incorrect Worker name (Should be string in camelCase); firstWord is "${firstWord}"`
      return Promise.reject(result)
    }

    try {
      // Проверяем, поддерживает ли браузер SharedWorker на самом деле
      const isSharedWorkerNeeded = typeof SharedWorker !== 'undefined' && !this.noSharedWorkers;

      if (isSharedWorkerNeeded) {
        // Если ПК и поддержка есть — создаем SharedWorker и пишем в динамический ключ wName!
        this.workers[wName] = new SharedWorker(`${PUBLIC_URL}/static/workers/${firstWord}/shared-worker.js`)

        // Запускаем порт
        const worker = this.workers[wName];
        if (worker instanceof SharedWorker) {
          worker.port.start();
        }
      } else {
        // Если мобилка (нет поддержки) — создаем обычный Dedicated Worker в тот же ключ wName
        this.workers[wName] = new Worker(`${PUBLIC_URL}/static/workers/${firstWord}/dedicated-worker.js`)
      }

      // Алиас для обратной совместимости, если у вас где-то в коде захардкожено имя ".newsWorker"
      if (wName === 'taro-worst-calc') {
        this.workers.newsWorker = this.workers[wName];
      }

      return Promise.resolve(result)
    } catch (err: unknown) {
      result.ok = false
      result.message = err instanceof Error ? err.message : String(err)
      return Promise.reject(result)
    }
  }

  public reInitWorker({ wName, ifNecessaryOnly }: {
    wName: string;
    ifNecessaryOnly?: boolean;
  }): Promise<{ ok: boolean; message?: string; }> {
    switch (true) {
      case !!this.workers[wName] && !ifNecessaryOnly:
        if (this.isDebugEnabled) groupLog({
          namespace: 'Terminate -> Reinit, cuz exists and !ifNecessaryOnly',
          items: [],
        })
        this.terminate({ wName })
        return this.initWorker({ wName })
      case typeof this.workers[wName] === 'undefined':
        if (this.isDebugEnabled) groupLog({
          namespace: 'Reinit, cuz not exists',
          items: [],
        })
        return this.initWorker({ wName })
      default:
        return Promise.resolve({ ok: true, message: 'Already exists' })
    }
  }

  public static getInstance(props: TProps): Singleton {
    if (!Singleton.instance) Singleton.instance = new Singleton(props)

    return Singleton.instance
  }
  private log({ label, msgs }: {
    label: string;
    msgs?: unknown[];
  }): void {
    if (this.isDebugEnabled) groupLog({ namespace: `-webWorkersInstance: ${label}`, items: msgs || [] })
  }
  public async subscribeOnData<T>({ wName, cb }: {
    wName: string;
    cb: (d: MessageEvent<T>) => void;
  }) {
    if (!this.workers[wName]) {
      // throw new Error(`No worker ${wName} yet #1`)
      await this.reInitWorker({ wName, ifNecessaryOnly: true })
    }

    // if (this.subscribersOnData[wName]?.[subscriberId] === true)
    //   return

    switch (true) {
      case this.workers[wName] instanceof Worker:
        // console.log(`-- sbscr w:${wName}`)
        this.workers[wName].onmessage = cb.bind(this)
        break
      case typeof SharedWorker !== 'undefined' && this.workers[wName] instanceof SharedWorker:
        // console.log(`-- sbscr sw:${wName}`)
        this.workers[wName].port.onmessage = cb.bind(this)
        break
      default:
        break
    }

    // if (!this.subscribersOnData[wName])
    //   this.subscribersOnData[wName] = {}
    // this.subscribersOnData[wName][subscriberId] = true  
  }

  public async subscribeOnErr<T>({ wName, cb }: {
    wName: string;
    cb: (d: MessageEvent<T>) => void;
  }) {
    if (!this.workers[wName]) {
      // throw new Error(`No worker ${wName} yet #2`)
      await this.reInitWorker({ wName, ifNecessaryOnly: true })
    }

    switch (true) {
      case this.workers[wName] instanceof Worker:
        this.workers[wName].onmessageerror = cb.bind(this)
        break
      case typeof SharedWorker !== 'undefined' && this.workers[wName] instanceof SharedWorker:
        this.workers[wName].port.onmessageerror = cb.bind(this)
        break
      default:
        break
    }
  }

  public async post<T>(e: {
    wName: string;
    eType: string;
    data?: T;
  }) {
    const { wName, eType, data } = e
    if (!this.workers[wName]) {
      // throw new Error(`No worker ${wName} yet #3`)
      await this.reInitWorker({ wName, ifNecessaryOnly: true })
    }

    switch (true) {
      case this.workers[wName] instanceof Worker:
        this.workers[wName].postMessage({ __eType: eType, ...data })
        break
      case typeof SharedWorker !== 'undefined' && this.workers[wName] instanceof SharedWorker:
        this.log({ label: 'before post to sw...', msgs: [e] })
        this.workers[wName].port.postMessage({ __eType: eType, ...data })
        break
      default:
        break
    }
  }

  public terminate({ wName, cb }: {
    wName: string;
    cb?: (d: unknown) => void;
  }) {
    if (!this.workers[wName]) return

    const currentWorker = this.workers[wName];

    switch (true) {
      case currentWorker instanceof Worker:
        currentWorker.terminate()
        break
      case typeof SharedWorker !== 'undefined' && currentWorker instanceof SharedWorker:
        currentWorker.port.postMessage({ __eType: NWService.EClientToWorkerEvent.DIE_WORKER })
        break
      default:
        break
    }
    delete this.workers[wName]
    if (cb) cb({ ok: true })
  }

  public resetHistory({ wName }: {
    wName: string;
  }): void {
    if (!this.workers[wName]) throw new Error(`No worker ${wName} yet #5`)

    this.post<{
      tsList: TTsListItem[];
    }>({
      wName,
      eType: NWService.EClientToWorkerEvent.RESET_WORKER_HISTORY,
    })
  }
  public resetOpsWorkerHistory() {
    this.resetHistory({ wName: 'newsWorker' })
  }
}

export const wws = Singleton.getInstance({
  noSharedWorkers: false,
  isDebugEnabled: true,
})
