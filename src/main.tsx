import { createRoot } from 'react-dom/client'
import { App } from './App.tsx'
import { CommonInfoLayer } from '~/shared/context'
import { SearchWidgetDataLayer, TopLevelContext } from '~/shared/xstate/topLevelMachine/v2'
import { ClientPerfWidget } from '~/shared/components/ClientPerfWidget'
import { SnackbarProvider, closeSnackbar } from 'notistack'
import CloseIcon from '@mui/icons-material/Close'
import 'react-photo-view/dist/react-photo-view.css'
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
    <CommonInfoLayer>
      <TopLevelContext.Provider>
        <SearchWidgetDataLayer>
          <ClientPerfWidget position='right-side-center-bottom' />
          <App />
        </SearchWidgetDataLayer>
      </TopLevelContext.Provider>
    </CommonInfoLayer>
  </SnackbarProvider>,
)
