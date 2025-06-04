const PUBLIC_URL = import.meta.env.VITE_PUBLIC_URL || ''
const sounds = {
  'click-1': '/click/click-1.mp3',
  'click-8': '/click/click-8.mp3',
  'click-12': '/click/click-12.mp3',
  'click-27': '/click/click-27.mp3',
  'fail-41': '/fail/fail-41.mp3',
  'fail-154': '/fail/fail-154-trailer.mp3',
  'mech-3': '/mech/mech-3-energy-off.mp3',
  'plop-1': '/plop/plop-1.mp3',
  'plop-3': '/plop/plop-3.mp3',
}

enum ELoadStatus {
  INACTIVE = 'inactive',
  STARTED = 'loading...',
  ERRORED = 'load error',
  LOADED = 'loaded'
}


class Singleton {
  private static instance: Singleton
  private _activeAudio: null | HTMLAudioElement;
  private _sounds: {
    [key: string]: string;
  };
  private _cache: {
    [key: string]: {
      audio: HTMLAudioElement;
      // loadStatus: ELoadStatus;
    }
  };
  private _loadStatus: {
    [key: string]: {
      value: ELoadStatus;
    }
  }
  constructor() {
    this._activeAudio = null
    this._sounds = sounds
    this._cache = {}
    this._loadStatus = {}
  }
  public static getInstance(): Singleton {
    if (!Singleton.instance) Singleton.instance = new Singleton()
    return Singleton.instance
  }

  public stopCurrentSound() {
    // NOTE: See also https://proweb63.ru/help/js/html5-audio-js
    if (!!this._activeAudio) {
      this._activeAudio.pause();
      this._activeAudio.currentTime = 0.0;
      this._activeAudio = null
    }
  }
  public playSound({ soundCode, cb }: {
    soundCode: string;
    cb?: {
      onLoadStart: (ev: Event) => void;
      onLoadProgress: (ev: Event) => void;
      onLoadError: (ev: string | Event, t: string | undefined) => void;
      onLoadSuccess: (ev: Event) => void;
    };
  }) {
    // this.stopCurrentSound()
    try {
      if (!!this._sounds[soundCode]) {
        const targetSrc = this._sounds[soundCode]
        let audio
        if (
          !!this._cache[targetSrc]
          && this._loadStatus[targetSrc].value === ELoadStatus.LOADED
        ) {
          audio = this._cache[targetSrc].audio
          this._activeAudio = audio
        } else {
          audio = new Audio(`${PUBLIC_URL}/static/audio${targetSrc}`)
          this._activeAudio = audio
          
          this._cache[targetSrc] = {
            audio,
          }
          if (!this._loadStatus[targetSrc]) {
            this._loadStatus[targetSrc] = {
              value: ELoadStatus.INACTIVE,
            }
          }

          audio.onloadstart = (e) => {
            this._loadStatus[targetSrc].value = ELoadStatus.STARTED
            if (!!cb) cb.onLoadStart(e)
          }
          audio.onprogress = (e) => {
            if (!!cb) cb.onLoadProgress(e)
          }
          audio.onloadeddata = (e) => {
            this._loadStatus[targetSrc].value = ELoadStatus.LOADED
            if (!!cb) cb.onLoadSuccess(e)
          }
          audio.onerror = (e, t) => {
            this._loadStatus[targetSrc].value = ELoadStatus.ERRORED
            if (!!cb) cb.onLoadError(e, t)
          }
          audio.onended = () => {
            // this._common.isAudioActive = false
            // this._common.activeAudioSrc = null
            // this._common.activeAudioBgSrc = null
          }
          audio.load()
        }
        
        // this._common.isAudioActive = true
        // this._common.activeAudioSrc = targetSrc
        // this._common.activeAudioBgSrc = this._sounds[projectName].items[soundIndex].bg.src
        
        this._cache[targetSrc].audio.play()
        // this._activeAudio.play()
      } else throw new Error('Нет такого аудио файла')
    } catch (err) {
      console.warn(err)
    }
  }
}

export const soundManager = Singleton.getInstance()
