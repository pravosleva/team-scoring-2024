import { useEffect, useMemo, useState, useRef, memo } from 'react'
import { TJob } from '~/shared/xstate'
import ThumbUpIcon from '@mui/icons-material/ThumbUp'
import ThumbDownIcon from '@mui/icons-material/ThumbDown'
import { Chip } from '@mui/material'
import dayjs from 'dayjs'
import Countdown from 'react-countdown'
import { TimeAgo } from '~/shared/components'
import { CountdownRenderer } from './components'

export const JobResultReviewShort = memo(({ job, isSpaceBetween }: {
  job: TJob;
  isSpaceBetween?: boolean;
}) => {
  const isJobDone = !!job.forecast.finish
  const isJobStartedAndEstimated = !!job.forecast.start && !!job.forecast.estimate
  const isStartedOnly = !!job.forecast.start && !job.forecast.estimate
  const isNew = !job.forecast.start

  const [nowDate, setNowDate] = useState(dayjs())
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  useEffect(() => {
    if (!!timeoutRef.current) clearInterval(timeoutRef.current)

    timeoutRef.current = setInterval(() => {
      setNowDate(dayjs())
    }, 1000 * 10)

    return () => {
      if (!!timeoutRef.current) clearInterval(timeoutRef.current)
    }
  }, [])

  const Image = useMemo(() => {
    switch (true) {
      case isJobDone: {
        // const isJobDataCorrect = typeof job.forecast.finish === 'number'
        //   && typeof job.forecast.estimate === 'number'
        const finish = dayjs(job.forecast.finish)
        const estimate = dayjs(job.forecast.estimate)
        const isGood = estimate.diff(finish, 'minutes') > 0
        const hrsDiff = finish.diff(estimate, 'hours')
        return (
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: '8px',
              fontSize: 'small',
              // width: '100%',
            }}
          >
            {
              isGood
                ? <ThumbUpIcon style={{ fontSize: '16px' }} />
                : <ThumbDownIcon style={{ fontSize: '16px' }} />
            }
            <div>{!isGood ? '+' : ''}{hrsDiff}h</div>
            {
              job.completed && !!job.forecast.finish && (
                <Chip
                  sx={{
                    marginLeft: isSpaceBetween ? 'auto' : 'none'
                  }}
                  variant='outlined'
                  size='small'
                  label={(
                    <TimeAgo
                      date={job.forecast.finish}
                      style={{ color: 'gray' }}
                      prefix='Done'
                    />
                  )}
                />
              )
            }
          </div>
        )
      }
      case isJobStartedAndEstimated: {
        const estimate = dayjs(job.forecast.estimate)
        const isGood = estimate.diff(nowDate, 'minutes') > 0
        // const isGood =
        //   (job.forecast.estimate as number) - (job.forecast.estimate as number) > 0
        const hrsDiff = nowDate.diff(estimate, 'hours')
        return (
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: '8px',
              fontSize: 'small',
              // width: '100%',
            }}
          >
            {
              isGood
                ? <ThumbUpIcon style={{ fontSize: '16px' }} />
                : <ThumbDownIcon style={{ fontSize: '16px' }} />
            }
            <div>{!isGood ? '+' : ''}{hrsDiff}h</div>
            {
              !!job.forecast.estimate && !job.completed && (
                <span
                  style={{
                    marginLeft: isSpaceBetween ? 'auto' : 'none'
                  }}
                >
                  <Countdown
                    renderer={CountdownRenderer}
                    date={job.forecast.estimate}
                  />
                </span>
              )
            }
          </div>
        )
      }
      case isNew:
        return <span style={{ fontSize: 'small' }}>New</span>
      case isStartedOnly:
        return <span style={{ fontSize: 'small' }}>Started</span>
      default:
        return null
    }
  }, [
    isNew,
    isStartedOnly,
    nowDate,
    isJobDone,
    job.forecast.estimate,
    job.forecast.finish,
    isJobStartedAndEstimated,
    job.completed,
    isSpaceBetween,
  ])

  return Image
})
