/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useState, useRef, useLayoutEffect, useMemo, useCallback, memo } from 'react'
import clsx from 'clsx'
import classes from '../ClientPerfWidget.module.scss'
import { getPercentage } from '~/shared/utils/number-ops'
import { ProgressBar } from '../components/ProgressBar'
import ExpandLessIcon from '@mui/icons-material/ArrowRight'
import MemoryIcon from '@mui/icons-material/Memory'
import { soundManager } from '~/shared/soundManager'

type TProps = {
  isOpenedByDefault?: boolean;
  position: 'top-center' | 'top-right' | 'right-side-top' | 'right-side-center-bottom';
}

type TMainStackItem = {
  jsHeapSizeLimit: number;
  totalJSHeapSize: number;
  usedJSHeapSize: number;
}
const mainStackLimit = 500
const canvasCfg = {
  width: 200,
  height: 15,
}
const interval = 1 * 100
// const MEMORY_UPDATE_INTERVAL = 1000 // Текст обновляем раз в секунду
const MAIN_COLOR = '#3c4856' // '#959eaa'

const getOffsetY = ({ data, fullPx, targetField }: {
  data: TMainStackItem;
  fullPx: number;
  targetField: string;
}) => {
  const { jsHeapSizeLimit: limit, totalJSHeapSize: total, usedJSHeapSize: used } = data
  let hPx = 0
  switch (targetField) {
    case 'total':
      hPx = (fullPx * total) / limit
      break
    case 'used':
      hPx = (fullPx * used) / total
      break
    default:
      break
  }
  return { strartY: fullPx - hPx, hPx }
}
const getStepX = ({ fullWidthPx, totalStackItems }: {
  fullWidthPx: number;
  totalStackItems: number;
}) => fullWidthPx / (totalStackItems * 2 < 100 ? 100 : totalStackItems * 2)

