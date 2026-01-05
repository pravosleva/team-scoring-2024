/* eslint-disable @typescript-eslint/no-explicit-any */
import { delayedCallFactory, delayedCallFactoryConfigurableDelay } from '~/shared/utils/web-api-ops'

const PUBLIC_URL = import.meta.env.VITE_PUBLIC_URL || ''
const sounds = {
  'click-1': '/click/click-1.mp3',
  'click-8': '/click/click-8.mp3',
  'click-12': '/click/click-12.mp3',
  'click-27': '/click/click-27.mp3',
  'click-28': '/click/click-28.mp3',
  'click-28-kassa': '/click/click-28-kassa.mp3',
  'click-30-kassa': '/click/click-30-kassa.mp3',
  'click-33': '/click/click-33-otto_lock.mp3',
  'click-34': '/click/click-34-otto_unlock.mp3',

  'electro-1-transformator': '/electro/electro-1-transformator.mp3',
  'electro-2': '/electro/electro-2.mp3',
  'electro-10-headphones-jh-808-2-c-1s': '/electro/electro-10-headphones-jh-808-2-c-1s.mp3',
  'electro-11-hissing-signal-reception': '/electro/electro-11-hissing-signal-reception.mp3',
  'electro-12-beep-short-melody-and-hiss': '/electro/electro-12-beep-short-melody-and-hiss.mp3',
  'electro-13-static-noise': '/electro/electro-13-static-noise.mp3',
  'electro-14.mp3': '/electro/electro-14.mp3',
  'electro-15': '/electro/electro-15.mp3',
  'electro-16-impulse-1': '/electro/electro-16-impulse-1.mp3',
  'electro-17-impulse-2': '/electro/electro-17-impulse-2.mp3',
  'electro-18-impulse-3': '/electro/electro-18-impulse-3.mp3',
  'electro-19-hit-and-impulse-4': '/electro/electro-19-hit-and-impulse-4.mp3',
  'electro-20-impulse-5': '/electro/electro-20-impulse-5.mp3',
  'electro-21-quick': '/electro/electro-21-quick.mp3',

  'fail-11': '/fail/fail-11.mp3',
  'fail-41': '/fail/fail-41.mp3',
  'fail-116': '/fail/fail-116-sheep.mp3',
  'fail-154': '/fail/fail-154-trailer.mp3',
  'gong-6': '/gong/gong-6.mp3',
  'load-24': '/load/load-24.mp3',
  'mech-3': '/mech/mech-3-energy-off.mp3',
  'mech-50-end-of-work': '/mech/mech-50-end-of-work.mp3',
  'mech-51-muted-noisy-short': '/mech/mech-51-muted-noisy-short.mp3',
  'mech-52-noisy-short-end-of-work': '/mech/mech-52-noisy-short-end-of-work.mp3',
  'mech-53-ringing-distant-short-hit': '/mech/mech-53-ringing-distant-short-hit.mp3',
  'mech-54-short-far-single-hit': '/mech/mech-54-short-far-single-hit.mp3',
  'mech-55-short-metal-single-hit': '/mech/mech-55-short-metal-single-hit.mp3',
  'mech-56-single-short-hit-in-space': '/mech/mech-56-single-short-hit-in-space.mp3',

  'mech-73-robots-moving-2': '/mech/mech-73-robots-moving-2.mp3',
  'mech-74-robots-big-cyber-moving': '/mech/mech-74-robots-big-cyber-moving.mp3',
  'mech-78-step': '/mech/mech-78-step.mp3',
  'mech-81-step-hydraulic-robot': '/mech/mech-81-step-hydraulic-robot.mp3',
  'mech-82-glitch': '/mech/mech-82-glitch.mp3',

  'ojing-eo-geim_player-excluded': '/click/ojing-eo-geim_player-excluded.mp3',
  'plop-1': '/plop/plop-1.mp3',
  'plop-3': '/plop/plop-3.mp3',

  'switch-2-between-cameras': '/switch/switch-2-between-cameras.mp3',
  'switch-3-epic': '/switch/switch-3-epic.mp3',

  'transition-5-dj': '/transition/transition-5-dj.mp3',
  'transition-11-kiberpank-2077-notif': '/transition/transition-11-kiberpank-2077-notif.mp3',

  'whoosh-7-end': '/whoosh/whoosh-7-end.mp3',
  'whoosh-16-rev': '/whoosh/whoosh-16-rev.mp3',
}

