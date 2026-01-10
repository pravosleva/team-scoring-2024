import React, { useRef, useState } from 'react'
// import { Button } from '~/components/Button'
import { Button } from '@mui/material'

type TProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rhfRegisterTransfer: () => any;
}

export const FileUploadInput = ({ rhfRegisterTransfer }: TProps) => {
  const hiddenInputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const {
    ref: registerRef, ...registerRest
  } = rhfRegisterTransfer();
  const handleUploadedFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const urlImage = URL.createObjectURL(file);
      setPreview(urlImage);
    }
  };
  const handleUpload = (_e: unknown) => {
    // e?.preventDefault();
    // console.log(hiddenInputRef.current);
    hiddenInputRef.current?.click();
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      <div>WIP</div>
      <input
        type="file"
        {...registerRest}
        onChange={handleUploadedFile}
        ref={(e) => {
          registerRef(e);
          hiddenInputRef.current = e;
        }}
      />
      {
        !!preview && (
          <div>{preview}</div>
        )
      }
      {
        !!preview && (
          <img
            src={preview}
            alt="preview"
          />
        )
      }
      <Button
        size='large'
        variant='outlined'
        color='primary'
        onClick={handleUpload}
      >
        TST
      </Button>
    </div>
  );
};

