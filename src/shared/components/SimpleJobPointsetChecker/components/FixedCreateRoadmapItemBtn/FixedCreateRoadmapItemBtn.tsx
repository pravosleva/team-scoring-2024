import { memo } from 'react'
import clsx from 'clsx'
import baseClasses from '~/App.module.scss'
import classes from './FixedCreateRoadmapItemBtn.module.scss'
// import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import AddRoadIcon from '@mui/icons-material/AddRoad'

type TProps = {
  isRequired: boolean;
  onClick: () => void;
  label?: string;
}

export const FixedCreateRoadmapItemBtn = memo(({ isRequired, onClick, label }: TProps) => {
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
                <AddRoadIcon htmlColor='inherit' />
              )
          }
        </div>
      )}
    </>
  )
})
