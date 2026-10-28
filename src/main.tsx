import { createRoot } from 'react-dom/client'
import { App } from './App.tsx'
import { CommonInfoLayer, IDBSwitchersLayer } from '~/shared/context'
import { SearchWidgetDataLayer, TopLevelContext } from '~/shared/xstate/topLevelMachine/v2'
import { ClientPerfWidget } from '~/shared/components/ClientPerfWidget'
import { SnackbarProvider, closeSnackbar } from 'notistack'
import CloseIcon from '@mui/icons-material/Close'
import 'react-photo-view/dist/react-photo-view.css'
import './special-experimental-styles.css'

async function enableMswMocking() {
  if (process.env.NODE_ENV === 'development') {
    const { worker } = await import('./mocks.msw/browser.ts')

    return worker.start({
      onUnhandledRequest: 'warn', // MSW напишет в консоль, если видит запрос, но нет подходящего обработчика
      serviceWorker: {
        url: '/mockServiceWorker.js'
      }
    })
  }
}

// Перехватываем запрос на удаление БД ДО старта React и инициализации idbInstance
if (window.localStorage.getItem('pwa_force_clear_idb_pending') === 'true') {
  // Временно блокируем отрисовку интерфейса, пока идет удаление
  const DB_NAME = 'LocalImageDB';
  
  const req = window.indexedDB.deleteDatabase(DB_NAME);
  
  req.onsuccess = () => {
    console.log(`✅ База данных ${DB_NAME} успешно удалена до старта приложения.`);
    window.localStorage.removeItem('pwa_force_clear_idb_pending');
    window.location.reload(); // Чистый перезапуск, теперь запустится новый IDBSingleton
  };

  req.onerror = () => {
    window.localStorage.removeItem('pwa_force_clear_idb_pending');
    window.location.reload();
  };

  req.onblocked = () => {
    // Если вкладки всё еще мешают, принудительно очищаем флаг, чтобы приложение не зациклилось
    window.localStorage.removeItem('pwa_force_clear_idb_pending');
    alert('Очистка заблокирована другими вкладками. Пожалуйста, закройте остальные вкладки приложения.');
    window.location.reload();
  };
} else {
  // Здесь идет ваш стандартный запуск React приложения, например:
  // const root = ReactDOM.createRoot(document.getElementById('root')!)
  // root.render(<App />)
}

const rootElement = createRoot(document.getElementById('root')!)

enableMswMocking()
  .then(() => {
    rootElement.render(
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
          <IDBSwitchersLayer>
            <TopLevelContext.Provider>
              <SearchWidgetDataLayer>
                <ClientPerfWidget position='right-side-center-bottom' />
                <App />
              </SearchWidgetDataLayer>
            </TopLevelContext.Provider>
          </IDBSwitchersLayer>
        </CommonInfoLayer>
      </SnackbarProvider>,
    )
  })
