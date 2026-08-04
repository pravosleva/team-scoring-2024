import React from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import LinearProgress from '@mui/material/LinearProgress'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import RefreshIcon from '@mui/icons-material/Refresh' // Убедитесь, что у вас есть @mui/icons-material
import { useStorageEstimate } from '~/shared/hooks/useStorageEstimate'

export const StorageInfo: React.FC = () => {
  const { usageMb, quotaMb, usageGb, quotaGb, percent, isLoading, refreshStorage } = useStorageEstimate()

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
        <Button
          color='primary'
          variant='outlined'
          size="small"
          onClick={refreshStorage}
          sx={{ p: 0.5, minWidth: 0 }}
          title="Refresh"
        >
          <RefreshIcon fontSize="small" />
        </Button>
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
