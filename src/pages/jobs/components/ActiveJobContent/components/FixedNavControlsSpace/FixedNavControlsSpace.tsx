import { memo } from 'react'
import clsx from 'clsx'
import baseClasses from '~/App.module.scss'
import classes from './FixedNavControlsSpace.module.scss'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'

type TProps = {
  isRequired: boolean;
  onClick: () => void;
  label?: string;
}

export const FixedNavControlsSpace = memo(({ isRequired, onClick, label }: TProps) => {
  return (
    <>
      {typeof window !== 'undefined' && (
        <div
          onClick={onClick}
          className={clsx(
            classes.fadeIn,
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
