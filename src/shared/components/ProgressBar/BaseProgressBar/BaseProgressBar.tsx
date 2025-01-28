import { styled } from '@mui/material/styles'

type TProps = {
  label: string;
  value: number;
}

const ProgressBar = styled('div')<TProps>(({ label, value }) => ({
  // color: 'darkslategray',
  // backgroundColor: 'aliceblue',
  padding: 8,
  borderRadius: 24,
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

export const BaseProgressBar = ({ label, value }: TProps) => {
  return <ProgressBar label={label} value={value} />
}
