import { useState, useRef, useCallback, useEffect, memo } from 'react'
import { getCurrentPercentage } from '~/shared/utils'
import { BaseProgressBar } from './BaseProgressBar'

type TProps = {
  targetDate: number;
  startDate: number;
  delay: number;
}

export const AutoRefreshedProgressBar = memo(({ targetDate, startDate, delay }: TProps) => {
  const [value, setValue] = useState(
    getCurrentPercentage({
      targetDateTs: targetDate,
      startDateTs: startDate,
    }),
  )
  const timeout = useRef<NodeJS.Timeout>()
  const updateValue = useCallback(() => {
    const newVal = getCurrentPercentage({
      targetDateTs: targetDate,
      startDateTs: startDate,
    })
    setValue(newVal)
  }, [targetDate, startDate, setValue])

  useEffect(() => {
    if (!!timeout.current) clearTimeout(timeout.current)

    timeout.current = setTimeout(updateValue, delay)

    return () => {
      if (!!timeout.current) clearTimeout(timeout.current)
    }
  }, [value, targetDate, startDate, updateValue, delay])

  return (
    <div style={{ width: '100%' }}>
      <BaseProgressBar value={value} label={`${value.toFixed(0)} %`} />
    </div>
  )
})
