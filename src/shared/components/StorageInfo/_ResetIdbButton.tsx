/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useCallback, useState } from 'react'
import { Button, CircularProgress } from '@mui/material'
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep' // Рекомендуемая иконка для выметания скрытого кэша

export const ResetIdbButton = () => {
  const [isCleaning, setIsCleaning] = useState(false)

  const handleForceClearIDB = useCallback(() => {
    // Предупреждаем пользователя, так как операция необратима и удалит локальные Blobs
    const isConfirmed = window.confirm(
      '⚠️ Принудительный сброс базы данных\n\n' +
      'Это действие полностью удалит файл базы данных LocalImageDB с диска и освободит место в системе.\n' +
      'Все локальные изображения будут удалены. Продолжить?'
    )
    
    if (!isConfirmed) return

    setIsCleaning(true)

    // Имя базы данных берем из конфигурации синглтона
    const DB_NAME = 'LocalImageDB'

    // Перед удалением базы данных желательно закрыть текущее соединение, 
    // чтобы операционная система не заблокировала файл
    try {
      // @ts-ignore
      if (idbInstance && idbInstance.db) {
        // @ts-ignore
        idbInstance.db.close()
      }
    } catch (e) {
      console.warn('Ошибка при закрытии соединения с IDB перед удалением:', e)
    }

    // Запускаем физическое удаление контейнера базы данных с диска устройства
    const req = window.indexedDB.deleteDatabase(DB_NAME)

    req.onsuccess = () => {
      console.log(`✅ База данных ${DB_NAME} успешно удалена с диска. Место освобождено.`)
      
      // Перезагружаем приложение, чтобы IDBSingleton инициализировал чистую БД с нуля
      setTimeout(() => {
        window.location.reload()
      }, 500)
    }

    req.onerror = (event: any) => {
      setIsCleaning(false)
      console.error('Ошибка при удалении базы данных:', event?.target?.error)
      alert(`Не удалось очистить базу данных: ${event?.target?.error?.message || 'Unknown Error'}`)
    }

    req.onblocked = () => {
      // Это событие срабатывает, если вкладки приложения в других окнах всё еще держат базу открытой
      setIsCleaning(false)
      alert('Очистка заблокирована. Пожалуйста, закройте остальные вкладки этого приложения и повторите попытку.')
    }
  }, [])

  return (
    <Button
      variant="outlined"
      color="error"
      size="small"
      onClick={handleForceClearIDB}
      disabled={isCleaning}
      startIcon={isCleaning ? <CircularProgress size={16} color="inherit" /> : <DeleteSweepIcon />}
      style={{ marginLeft: '12px' }} // Небольшой отступ, если кнопка стоит в строку с заголовком
    >
      {isCleaning ? 'Очистка...' : 'Сброс и сжатие IDB'}
    </Button>
  )
}
