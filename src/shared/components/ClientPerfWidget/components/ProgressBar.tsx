import { memo, useMemo } from 'react';
import clsx from 'clsx'
import classes from './ProgressBar.module.scss'
// import { linear } from 'math-interpolate'
import { progressBarCfg, colorSubZero, colorNormal, colorWarning, colorDanger } from './progressBarCfg'

type TProps = {
  value: number;
  label: string;
}

export const ProgressBar = memo(({ value, label }: TProps) => {
  const memoizedWidth = useMemo(() => (
    `${value <= 100 ? Math.abs(value).toFixed(0) : 100}%`
  ), [value])
  const memoizedColor = useMemo(() => (
    value < 0
      ? colorSubZero
      : value >= 0 && value < progressBarCfg.first.limits.warning
        ? colorNormal
        : value >= progressBarCfg.first.limits.warning && value < progressBarCfg.first.limits.danger
          ? colorWarning
          : colorDanger
  ), [value])

  return (
    <div className={clsx(classes.progressBar, classes.progressBar_external)}>
      <div
        className={clsx(
          classes.progressBar,
          classes.progressBar_internal,
          // {
          //   [classes.subZero]: value < 0,
          //   [classes.success]: value >= 0 && value < progressBarCfg.first.limits.warning,
          //   [classes.warning]: value >= progressBarCfg.first.limits.warning && value < progressBarCfg.first.limits.danger,
          //   [classes.danger]:value >= progressBarCfg.first.limits.danger,
          // },
        )}
        style={{
          width: memoizedWidth,
          backgroundColor: memoizedColor,
        }}
      >
        <span>{value.toFixed(0)}%</span>
        <span>{label}</span>
      </div>
    </div>
  )
})
