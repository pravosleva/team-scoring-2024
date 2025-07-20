import { memo, useState } from 'react'
import { Layout } from '~/shared/components/Layout'
import { Button, Grid2 as Grid } from '@mui/material'
import baseClasses from '~/App.module.scss'
import { ResponsiveBlock } from '~/shared/components'
import { Link } from 'react-router-dom'
// import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import AppsIcon from '@mui/icons-material/Apps'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import { soundManager } from '~/shared'
import layoutClasses from '~/shared/components/Layout/Layout.module.scss'

export const SoundCheckPage = memo(() => {
  const [counter, setCounter] = useState<number>(0)
  const incCounter = () => setCounter((v) => v + 1)
  const handlePlayDelayed = () => {
    incCounter()
    soundManager.playDelayedSound({
      soundCode: 'switch-3-epic',
    })
  }
  const handlePlayDelayedConfigurable = () => {
    incCounter()
    soundManager.playDelayedSoundConfigurable({
      soundCode: 'mech-78-step',
      delay: {
        before: 0,
        after: 1000,
      },
      _debug: { msg: '1' }
    })
    soundManager.playDelayedSoundConfigurable({
      soundCode: 'mech-78-step',
      delay: {
        before: 0,
        after: 500,
      },
      _debug: { msg: '2' }
    })
    soundManager.playDelayedSoundConfigurable({
      soundCode: 'mech-78-step',
      delay: {
        before: 0,
        after: 1000,
      },
      _debug: { msg: '3' }
    })
  }

  return (
    <Layout>
      <div
        className={baseClasses.stack1}
        style={{
          marginBottom: '24px',
        }}
      >
        <Grid container spacing={2}>
          <Grid size={12}>
            <h1>Cound check [{counter}]</h1>
            <p>U can try <code className={layoutClasses.code}>soundManager</code> tetsing</p>
          </Grid>

          <Grid
            size={12}
            sx={{
              display: 'flex',
              flexDirection: 'row',
              gap: '8px',
            }}
          >
            <Button
              onClick={handlePlayDelayed}
              variant='outlined'
              endIcon={<PlayArrowIcon />}
            >
              Delayed 500ms
            </Button>
          </Grid>

          <Grid
            size={12}
            sx={{
              display: 'flex',
              flexDirection: 'row',
              gap: '8px',
            }}
          >
            <Button
              onClick={handlePlayDelayedConfigurable}
              variant='outlined'
              endIcon={<PlayArrowIcon />}
            >
              Delayed Conf. 1s-500ms-1s
            </Button>
          </Grid>

        </Grid>
      </div>
      <ResponsiveBlock
        className={baseClasses.specialActionsGrid}
        style={{
          padding: '16px 0 16px 0',
          // border: '1px dashed red',
          boxShadow: '0 -10px 7px -8px rgba(34,60,80,.2)',
          position: 'sticky',
          bottom: 0,
          backgroundColor: '#fff',
          zIndex: 3,
          marginTop: 'auto',
          // borderRadius: '16px 16px 0px 0px',
        }}
      >
        <Link to='/' target='_self'>
          <Button variant='contained' startIcon={<AppsIcon />} fullWidth>
            Home
          </Button>
        </Link>
      </ResponsiveBlock>
    </Layout>
  )
})