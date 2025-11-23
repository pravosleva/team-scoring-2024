import { NValidate } from './types'

/**
 * Стандартная валидация
 * 
 * @source Для использования стандартной валидации достаточно передать объект с описанием правил
 *
 * @param {Object} arg 
 * @param {NValidate.TRules} arg.rules Правила валидаии
 * @param {*} arg.event Объект для проверки
 * @returns {NValidate.TResult} 
 */
export const getValidateResult = ({ rules, event }: {
  rules: NValidate.TRules;
  // TODO: По возможности исправить
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  event: any;
}): NValidate.TResult => {
  const result: NValidate.TResult = { ok: true }

  const msgs: string[] = []
  for (const key in rules) {

    if (rules[key].isRequired && typeof event?.[key] === 'undefined') {
      msgs.push(`Не найдено обязательное поле ${key}`)
    }
    else if (rules[key].isRequired) {
      const validateResult = rules[key].validate<typeof event>({ value: event?.[key], event, key })
      if (!validateResult.ok) {
        msgs.push(`Некорректное значение поля "${key}" <- ${validateResult?.message || 'No message'}`)
      }
    }
    else if (!rules[key].isRequired && typeof event?.[key] !== 'undefined') {
      const validateResult = rules[key].validate<typeof event>({
        value: event?.[key],
        key,
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
