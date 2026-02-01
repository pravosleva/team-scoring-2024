/* eslint-disable @typescript-eslint/no-unused-vars */
import { memo, useCallback, useEffect, useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { UploadDocumentsStepper } from '~/shared/components/FileUploadInput/v4'
import baseClasses from '~/App.module.scss'
import { Alert, Button } from '@mui/material'
import { ResponsiveBlock } from '~/shared/components'
// import { Link } from 'react-router-dom'
import { PhotoProvider, PhotoView } from 'react-photo-view'
import SaveIcon from '@mui/icons-material/Save'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
// import ImageIcon from '@mui/icons-material/Image'
import { idbInstance } from '~/shared/utils/indexed-db-ops'
import { soundManager } from '~/shared'
import { CommonInfoContext } from '~/shared/context'
import { getHumanReadableSize } from '~/shared/utils/number-ops'
import { CollapsibleText } from '~/pages/jobs/[job_id]/components/ProjectsTree/components'
// import { useLoadedStore } from '../FileUploadInput/v4/context'

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
  renderer?: (_ps: {
    counter: number;
    documents: { file: Blob; preview?: string }[];
    size: {
      bytes: number;
      humanized: string;
    };
  }) => React.ReactNode;
  dontShowIdbKey?: boolean;
  _hasGalleryContent?: boolean;
  isRemoveable?: boolean;
  isEditModeCollapsible?: boolean;
}

