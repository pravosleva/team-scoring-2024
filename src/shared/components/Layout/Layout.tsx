import { useState } from 'react'
import SpeedDial from '@mui/material/SpeedDial'
import Backdrop from '@mui/material/Backdrop'
// import BioTechIcon from '@mui/icons-material/Biotech'
// import SpeedDialIcon from '@mui/material/SpeedDialIcon'
import SpeedDialAction from '@mui/material/SpeedDialAction'
import { Link } from 'react-router-dom'
// import PlaylistAddCheckCircleIcon from '@mui/icons-material/PlaylistAddCheckCircle'
// import PlaylistPlayIcon from '@mui/icons-material/PlaylistPlay'
import PeopleIcon from '@mui/icons-material/People'
import classes from './Layout.module.scss'
import AppsIcon from '@mui/icons-material/Apps'
// import LocalActivityIcon from '@mui/icons-material/LocalActivity';
import clsx from 'clsx'
import { ResponsiveBlock, SearchWidget } from '~/shared/components'
// import SegmentIcon from '@mui/icons-material/Segment'
import SportsBasketballIcon from '@mui/icons-material/SportsBasketball'
import { FixedPinnedJoblist, FixedScrollTopBtn } from './components'
import { ParamsInspectorContextWrapper } from '~/shared/xstate/topLevelMachine/v2/context/ParamsInspectorContextWrapper'
import { useSnapshot } from 'valtio/react'
import { vi } from '~/shared/utils/vi'
import LensBlurIcon from '@mui/icons-material/LensBlur'
import LensIcon from '@mui/icons-material/Lens'
import SettingsIcon from '@mui/icons-material/Settings'
import { TopLevelContext } from '~/shared/xstate'
import { CommonInfoContext } from '~/shared/context'

type TProps = {
  children: React.ReactNode;
  noScrollTopBtn?: boolean;
  noPinnedJoblistBtn?: boolean;
}
type TSpeedDialMenuItem = {
  to: string;
  _Icon: React.ReactNode;
  name: string;
}

const allActions: TSpeedDialMenuItem[] = [
  {
    to: '/',
    _Icon: <AppsIcon color='primary' />,
    name: 'Home',
  },
  // {
  //   to: '/jobs',
  //   _Icon: <PlaylistPlayIcon color='primary' />,
  //   name: 'Jobs',
  // },
  {
    to: '/employees',
    _Icon: <PeopleIcon color='primary' />,
    name: 'Employees',
  },
  {
    to: '/local-settings',
    _Icon: <SettingsIcon color='primary' />,
    name: 'Local settings',
  },
  {
    to: '/last-activity',
    _Icon: <SportsBasketballIcon color='primary' />,
    name: 'Last Activity',
  },
  // {
  //   to: '/report/total',
  //   _Icon: <BioTechIcon color='primary' />,
  //   name: 'Report exp',
  // },
]

export const Layout = ({ children, noPinnedJoblistBtn, noScrollTopBtn }: TProps) => {
  const [speedDialOpened, setSpeedDialOpened] = useState(false)
  const handleOpenSpeedDial = () => setSpeedDialOpened(true)
  const handleCloseSpeedDial = () => setSpeedDialOpened(false)
  const debugViSnap = useSnapshot(vi.common.devtools)
  const jobs = TopLevelContext.useSelector((s) => s.context.jobs.items)
  const [appVersion] = CommonInfoContext.useStore((s) => s.appVersion)
  const [brandName] = CommonInfoContext.useStore((s) => s.brandName)
  const [createdYear] = CommonInfoContext.useStore((s) => s.createdYear)
  const [currentYear] = CommonInfoContext.useStore((s) => s.currentYear)
  const [gitBranchName] = CommonInfoContext.useStore((s) => s.gitBranchName)
  const [gitSHA1] = CommonInfoContext.useStore((s) => s.gitSHA1)
  const [isCreactedCurrentYear] = CommonInfoContext.useStore((s) => s.isCreactedCurrentYear)
  const [ls] = CommonInfoContext.useStore((s) => s.ls)
  const [idb] = CommonInfoContext.useStore((s) => s.idb)

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
          <b>© {brandName}, {isCreactedCurrentYear ? currentYear : `${createdYear} — ${currentYear}`}</b>
          <div>App version <code className={classes.code}>{appVersion}</code></div>
          <div>GIT SHA-1 <code className={classes.code}>{gitSHA1}</code></div>
          <div>GIT branch name <code className={classes.code}>{gitBranchName}</code></div>
          {!!ls.sizeInfo && <div>LS size used <code className={classes.code}>{ls.sizeInfo}</code></div>}
          {!!idb && <div>IndexedDB size used <code className={classes.code}>{idb.used.humanized} ({idb.used.percentage.toFixed(2)}%)</code></div>}
        </ResponsiveBlock>
      </div>

      <Backdrop
        open={speedDialOpened}
        sx={{
          zIndex: 51,
        }}
      />
      <SpeedDial
        open={speedDialOpened}
        ariaLabel='SpeedDial'
        onOpen={handleOpenSpeedDial}
        onClose={handleCloseSpeedDial}
        sx={{
          position: 'fixed',
          bottom: 32,
          right: 24,
        }}
        icon={debugViSnap.network.socket.isConnected ? <LensIcon /> : <LensBlurIcon />}
      >
        {allActions.map(({ to, name, _Icon }) => (
          <SpeedDialAction
            onClick={handleCloseSpeedDial}
            FabProps={{
              size: 'medium',
            }}
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
              </Link>
            }
            tooltipTitle={name}
          />
        ))}
      </SpeedDial>
      {
        !noScrollTopBtn && (
          <FixedScrollTopBtn />
        )
      }
      {
        !noPinnedJoblistBtn && (
          <FixedPinnedJoblist />
        )
      }
      {
        jobs.length > 0 && (
          <SearchWidget position='left-side-center-bottom' />
        )
      }
    </ParamsInspectorContextWrapper>
  )
}
