/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-explicit-any */
export namespace NResponseValidate {
  export type TRules<T> = {
    [key: string]: {
      isRequired: boolean;
      validate: (val: any, fullResponse: T) => ({
        ok: boolean;
        message?: string;
        _showDetailsInUi?: boolean;
      });
    };
  };
  export type TResult<T> = {
    ok: boolean;
    message?: string;
    _isCustomError?: boolean;
    _fromServer?: T;
    _showDetailsInUi?: boolean;
  };
}

export const responseValidate = <T>({ rules, response }: {
  rules: NResponseValidate.TRules<T>;
  response: T;
}): NResponseValidate.TResult<T> => {
  const result: NResponseValidate.TResult<T> = { ok: true }

  const msgs: string[] = []
  for (const key in rules) {
    // @ts-ignore
    if (rules[key].isRequired && typeof response?.[key] === 'undefined') {
      msgs.push(`Не найдено обязательное поле ${key} в ответе`)
    }
    else if (rules[key].isRequired) {
      // @ts-ignore
      const validateResult = rules[key].validate(response?.[key], response)
      if (!validateResult.ok) {
        msgs.push(`Некорректное значение поля "${key}" <- ${validateResult?.message || 'No message'}`)
        if (validateResult._showDetailsInUi) result._showDetailsInUi = true
      }
    }
    // @ts-ignore
    else if (!rules[key].isRequired && typeof response?.[key] !== 'undefined') {
      // @ts-ignore
      const validateResult = rules[key].validate(response?.[key], response)
      if (!validateResult.ok) {
        msgs.push(`Некорректное значение поля "${key}" <- ${validateResult?.message || 'No message'}`)
        if (validateResult._showDetailsInUi) result._showDetailsInUi = true
      }
    }
    else {
      // NOTE: Ничего не проверяем
    }
  }

  if (msgs.length > 0) {
    result.ok = false
    result.message = `Неожиданный ответ от сервера <- ${msgs.join(' // ')}`
    result._isCustomError = true
    result._fromServer = response
  }

  return result
}
