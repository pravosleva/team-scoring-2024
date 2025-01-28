import { createRoot } from 'react-dom/client'
import { App } from './App.tsx'
import { TopLevelContext } from './shared/xstate/topLevelMachine/v2'
import { ClientPerfWidget } from '~/shared/components/ClientPerfWidget'

// import 'todomvc-common/base.css'
// import 'todomvc-app-css/index.css'

createRoot(document.getElementById('root')!).render(
  <TopLevelContext.Provider>
    <ClientPerfWidget position='top-right' />
    <App />
  </TopLevelContext.Provider>,
)
