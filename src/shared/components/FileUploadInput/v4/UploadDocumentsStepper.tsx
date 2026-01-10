/* eslint-disable @typescript-eslint/no-namespace */
import React, {
  useCallback, useRef, memo, useEffect
} from 'react';
import { useFieldArray, Control } from 'react-hook-form';
import { createFastContext } from '~/shared/utils/createFastContext';
import { getHumanReadableSize, getBytesFromMiB } from '~/shared/utils/number-ops';
import { clsx } from 'clsx';
// import { NSAdministrativeTicket } from '~/middleware/context/utils/administrative';
import { debugFactory } from '~/shared/utils';
import { SingleReadyFile } from './components';
// import { ControlButton } from './components/SingleReadyFile/styles';
import { PlusIcon } from './components/SingleReadyFile/icons';
// import { DescriptionBox, HiddenInput } from './styles';
import classes from './UploadDocumentsStepper.module.scss'
import { CommonInfoProvider, useCommonInfoStore } from './context';
import singleFileClasses from './components/SingleReadyFile/SingleReadyFile.module.scss'

enum ApiResponseStatus {
  Success = 'Success',
  Fail = 'Fail'
}
interface IBaseResponse<TData> {
  data?: TData;
  status: ApiResponseStatus;
  requestId: string;
  success?: boolean;
  message?: string;
}
namespace NSAdministrativeTicket {
  export type TFinalFileInfoForApi = { fileStoreId: string; name: string }
  export type TRequestBody = {
    topic: string;
    messageText: string;
    files?: TFinalFileInfoForApi[];
  }
  export type TResponseData = {
    dmsRequestID: number;
    dmsRequestNumber: string;
    requestID: string;
    requestNumber: string;
  };
  export type TBaseResponse = IBaseResponse<TResponseData>;
}

type TCommonDebugEvent = {
  originalEvent?: React.ChangeEvent<HTMLInputElement>;
  openSlot?: boolean;
  fields?: Record<'documentId', string>[];
}
const fileSelectorLogger = debugFactory<TCommonDebugEvent | null, string | null>({ label: '🇫 UploadDocumentsStepper:v4 | common' });

type TInputDebugEvent = {
  originalEvent?: React.ChangeEvent<HTMLInputElement>;
  filesFromEvent?: FileList | null;
  extractedFiles?: { file: File; preview: string }[];
  msg?: string;
  newRequiredStuff?: {
    [key: string]: {
      size: number;
      previewUrl: string;
    };
  };
}
const originalInputLogger = debugFactory<TInputDebugEvent | null, string | null>({ label: '🇫 UploadDocumentsStepper:v4 | input' });

type TProps = {

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>;
  // TODO: По возможности описать корректно
  filesQuantityLimit: number;
  totalSizeLimitMiB?: number;
  // onSuccess?: ({ reason }: { reason: string }) => void;
  onResetInternalErrors?: () => void;
  onUpdateFileStorageIds?: (ps: { readyStuffForApi: NSAdministrativeTicket.TFinalFileInfoForApi[] }) => void;
  onAdd?: () => void;
  onRemove?: () => void;
}

const {
  Provider: LoadedProvider, useStore: useLoadedStore,
} = createFastContext<{
  [key: string]: {
    // NOTE: Key -> localDocumentId: string;
    fileStoreId: string;
    fileName: string;
    size: number;
    previewUrl: string;
  } | null;
}>({});
const {
  Provider: RequiredProvider, useStore: useRequiredStore,
} = createFastContext<{
  [key: string]: {
    // NOTE: Key -> previewUrl: string;
    size: number;
    previewUrl: string;
  } | null;
}>({});

