import { useMemo } from 'react'
import SpeedDial from '@mui/material/SpeedDial'
// import SpeedDialIcon from '@mui/material/SpeedDialIcon'
import SpeedDialAction from '@mui/material/SpeedDialAction'
import { Link } from 'react-router-dom'
// import PlaylistAddCheckCircleIcon from '@mui/icons-material/PlaylistAddCheckCircle'
import PlaylistPlayIcon from '@mui/icons-material/PlaylistPlay'
import PeopleIcon from '@mui/icons-material/People'
import classes from './Layout.module.scss'
import { useLocation } from 'react-router-dom'
import AppsIcon from '@mui/icons-material/Apps'
import clsx from 'clsx'
import { ResponsiveBlock } from '~/shared/components'
import SegmentIcon from '@mui/icons-material/Segment'
import { FixedScrollTopBtn } from './components'
import { ParamsInspectorContextWrapper } from '~/shared/xstate/topLevelMachine/v2/context/ParamsInspectorContext'

type TProps = {
  children: React.ReactNode;
}
type TSpeedDialMenuItem = {
  to: string;
  _Icon: React.ReactNode;
  name: string;
}

const allActions: TSpeedDialMenuItem[] = [
  {
    to: '/jobs',
    _Icon: <PlaylistPlayIcon color='primary' />,
    name: 'Jobs',
  },
  {
    to: '/employees',
    _Icon: <PeopleIcon color='primary' />,
    name: 'Employees',
  },
  {
    to: '/',
    _Icon: <AppsIcon color='primary' />,
    name: 'Home',
  },
]

const APP_VERSION = import.meta.env.VITE_APP_VERSION || 'No VITE_APP_VERSION'
const BRAND_NAME = import.meta.env.VITE_BRAND_NAME || 'No VITE_BRAND_NAME'
const GIT_SHA1 = import.meta.env.VITE_GIT_SHA1 || 'No Git VITE_GIT_SHA1'
const GIT_BRANCH_NAME = import.meta.env.VITE_GIT_BRANCH_NAME || 'No VITE_GIT_BRANCH_NAME'

export const Layout = ({ children }: TProps) => {
  const location = useLocation()
  const currentYear = useMemo(() => new Date().getFullYear(), [])
  const createdYear = 2019
  const isCreactedCurrentYear = useMemo(() => currentYear === createdYear, [createdYear, currentYear])

  return (
    <ParamsInspectorContextWrapper>
      <div className={classes.appWrapper}>
        <ResponsiveBlock
          isPaddedMobile
          isLimitedForDesktop
        >
          {children}
        </ResponsiveBlock>
        <ResponsiveBlock
          isPaddedMobile
          isLimitedForDesktop
          style={{
            height: '100%',
            marginTop: 'auto',
            borderTop: '1px solid lightgray',
            paddingTop: '16px',
            paddingBottom: '16px',
            fontSize: 'x-small',
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
          }}
        >
          <b>© {BRAND_NAME}, {isCreactedCurrentYear ? currentYear : `${createdYear} — ${currentYear}`}</b>
          <div>App version <code className={classes.code}>{APP_VERSION}</code></div>
          <div>GIT SHA-1 <code className={classes.code}>{GIT_SHA1}</code></div>
          <div>GIT branch name <code className={classes.code}>{GIT_BRANCH_NAME}</code></div>
        </ResponsiveBlock>
      </div>
      
      <SpeedDial
        ariaLabel='SpeedDial'
        sx={{
          position: 'fixed',
          bottom: 32,
          right: 24,
        }}
        icon={<SegmentIcon />}
      >
        {allActions.map(({ to, name, _Icon }) => (
          <SpeedDialAction
            key={name}
            icon={
              <Link
                to={to}
                className={clsx(
                  classes.speedDialLink,
                  {
                    [classes.inactive]: location.pathname === to,
                  },
                )}
              >
                {_Icon}
              </Link>}
            tooltipTitle={name}
          />
        ))}
      </SpeedDial>
      <FixedScrollTopBtn />
    </ParamsInspectorContextWrapper>
  )
}
