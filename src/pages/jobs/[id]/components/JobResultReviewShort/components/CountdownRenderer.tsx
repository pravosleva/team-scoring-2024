import { Chip } from '@mui/material'
import { zeroPad } from 'react-countdown'

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
      variant='outlined'
      size='small'
      label={`${days} d ${zeroPad(hours)}:${zeroPad(minutes)}:${zeroPad(seconds)}`}
    />
  )
}
