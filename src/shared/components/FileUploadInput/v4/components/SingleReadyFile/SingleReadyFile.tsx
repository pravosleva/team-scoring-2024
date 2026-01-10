/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { memo, useCallback, useEffect, } from 'react';
// import { LoaderIcon } from '~/components/LoaderIcon';
// import { getBytesFromMiB } from '~/utils/number-ops';
import { MultistepFSMScenarioContext } from './multistep-machine';
import { NSMachine } from './types';
import {
  CheckIcon, PlusIcon, RetryIcon, TrashIcon
} from './icons';
import CircularProgress from '@mui/material/CircularProgress'
import classes from './SingleReadyFile.module.scss'

type TProps = {
  isLoadedAlready?: boolean;
  shouldWaiting?: boolean;
  documentId: string;
  previewUrl: string;
  onReplaceFile?: (ps: { fileStoreId?: string; size?: number; fileName: string; localDocumentId: string; previewUrl: string }) => void;
  onDeleteSlot?: (ps: { fileStoreId?: string; size?: number; fileName: string; localDocumentId: string; previewUrl: string }) => void;
  file: File;
  onSuccessUpload?: ({
    fileStoreId, size, fileName, previewUrl,
  }: {
    fileStoreId: string;
    size: number;
    fileName: string;
    localDocumentId: string;
    previewUrl: string;
  }) => void;
  totalSizeLimitMiB?: number;
}

