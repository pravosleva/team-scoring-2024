import CssBaseline from '@mui/material/CssBaseline'
import { RouterProvider } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import { router } from '~/router'
import { theme } from '~/shared/components/ui-kit'
import { useMetrix } from '~/shared/hooks/useMetrix'

export const App = () => {
  // NOTE: ⛔ Dont touch!
  useMetrix({ isDebugEnabled: false })

  return (
    <>
      <CssBaseline />
      <ThemeProvider theme={theme}>
        <RouterProvider router={router} />
      </ThemeProvider>
    </>
  )
}
