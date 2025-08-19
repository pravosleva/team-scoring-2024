import { createRoot } from 'react-dom/client'
import { App } from './App.tsx'
import { TopLevelContext } from './shared/xstate/topLevelMachine/v2'
import { ClientPerfWidget } from '~/shared/components/ClientPerfWidget'
import { SnackbarProvider, closeSnackbar } from 'notistack'
import CloseIcon from '@mui/icons-material/Close'
import './special-experimental-styles.css'

createRoot(document.getElementById('root')!).render(
  <SnackbarProvider
    maxSnack={3}
    autoHideDuration={60000}
    // preventDuplicate
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'right',
    }}
    style={{
      borderRadius: '8px',
      maxWidth: '430px',
      whiteSpace: 'pre-wrap',
    }}
    action={(snackbarId) => (
      <button
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: '50%',
          border: '2px solid #FFF',
          backgroundColor: 'transparent',
          color: '#FFF',
          width: '32px',
          height: '32px',
          cursor: 'pointer',
        }}
        onClick={() => closeSnackbar(snackbarId)}
      >
        <CloseIcon fontSize='small' />
      </button>
    )}
  >
    <TopLevelContext.Provider>
      <ClientPerfWidget position='right-side-center-bottom' />
      <App />
    </TopLevelContext.Provider>
  </SnackbarProvider>,
)
