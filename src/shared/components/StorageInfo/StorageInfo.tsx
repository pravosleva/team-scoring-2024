 
import React, { useCallback, useMemo, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import LinearProgress from '@mui/material/LinearProgress'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import RefreshIcon from '@mui/icons-material/Refresh' // Убедитесь, что у вас есть @mui/icons-material
import { useStorageEstimate } from '~/shared/hooks/useStorageEstimate'
// import { idbInstance } from '~/shared/utils/indexed-db-ops/idbInstance'
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep'
import { CommonInfoContext } from '~/shared/context/01-CommonInfoLayer/CommonInfoLayer'

export const StorageInfo: React.FC = () => {
  const { usageMb, quotaMb, usageGb, quotaGb, percent, isLoading, refreshStorage } = useStorageEstimate()

  const [isCleaning, _setIsCleaning] = useState(false)

  // 1. Берем из контекста информацию об IndexedDB, которую выводит лейаут
  const [idb] = CommonInfoContext.useStore((s) => s.idb)

  // 2. Проверяем, была ли база уже сброшена в этой сессии
  const isAlreadyCleaned = useMemo(() => {
    return window.localStorage.getItem('pwa_idb_cleaned_status') === 'true'
  }, [])

  const handleForceClearIDB = useCallback(() => {
    const isConfirmed = window.confirm(
      '⚠️ Принудительный сброс базы данных\n\n' +
      'Приложение перезагрузится, файл базы данных LocalImageDB будет полностью удален с диска и место освободится.\n' +
      'Все локальные изображения будут удалены. Продолжить?'
    )
    
    if (!isConfirmed) return

    // Выставляем флаги: один для main.tsx на удаление, второй — для UI на блокировку кнопки
    window.localStorage.setItem('pwa_force_clear_idb_pending', 'true')
    window.localStorage.setItem('pwa_idb_cleaned_status', 'true')
    
    window.location.reload()
  }, [])

  // 3. Логика блокировки кнопки:
  // Если в контексте приложения процент использования или байты равны 0, 
  // ИЛИ если мы только что нажали сброс — блокируем кнопку.
  const isButtonDisabled = useMemo(() => {
    if (isAlreadyCleaned) return true;
    // Если у вас в контекст прокидывается объект idb (как в Layout.tsx):
    // Если bytes === 0 или процент использования ничтожно мал, кнопка не нужна
    if (idb && idb.used && idb.used.bytes === 0) return true;
    return false;
  }, [idb, isAlreadyCleaned])

  if (isLoading) {
    return (
      <Box display="flex" alignItems="center" gap={1}>
        <CircularProgress size={16} />
        <Typography variant="body2" color="text.secondary">Calc...</Typography>
      </Box>
    )
  }

  // Если браузер не поддерживает API
  if (quotaMb === 0) return null

  return (
    <Box sx={{ p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 2, maxWidth: 300 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="subtitle2" fontWeight="bold">
          PWA cache
        </Typography>
        <Box display="flex" gap={1}> {/* Обертка для аккуратного выравнивания группы кнопок */}
          <Button
            color="error"
            variant="outlined"
            size="small"
            onClick={handleForceClearIDB}
            disabled={isButtonDisabled} // Используем умную блокировку
            sx={{ p: 0.5, minWidth: 0 }}
            title={isButtonDisabled ? "База данных уже очищена" : "Принудительный сброс и сжатие IDB"}
          >
            <DeleteSweepIcon fontSize="small" />
          </Button>
          
          <Button
            color='primary'
            variant='outlined'
            size="small"
            onClick={refreshStorage}
            disabled={isCleaning}
            sx={{ p: 0.5, minWidth: 0 }}
            title="Refresh"
          >
            <RefreshIcon fontSize="small" />
          </Button>
        </Box>
      </Box>

      <Typography variant="body2" color="text.secondary" mb={0.5}>
        Used:{' '}
        <strong>
          {usageGb >= 1 ? `${usageGb} Gb` : `${usageMb} Mb`}
        </strong>{' '}
        of {quotaGb >= 1 ? `${quotaGb} Gb` : `${quotaMb} Mb`}
      </Typography>

      <LinearProgress
        variant="determinate"
        value={percent}
        color={percent > 80 ? 'error' : percent > 50 ? 'warning' : 'primary'}
        sx={{ height: 6, borderRadius: 3 }}
      />

      <Typography variant="caption" color="text.secondary" display="block" textAlign="right" mt={0.5}>
        Used {percent}%
      </Typography>
    </Box>
  )
}
