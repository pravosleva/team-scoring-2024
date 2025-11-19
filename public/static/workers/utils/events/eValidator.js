/**
 * @typedef {Object} TValidationRule Списание правила валидации
 * @property {boolean} isRequired - Обязательное поле
 * @property {string} type - Тип (только для отображение, можно использовать псевдо-код)
 * @property {Function} validate - Функция валидации, получившая в аргументе ориинальный объект (unknown) => { ok: boolean; reason?: string; }
 */
/**
 * @typedef {Object} TValidationResult Результат валидации поля
 * @property {boolean} ok - Индикатор успеха
 * @property {string} reason - Причина неуспеха
 */

/**
 * Универсальная валидация
 *
 * @param {Object} arg 
 * @param {unknown} arg.event Оригинальный обект для валидации
 * @param {Object} arg.rules Универсальные правила валидации для arg.event в виде объекта
 * @param {TValidationRule} arg.rules.ANY_KEY Элемент валидации (нейминг ключа соответствует имени поля в оригинальном объекте)
 * 
 * @returns {TValidationResult} Результат валидации 👉 { ok: boolean; reason?: string; }
 */
const eValidator = ({ event, rules }) => {
  let _c = 0
  let res = { ok: true }
  const errs = [] // NOTE: TS like { msg: string, _reponseDetails?: any }[] = []

  for (const key in rules) {
    _c += 1

    // NOTE: 1. Очевидный кейс
    if (rules[key].isRequired && !event[key]) {
      res.ok = false
      errs.push({
        msg: `Missing required param: event.${key} (expected ${rules[key].type}, received ${typeof event[key]}) - ${rules[key].descr}`
      })
    }

    // NOTE: 2. В любом случае проверим параметр,
    // если передана соотв. функция
    if (!!event[key]) {
      try {
        switch (true) {
          case !!rules[key].validate && typeof rules[key].validate === 'function': {
            const validationItemResult = rules[key].validate(event[key])
            if (!validationItemResult.ok) {
              errs.push({
                msg: `Incorrect event.${key} format: ${!!validationItemResult.reason ? `: ${validationItemResult.reason}` : ''}`
              })
            }
            break
          }
          default:
            break
        }
      } catch (err) {
        errs.push({
          msg: `Не удалось проверить поле: event.${key} (expected ${rules[key].type}, received ${typeof event[key]}) - ${rules[key].descr}, ${typeof err === 'string' ? err : (err.message || 'No err.message')}`
        })
      }
    }

    if (!res.ok) {
      res._c = _c
      if (errs.length > 0) {
        res.reason = errs.map(({ msg }) => msg).join('; ')
      }
      break
    }
  }

  return res
}
