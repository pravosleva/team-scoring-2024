/* eslint-disable @typescript-eslint/no-explicit-any */
import { NValidate } from './types'

export const getValidateResult = ({ rules, event }: {
  rules: NValidate.TRules;
  event: any;
}): NValidate.TResult => {
  const result: NValidate.TResult = { ok: true }

  const msgs: string[] = []
  for (const key in rules) {
   
    if (rules[key].isRequired && typeof event?.[key] === 'undefined') {
      msgs.push(`Не найдено обязательное поле ${key} в ответе`)
    }
    else if (rules[key].isRequired) {
      const validateResult = rules[key].validate({ value: event?.[key], event })
      if (!validateResult.ok) {
        msgs.push(`Некорректное значение поля "${key}" <- ${validateResult?.message || 'No message'}`)
      }
    }
    else if (!rules[key].isRequired && typeof event?.[key] !== 'undefined') {
      const validateResult = rules[key].validate<typeof event>({
        value: event?.[key],
        event,
      })
      if (!validateResult.ok) {
        msgs.push(`Некорректное значение поля "${key}" <- ${validateResult?.message || 'No message'}`)
      }
    }
    else {
      // NOTE: Ничего не проверяем
    }
  }

  if (msgs.length > 0) {
    result.ok = false
    result.message = `Неожиданный результат <- ${msgs.join(' // ')}`
  }

  return result
}
