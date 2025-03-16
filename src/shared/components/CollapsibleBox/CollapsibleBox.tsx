import { useState, useCallback, memo } from 'react'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import classes from './CollapsibleBox.module.scss'
import clsx from 'clsx'
import baseClasses from '~/App.module.scss'

type TProps = {
  header: string;
  text: string | React.ReactNode;
}

export const CollapsibleBox = memo(({ header, text }: TProps) => {
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
        border: '2px solid inherit',
        padding: '12px 16px',
        transition: '0.2s all ease',
        borderRadius: isOpened ? '20px' : '28px',
        // color: textColor,
        // backgroundColor: bgColor,
        boxShadow: '0 2px 10px -2px rgba(0,0,0,0.3)',
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
        <div style={{ fontWeight: 'bold' }} className={baseClasses.truncate}>{header}</div>
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