import CssBaseline from '@mui/material/CssBaseline'
import { RouterProvider } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import { router } from '~/router'
import { theme } from '~/shared/components/ui-kit'
import { useMetrix } from '~/shared/hooks/useMetrix'
// import { useInitHttpClientExample } from '~/shared/hooks'
import { ReloadPrompt } from '~/shared/components'

import './App.css'

export const App = () => {
  // NOTE: ⛔ Dont touch!
  useMetrix({ isDebugEnabled: false })

  // useInitHttpClientExample()

  return (
    <>
      <CssBaseline />
      <ThemeProvider theme={theme}>
        <RouterProvider router={router} />
        <ReloadPrompt />
      </ThemeProvider>
    </>
  )
}
