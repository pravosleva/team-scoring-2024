/* eslint-disable @typescript-eslint/ban-ts-comment */

import { useState, useRef, useLayoutEffect, useCallback, memo, useMemo } from 'react'
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
const mainStackLimit = 1000
const canvasCfg = {
  width: 200,
  height: 15,
}
// const interval = 1 * 100
// const MEMORY_UPDATE_INTERVAL = 1000 // Текст обновляем раз в секунду
const MAIN_COLOR = '#000' // '#959eaa'

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
  // const [isOpened, setIsOpened] = useState(ps.isOpenedByDefault || false)
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
  const [state, setMemState] = useState<TMainStackItem | null>(null)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mainStackRef = useRef<TMainStackItem[]>([])
  const requestRef = useRef<number>()
  const lastUpdateRef = useRef<number>(0)

  const draw = useCallback((time: number) => {
    // @ts-expect-error - работаем с нестандартным API Chrome
    const mem = window.performance?.memory
    if (!mem) return

    // 1. Обновляем данные раз в секунду (Троттлинг)
    if (time - lastUpdateRef.current > 1000) {
      const sample = {
        jsHeapSizeLimit: mem.jsHeapSizeLimit,
        totalJSHeapSize: mem.totalJSHeapSize,
        usedJSHeapSize: mem.usedJSHeapSize
      }
      setMemState(sample)

      if (mainStackRef.current.length >= mainStackLimit) mainStackRef.current.shift()
      mainStackRef.current.push(sample)
      lastUpdateRef.current = time
    }

    // 2. Отрисовка (каждый кадр, если есть данные)
    const ctx = canvasRef.current?.getContext('2d')
    if (ctx && mainStackRef.current.length > 0) {
      const { width, height } = canvasCfg
      const stepX = getStepX({ fullWidthPx: width, totalStackItems: mainStackRef.current.length })

      ctx.clearRect(0, 0, width, height)
      ctx.fillStyle = MAIN_COLOR

      let x = 0
      ctx.beginPath()
      mainStackRef.current.forEach((data) => {
        const total = getOffsetY({ data, fullPx: height, targetField: 'total' })
        ctx.rect(x, total.strartY, stepX, total.hPx)
        x += stepX

        const used = getOffsetY({ data, fullPx: height, targetField: 'used' })
        ctx.rect(x, used.strartY, stepX, used.hPx)
        x += stepX
      })
      ctx.fill()
    }

    requestRef.current = requestAnimationFrame(draw)
  }, [])

  useLayoutEffect(() => {
    // @ts-ignore
    if (!window.performance?.memory) return

    requestRef.current = requestAnimationFrame(draw)
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current)
    }
  }, [draw])

  // Расчеты для UI
  const { limit, total, used, totalOfLimit, usedOfTotal } = useMemo(() => {
    const l = (state?.jsHeapSizeLimit || 0) / 1024 / 1024
    const t = (state?.totalJSHeapSize || 0) / 1024 / 1024
    const u = (state?.usedJSHeapSize || 0) / 1024 / 1024
    return {
      limit: l, total: t, used: u,
      totalOfLimit: getPercentage({ x: t, sum: l }),
      usedOfTotal: getPercentage({ x: u, sum: t })
    }
  }, [state])

  // ВАЖНО: Если API не поддерживается, рисуем заглушку сразу
  // @ts-ignore
  if (!window.performance?.memory) {
    return <div className={classes.wrapper}>Memory API not supported</div>
  }

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
