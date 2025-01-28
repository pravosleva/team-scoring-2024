/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { memo, useMemo, useLayoutEffect, useState, useCallback, useRef } from 'react'
import Grid from '@mui/material/Grid2'
import {
  Checkbox,
  FormControlLabel,
  Rating,
  TextField,
} from '@mui/material'
// import CssBaseline from '@mui/material/CssBaseline'
import ScopedCssBaseline from '@mui/material/ScopedCssBaseline'
// import { TJob } from '~/shared/xstate/topLevelMachine/v2/types'
// import { ThemeProvider } from '@mui/material/styles'
// import { theme } from '~/shared/components/ui-kit'
import { useForm, Controller, FormProvider } from 'react-hook-form'
import { TScheme, TValue } from './types'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { MobileDateTimePicker } from '@mui/x-date-pickers/MobileDateTimePicker'
import dayjs from 'dayjs'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { CreatableAutocomplete, TOption } from '~/shared/components/CreatableAutocomplete'
import baseClasses from '~/App.module.scss'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type TProps<Value> = {
  cb: {
    onSuccess: (values: any) => Promise<any>;
    onError: (err: any) => void;
    onClose: () => void;
  };
  onChangeField?: (e: {
    name: string;
    value: TValue | TOption;
  }) => void;
  // initialValues: Value;
  scheme: TScheme;
  onFormReady: ({ state }: {
    state: { [key: string]: TValue | TOption; };
    okObj: { [key: string]: boolean };
    errsObj: { [key: string]: string | undefined };
  }) => void;
  onFormNotReady: ({ state }: {
    state: { [key: string]: TValue | TOption; };
    okObj: { [key: string]: boolean };
    errsObj: { [key: string]: string | undefined };
  }) => void;
  __auxStateInitSpecialForKeys?: string[];
  __errsBeforeTouchedIgnoreList?: string[];
}

const genericMemo: <T>(component: T) => T = memo

