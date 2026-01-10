import React, { useRef } from 'react';
import { useFieldArray, Control } from 'react-hook-form';
// import { Button } from '~/components/Button';
import { Button } from '@mui/material'

type TProps = {
  // TODO: По возможности типизировать корректно
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>;
}
interface Event<T = EventTarget> {
  target: T;
  // ...
}

export const UploadDocuments = ({ control }: TProps) => {
  const {
    append, fields, remove
  } = useFieldArray({
    control,
    name: 'documents',
    keyName: 'documentId'
  });
  const hiddenFileInput = useRef<HTMLInputElement | null>(null);
  const handleAddDocs = () => {
    hiddenFileInput.current?.click();
  };
  const __handleAddFiles = (event: Event<HTMLInputElement>) => {
    if (event.target.files) {
      const filesToUpload: File[] = Array.from(event.target.files);
      const files = filesToUpload.map((file) => ({
        file,
        preview: URL.createObjectURL(file)
      }));
      append(files);

      // if (hiddenFileInput.current) {
      //   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //   // @ts-ignore
      //   hiddenFileInput.current?.value = '';
      // }
    }
  };

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
          style={{ display: 'none' }}
          ref={hiddenFileInput}
          type="file"
          multiple={true}
          onChange={__handleAddFiles}
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
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      maxWidth: '148px',
                    }}
                  >
                    <div
                      key={documentId}
                      style={{
                        // display: 'flex',
                        // flexDirection: 'row',
                        // justifyContent: 'space-between',
                        // alignItems: 'center',
                        // gap: '8px',
                        // border: '1px dashed red',

                        backgroundImage: preview ? `url("${preview}")` : undefined,
                        backgroundRepeat: 'no-repeat',
                        // objectFit: 'contain',
                        backgroundPosition: 'center',
                        backgroundSize: 'cover',
                        borderRadius: '16px',

                        width: '148px',
                        height: '148px',

                        position: 'relative',
                      }}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          top: '0px',
                          bottom: '0px',
                          left: '0px',
                          right: '0px',
                          // background: 'linear-gradient(rgba(0,0,0,.7) 30%, rgba(219,115,22,.6) 100%)',
                          background: 'linear-gradient(rgba(0,0,0,.7) 20%, rgba(0,0,0,.3) 100%)',
                          color: '#fff',
                          borderRadius: 'inherit',
                          padding: '8px',
                          fontSize: 'small',
                        }}
                      />

                      <Button
                        size='small'
                        variant='outlined'
                        color='primary'
                        onClick={() => remove(i)}
                        style={{
                          position: 'absolute',
                          bottom: '8px',
                          right: '8px',
                          outline: '2px solid #FFF'
                        }}
                      >
                        ✕ DEL
                      </Button>
                    </div>
                    <span
                      style={{
                        fontFamily: 'SuisseIntl',
                        fontStyle: 'normal',
                        fontWeight: 400,
                        fontSize: '14px',
                        lineHeight: '20px',
                        /* identical to box height, or 143% */
                        textAlign: 'center',

                        color: '#1F232B',
                      }}
                    >
                      {file.name}
                    </span>
                  </div>
                ))}
              </>
            )
          }
          <button
            type="button"
            onClick={handleAddDocs}
            style={{
              cursor: 'pointer',
              display: 'flex',
              // flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '8px',
              width: '148px',
              height: '148px',
              border: '1px dashed #DCE1EF',
              backgroundColor: '#F1F2F6',
              borderRadius: '12px',
            }}
          >
            ADD
          </button>
        </div>

        {/* <Button
          size="large"
          variant="outlined"
          color="default"
          onClick={handleAddDocs}
        >
          Add Files
        </Button> */}
      </div>
    </>
  );
};