export const ClientPerfWidget = memo((ps: TProps) => {
  const [isBrowserMemoryMonitorEnabled, setIsBrowserMemoryMonitorEnabled] = useState<boolean>(ps.isOpenedByDefault || false)
  const handleOpenToggle = useCallback(() => {
    const wasOpened = isBrowserMemoryMonitorEnabled
    if (wasOpened) {
      soundManager.playDelayedSoundConfigurable({
        soundCode: 'mech-78-step', // 'mech-73-robots-moving-2',
        delay: {
          before: 0,
          after: 500,
        },
      })
    } else {
      soundManager.playDelayedSoundConfigurable({
        soundCode: 'electro-12-beep-short-melody-and-hiss',
        delay: {
          before: 0,
          after: 1000,
        },
      })
    }
    setIsBrowserMemoryMonitorEnabled((s) => !s)
  }, [setIsBrowserMemoryMonitorEnabled, isBrowserMemoryMonitorEnabled])

  const [state, setMemState] = useState<any>(null)
  const [counter, setCounter] = useState<number>(0)
  const intervalRef = useRef<NodeJS.Timeout>()
  const mainStackRef = useRef<TMainStackItem[]>([])
  const canvasRef = useRef<HTMLCanvasElement>(null)

  /* NOTE: Exp
  const requestRef = useRef<number>()
  const lastUpdateRef = useRef<number>(0) // Храним время последнего обновления стейта
  const draw = useCallback((_time: number) => {
    // @ts-ignore
    const memState = window.performance?.memory
    if (!memState) return

    // 1. ТРОТТЛИНГ СТЕЙТА: Обновляем текстовые данные не чаще чем раз в секунду
    if (time - lastUpdateRef.current > MEMORY_UPDATE_INTERVAL) {
      const isCorrect = !!memState?.jsHeapSizeLimit && !!memState?.totalJSHeapSize && !!memState?.usedJSHeapSize
      if (isCorrect) {
        setMemState({
          jsHeapSizeLimit: memState.jsHeapSizeLimit,
          totalJSHeapSize: memState.totalJSHeapSize,
          usedJSHeapSize: memState.usedJSHeapSize
        })
        // Добавляем точку в историю
        if (mainStackRef.current.length < mainStackLimit) mainStackRef.current.push(memState)
        else {
          mainStackRef.current.shift()
          mainStackRef.current.push(memState)
        }
      }
      lastUpdateRef.current = time
    }

    // 2. ОТРИСОВКА: Canvas рисуем в каждом кадре (если нужно плавное движение)
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (ctx && canvas) {
      const cfg = canvasCfg
      const stepX = getStepX({ fullWidthPx: cfg.width, totalStackItems: mainStackRef.current.length })
      ctx.clearRect(0, 0, cfg.width, cfg.height)
      ctx.beginPath()
      ctx.fillStyle = MAIN_COLOR
      let x = 0
      mainStackRef.current.forEach((data) => {
        const c1 = getOffsetY({ data, fullPx: cfg.height, targetField: 'total' })
        ctx.rect(x, c1.strartY, stepX, c1.hPx)
        x += stepX
        const c2 = getOffsetY({ data, fullPx: cfg.height, targetField: 'used' })
        ctx.rect(x, c2.strartY, stepX, c2.hPx)
        x += stepX
      })
      ctx.fill()
    }
  }, [])

  useLayoutEffect(() => {
    // @ts-ignore
    if (!window.performance?.memory) return

    requestRef.current = requestAnimationFrame(draw)

    return () => {
      if (!!requestRef.current) cancelAnimationFrame(requestRef.current)
    }
  }, [draw])
  */

  useLayoutEffect(() => {
    // @ts-ignore
    if (!window.performance?.memory) return

    intervalRef.current = setInterval(() => {
      setCounter((s) => s + 1)
    }, interval)

    return () => {
      if (!!intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  useLayoutEffect(() => {
    // @ts-ignore
    const memState = window.performance?.memory
    const isCorrect = !!memState?.jsHeapSizeLimit && !!memState?.totalJSHeapSize && !!memState?.usedJSHeapSize

    if (isCorrect) {
      setMemState({
        jsHeapSizeLimit: memState.jsHeapSizeLimit,
        totalJSHeapSize: memState.totalJSHeapSize,
        usedJSHeapSize: memState.usedJSHeapSize
      })
      if (mainStackRef.current.length < mainStackLimit) {
        mainStackRef.current.push({ ...memState })
      } else {
        mainStackRef.current.shift()
        mainStackRef.current.push({ ...memState })
      }
    }
    if (isCorrect) {
      if (mainStackRef.current.length < mainStackLimit) mainStackRef.current.push(memState)
      else {
        mainStackRef.current.shift()
        mainStackRef.current.push(memState)
      }
      if (!!canvasRef.current) {
        const cfg = canvasCfg
        const ctx = canvasRef.current.getContext('2d')
        let x = 0
        const stepX = getStepX({ fullWidthPx: cfg.width, totalStackItems: mainStackRef.current.length })
        if (!!ctx) setTimeout(() => {
          // @ts-ignore
          ctx.reset()
          ctx.fillStyle = MAIN_COLOR
          mainStackRef.current.forEach((data) => {
            const c1 = getOffsetY({ data, fullPx: cfg.height, targetField: 'total' })
            // NOTE: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/fillRect
            ctx.rect(x, c1.strartY, stepX, c1.hPx)
            // ctx.fill()
            x += stepX
            const c2 = getOffsetY({ data, fullPx: cfg.height, targetField: 'used' })
            ctx.rect(x, c2.strartY, stepX, c2.hPx)
            // ctx.fill()
            x += stepX
          })
          ctx.fill()
        }, 0)
      }
    }
    // NOTE: Теперь вызываем draw когда захотим - она сама решит когда нужно перерисовать canvas
    // requestRef.current = requestAnimationFrame(draw)
  }, [counter])

  const limit = useMemo(() => (state?.jsHeapSizeLimit || 0) / 1024 / 1024, [state?.jsHeapSizeLimit])
  const total = useMemo(() => (state?.totalJSHeapSize || 0) / 1024 / 1024, [state?.totalJSHeapSize])
  const used = useMemo(() => (state?.usedJSHeapSize || 0) / 1024 / 1024, [state?.usedJSHeapSize])
  const totalOfLimit = useMemo(() => getPercentage({ x: total, sum: limit }), [total, limit])
  const usedOfTotal = useMemo(() => getPercentage({ x: used, sum: total }), [used, total])

  return (
    <div
      className={clsx(
        classes.wrapper,
        classes.stack1,
        classes.fixedBox,
        {
          [classes.topCenter]: ps.position === 'top-center',
          [classes.topRight]: ps.position === 'top-right',
          [classes.rightSideTop]: ps.position === 'right-side-top',
          [classes.rightSideCenterBottom]: ps.position === 'right-side-center-bottom',
          [classes.isClosed]: !isBrowserMemoryMonitorEnabled,
          [classes.isOpened]: isBrowserMemoryMonitorEnabled,
        },
        classes.backdropBlur,
      )}
    >
      {
        !!state ? (
          <>
            <canvas ref={canvasRef} className={classes.canvas} height={canvasCfg.height} width={canvasCfg.width} />
            <div className={classes.stack0}>
              <div
                style={{ display: 'flex', justifyContent: 'space-between' }}
              >
                <span><b>Used</b> of Total</span>
                <span>{total.toFixed(0)} MB</span>
              </div>
              <ProgressBar value={usedOfTotal} label={`${used.toFixed(0)} MB`} />
            </div>

            <div className={classes.stack0}>
              <div
                style={{ display: 'flex', justifyContent: 'space-between' }}
              >
                <span><b>Total</b> of Limit</span>
                <span>{limit.toFixed(0)} MB</span>
              </div>
              <ProgressBar value={totalOfLimit} label={`${total.toFixed(0)} MB`} />
            </div>
          </>
        ) : (
          <div style={{ fontWeight: 'bold', padding: '0px 8px' }}>Memory stat isnt supported</div>
        )
      }
      <button
        className={clsx(
          classes.absoluteToggler,
        )}
        onClick={handleOpenToggle}
      >
        {
          isBrowserMemoryMonitorEnabled
            ? <ExpandLessIcon style={{ fontSize: '24px' }} />
            : <MemoryIcon style={{ fontSize: '24px' }} />
        }
      </button>

    </div>
  )
})