export const FileSteperExample = memo(({ idbKey, isEditable, renderer, dontShowIdbKey, _hasGalleryContent, isRemoveable, isEditModeCollapsible }: TProps) => {
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

  // NOTE: 1/4
  // const [loadedTsUpdate, setLoadedTsUpdate] = useState<null | number>(null)
  // const [savedTsUpdate, setSavedTsUpdate] = useState<null | number>(null)
  // const [currentSelectTs, setCurrentSelectTs] = useState<null | number>(null)
  // const [wasLoadedFirstly, setWasLoadedFirstly] = useState(true)

  // const auxSensor = useRef<number>(0)
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

            /* NOTE: 2/4
            if (!!ps.data?.ts) {
              setLoadedTsUpdate(ps.data?.ts)
              setSavedTsUpdate(ps.data?.ts)
              auxSensor.current += 1
            }
            */
          }
        },
        onFuckup: console.warn,
      },
    })

    // TODO: 2. Set to local state
  }, [idbKey])

  const [isUpdated, setIsUpdated] = useState(false)
  const [_c, setCommonInfoContext] = CommonInfoContext.useStore((s) => s)
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
          // setSavedTsUpdate(ps.ts)
          // setCurrentSelectTs(ps.ts)
          // setLoadedTsUpdate(ps.ts)
          // setWasLoadedFirstly(false)
          setIsUpdated(false)

          idbInstance.getAsyncSizeInfo()
            .then(({ result }) => setCommonInfoContext({ idb: result }))
            .catch(console.warn)
        },
        onFuckup: console.warn,
      },
    })
  }, [idbKey, setIsUpdated])
  const [isRemoved, setIsRemoved] = useState(false)
  const removeKeyFromIDB = useCallback(() => {
    const isConfirmed = window.confirm('⚡️ Will be removed forever. Yes?')
    if (!isConfirmed) return
    idbInstance.removeImagesPack({
      key: idbKey,
      cb: {
        onFuckup: () => {
          console.warn(`ERROR: idbKey: ${idbKey}`)
        },
        onSuccess: () => {
          setIsUpdated(false)
          setIsRemoved(true)
          idbInstance.getAsyncSizeInfo()
            .then(({ result }) => setCommonInfoContext({ idb: result }))
            .catch(console.warn)
        },
      }
    })
  }, [idbKey])
  // const [loadedStore] = useLoadedStore((s) => s);
  // const totalSize = useMemo(() => {}, [])
  const totalBytes = [...watch('documents').values()].reduce((acc, cur) => {
    if (typeof cur.file.size === 'number')
      acc += cur.file.size
    return acc
  }, 0)


  if (!!renderer)
    return renderer({
      counter: isRemoved ? 0 : [...watch('documents').values()].length,
      documents: isRemoved ? [] : [...watch('documents').values()],
      size: {
        bytes: totalBytes,
        humanized: getHumanReadableSize({
          bytes: totalBytes,
          decimals: 2,
        })
      },
    })

  if (!isEditable && [...watch('documents').values()].length == 0)
    return null

  return isRemoved ? (
    <Alert
      severity='info'
      variant='outlined'
    >
      <code style={{ fontSize: 'small' }}>Deleted: {idbKey}</code>
    </Alert>
  ) : (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        // padding: '16px',
      }}
    >
      {
        isEditable && !dontShowIdbKey && (
          <code style={{ fontSize: 'small' }}>
            ({getHumanReadableSize({ bytes: totalBytes, decimals: 2 })}) IndexedDB key: {idbKey}
          </code>
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
            <div
              // className={baseClasses.galleryWrapperRounded}
              className={baseClasses.galleryWrapperGrid2}
            >
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
        isEditable && isEditModeCollapsible && (
          <>
            <CollapsibleText
              // briefPrefix={!!targetJob.relations.parent || targetJob.relations.children.length > 0 || !!targetJob.descr ? '├─' : '└─'}
              briefText='Edit images'
              isClickableBrief
              contentRender={() => (
                <UploadDocumentsStepper
                  control={control}
                  filesQuantityLimit={12}
                  totalSizeLimitMiB={10}
                  // onResetInternalErrors={handleResetInternalErrors}
                  onResetInternalErrors={() => undefined}
                  // NOTE: 3/4
                  // onUpdateFileStorageIds={() => {
                  //   setCurrentSelectTs(new Date().getTime())
                  // }}
                  onAdd={() => setIsUpdated(true)}
                  onRemove={() => setIsUpdated(true)}
                />
              )}
            />
            {
              _hasGalleryContent && totalBytes > 0 && (
                <PhotoProvider>
                  <div
                    // className={baseClasses.galleryWrapperRounded}
                    className={baseClasses.galleryWrapperGrid1}
                  >
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
              (isUpdated || isRemoveable) && (
                <ResponsiveBlock
                  className={baseClasses.specialActionsGrid}
                  style={{
                    // padding: '16px 0px 16px 0px',
                    // border: '1px dashed red',
                    // boxShadow: '0 -10px 7px -8px rgba(34,60,80,.2)',
                    // position: 'sticky',
                    // bottom: 0,
                    backgroundColor: 'transparent',
                    // zIndex: 3,
                    marginTop: 'auto',
                    // borderRadius: '16px 16px 0px 0px',
                  }}
                >
                  {
                    isUpdated && (
                      <Button
                        onClick={setImagePackToIDB}
                        color='primary'
                        variant='contained'
                        // disabled={}
                        startIcon={<SaveIcon />}
                      >
                        Save images
                      </Button>
                    )
                  }
                  {
                    isRemoveable && (
                      <Button
                        onClick={removeKeyFromIDB}
                        color='error'
                        variant='outlined'
                        // disabled={watch('documents').length === 0}
                        startIcon={<DeleteForeverIcon />}
                      >
                        Delete key
                      </Button>
                    )
                  }
                </ResponsiveBlock>
              )
            }
          </>
        )
      }
      {
        isEditable && !isEditModeCollapsible && (
          <>
            <UploadDocumentsStepper
              control={control}
              filesQuantityLimit={12}
              totalSizeLimitMiB={10}
              // onResetInternalErrors={handleResetInternalErrors}
              onResetInternalErrors={() => undefined}
              // NOTE: 3/4
              // onUpdateFileStorageIds={() => {
              //   setCurrentSelectTs(new Date().getTime())
              // }}
              onAdd={() => setIsUpdated(true)}
              onRemove={() => setIsUpdated(true)}
            />
            {
              _hasGalleryContent && totalBytes > 0 && (
                <PhotoProvider>
                  <div
                    // className={baseClasses.galleryWrapperRounded}
                    className={baseClasses.galleryWrapperGrid1}
                  >
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
              (isUpdated || isRemoveable) && (
                <ResponsiveBlock
                  className={baseClasses.specialActionsGrid}
                  style={{
                    // padding: '16px 0px 16px 0px',
                    // border: '1px dashed red',
                    // boxShadow: '0 -10px 7px -8px rgba(34,60,80,.2)',
                    // position: 'sticky',
                    // bottom: 0,
                    backgroundColor: 'transparent',
                    // zIndex: 3,
                    marginTop: 'auto',
                    // borderRadius: '16px 16px 0px 0px',
                  }}
                >
                  {
                    isUpdated && (
                      <Button
                        onClick={setImagePackToIDB}
                        color='primary'
                        variant='contained'
                        // disabled={}
                        startIcon={<SaveIcon />}
                      >
                        Save images
                      </Button>
                    )
                  }
                  {
                    isRemoveable && (
                      <Button
                        onClick={removeKeyFromIDB}
                        color='error'
                        variant='outlined'
                        // disabled={watch('documents').length === 0}
                        startIcon={<DeleteForeverIcon />}
                      >
                        Delete key
                      </Button>
                    )
                  }
                </ResponsiveBlock>
              )
            }
          </>
        )
      }
    </div>
  )
})
