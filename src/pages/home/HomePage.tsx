import { Link } from 'react-router-dom'
// import { Button } from '@mui/material'
// import baseClasses from '~/App.module.scss'
import { Layout } from '~/shared/components/Layout'
import Grid from '@mui/material/Grid2'
import baseClasses from '~/App.module.scss'
import { ResponsiveBlock } from '~/shared/components'
import classes from './HomePage.module.scss'
import clsx from 'clsx'

export const HomePage = () => {
  return (
    <Layout>
      <Grid container spacing={1}>
        <Grid size={12}>
          <h1>Estimate corrector</h1>
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
            <Link
              to='/jobs'
              style={{
                display: 'block',
              }}
            >
              <div className={classes.gridItem}>
                <div className={classes.title}>Jobs</div>
                <em className={classes.descr}>You can create jobs and take timing analysis</em>
              </div>
            </Link>
            <Link
              to='/employees'
              style={{
                display: 'block',
              }}
            >
              <div className={classes.gridItem}>
                <div className={classes.title}>Employees</div>
                <em className={classes.descr}>All users</em>
              </div>
            </Link>
            <Link
              to='/about'
              style={{
                display: 'block',
              }}
            >
              <div className={classes.gridItem}>
                <div className={classes.title}>About</div>
              </div>
            </Link>
            <Link
              to='/business-time'
              style={{
                display: 'block',
              }}
            >
              <div className={classes.gridItem}>
                <div className={classes.title}>⚙️ Business time</div>
                <em className={classes.descr}>Local settings (experimental)</em>
              </div>
            </Link>
          </ResponsiveBlock>
        </Grid>
      </Grid>
    </Layout>
  )
}
