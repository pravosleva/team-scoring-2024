import { useEffect, useRef, useState, useCallback, memo, useMemo } from 'react'
import { Avatar } from '@mui/material'
import { getJobColor } from './getJobColor'
import { TJob } from '~/shared/xstate'
import { getIcon } from './getIcon'
import { getCurrentPercentage } from '~/shared/utils'
import dayjs from 'dayjs'

type TProps = {
  job: TJob;
  delay: number;
  size?: number;
}

export const AutoRefreshedJobMuiAva = memo(({ job, delay, size }: TProps) => {
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

  const handleClick = useCallback(() => {
    const json = {
      started: !!job.forecast?.start
        ? dayjs(job.forecast.start).format('DD.MM.YYYY HH:mm')
        : undefined,
      estimate: !!job.forecast?.estimate
        ? dayjs(job.forecast.estimate).format('DD.MM.YYYY HH:mm')
        : undefined,
      finish: !!job.forecast?.finish
        ? dayjs(job.forecast.finish).format('DD.MM.YYYY HH:mm')
        : undefined,
    }

    window.alert([
      job.title,
      Object.values(json).some(Boolean)
        ? JSON.stringify(json, null, 2)
        : 'No timers',
    ].join('\n\n'))
  }, [job.title, job.forecast?.start, job.forecast?.estimate, job.forecast?.finish])

  return (
    <Avatar
      sx={{
        backgroundColor: jobColor,
        width: !!size ? size : undefined,
        height: !!size ? size : undefined,
      }}
      onClick={handleClick}
    >
      {MemoizedIcon}
    </Avatar>
  )
})
