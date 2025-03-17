import { memo } from 'react'
import { styled } from '@mui/material/styles'

type TUiConnectVariant = 'bottom' | 'right';

export type TBaseProgressBarProps = {
  label: string;
  value: number;
  connectedOnThe?: TUiConnectVariant[];
}

type TBorderRadiusResult = {
  values: [number, number, number, number];
  extentalMui: string;
}

const getBorderRadiusByUiConnectVariant = ({ codes }: {
  codes?: TUiConnectVariant[];
}): TBorderRadiusResult => {
  const res: TBorderRadiusResult = {
    values: [24, 24, 24, 24],
    extentalMui: '24px 24px 24px 24px',
  }
  switch (true) {
    case !codes:
      // Nothing...
      break
    case codes?.includes('bottom'):
      res.values[2] = 0
      res.values[3] = 0
      break
    case codes?.includes('right'):
      res.values[1] = 0
      res.values[2] = 0
      break
    default:
      break
  }
  res.extentalMui = res.values.map((n) => `${n}px`).join(' ')
  return res
}

const ProgressBar = styled('div')<TBaseProgressBarProps>(({
  label,
  value,
  connectedOnThe,
}) => ({
  // color: 'darkslategray',
  // backgroundColor: 'aliceblue',
  padding: 8,
  borderRadius: getBorderRadiusByUiConnectVariant({
    codes: connectedOnThe,
  }).extentalMui,
  position: 'relative',
  backgroundColor: 'lightgray',
  boxSizing: 'border-box',
  width: '100%',
  height: '3em',
  color: '#fff',
  fontFamily: 'system-ui',

  '&::before': {
    boxSizing: 'border-box',
    // fontSize: '8px',
    whiteSpace: 'pre',
    content: `"${label}"`,
    display: 'flex',
    alignItems: 'center',
    position: 'absolute',
    left: '0.5em',
    top: '0.5em',
    bottom: '0.5em',
    /* width: calc(var(--width, 0) * 1%); */
    width: `${value <= 100 ? Math.abs(value).toFixed(0) : 100}%`,
    // backgroundColor: '#2cc194',
    // value > 100 -> background-color: #e46046;
    // value < 0 -> background-color: #2280fa;
    backgroundColor:
      value > 100 ? '#e46046'
      : value < 0
        ? '#2280fa'
        : '#2cc194',
    minWidth: '2rem',
    maxWidth: 'calc(100% - 1em)',
    borderRadius: '1em',
    padding: '1em',
    transition: 'width 0.3s ease-in',
  }
}))

export const BaseProgressBar = memo(
  ({ label, value, ...others }: TBaseProgressBarProps) => (
    <ProgressBar label={label} value={value} {...others} />
  )
)
