
import { useCallback, memo, useState } from 'react'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import baseClasses from '~/App.module.scss'
// import { FaCopy, FaRegCopy } from 'react-icons/fa'
import FaCopy from '@mui/icons-material/ContentCopy'
import FaRegCopy from '@mui/icons-material/FileCopy'
import clsx from 'clsx'
import {
  useSnackbar,
  SnackbarMessage as TSnackbarMessage,
  OptionsObject as IOptionsObject,
  // SharedProps as ISharedProps,
  // closeSnackbar,
} from 'notistack'
import classes from './CopyToClipboardWrapper.module.scss'
import { getTruncated } from '~/shared/utils/string-ops'

type TProps = {
  text: string;
  uiText?: string;
  onCopy?: () => void;
  showNotifOnCopy?: boolean;
}

export const CopyToClipboardWrapper = memo(({ onCopy, text, uiText, showNotifOnCopy }: TProps) => {
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
    showNotif(getTruncated(message, 100) || 'No message', {
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
    if (showNotifOnCopy) showInfo({ message: `Скопировано ${text}` })
    if (!!onCopy) onCopy()

    setIsCopied(true)
  }, [showNotifOnCopy, setIsCopied, onCopy, showInfo, text])

  return (
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    <CopyToClipboard
      text={text}
      onCopy={handleCopy}
    >
      <span
        className={clsx([
          baseClasses.truncate,
          classes.wrapper,
          {
            [classes.danger]: !isCopied,
            [classes.success]: isCopied,
          },
        ])}
      >
        <code
          className={clsx([
            baseClasses.truncate,
            baseClasses.inlineCode,
            classes.targetText,
          ])}
          style={{ paddingLeft: '8px' }}
        >{uiText || text}</code>
        <span
          style={{
            minWidth: '25px',
            maxWidth: '25px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {!isCopied ? (
            <span className={classes.copyIcon}>
              <FaCopy fontSize='inherit' />
            </span>
          ) : (
            // <span className={classes.copyInfo}>Скопировано</span>
            <span className={classes.copyIcon}>
              <FaRegCopy fontSize='inherit' />
            </span>
          )}
        </span>
      </span>
    </CopyToClipboard>
  )
})
