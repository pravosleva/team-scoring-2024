import { memo, useCallback } from 'react'
import { Layout } from '~/shared/components/Layout'
import { Button, Grid2 as Grid } from '@mui/material'
import baseClasses from '~/App.module.scss'
// import { groupLog } from '~/shared/utils'
// import { TJob, TopLevelContext } from '~/shared/xstate'
import Brightness1Icon from '@mui/icons-material/Brightness1'
// import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew'
import clsx from 'clsx'
import { ResponsiveBlock } from '~/shared/components'
import { Link } from 'react-router-dom'
// import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import AppsIcon from '@mui/icons-material/Apps'
import { useSnapshot } from 'valtio/react'
import { vi } from '~/shared/utils/vi'
// import { useExperimentalWorker } from './hooks'
import classes from './OnlineExpPage.module.scss'
import { getRandomString } from '~/shared/utils/string-ops'
import pkg from '../../../package.json'

// const PUBLIC_URL = import.meta.env.VITE_PUBLIC_URL || ''
// const BUILD_DATE = import.meta.env.VITE_BUILD_DATE || ''

// type TProps = {
//   isDebugEnabled?: boolean;
// }
// type TTargetResultByWorker = {
//   _x: number;
//   message?: string;
// }
// type TWorkerServiceReport = {
//   message?: string;
// }

export const OnlineExpPage = memo(() => {
  const debugViSnap = useSnapshot(vi.common.devtools)
  // const [outputWorkerData, setOutputWorkerData] = useState<TTargetResultByWorker | null>(null)
  // const [outputWorkerErrMsg, setOutputWorkerErrMsg] = useState<string | null>(null)
  // const [outputWorkerDebugMsg, setOutputWorkerDebugMsg] = useState<string | null>(null)
  // const jobs = TopLevelContext.useSelector((s) => s.context.jobs.items)
  // const [isWorkerEnabled, setIsWorkerEnabled] = useState<boolean>(true)
  // const toggleWorker = () => setIsWorkerEnabled((v) => !v)

  // const [counter, setCounter] = useState<number>(0)
  // const incCounter = useCallback(() => {
  //   setCounter((v) => v + 1)
  // }, [])

  // useExperimentalWorker<TTargetResultByWorker, TWorkerServiceReport>({
  //   isEnabled: isWorkerEnabled,
  //   isDebugEnabled,
  //   cb: {
  //     onEachSuccessItemData: (data) => {
  //       if (isDebugEnabled)
  //         groupLog({
  //           namespace: '[debug] useProjectsTreeCalcWorker:onEachNewsItemData -> data',
  //           items: [
  //             data
  //           ],
  //         })
  //       if (!!data.originalResponse) {
  //         console.log(data.originalResponse)
  //         setOutputWorkerErrMsg(null)
  //         setOutputWorkerData(data.originalResponse)
  //         if (!!data.message) setOutputWorkerDebugMsg(data.message)
  //       }
  //     },
  //     onFinalError: ({ reason }) => {
  //       if (isDebugEnabled)
  //         groupLog({
  //           namespace: '[debug] useProjectsTreeCalcWorker:onFinalError -> reason',
  //           items: [
  //             reason
  //           ],
  //         })
  //       setOutputWorkerErrMsg(reason)
  //     },
  //   },
  //   deps: {
  //     counter
  //   },
  // })

  const handleSetStateValue = useCallback(() => {
    vi.setStateValue({ value: getRandomString(5) })
  }, [])

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
            <h1 style={{ display: 'inline-flex', alignItems: 'center', gap: '16px' }}>
              <Brightness1Icon color={debugViSnap.network.socket.isConnected ? 'success' : 'error'} />
              <span>Socket exp</span>
            </h1>
          </Grid>

          <Grid size={12}>
            <code>{pkg.version}</code> Should be connected by default: in <code className={baseClasses.inlineCode}>App</code>
          </Grid>

          <Grid size={12}>
            <Button
              onClick={handleSetStateValue}
              variant='outlined'
            >
              Random stateValue
            </Button>
          </Grid>

          {/* <Grid
            size={12}
            sx={{
              display: 'flex',
              flexDirection: 'row',
              gap: '8px',
            }}
          >
            <Button
              onClick={incCounter}
              variant='outlined'
            >
              Inc counter ({counter}) & send msg to Worker
            </Button>
            <Button
              onClick={toggleWorker}
              variant='outlined'
              startIcon={isWorkerEnabled ? <Brightness1Icon /> : <PowerSettingsNewIcon />}
              color={isWorkerEnabled ? 'success' : 'error'}
            >
              {isWorkerEnabled ? 'OFF' : 'ON'}
            </Button>
          </Grid> */}

          {/*!!outputWorkerErrMsg && (
            <Grid size={12}>
              <Alert severity='error' variant='filled'>
                <div className={baseClasses.stack1}>
                  <b>Error message</b>
                  <span>{outputWorkerErrMsg}</span>
                </div>
              </Alert>
            </Grid>
          )*/}

          <Grid size={12}>
            <pre
              className={clsx(
                baseClasses.preNormalized,
                classes.resultWrapper,
                {
                  [classes.resultWhenWorkerDisabled]: !debugViSnap.network.socket.isConnected,
                  [classes.resultWhenWorkerEnabled]: debugViSnap.network.socket.isConnected,
                }
              )}
            >{JSON.stringify(debugViSnap.network, null, 2)}</pre>
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
