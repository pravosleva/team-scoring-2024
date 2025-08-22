import { getValidateResult, NValidate } from '~/shared/utils'
import { getIsNumeric } from '~/shared/utils/number-ops'
import { TDayConfig, TDayFormat } from './types'
import clsx from 'clsx'

// -- NOTE: Is time format correct? hh:mm:ss
const getTimeChunkAnalysis = ({ errorPrefix, tested }: {
  errorPrefix?: string;
  tested: string
}): NValidate.TResult => {
  const res: NValidate.TResult = { ok: true }
  const splittedInput = tested.split(':')
  const errMsgs = [errorPrefix]

  switch (true) {
    case typeof tested !== 'string':
      errMsgs.push(`Значение должно быть строкой (получено "${typeof tested}")`)
      res.ok = false
      res.message = clsx(errMsgs)
      break
    case splittedInput.length === 0:
      errMsgs.push('Значение должно быть непустой строкой (example: 13:00:00)')
      res.ok = false
      res.message = clsx(errMsgs)
      break
    case splittedInput.length !== 3:
      errMsgs.push('Expected: HH:MM:SS (example: 13:00:00)')
      res.ok = false
      res.message = clsx(errMsgs)
      break
    case !getIsNumeric(splittedInput[0]):
      errMsgs.push([
        `Expected: [this errored <- ${splittedInput[0] || `empty (${typeof splittedInput[0]})`}]:MM:SS`,
        '(example: 13:00:00)',
      ].join(' '))
      res.ok = false
      res.message = clsx(errMsgs)
      break
    case !getIsNumeric(splittedInput[1]):
      errMsgs.push([
        `Expected: HH:[this errored <- ${splittedInput[1] || `empty (${typeof splittedInput[1]})`}]:SS`,
        '(example: 13:00:00)',
      ].join(' '))
      res.ok = false
      res.message = clsx(errMsgs)
      break
    case !getIsNumeric(splittedInput[2]):
      errMsgs.push([
        `Expected: HH:MM:[this errored <- ${splittedInput[2] || `empty (${typeof splittedInput[2]})`}]`,
        '(example: 13:00:00)',
      ].join(' '))
      res.ok = false
      res.message = clsx(errMsgs)
      break
    default:
      break
  }
  return res
}
// --

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
                    default: {
                      const formatAnalysis = getTimeChunkAnalysis({
                        errorPrefix: `Incorrect format: ${key}[${i}][${_key}]=${_value}.`,
                        tested: _value as string,
                      })
                      if (!formatAnalysis.ok) {
                        res.ok = false
                        res.message = formatAnalysis.message || 'No message'
                      }
                      break
                    }
                  }
                  return res
                },
              },
              end: {
                isRequired: true,
                validate: ({ key: _key, value: _value }) => {
                  const res: NValidate.TResult = { ok: true }
                  switch (true) {
                    default: {
                      const formatAnalysis = getTimeChunkAnalysis({
                        errorPrefix: `Incorrect format: ${key}[${i}][${_key}]=${_value}.`,
                        tested: _value as string,
                      })
                      if (!formatAnalysis.ok) {
                        res.ok = false
                        res.message = formatAnalysis.message || 'No message'
                      }
                      break
                    }
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
