import React from 'react'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
// @ts-expect-error - виртуальный модуль VitePWA
import { useRegisterSW } from 'virtual:pwa-register/react'

export const ReloadPrompt: React.FC = () => {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r: unknown) {
      console.log('SW зарегистрирован:', r)
    },
    onRegisterError(error: unknown) {
      console.error('Ошибка регистрации SW:', error)
    },
  })

  const handleClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    // Не закрываем уведомление при случайном клике мимо (clickaway)
    if (reason === 'clickaway') return

    setOfflineReady(false)
    setNeedRefresh(false)
  }

  // Показывать плашку, если приложение готово к оффлайну или есть обновление
  const isOpen = offlineReady || needRefresh

  return (
    <Snackbar
      open={isOpen}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert
        severity={offlineReady ? 'success' : 'info'}
        variant="filled"
        elevation={6}
        onClose={handleClose}
        sx={{
          maxWidth: 400,
          '& .MuiAlert-message': { width: '100%' }
        }}
      >
        <Box display="flex" flexDirection="column" gap={1}>
          <span>
            {offlineReady
              ? 'Приложение готово к работе в автономном режиме.'
              : 'Доступна новая версия системы (обновились воркеры или звуки).'}
          </span>

          {needRefresh && (
            <Box display="flex" justifyContent="flex-end" gap={1} mt={0.5}>
              <Button
                color="inherit"
                size="small"
                variant="outlined"
                onClick={() => updateServiceWorker(true)}
                sx={{ borderColor: 'rgba(255,255,255,0.5)', fontWeight: 'bold' }}
              >
                Обновить
              </Button>
            </Box>
          )}
        </Box>
      </Alert>
    </Snackbar>
  )
}
