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
      variant='filled'
      size='small'
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      color='salmon'
      label={`${days} d ${zeroPad(hours)}:${zeroPad(minutes)}:${zeroPad(seconds)}`}
    />
  )
}
