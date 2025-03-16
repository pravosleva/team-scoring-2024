import { useEffect, useRef, useState, useCallback, memo, useMemo } from 'react'
import { Avatar } from '@mui/material'
import { getJobColor } from './getJobColor'
import { TJob } from '~/shared/xstate'
import { getIcon } from './getIcon'
import { getCurrentPercentage } from '~/shared/utils'

type TProps = {
  job: TJob;
  delay: number;
}

export const AutoRefreshedJobMuiAva = memo(({ job, delay }: TProps) => {
  const [percentageValue, setPercentageValue] = useState(
    getCurrentPercentage({
      targetDateTs: job.forecast.estimate || new Date().getTime(),
      startDateTs: job.forecast.start || new Date().getTime(),
    })
  )
  const timeout = useRef<NodeJS.Timeout>()
  const updateValue = useCallback(() => {
    const newVal = getCurrentPercentage({
      targetDateTs: job.forecast.estimate || new Date().getTime(),
      startDateTs: job.forecast.start || new Date().getTime(),
    })
    setPercentageValue(newVal)
  }, [job.forecast.estimate, job.forecast.start, setPercentageValue])

  useEffect(() => {
    if (!!timeout.current) clearTimeout(timeout.current)
    
    timeout.current = setTimeout(updateValue, delay)

    return () => {
      if (!!timeout.current) clearTimeout(timeout.current)
    }
  }, [percentageValue, job.forecast.estimate, job.forecast.start, updateValue, delay])
  const MemoizedIcon = useMemo(() => getIcon({ job }), [job])
  const jobColor = useMemo(() => getJobColor({ forecast: job.forecast, percentageValue }), [job.forecast, percentageValue])

  return (
    <Avatar
      sx={{
        backgroundColor: jobColor,
      }}
    >
      {MemoizedIcon}
    </Avatar>
  )
})