const Logic = memo(({
  control, filesQuantityLimit, totalSizeLimitMiB, onResetInternalErrors,
  onUpdateFileStorageIds,
  onAdd, onRemove
}: TProps) => {
  const {
    append, fields, remove
  } = useFieldArray({
    control,
    name: 'documents',
    keyName: 'documentId'
  });
  const hiddenFileInputRef = useRef<HTMLInputElement | null>(null);
  const preventExternalClick = useCallback((cb: () => void) => (e?: React.MouseEvent<HTMLElement>) => {
    if (typeof e?.stopPropagation === 'function') {
      e?.stopPropagation();
    }
    cb();
  }, []);
  const handleAddDocs = (_e?: React.MouseEvent<HTMLElement>) => hiddenFileInputRef.current?.click();
  useEffect(() => {
    fileSelectorLogger.log({
      label: 'Mounted', err: null, evt: null
    });
  }, []);

  const [loadedStore, setLoadedStore] = useLoadedStore((s) => s);
  // const loadedQuantity = useMemo(() => Object.values(loadedStore).filter(Boolean).length, [loadedStore]);
  const [requiredStore, setRequiredStore] = useRequiredStore((s) => s);

  const [errQuantityMessage, setCommonInfoStore] = useCommonInfoStore((s) => s.errQuantityMessage);
  const __handleAddFiles: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    originalInputLogger.log({
      label: '➕ handler called', err: null, evt: { originalEvent: event }
    });
    if (event.target.files) {
      originalInputLogger.log({
        label: '➕ 1. Has files', err: null, evt: { filesFromEvent: event.target.files }
      });
      setCommonInfoStore({ errQuantityMessage: null });
      // Event<HTMLInputElement>
      const filesToUpload: File[] = Array.from(event.target.files);

      // -- NOTE: Ограничение по количеству файлов
      const attemptToSelectFilesTotalQuantity = filesToUpload.length + Object.values(requiredStore).filter(Boolean).length;
      if (attemptToSelectFilesTotalQuantity > filesQuantityLimit) {
        const message: string = [
          `Вы можете приложить максимум ${filesQuantityLimit} файлов`,
          `(нельзя выбрать ${attemptToSelectFilesTotalQuantity})`,
        ].join(' ');
        setCommonInfoStore({ errQuantityMessage: message });
        return;
      }
      // --

      const files = filesToUpload.map((file) => ({
        file,
        preview: URL.createObjectURL(file)
      }));

      originalInputLogger.log({
        label: `➕ 1.1 Extracted files (${files.length})`, err: null, evt: { extractedFiles: files }
      });

      // -- NOTE: [UPLOAD_FILE_SIZE_LIMIT] 1/2 Ограничение по суммарному объему выбранного
      if (typeof totalSizeLimitMiB === 'number') {
        const __earlyRequiredSize = Object.keys(requiredStore)
          .filter(Boolean)
          .reduce((acc, previewUrl) => {
            acc += requiredStore[previewUrl]?.size || 0;
            return acc;
          }, 0);
        const __selectedSize = files
          .reduce((acc, pack) => {
            acc += pack.file.size || 0;
            return acc;
          }, 0);
        const __fullSize = __earlyRequiredSize + __selectedSize;
        const limitB = getBytesFromMiB(totalSizeLimitMiB);
        if (__fullSize > limitB) {
          const message: string = [
            `Вы можете приложить максимум ${totalSizeLimitMiB} MiB`,
            `(нельзя выбрать суммарно ${getHumanReadableSize({ bytes: __fullSize, decimals: 2 })})`,
          ].join(' ');
          setCommonInfoStore({ errQuantityMessage: message });
          return;
        }
        originalInputLogger.log({
          label: '➕ 1.2 Size checked', err: null, evt: { msg: `Humanized __fullSize -> ${getHumanReadableSize({ bytes: __fullSize, decimals: 2 })}` }
        });
      }
      // --

      const newRequiredStuff: {
        [key: string]: {
          size: number;
          previewUrl: string;
        };
      } = {};

      for (const pack of files) {
        newRequiredStuff[pack.preview] = {
          size: pack.file.size || 0,
          previewUrl: pack.preview,
        };
      }
      originalInputLogger.log({
        label: '➕ 1.3 Required store before setup', err: null, evt: { newRequiredStuff, }
      });
      setRequiredStore({ ...newRequiredStuff });

      append(files);

      originalInputLogger.log({
        label: '➕ 1.4 Files was append to RHF', err: null, evt: { extractedFiles: files }
      });

      // if (hiddenFileInputRef.current) {
      //   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //   // @ts-ignore
      //   hiddenFileInputRef.current?.value = '';
      // }

      if (typeof onAdd === 'function') onAdd()
    } else {
      originalInputLogger.log({
        label: '➕ 2. No files', err: null, evt: { originalEvent: event }
      });
    }
  };

  const handleRemoveFile = useCallback(({
    index, openSlot,
  }: { index: number; openSlot?: boolean }) => (ps: {
    fileStoreId?: string;
    size?: number;
    fileName: string;
    localDocumentId: string;
    previewUrl: string;
  }) => {
      fileSelectorLogger.log({
        label: 'handleRemoveFile called', err: null, evt: { openSlot }
      });
      setCommonInfoStore({ errQuantityMessage: null });
      if (typeof ps.size === 'number') {
        // NOTE: File selected
        switch (true) {
          case typeof ps.fileStoreId === 'string': {
            // NOTE: Was loaded
            setLoadedStore({ [ps.localDocumentId]: null });
            setRequiredStore({ [ps.previewUrl]: null });
            break;
          }
          case !ps.fileStoreId:
            // NOTE: Wasnt loaded
            setRequiredStore({ [ps.previewUrl]: null });
            break;
          default:
            setRequiredStore({ [ps.previewUrl]: null });
            break;
        }
      }
      remove(index);

      if (typeof onRemove === 'function') onRemove()

      if (openSlot) {
        hiddenFileInputRef.current?.blur();
        fileSelectorLogger.log({
          label: 'OPEN SLOT', err: null, evt: null
        });
        setTimeout(() => hiddenFileInputRef.current?.click(), 0);
      }
    }, [setLoadedStore, setRequiredStore, remove, setCommonInfoStore]);

  const handleSuccessUpload = useCallback(({
    fileStoreId, size, fileName, localDocumentId, previewUrl
  }: {
    fileStoreId: string;
    size: number;
    fileName: string;
    localDocumentId: string;
    previewUrl: string;
  }) => {
    setLoadedStore({
      [localDocumentId]: {
        size,
        fileStoreId,
        fileName,
        previewUrl,
      }
    });
    // onSuccess?.({
    //   reason: 'Все проверки пройдены успешно',
    // });
  }, [loadedStore]);

  // const [loadedSize] = useCommonInfoStore((s) => s.loadedSize);
  useEffect(() => {
    setCommonInfoStore({
      loadedSize: Object.keys(loadedStore).reduce((acc: number, fileStoreId: string) => {
        acc += loadedStore[fileStoreId]?.size || 0;
        return acc;
      }, 0),
    });
    onUpdateFileStorageIds?.({
      readyStuffForApi: Object.keys(loadedStore).reduce((acc: NSAdministrativeTicket.TFinalFileInfoForApi[], localDocumentId: string) => {
        if (loadedStore[localDocumentId]?.fileStoreId) {
          acc.push({
            fileStoreId: loadedStore[localDocumentId].fileStoreId,
            name: loadedStore[localDocumentId].fileName,
          });
        }
        return acc;
      }, [])
    });
  }, [loadedStore]);

  const [requiredSize] = useCommonInfoStore((s) => s.requiredSize);
  useEffect(() => {
    setCommonInfoStore({
      requiredSize: Object.keys(requiredStore).reduce((acc: number, previewUrl: string) => {
        acc += requiredStore[previewUrl]?.size || 0;
        return acc;
      }, 0),
    });
  }, [requiredStore]);

  const [errTotalSizeMessage] = useCommonInfoStore((s) => s.errTotalSizeMessage);
  useEffect(() => {
    if (typeof totalSizeLimitMiB === 'number') {
      const limitMb = totalSizeLimitMiB;
      const limitB = getBytesFromMiB(limitMb);
      setCommonInfoStore({
        errTotalSizeMessage: requiredSize > limitB
          ? [
            `Общий объем файлов слишком большой: ${getHumanReadableSize({ bytes: requiredSize, decimals: 1 })}.`,
            `Удалите ${getHumanReadableSize({ bytes: requiredSize - limitB, decimals: 0 })}`,
          ].join(' ')
          : null
      });
    }
  }, [requiredSize, totalSizeLimitMiB]);

  return (
    <>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <input
          className={classes.hiddenInput}
          ref={hiddenFileInputRef}
          type="file"
          multiple={true}
          onChange={__handleAddFiles}
          key={`fields-${fields.length}-reqFields-${Object.values(requiredStore).length}-loadedActual-${Object.keys(loadedStore).filter((k) => !!loadedStore[k]).length}`}
        />
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          {
            fields.length > 0 && (
              <>
                {fields.map(({
                  documentId,
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  file, preview,
                }, i) => (
                  <div
                    key={`${documentId}-${preview}-${i}`}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      maxWidth: '148px',
                      position: 'relative',
                    }}
                  >
                    {
                      !!requiredStore[preview]?.size && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '8px',
                            left: '8px',
                            borderRadius: '16px',
                            border: '1px solid #DCE1EF',
                            padding: '4px 8px',
                            zIndex: 1,
                            fontSize: 'small',
                            backgroundColor: '#FFF',
                          }}
                        >
                          {getHumanReadableSize({ bytes: requiredStore[preview]?.size || 0, decimals: 0 })}
                        </div>
                      )
                    }
                    <SingleReadyFile
                      key={`${documentId}-${preview}-${i}-ready`}
                      totalSizeLimitMiB={totalSizeLimitMiB}
                      // isLoadedAlready={Object.keys(loadedStore).some((fsid) => loadedStore[fsid]?.fileName === file.name && loadedStore[fsid]?.size === file.size)}
                      // -- NOTE: Логика для соответствия бизнес-требованиям
                      // 1. Получилось так, что количество загруженных файлов соответствует индексу
                      // shouldWaiting={!(loadedQuantity === i)}
                      // shouldWaiting={i > 0 ? loadedQuantity > i : false}
                      // 2. Если загрузка очередного файла вызвала ошибку, очередь дальше не пойдет
                      // --
                      documentId={documentId}
                      previewUrl={preview}
                      onReplaceFile={handleRemoveFile({
                        index: i, openSlot: true
                      })}
                      onDeleteSlot={handleRemoveFile({
                        index: i, openSlot: false
                      })}
                      onSuccessUpload={handleSuccessUpload}
                      file={file}
                    />
                    {/* <span
                      style={{
                        fontFamily: 'system-ui',
                        fontStyle: 'normal',
                        fontWeight: 400,
                        fontSize: '14px',
                        lineHeight: '20px',
                        textAlign: 'center',
                        color: '#1F232B',
                      }}
                    >
                      {file.name}
                    </span> */}
                  </div>
                ))}
              </>
            )
          }
          {
            fields.length < filesQuantityLimit && (
              <div
                onClick={preventExternalClick(handleAddDocs)}
                style={{
                  boxSizing: 'border-box',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  alignItems: 'flex-end',
                  gap: '8px',
                  width: '148px',
                  maxWidth: '148px',
                  height: '148px',
                  maxHeight: '148px',
                  border: '1px dashed #DCE1EF',
                  backgroundColor: '#F1F2F6',
                  borderRadius: '24px',
                  padding: '8px',
                }}
              >
                <button
                  className={singleFileClasses.controlButton}
                  type="button"
                  style={{ backgroundColor: 'red' }}
                >
                  <PlusIcon />
                </button>
              </div>
            )
          }
        </div>

        {/* <Button size="large" variant="outlined" color="default" onClick={handleAddDocs}>
          Add Files
        </Button> */}

        {
          (!!errQuantityMessage || !!errTotalSizeMessage) && (
            <div
              className={clsx(
                classes.descriptionBox,
                { [classes.isErrored]: true }
              )}
            >
              {clsx(errQuantityMessage, errTotalSizeMessage)}
              {
                !!onResetInternalErrors && (
                  <>
                    <br />
                    <b
                      style={{
                        textDecorationLine: 'underline',
                        textDecorationStyle: 'solid',
                        cursor: 'pointer',
                      }}
                      onClick={preventExternalClick(() => {
                        setCommonInfoStore({ errQuantityMessage: null });
                        setCommonInfoStore({ errTotalSizeMessage: null });
                        onResetInternalErrors();
                        // hiddenFileInputRef.current?.blur();
                      })}
                    >
                      Понятно
                    </b>
                  </>
                )
              }
            </div>
          )
        }
      </div>
    </>
  );
});

export const UploadDocumentsStepper = (ps: TProps) => (
  <CommonInfoProvider>
    <RequiredProvider>
      <LoadedProvider>
        <Logic {...ps} />
      </LoadedProvider>
    </RequiredProvider>
  </CommonInfoProvider>
);
