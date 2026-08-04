import { useState, useEffect, useCallback } from 'react'

export type TStorageEstimate = {
  usageMb: number;     // Сколько мегабайт использовано
  quotaMb: number;     // Какой лимит в мегабайтах выделен браузером
  usageGb: number;     // Сколько гигабайт использовано
  quotaGb: number;     // Какой лимит в гигабайтах выделен браузером
  percent: number;     // Процент заполнения кэша
  isLoading: boolean;
}

export const useStorageEstimate = () => {
  const [estimate, setEstimate] = useState<TStorageEstimate>({
    usageMb: 0,
    quotaMb: 0,
    usageGb: 0,
    quotaGb: 0,
    percent: 0,
    isLoading: true,
  })

  const checkStorage = useCallback(async () => {
    if (!navigator.storage || !navigator.storage.estimate) {
      setEstimate((prev) => ({ ...prev, isLoading: false }))
      return
    }

    try {
      const { usage, quota } = await navigator.storage.estimate()

      const rawUsage = usage || 0
      const rawQuota = quota || 0

      // Вычисления для Мегабайт
      const usageMb = Number((rawUsage / (1024 * 1024)).toFixed(2))
      const quotaMb = Number((rawQuota / (1024 * 1024)).toFixed(2))

      // Вычисления для Гигабайт
      const usageGb = Number((rawUsage / (1024 * 1024 * 1024)).toFixed(2))
      const quotaGb = Number((rawQuota / (1024 * 1024 * 1024)).toFixed(2))

      // Процент вычисляем на основе сырых байт для максимальной точности
      const percent = rawQuota > 0 ? Number(((rawUsage / rawQuota) * 100).toFixed(2)) : 0

      setEstimate({ usageMb, quotaMb, usageGb, quotaGb, percent, isLoading: false })
    } catch (error) {
      console.error('Ошибка при получении размера кэша:', error)
      setEstimate((prev) => ({ ...prev, isLoading: false }))
    }
  }, [])

  useEffect(() => {
    checkStorage()
  }, [checkStorage])

  return { ...estimate, refreshStorage: checkStorage }
}
