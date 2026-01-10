import React, { useRef } from 'react'
import { useFieldArray, Control } from 'react-hook-form'
// import { Button } from '~/components/Button'
import { Button } from '@mui/material'

type TProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>;
}

export const Documents = ({ control }: TProps) => {
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const __handleAddFiles = (event: any) => {
    const filesToUpload = Array.from(event.target.files);
    const files = filesToUpload.map((file) => ({ file }));
    append(files);

    // if (hiddenFileInput.current) {
    //   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //   // @ts-ignore
    //   hiddenFileInput.current?.value = '';
    // }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      <input
        ref={hiddenFileInput}
        type="file"
        multiple={true}
        onChange={__handleAddFiles}
      />

      {fields.map(({
        documentId,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        file
      }, i) => (
        <div
          key={documentId}
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '8px',
            width: '100%'
          }}
        >
          <b>{file.name}</b>

          <Button
            size='small'
            variant='outlined'
            color='primary'
            onClick={() => remove(i)}
          >
            DEL
          </Button>
        </div>
      ))}

      <Button
        size='large'
        variant='outlined'
        color='primary'
        onClick={handleAddDocs}
      >
        Add Files
      </Button>
    </div>
  );
};
