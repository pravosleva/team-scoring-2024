import { memo } from 'react'
import clsx from 'clsx'
import baseClasses from '~/App.module.scss'
import classes from './FixedBackToPointsetBtn.module.scss'
// import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import EditRoadIcon from '@mui/icons-material/EditRoad'

type TProps = {
  isRequired: boolean;
  onClick: () => void;
  label?: string;
}

export const FixedBackToPointsetBtn = memo(({ isRequired, onClick, label }: TProps) => {
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
            baseClasses.backdropBlurSuperLite,
          )}
        >
          {
            !!label
              ? (
                <span className={baseClasses.truncate}>{label}</span>
              )
              : (
                <EditRoadIcon htmlColor='inherit' />
              )
          }
        </div>
      )}
    </>
  )
})
