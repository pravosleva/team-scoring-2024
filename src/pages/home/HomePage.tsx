import { Link } from 'react-router-dom'
// import { Button } from '@mui/material'
// import baseClasses from '~/App.module.scss'
import { Layout } from '~/shared/components/Layout'
import Grid from '@mui/material/Grid2'
import baseClasses from '~/App.module.scss'
import { ResponsiveBlock } from '~/shared/components'
import classes from './HomePage.module.scss'
import clsx from 'clsx'
import ConstructionIcon from '@mui/icons-material/Construction'
import GroupIcon from '@mui/icons-material/Group'
import InfoIcon from '@mui/icons-material/Info'
import WorkHistoryIcon from '@mui/icons-material/WorkHistory'
import SportsBasketballIcon from '@mui/icons-material/SportsBasketball'
import Brightness1Icon from '@mui/icons-material/Brightness1'
import SurroundSoundIcon from '@mui/icons-material/SurroundSound'
import AnalyticsIcon from '@mui/icons-material/Analytics';
// import WebIcon from '@mui/icons-material/Web'

export const HomePage = () => {
  return (
    <Layout>
      <Grid container spacing={1} sx={{ mb: 2 }}>
        <Grid size={12}>
          <h1 className={baseClasses.inlineH1}>
            <AnalyticsIcon fontSize='inherit' />
            <span>Estimate corrector</span>
          </h1>
        </Grid>
        <Grid size={12}>
          <ResponsiveBlock
            isPaddedMobile
            isLimited
            className={clsx(
              baseClasses.pagesGrid,
              classes.grid,
            )}
          >
            <h2 style={{ color: '#959eaa' }}>Main</h2>
            <Link
              to='/last-activity'
              style={{
                display: 'block',
              }}
            >
              <div className={classes.gridItem}>
                <SportsBasketballIcon />
                <div className={classes.internalWrapper}>
                  <div className={classes.title}>Last activity</div>
                </div>
              </div>
            </Link>
            <Link
              to='/jobs'
              style={{
                display: 'block',
              }}
            >
              <div className={classes.gridItem}>
                <ConstructionIcon />
                <div className={classes.internalWrapper}>
                  <div className={classes.title}>Jobs</div>
                  <em className={classes.descr}>You can create jobs and take timing analysis</em>
                </div>
              </div>
            </Link>
            <Link
              to='/employees'
              style={{
                display: 'block',
              }}
            >
              <div className={classes.gridItem}>
                <GroupIcon />
                <div className={classes.internalWrapper}>
                  <div className={classes.title}>Employees</div>
                  <em className={classes.descr}>All users</em>
                </div>
              </div>
            </Link>

            <h2 style={{ color: '#959eaa' }}>Experimental</h2>

            {/* <Link
              to='/jobs-pager-exp'
              style={{
                display: 'block',
              }}
            >
              <div className={classes.gridItem}>
                <WebIcon />
                <div className={classes.internalWrapper}>
                  <div className={classes.title}>Jobs Pager Exp</div>
                  <em className={classes.descr}>Web Worker experience (experimental)</em>
                </div>
              </div>
            </Link> */}
            <Link
              to='/business-time'
              style={{
                display: 'block',
              }}
            >
              <div className={classes.gridItem}>
                <WorkHistoryIcon />
                <div className={classes.internalWrapper}>
                  <div className={classes.title}>Business time</div>
                  <em className={classes.descr}>Local settings (experimental)</em>
                </div>
              </div>
            </Link>
            <Link
              to='/worker-exp'
              style={{
                display: 'block',
              }}
            >
              <div className={classes.gridItem}>
                <Brightness1Icon />
                <div className={classes.internalWrapper}>
                  <div className={classes.title}>Worker Exp</div>
                  <em className={classes.descr}>Web Worker experience (experimental)</em>
                </div>
              </div>
            </Link>
            <Link
              to='/sound-check'
              style={{
                display: 'block',
              }}
            >
              <div className={classes.gridItem}>
                <SurroundSoundIcon />
                <div className={classes.internalWrapper}>
                  <div className={classes.title}>Sound check</div>
                  <em className={classes.descr}>Play sound (experimental)</em>
                </div>
              </div>
            </Link>
            <Link
              to='/about'
              style={{
                display: 'block',
              }}
            >
              <div className={classes.gridItem}>
                <InfoIcon />
                <div className={classes.internalWrapper}>
                  <div className={classes.title}>About</div>
                </div>
              </div>
            </Link>
          </ResponsiveBlock>
        </Grid>
      </Grid>
    </Layout>
  )
}