enum ELoadStatus {
  INACTIVE = 'inactive',
  STARTED = 'loading...',
  ERRORED = 'load error',
  LOADED = 'loaded'
}

type TPlaySoundProps = {
  _debug?: {
    msg: string;
  };
  soundCode: keyof typeof sounds;
  cb?: {
    onLoadStart: (ev: Event) => void;
    onLoadProgress: (ev: Event) => void;
    onLoadError: (ev: string | Event, t: string | undefined) => void;
    onLoadSuccess: (ev: Event) => void;
  };
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

  private _playDelayedSound: any;
  private _playDelayedSoundConfigurable: any;
  constructor() {
    this._activeAudio = null
    this._sounds = sounds
    this._cache = {}
    this._loadStatus = {}

    const [delayedPlay] = delayedCallFactory(this.__playDelayedSound, 750)
    this._playDelayedSound = delayedPlay
    const [delayedPlayConfigurable] = delayedCallFactoryConfigurableDelay(this.__playDelayedSound, 500)
    this._playDelayedSoundConfigurable = delayedPlayConfigurable
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
  private __playDelayedSound({ soundCode, cb, _self, _debug, delay }: TPlaySoundProps & { delay?: number; _self: Singleton }) {
    // -- NOTE: Experimental
    // BAD: Sound stopped
    // GOOD: All sounds will be played
    _self.stopCurrentSound()
    // --
    console.log([
      `▶️ ${soundCode}`,
      typeof delay === 'number'
        ? `delay:${delay}`
        : '',
      !!_debug?.msg ? _debug.msg : '',
    ].filter(Boolean).join(' '))
    try {
      if (!!_self._sounds[soundCode]) {
        const targetSrc = _self._sounds[soundCode]
        let audio
        if (
          !!_self._cache[targetSrc]
          && _self._loadStatus[targetSrc].value === ELoadStatus.LOADED
        ) {
          audio = _self._cache[targetSrc].audio
          _self._activeAudio = audio
        } else {
          audio = new Audio(`${PUBLIC_URL}/static/audio${targetSrc}`)
          _self._activeAudio = audio

          _self._cache[targetSrc] = {
            audio,
          }
          if (!_self._loadStatus[targetSrc]) {
            _self._loadStatus[targetSrc] = {
              value: ELoadStatus.INACTIVE,
            }
          }

          audio.onloadstart = (e) => {
            _self._loadStatus[targetSrc].value = ELoadStatus.STARTED
            if (!!cb) cb.onLoadStart(e)
          }
          audio.onprogress = (e) => {
            if (!!cb) cb.onLoadProgress(e)
          }
          audio.onloadeddata = (e) => {
            _self._loadStatus[targetSrc].value = ELoadStatus.LOADED
            if (!!cb) cb.onLoadSuccess(e)
          }
          audio.onerror = (e, t) => {
            _self._loadStatus[targetSrc].value = ELoadStatus.ERRORED
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

        _self._cache[targetSrc].audio.play()
        // this._activeAudio.play()
      } else throw new Error('Нет такого аудио файла')
    } catch (err) {
      console.warn(err)
    }
  }
  // NOTE: See also https://github.com/martinstark/throttle-ts/tree/main
  public playDelayedSound({ soundCode, cb, _debug }: TPlaySoundProps) {
    this._playDelayedSound({ soundCode, cb, _self: this, _debug })
  }
  public playDelayedSoundConfigurable({ soundCode, cb, _debug, delay }:
    TPlaySoundProps & {
      delay: {
        before: number;
        after: number;
      };
    }
  ) {
    // this.stopCurrentSound()
    this._playDelayedSoundConfigurable({ soundCode, cb, _self: this, _debug })({ delay })
  }
}

export const soundManager = Singleton.getInstance()
