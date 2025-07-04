import { memo } from 'react'
import clsx from 'clsx'
import baseClasses from '~/App.module.scss'
import classes from './FixedBackToNodeBtn.module.scss'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'

type TProps = {
  isRequired: boolean;
  onClick: () => void;
  label?: string;
}

export const FixedBackToNodeBtn = memo(({ isRequired, onClick, label }: TProps) => {
  return (
    <>
      {typeof window !== 'undefined' && (
        <div
          onClick={onClick}
          className={clsx(
            classes.wrapper,
            classes.fixed,
            // baseClasses.backdropBlurLite,
            {
              [classes.isRequired]: isRequired,
            },
            baseClasses.truncate,
          )}
        >
          {
            !!label
              ? (
                <span className={baseClasses.truncate}>{label}</span>
              )
              : (
                <KeyboardArrowUpIcon htmlColor='#FFF' />
              )
          }
        </div>
      )}
    </>
  )
})
