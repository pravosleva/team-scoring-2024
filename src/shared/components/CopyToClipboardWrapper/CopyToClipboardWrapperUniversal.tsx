
import { useCallback, memo, useState } from 'react'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import {
  useSnackbar,
  SnackbarMessage as TSnackbarMessage,
  OptionsObject as IOptionsObject,
  // SharedProps as ISharedProps,
  // closeSnackbar,
} from 'notistack'

type TProps = {
  text: string;
  onCopy?: (text: string) => void;
  showNotifOnCopy?: boolean;
  renderer: ({ isCopied }: { isCopied: boolean }) => React.ReactNode;
}

export const CopyToClipboardWrapperUniversal = memo(({ renderer, onCopy, text, showNotifOnCopy }: TProps) => {
  const [isCopied, setIsCopied] = useState(false)
  const { enqueueSnackbar } = useSnackbar()
  const showNotif = useCallback((msg: TSnackbarMessage, opts?: IOptionsObject) => {
    if (!document.hidden) enqueueSnackbar(msg, opts)
  }, [enqueueSnackbar])
  // const showError = useCallback(({ message }: { message: string }) => {
  //   showNotif(message, { variant: 'default' })
  // }, [showNotif])
  // const showSuccess = useCallback(({ message }: { message: string }) => {
  //   showNotif(message, { variant: 'default' })
  // }, [showNotif])
  const showInfo = useCallback(({ message }: { message: string }) => {
    showNotif(message || 'No message', {
      variant: 'info',
      hideIconVariant: true,
      anchorOrigin: {
        vertical: 'top',
        horizontal: 'center',
      },
      action: null,
    })
  }, [showNotif])
  const handleCopy = useCallback(() => {
    if (showNotifOnCopy) showInfo({ message: `Copied: ${text}` })
    if (!!onCopy) onCopy(text)

    setIsCopied(true)
  }, [showNotifOnCopy, setIsCopied, onCopy, showInfo, text])

  return (
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    <CopyToClipboard
      text={text}
      onCopy={handleCopy}
    >
      {renderer({ isCopied })}
    </CopyToClipboard>
  )
})
