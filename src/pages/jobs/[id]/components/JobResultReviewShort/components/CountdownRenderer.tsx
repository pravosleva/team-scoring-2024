import { Chip } from '@mui/material'
import { zeroPad } from 'react-countdown'

enum EDeadLine {
  WARN = 2,
  DANGER = 1,
}
const deadlineConfig = {
  [EDeadLine.WARN]: 'salmon',
  [EDeadLine.DANGER]: 'error',
}

export const CountdownRenderer = ({ days, hours, minutes, seconds, completed }: {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  completed: boolean;
}) => {
  if (completed) return null

  return (
    <Chip
      variant='filled'
      size='small'
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      color={
        days <= EDeadLine.DANGER
        ? deadlineConfig[EDeadLine.DANGER]
        : days <= EDeadLine.WARN
          ? deadlineConfig[EDeadLine.WARN]
          : 'success'
      }
      label={`${days}d ${zeroPad(hours)}:${zeroPad(minutes)}:${zeroPad(seconds)}`}
    />
  )
}
