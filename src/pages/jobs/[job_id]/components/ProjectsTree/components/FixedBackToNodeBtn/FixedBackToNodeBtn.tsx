import { memo } from 'react'
import clsx from 'clsx'
import baseClasses from '~/App.module.scss'
import classes from './FixedBackToNodeBtn.module.scss'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'

type TProps = {
  isRequired: boolean;
  onClick: () => void;
  label?: string;
  color: 'green' | 'primary' | 'red' | 'orange';
  position: 'right-center' | 'right-bottom';
  DefaultIcon?: React.ReactNode;
}

export const FixedBackToNodeBtn = memo(({ isRequired, onClick, label, color, position, DefaultIcon }: TProps) => {
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
            {
              [classes.green]: color === 'green',
              [classes.primary]: color === 'primary',
              [classes.red]: color === 'red',
              [classes.orange]: color === 'orange',

              [classes.rightCenter]: position === 'right-center',
              [classes.rightBottom]: position === 'right-bottom',
            }
          )}
        >
          {
            !!label
              ? (
                <span className={baseClasses.truncate}>{label}</span>
              )
              : (
                <>
                  {!!DefaultIcon ? <>{DefaultIcon}</> : <KeyboardArrowUpIcon htmlColor='#FFF' />}
                </>
              )
          }
        </div>
      )}
    </>
  )
})
