import { useState, useCallback, memo } from 'react'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import classes from './CollapsibleBox.module.scss'
import clsx from 'clsx'
import baseClasses from '~/App.module.scss'
import { TUiConnectVariant } from './types'
import { getStylesByUiConnectVariant } from './getStylesByUiConnectVariant'

type TProps = {
  header: string;
  text: string | React.ReactNode;
  connectedOnThe?: TUiConnectVariant[];
}

export const CollapsibleBox = memo(({ header, text, connectedOnThe }: TProps) => {
  const [isOpened, setIsOpened] = useState(false)
  const handleToggle = useCallback(() => {
    setIsOpened((s) => !s)
  }, [setIsOpened])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        // border: '2px solid inherit',
        padding: '12px 16px',
        transition: '0.2s all ease',
        borderRadius: isOpened
          ? getStylesByUiConnectVariant({ codes: connectedOnThe }).output.opened.border.radius
          : getStylesByUiConnectVariant({ codes: connectedOnThe }).output.collapsed.border.radius,
        // color: textColor,
        // backgroundColor: bgColor,
        // boxShadow: '0 2px 10px -2px rgba(0,0,0,0.3)',
        // border: '2px solid lightgray',
        borderWidth: isOpened
          ? getStylesByUiConnectVariant({ codes: connectedOnThe }).output.opened.border.width
          : getStylesByUiConnectVariant({ codes: connectedOnThe }).output.collapsed.border.width,
        borderStyle: isOpened
          ? getStylesByUiConnectVariant({ codes: connectedOnThe }).output.opened.border.style
          : getStylesByUiConnectVariant({ codes: connectedOnThe }).output.collapsed.border.style,
        borderColor: isOpened
          ? getStylesByUiConnectVariant({ codes: connectedOnThe }).output.opened.border.color
          : getStylesByUiConnectVariant({ codes: connectedOnThe }).output.collapsed.border.color,

        // marginBottom: '20px',

        cursor: 'pointer',
        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
      }}
      onClick={handleToggle}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'nowrap',
          alignItems: 'center',
          gap: '16px',
        }}
        className={classes.collapsible}
      >
        {/* <input id={togglerSlug} type='checkbox' style={{ border: '1px solid red' }} />
        <label style={{ fontWeight: 'bold' }} htmlFor={togglerSlug}>{header}</label> */}
        <div style={{ fontWeight: 'bold', fontSize: 'small' }} className={baseClasses.truncate}>{header}</div>
        <div
          style={{
            marginLeft: 'auto',
            border: '2px solid inherit',
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {
            isOpened
              ? <KeyboardArrowUpIcon fontSize='small' />
              : <KeyboardArrowDownIcon fontSize='small' />
          }
        </div>
      </div>
      
      {isOpened && (
        <div
          className={clsx(classes.noMarginBottomForLastChild, classes.content)}
        >
          {text}
        </div>
      )}
    </div>
  )
})