function GenericComponentForm<Value> ({
  cb,
  scheme,
  onChangeField,
  onFormReady,
  onFormNotReady,
  __auxStateInitSpecialForKeys,
  __errsBeforeTouchedIgnoreList,
}: TProps<Value>) {
  const methods = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: Object.keys(scheme).reduce((acc: { [key: string]: TValue }, key) => {
      if (typeof scheme[key].initValue !== 'undefined') acc[key] = scheme[key].initValue
      return acc
    }, {}),
  })
  const {
    watch,
    control,
    setValue,
    register,
    handleSubmit,
    formState: {
      errors,
      // isValid,
    },
    reset,
  } = methods

  const initialAuxState = useMemo(() => Object.keys(scheme).reduce((acc: { [key: string]: TValue }, key) => {
    if (typeof scheme[key].initValue !== 'undefined') {
      acc[key] = scheme[key].initValue
    }
    return acc
  }, {}), [scheme])

  const [auxState, setAuxState] = useState<{ [key: string]: any }>(initialAuxState)
  const auxRef = useRef<{ [key: string]: any }>({})
  const resetAuxState = useCallback(() => {
    setAuxState(initialAuxState)
  }, [initialAuxState, setAuxState])

  const handleSuccess = useCallback((vals: any) => {
    cb.onSuccess(vals)
      .then(() => {
        cb.onClose()
        reset()
        resetAuxState()
      })
      // .catch((err) => {})
  }, [cb, reset, resetAuxState])
  const handleError = useCallback((arg: any) => {
    cb.onError(arg)
  }, [cb])

  const handleClose = useCallback(() => {
    cb.onClose()
    reset()
    resetAuxState()
  }, [cb, reset, resetAuxState])

  const [isFormReady, setIsFormReady] = useState<boolean>(false)
  const touchedMapRef = useRef<{
    [key: string]: boolean;
  }>(Object.keys(scheme).reduce((acc: { [key: string]: boolean; }, key: string) => {
    if ((__errsBeforeTouchedIgnoreList || []).includes(key)) {
      // console.log(`init as touched -> ${key}`)
      acc[key] = true
    }
    return acc
  }, {}))
  const [__errsState, __setErrsState] = useState<{ [key: string]: string }>({})
  const [__okState, __setOkState] = useState<{[key: string]: boolean}>({})
  const [__auxControlledDatesState, __setAuxControlledDatesState] = useState<{[key: string]: dayjs.Dayjs | null}>({})
  const rendersCounterRef = useRef<number>(0)
  useLayoutEffect(() => {
    if (rendersCounterRef.current === 0) {
      const fieldsToInit = (
        __auxStateInitSpecialForKeys
        || ['estimate', 'start', 'finish']
      ).reduce((acc: string[], cur: string) => {
        if (typeof scheme[cur]?.initValue !== 'undefined') acc.push(cur)
        return acc
      }, [])
    
      const isAuxStateInitNeeded = fieldsToInit.length > 0
      if (isAuxStateInitNeeded) {
        __setAuxControlledDatesState((s) => ({
          ...s,
          ...fieldsToInit.reduce((acc: {
            [key: string]: dayjs.Dayjs | null;
          }, key: string) => {
            switch (scheme[key].type) {
              case 'date-ts':
                acc[key] = typeof scheme[key]?.initValue === 'number'
                ? dayjs(scheme[key]?.initValue)
                : dayjs()
                break
              default:
                break
            }
            
            return acc
          } ,{}),
        }))
      }
    }

    rendersCounterRef.current += 1
  }, [__setAuxControlledDatesState, scheme, __auxStateInitSpecialForKeys, __errsBeforeTouchedIgnoreList])
  const [__disabledState, __setDisabledState] = useState<{ [key: string]: string; }>(Object.keys(scheme).reduce((acc: { [key: string]: string; }, key: string) => {
    if (typeof scheme[key].validator === 'function') {
      const validationResult = scheme[key].validator({
        value: scheme[key].initValue,
        scheme,
        internalState: {
          ...(Object.keys(scheme).reduce((acc: any, key) => {
            acc[key] = scheme[key].initValue
            return acc
          }, {})),
          // ...__auxControlledNumsState,
          ...__auxControlledDatesState,
        },
      })
      if (validationResult._isDisabled?.value) acc[key] = validationResult._isDisabled.reason || 'No reason'
    }
    return acc
  }, {}))
  useLayoutEffect(() => {
    const subscription = watch((
      state,
      {
        name,
        // type,
      }
    ) => {
      
      if (!!name) touchedMapRef.current[name] = true

      const errsObj: {
        [key: string]: string;
      } = {}
      const okObj: {
        [key: string]: boolean;
      } = {}
      const disabledObj: {
        [key: string]: string;
      } = {}
      for (const key in scheme) {
        switch (key) {
          default: {
            const validationResult = scheme[key].validator({
              value: state[key],
              scheme,
              // @ts-ignore
              internalState: state,
            })
            // NOTE: Disabled state
            if (validationResult._isDisabled?.value) disabledObj[key] = validationResult._isDisabled.reason || 'No reason'

            if (
              scheme[key].isRequired
              || (
                !scheme[key].isRequired
                && typeof state[key] !== 'undefined'
              )
            ) {
              // console.log(`-- validation for ${key}`)
              // console.log(state[key])
              // console.log(validationResult)
              // console.log('--')
              if (!validationResult.ok && !!validationResult.message) {
                if (touchedMapRef.current[key] === true) {
                  // console.log(`- ERRORED ${key}: ${validationResult.message}`)
                  errsObj[key] = validationResult.message
                }
                if (scheme[key].isRequired) {
                  okObj[key] = false
                } else okObj[key] = true
                
              } else {
                okObj[key] = true
              }
            } else
              okObj[key] = true
            break
          }
        }
      }
      // NOTE: _setErrValue(key, null) -> errsObj
      __setErrsState(errsObj)
      __setOkState(okObj)
      __setDisabledState(disabledObj)

      // console.log({ counters, schemeLen: Object.keys(scheme).length })

      // if (counters.ok === Object.keys(scheme).length && counters.fail === 0)
      //   setIsFormReady(true)
      // else setIsFormReady(false)

      if (
        Object.keys(errsObj).length === 0
        && Object.values(okObj).every((val) => val === true)
      ) {
        setIsFormReady(true)
        onFormReady({ state: { ...state, ...auxRef.current }, okObj, errsObj })
      }
      else {
        onFormNotReady({ state: { ...state, ...auxRef.current }, okObj, errsObj })
        setIsFormReady(false)
      }
    })
    return () => subscription.unsubscribe()
  }, [setIsFormReady, onFormNotReady, onFormReady, scheme])

  // const methods = useForm({
  //   values: Object.keys(scheme).reduce((acc: {[key: string]: TValue | undefined}, key) => {
  //     switch (scheme[key].type) {
  //       case 'number':
  //       case 'string':
  //       case 'multiline-text':
  //       case 'date-ts':
  //         acc[key] = typeof scheme[key].initValue !== 'undefined'
  //           ? scheme[key].initValue
  //           : undefined
  //         break
  //       default:
  //         break
  //     }
      
  //     return acc
  //   }, {})
  // })

  /*
  const {
    register,
    control,
    // handleSubmit,
    // getValues,
    // formState: {
    //   errors,
    //   // defaultValues,
    //   isDirty,
    //   // isValid,
    //   ...restFormStateProps
    // },
    // clearErrors,
    watch,
    setValue,
    // reset,
    // getFieldState,
    // setError,
    // trigger,
    // ... restProps
  } = methods

  const [__auxControlledDatesState, __setAuxControlledDatesState] = useState<{[key: string]: dayjs.Dayjs | null}>({})
  const [__auxControlledNumsState, __setAuxControlledNumsState] = useState<{[key: string]: number}>(
    Object.keys(scheme).reduce((acc: { [key: string]: number; }, key: string) => {
      if (
        scheme[key].type === 'number'
        && typeof scheme[key].initValue === 'number'
      ) acc[key] = scheme[key].initValue
      // else console.log(`init val [${key}] (scheme[key].type ${scheme[key].type}) x-> ${scheme[key].initValue} (${typeof scheme[key].initValue})`)
      return acc
    }, {})
  )
  const setAuxStateValue = useCallback((fn: string, val: dayjs.Dayjs | number | null) => {
    switch (true) {
      case val instanceof dayjs:
        __setAuxControlledDatesState((s) => ({ ...s, [fn]: val }))
        break
      case typeof val === 'number':
        __setAuxControlledNumsState((s) => ({ ...s, [fn]: val }))
        break
      default:
        break
    }
  }, [__setAuxControlledDatesState, __setAuxControlledNumsState])

  const [__errsState, __setErrsState] = useState<{[key: string]: string | undefined}>({})
  // const _setErrValue = useCallback((fn: string, val: any) => {
  //   __setErrsState((s) => ({ ...s, [fn]: val }))
  // }, [__setErrsState])
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [__okState, __setOkState] = useState<{[key: string]: boolean}>({})
  
  const touchedMapRef = useRef<{
    [key: string]: boolean;
  }>(Object.keys(scheme).reduce((acc: { [key: string]: boolean; }, key: string) => {
    if ((__errsBeforeTouchedIgnoreList || []).includes(key)) {
      // console.log(`init as touched -> ${key}`)
      acc[key] = true
    }
    return acc
  }, {}))
  // const setIsTouchedField = useCallback(({ name }: {
  //   name: string;
  // }) => {
  //   console.log(`-- set touched -> ${name}`)
  //   setIsTouchedMap((s) => ({ ...s, [name]: true }))
  // }, [setIsTouchedMap])

  const [__disabledState, __setDisabledState] = useState<{ [key: string]: string; }>(Object.keys(scheme).reduce((acc: { [key: string]: string; }, key: string) => {
    if (typeof scheme[key].validator === 'function') {
      const validationResult = scheme[key].validator({
        value: scheme[key].initValue,
        scheme,
        internalState: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ...(Object.keys(scheme).reduce((acc: any, key) => {
            acc[key] = scheme[key].initValue
            return acc
          }, {})),
          ...__auxControlledNumsState,
          ...__auxControlledDatesState,
        },
      })
      if (validationResult._isDisabled?.value) acc[key] = validationResult._isDisabled.reason || 'No reason'
    }
    return acc
  }, {}))
  useEffect(() => {
    const subscription = watch(( state, { name }) => {
      // -- NOTE: Aux external store for restore form
      console.log(`- watch edited: ${name}`)
      if (!!name) touchedMapRef.current[name] = true

      if (typeof onChangeField === 'function' && !!name)
        onChangeField({ name, value: state[String(name)] })
      // --

      const errsObj: {
        [key: string]: string;
      } = {}
      const okObj: {
        [key: string]: boolean;
      } = {}
      const disabledObj: {
        [key: string]: string;
      } = {}
      for (const key in scheme) {
        switch (key) {
          default: {
            const validationResult = scheme[key].validator({
              value: state[key],
              scheme,
              internalState: state,
            })
            // NOTE: Disabled state
            if (validationResult._isDisabled?.value) disabledObj[key] = validationResult._isDisabled.reason || 'No reason'

            if (
              scheme[key].isRequired
              || (
                !scheme[key].isRequired
                && typeof state[key] !== 'undefined'
                && typeof scheme[key].validator === 'function'
              )
            ) {
              // console.log(`-- validation for ${key}`)
              // console.log(state[key])
              // console.log(validationResult)
              // console.log('--')
              if (!validationResult.ok && !!validationResult.message) {
                if (touchedMapRef.current[key] === true) {
                  // console.log(`- ERRORED ${key}: ${validationResult.message}`)
                  errsObj[key] = validationResult.message
                }
                if (scheme[key].isRequired) {
                  okObj[key] = false
                } else okObj[key] = true
                
              } else {
                okObj[key] = true
              }
            } else
              okObj[key] = true
            break
          }
        }
      }
      // NOTE: _setErrValue(key, null) -> errsObj
      __setErrsState(errsObj)
      __setOkState(okObj)
      __setDisabledState(disabledObj)

      if (
        Object.keys(errsObj).length === 0
        && Object.values(okObj).every((val) => val === true)
      ) onFormReady({ state, okObj, errsObj })
      else onFormNotReady({ state, okObj, errsObj })
    })
    return () => subscription.unsubscribe()
  }, [watch, scheme, onFormReady, onFormNotReady, onChangeField, __setErrsState, __setOkState, __setDisabledState])

  // useEffect(() => {
  //   console.log('-- update scheme')
  // }, [scheme])
  */
  return (
    <FormProvider {...methods}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <ScopedCssBaseline />
        {
          Object.keys(scheme).map((key, i) => {
            const { ref, ...rest } = register(key, { required: scheme[key].isRequired, maxLength: scheme[key].nativeRules?.maxLength || 100, minLength: scheme[key].nativeRules?.minLength })

            switch (scheme[key].type) {
              case 'checkbox':
                return (
                  <Grid
                    size={scheme[key].gridSize}
                    key={`${key}-${i}`}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          {...rest}
                          defaultChecked={auxState[key]}
                          value={auxState[key]}
                          onChange={(_event, newValue) => {
                            // console.log(newValue)
                            setValue(key, newValue)
                            setAuxState((s) => ({ ...s, [key]: newValue }))
                          }}
                        />
                      }
                      label={scheme[key].label}
                    />
                  </Grid>
                )
              case 'rating':
                return (
                  <Grid
                    size={scheme[key].gridSize}
                    key={`${key}-${i}`}
                    sx={{
                      // border: '1px solid red',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px',
                        flexWrap: 'wrap',
                      }}
                    >
                      <Rating
                        name='rating-controlled'
                        value={auxState[key]}
                        onChange={(_event, newValue) => {
                          setValue(key, newValue || 0)
                          setAuxState((s) => ({ ...s, [key]: newValue || 0 }))
                        }}
                      />
                      <div>{scheme[key].label}</div>
                    </div>
                  </Grid>
                )
              case 'string':
                return (
                  <Grid size={scheme[key].gridSize} key={`${key}-${i}`}>
                    <TextField
                      {...rest}
                      ref={(e) => ref(e)}
                      label={scheme[key].label}
                      variant='outlined'
                      error={!!__errsState[key]}
                      helperText={__errsState[key] || undefined}
                      // {...register(key, cfg[key].reactHookFormOptions || undefined)}
                    />
                  </Grid>
                )
              // case 'number':
              //   return (
              //     <Grid size={scheme[key].gridSize}>
              //       <TextField
              //         // {...rest}
              //         ref={(e) => ref(e)}
              //         type='number'
              //         onChange={(e) => {
              //           setAuxStateValue(key, Number(e.target.value))
              //           setValue(key, Number(e.target.value))
              //         }}
              //         value={__auxControlledNumsState[key]}
              //         label={scheme[key].label}
              //         variant='outlined'
              //         disabled={scheme[key].isReadOnly}
              //         error={!!__errsState[key]}
              //         helperText={__errsState[key] || undefined}
              //       />
              //     </Grid>
              //   )
              case 'multiline-text':
                return (
                  <Grid size={scheme[key].gridSize} key={`${key}-${i}`}>
                    <TextField
                      {...rest}
                      ref={(e) => ref(e)}
                      type='text'
                      multiline
                      rows={4}
                      label={scheme[key].label}
                      variant='outlined'
                      disabled={scheme[key].isReadOnly}
                      error={!!__errsState[key]}
                      helperText={__errsState[key] || undefined}
                    />
                  </Grid>
                )
              case 'creatable-autocomplete': {
                return (
                  <Grid size={scheme[key].gridSize} key={`${key}-${i}`}>
                    <CreatableAutocomplete
                      {...rest}
                      // ref={(e) => ref(e)}
                      label={scheme[key].label}
                      // key={`${key}-${i}`}
                      list={scheme[key]._selectCustomOpts?.list || []}
                      onSelect={(item) => {
                        if (!!item?.value) {
                          const { value, label, _id } = item

                          // if (isNew && typeof scheme[key]._selectCustomOpts?._onCreate === 'function') {
                          //   scheme[key]._selectCustomOpts._onCreate({ value, label })
                          //     .then(({ ok, createdOption }) => {
                          //       if (ok) {
                          //         auxRef.current[key] = createdOption
                          //         setValue(key, createdOption)
                          //       }
                          //     })
                          // } else {
                            auxRef.current[key] = { value, label, _id }
                            setValue(key, { value, label, _id })
                          // }
                          // setAuxState((s) => ({ ...s, [key]: item?.value }))
                        }
                      }}
                      defaultValue={scheme[key].initValue as TOption}
                      isErrored={!!__errsState[key]}
                      helperText={__errsState[key]}
                    />
                    {/* <pre>{JSON.stringify({ list: scheme[key]._selectCustomOpts?.list, initValue: scheme[key].initValue }, null, 2)}</pre> */}
                  </Grid>
                )
              }
              case 'date-ts':
                return (
                  <Grid size={scheme[key].gridSize} key={`${key}-${scheme[key].specialKey}`}>
                    <Controller
                      key={`${key}-${scheme[key].specialKey}`}
                      name={key}
                      control={control}
                      // eslint-disable-next-line @typescript-eslint/no-unused-vars
                      render={({ field: { value } }) => (
                        // NOTE: See also https://mui.com/x/react-date-pickers/date-time-picker/
                        <MobileDateTimePicker
                          key={`${key}-${scheme[key].specialKey}`}
                          label={scheme[key].label}
                          views={['year', 'month', 'day', 'hours', 'minutes']}
                          onChange={(value) => {
                            if (!!value) {
                              // setAuxStateValue(key, value)
                              // setValue(key,
                              //   value instanceof dayjs && !!value
                              //   ? value.toDate().getTime()
                              //   : undefined
                              // )
                              setValue(key, value instanceof dayjs && !!value ? value.toDate().getTime() : new Date().getTime())
                              setAuxState((s) => ({ ...s, [key]: value }))
                              if (value instanceof dayjs) {
                                __setAuxControlledDatesState((s) => ({ ...s, [key]: value }))
                              }
                              // onChange(new Date(e.format()).getTime())
                            }
                          }}
                          slotProps={{
                            textField: {
                              disabled: scheme[key].isReadOnly || !!__disabledState[key],
                              // key: scheme[key].specialKey,
                              // value: typeof value === 'number' ? dayjs(value) : undefined,
                              error: !!__errsState[key],
                              helperText: __errsState[key] || __disabledState[key] || undefined,
                            },
                          }}
                          value={__auxControlledDatesState[key]}
                        />
                      )}
                    />
                  </Grid>
                )
              default:
                return (
                  <div key={`${key}-${scheme[key].specialKey}`}>[WIP] Unknown case for {key}</div>
                )
            }
          })
        }
        {/* <Grid size={12}>
          <pre className={baseClasses.preNormalized}>{JSON.stringify(auxState, null, 2)}</pre>
        </Grid> */}
        <Grid size={12}>
          <pre className={baseClasses.preNormalized}>{JSON.stringify(__errsState, null, 2)}</pre>
        </Grid>
      </LocalizationProvider>
    </FormProvider>
  )
}

export const Form = genericMemo(GenericComponentForm)
// export const Form = GenericComponentForm
