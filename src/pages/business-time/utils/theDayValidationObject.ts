import { getValidateResult, NValidate } from '~/shared/utils/getValidateResult'
import { TDayConfig, TDayFormat } from './types'

// TODO: Is time format correct? hh:mm:ss
// const isTimeFormatCorrect = () =>

export const theDayValidationObject: NValidate.TRule = {
  isRequired: false,
  validate: ({ value, key }) => {
    const res: NValidate.TResult = { ok: true }
    switch (true) {
      case !Array.isArray(value) && !(value === null):
        res.ok = false
        res.message = 'Should be an Array or null'
        break
      // case (value as TDayConfig)?.some((day) => !day):
      //   res.ok = false
      //   res.message = `Check config for ${key}! Dont do that; Try edit as textarea`
      //   break
      case (value as TDayConfig)?.length === 0:
        res.ok = false
        res.message = 'Should be not empty Array'
        break
      case value === null:
        res.ok = true
        break
      default: {
        const errs: string[] = []
        for (let i = 0, max = (value as TDayFormat[]).length; i < max; i++) {
          const validated = getValidateResult({
            rules: {
              start: {
                isRequired: true,
                validate: ({ key: _key, value: _value }) => {
                  const res: NValidate.TResult = { ok: true }
                  switch (true) {
                    case typeof _value !== 'string':
                      res.ok = false
                      res.message = `${key}[${i}][${_key}]=${_value} должно быть строкой (получено ${typeof _value})`
                      break
                    case (_value as string).length === 0:
                      res.ok = false
                      res.message = `${key}[${i}][${_key}]=${_value} должно быть непустой строкой`
                      break
                    default:
                      break
                  }
                  return res
                },
              },
              end: {
                isRequired: true,
                validate: ({ key: _key, value: _value }) => {
                  const res: NValidate.TResult = { ok: true }
                  switch (true) {
                    case typeof _value !== 'string':
                      res.ok = false
                      res.message = `${key}[${i}][${_key}]=${_value} должно быть строкой (получено ${typeof _value})`
                      break
                    case (_value as string).length === 0:
                      res.ok = false
                      res.message = `${key}[${i}][${_key}]=${_value} должно быть непустой строкой`
                      break
                    default:
                      break
                  }
                  return res
                },
              }
            },
            event: (value as TDayFormat[])[i],
          })
          
          if (!validated.ok && !!validated.message)
            errs.push(validated.message)
        }
        if (errs.length > 0) {
          res.ok = false
          res.message = errs.join('; ')
        }
        break
      }
    }
    return res
  },
}