const WrappedSingleReadyFile = memo(({
  // isLoadedAlready,
  // shouldWaiting,
  documentId,
  previewUrl,
  onReplaceFile,
  onDeleteSlot,
  file,
  onSuccessUpload,
  // totalSizeLimitMiB,
}: TProps) => {
  // const [requiredSize] = useCommonInfoStore((s) => s.requiredSize);
  // const [errTotalSizeMessage] = useCommonInfoStore((s) => s.errTotalSizeMessage);
  // const requiredSizeRef = useRef<number>(0);
  const scenarioActorRef = MultistepFSMScenarioContext.useActorRef();
  // scenario4ActorRef.send({ type: 'runRequest' });
  const handleClickForQuestion = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    scenarioActorRef.send({ type: 'goQuestion' });
  }, []);
  const handleClickForReady = useCallback(() => {
    scenarioActorRef.send({ type: 'goReady' });
  }, []);
  const originalResponse = MultistepFSMScenarioContext.useSelector((s) => s.context.common.originalResponse);
  const loadedSize = MultistepFSMScenarioContext.useSelector((s) => s.context.common.loadedSize);
  const selectedFileName = MultistepFSMScenarioContext.useSelector((s) => s.context.common.file?.name);

  const handleClickForOpenSlot = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onReplaceFile?.({
      fileStoreId: originalResponse?.data?.fileStoreId,
      size: loadedSize,
      fileName: selectedFileName || originalResponse?.data?.originalFileName || '[impossible]-incorrect-response',
      localDocumentId: documentId,
      previewUrl,
    });
  }, [originalResponse?.data?.fileStoreId, loadedSize, selectedFileName, previewUrl]);

  const handleClickForRemoveSlot = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteSlot?.({
      fileStoreId: originalResponse?.data?.fileStoreId,
      size: loadedSize,
      fileName: selectedFileName || originalResponse?.data?.originalFileName || '[impossible]-incorrect-response',
      localDocumentId: documentId,
      previewUrl,
    });
  }, [originalResponse?.data?.fileStoreId, loadedSize, selectedFileName, previewUrl]);

  const fsmValue = MultistepFSMScenarioContext.useSelector((s) => s.value);
  const responseAnalysis = MultistepFSMScenarioContext.useSelector((s) => s.context.common.responseAnalysis);
  // const customErrorReason = MultistepFSMScenarioContext.useSelector((s) => s.context.common.customError.reason);
  useEffect(() => {
    switch (fsmValue) {
      case NSMachine.EStep.Ready:
        if (!responseAnalysis?.ok) {
          // NOTE: Пора переключаться на загрузку...
          scenarioActorRef.send({
            type: 'SET_FILE', value: file
          });
          scenarioActorRef.send({ type: 'goSending' });
        }
        break;
      default:
        break;
    }
  }, [fsmValue, responseAnalysis?.ok]);

  // useEffect(() => {
  //   requiredSizeRef.current = requiredSize;
  // }, [requiredSize]);

  useEffect(() => {
    switch (fsmValue) {
      case NSMachine.EStep.SentOk:
        if (typeof originalResponse?.data?.fileStoreId === 'string' && !!originalResponse.data?.fileStoreId) {
          onSuccessUpload?.({
            fileStoreId: originalResponse.data.fileStoreId,
            size: loadedSize,
            fileName: selectedFileName || originalResponse.data.originalFileName || '[impossible]-incorrect-response',
            localDocumentId: documentId,
            previewUrl,
          });
        }
        break;
      default:
        break;
    }
  }, [fsmValue, originalResponse?.data?.fileStoreId, loadedSize, selectedFileName, previewUrl]);

  const handleClickForRetry = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    scenarioActorRef.send({ type: 'goSending' });
  }, []);

  const dontAllowRetry = MultistepFSMScenarioContext.useSelector((s) => s.context.common.dontAllowRetry);

  return (
    <div
      key={documentId}
      style={{
        backgroundColor: '#F1F2F6',
        borderRadius: '24px',
        width: '148px',
        height: '148px',
        position: 'relative',
      }}
    >
      <div
        // @ts-ignore
        // onClick={handleClickForOpenSlot}
        style={{
          position: 'absolute',
          top: '0px',
          bottom: '0px',
          left: '0px',
          right: '0px',
          borderRadius: 'inherit',
          padding: '8px',
          fontSize: 'small',
          filter: fsmValue === NSMachine.EStep.Question ? 'blur(4px)' : 'blur(0px)',
          transition: 'filter 0.3s ease-in',
          backgroundImage: previewUrl ? `url("${previewUrl}")` : undefined,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center center',
          backgroundSize: 'min(300px, 100%)',
        }}
      />
      {
        fsmValue === NSMachine.EStep.Ready && (
          <div
            onClick={handleClickForQuestion}
            style={{
              cursor: 'pointer',
              position: 'absolute',
              top: '0px',
              bottom: '0px',
              left: '0px',
              right: '0px',
              // backgroundColor: 'green',
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'flex-end',
              padding: '8px',

              border: '1px solid #DCE1EF',
              borderRadius: 'inherit',
            }}
          >
            <button
              className={classes.controlButton}
              onClick={handleClickForQuestion}
              style={{ backgroundColor: '#15BC3A' }}
            >
              <CheckIcon />
            </button>
          </div>
        )
      }
      {
        fsmValue === NSMachine.EStep.Sending && (
          <div className={classes.absoluteBluredLayout}>
            <div>
              <CircularProgress />
            </div>
          </div>
        )
      }
      {
        fsmValue === NSMachine.EStep.SentErr && (
          <div
            className={classes.absoluteBluredLayout}
            style={{
              border: '1px solid #E33368',
              backgroundColor: '#FADBE4',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              // padding: '8px',
            }}
          >
            <span
              style={{
                fontSize: 'small',
                fontWeight: 'bold',
                textAlign: 'center',
              }}
            >
              {responseAnalysis?.message || 'No message (empty)'}
            </span>
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                width: 'calc(100% - 16px)',
                gap: '16px',

                position: 'absolute',
                right: '8px',
                bottom: '8px',
              }}
            >
              {!dontAllowRetry && (
                <button
                  className={classes.controlButton}
                  onClick={handleClickForRetry}
                  style={{ backgroundColor: '#15BC3A' }}
                >
                  <RetryIcon
                    style={{
                      color: '#FFF', transform: 'scale(0.7)'
                    }}
                  />
                </button>
              )}
              <button
                className={classes.controlButton}
                onClick={handleClickForRemoveSlot}
                style={{ backgroundColor: 'red' }}
              >
                <TrashIcon style={{ transform: 'scale(0.7)' }} />
              </button>
            </div>
          </div>
        )
      }
      {
        fsmValue === NSMachine.EStep.SentOk && (
          <div
            onClick={handleClickForQuestion}
            style={{
              cursor: 'pointer',
              position: 'absolute',
              top: '0px',
              bottom: '0px',
              left: '0px',
              right: '0px',
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'flex-end',
              padding: '8px',
            }}
          >
            <button
              className={classes.controlButton}
              // onClick={handleClickForOpenSlot}
              // onClick={handleClickForQuestion}
              style={{ backgroundColor: '#15BC3A' }}
            >
              <CheckIcon />
            </button>
          </div>
        )
      }
      {
        fsmValue === NSMachine.EStep.Question && (
          <>
            <div
              className={classes.absoluteBluredLayout}
              onClick={handleClickForReady}
              style={{
                border: '1px solid #DCE1EF',
                borderRadius: 'inherit',
              }}
            >
              <div>Заменить?</div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  gap: '8px',
                  width: 'calc(100% - 16px)',

                  position: 'absolute',
                  right: '8px',
                  bottom: '8px',
                  left: '8px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '8px',
                  }}
                >
                  <button
                    className={classes.controlButton}
                    onClick={handleClickForOpenSlot}
                    style={{ backgroundColor: '#15BC3A' }}
                  >
                    <CheckIcon />
                  </button>
                  <button
                    className={classes.controlButton}
                    onClick={handleClickForReady}
                    style={{ backgroundColor: 'red' }}
                  >
                    <PlusIcon style={{ transform: 'rotate(45deg)' }} />
                  </button>
                </div>
                <button
                  className={classes.controlButton}
                  onClick={handleClickForRemoveSlot}
                  style={{ backgroundColor: 'red' }}
                >
                  <TrashIcon style={{ transform: 'scale(0.7)' }} />
                </button>
              </div>
            </div>
          </>
        )
      }
    </div>
  );
});

export const SingleReadyFile = memo((ps: TProps) => (
  <MultistepFSMScenarioContext.Provider>
    <WrappedSingleReadyFile
      {...ps}
    />
  </MultistepFSMScenarioContext.Provider>
));

