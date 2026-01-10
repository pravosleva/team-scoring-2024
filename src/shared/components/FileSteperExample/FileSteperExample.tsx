/* eslint-disable @typescript-eslint/no-unused-vars */
import { memo, useCallback, useEffect, useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { UploadDocumentsStepper } from '~/shared/components/FileUploadInput/v4'
import baseClasses from '~/App.module.scss'
import { Button } from '@mui/material'
import { ResponsiveBlock } from '~/shared/components'
// import { Link } from 'react-router-dom'
import { PhotoProvider, PhotoView } from 'react-photo-view'
import SaveIcon from '@mui/icons-material/Save'
// import ImageIcon from '@mui/icons-material/Image'
import { idbInstance } from './utils'
import { soundManager } from '~/shared'

export type TState = {
  // TODO: #backlog По возможности описать корректно

  documents: { file: Blob; preview?: string }[];
}
const initialState: TState = {
  documents: [],
};
type TProps = {
  isEditable?: boolean;
  idbKey: string;
}

export const FileSteperExample = memo(({ idbKey, isEditable }: TProps) => {
  const {
    watch,
    control,
    register,
    handleSubmit: _rhfHandleSubmit,
    formState: {
      errors,
      // defaultValues,
      isValid,
    },
    setValue,
    setError,
    clearErrors,
    // getValues,
  } = useForm({
    mode: 'all',
    defaultValues: initialState,
  });

  const [loadedTsUpdate, setLoadedTsUpdate] = useState<null | number>(null)
  const [savedTsUpdate, setSavedTsUpdate] = useState<null | number>(null)
  const [currentSelectTs, setCurrentSelectTs] = useState<null | number>(null)
  const [wasLoadedFirstly, setWasLoadedFirstly] = useState(true)

  const auxSensor = useRef<number>(0)
  useEffect(() => {
    // NOTE: 1. Get from indexed db
    idbInstance.loadImages({
      key: idbKey,
      cb: {
        onSuccess: (ps) => {
          if (ps.ok) {
            // console.log(ps.data)
            // console.log(Array.isArray(ps.data))

            // NOTE: v1
            // setValue('documents', ps.data)

            // NOTE: v2
            // console.log(ps.data?.[0])
            // console.log(ps.data?.[0] instanceof File)
            const res = ps.data?.items?.map((item) => ({
              file: item,
              preview: item instanceof Blob ? URL.createObjectURL(item) : undefined,
            }))
            // console.log(res)
            if (!!res) setValue('documents', res)

            if (!!ps.data?.ts) {
              setLoadedTsUpdate(ps.data?.ts)
              // setSelectedTs(ps.data?.ts)
              setSavedTsUpdate(ps.data?.ts)
              auxSensor.current += 1
            }
          }
        },
        onFuckup: console.warn,
      },
    })

    // TODO: 2. Set to local state
  }, [idbKey])

  const [isUpdated, setIsUpdated] = useState(false)
  const setImagePackToIDB = useCallback(() => {
    idbInstance.setImagesPack({
      key: idbKey,
      items: [...watch('documents').values()].map((f) => f.file),
      cb: {
        onSuccess: (ps) => {
          soundManager.playDelayedSoundConfigurable({
            soundCode: 'load-203-saved',
            delay: {
              before: 0,
              after: 1000,
            },
            _debug: { msg: 'Saved to IndexedDB' }
          })
          setSavedTsUpdate(ps.ts)
          setCurrentSelectTs(ps.ts)
          setLoadedTsUpdate(ps.ts)
          setWasLoadedFirstly(false)
          setIsUpdated(false)
        },
        onFuckup: console.warn,
      },
    })
  }, [idbKey, setIsUpdated])

  if (!isEditable && [...watch('documents').values()].length == 0)
    return null

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        // padding: '16px',
      }}
    >
      {
        isEditable && (
          <code style={{ fontSize: 'small' }}>IndexedDB key: {idbKey}</code>
        )
      }

      {
        !isEditable && [...watch('documents').values()].length > 0 && (
          <PhotoProvider
          // toolbarRender={({ onScale, scale }) => (
          //   <>
          //     <svg className="PhotoView-Slider__toolbarIcon" onClick={() => onScale(scale + 1)} />
          //     <svg className="PhotoView-Slider__toolbarIcon" onClick={() => onScale(scale - 1)} />
          //   </>
          // )}
          >
            <div className={baseClasses.galleryWrapperRounded}>
              {[...watch('documents').values()].map((item, index) => (
                <PhotoView key={index} src={item.preview}>
                  <img
                    src={item.preview}
                    style={{
                      objectFit: 'cover',
                      maxWidth: '100%',
                      // borderRadius: (!isEditable && cfg?.readonlyMode.isImagesRounded) ? '16px' : '0px',
                    }}
                    alt=""
                  />
                </PhotoView>
              ))}
            </div>
          </PhotoProvider>
        )
      }
      {
        isEditable && (
          <>
            <UploadDocumentsStepper
              control={control}
              filesQuantityLimit={5}
              totalSizeLimitMiB={25}
              // onResetInternalErrors={handleResetInternalErrors}
              onResetInternalErrors={() => undefined}
              onUpdateFileStorageIds={() => {
                setCurrentSelectTs(new Date().getTime())
              }}
              onAdd={() => setIsUpdated(true)}
              onRemove={() => setIsUpdated(true)}
            />
            {
              isUpdated && (
                <ResponsiveBlock
                  className={baseClasses.specialActionsGrid}
                  style={{
                    // padding: '16px 0px 16px 0px',
                    // border: '1px dashed red',
                    // boxShadow: '0 -10px 7px -8px rgba(34,60,80,.2)',
                    position: 'sticky',
                    bottom: 0,
                    backgroundColor: 'transparent',
                    // zIndex: 3,
                    marginTop: 'auto',
                    // borderRadius: '16px 16px 0px 0px',
                  }}
                >
                  <Button
                    onClick={setImagePackToIDB}
                    color='gray'
                    variant='outlined'
                    disabled={
                      watch('documents').length === 0
                      || (currentSelectTs === savedTsUpdate && !wasLoadedFirstly)
                    }
                    startIcon={<SaveIcon />}
                  // endIcon={<ImageIcon />}
                  >
                    Save images
                  </Button>
                </ResponsiveBlock>
              )
            }

            {/* <pre className={baseClasses.preNormalized}>
              {JSON.stringify({
                // isSubmitBtnDisabled: !isValid || isFormLoading || isTopicsLoading || !topicsResponseIsValidated.ok || !!errors?.message?.message || !!errors?.questionTheme?.message,
                // isTopicsLoading,
                // topicsData,
                // ...restTopicsState,
                // isValid,
                // filesAdditionalInfo,
                loadedTsUpdate,
                savedTsUpdate,
                currentSelectTs,
                documents: {
                  value: watch('documents'),
                  err: errors?.documents?.message,
                },
                // errors,
                //   data,
                //   defaultValues,
                // _ errors: Object.entries(errors),
              }, null, 2)}
            </pre> */}
          </>
        )
      }
    </div>
  )
})
