import { memo } from 'react'
import classes from './SimpleCheckList.module.scss'
import { TLogChecklistItem } from '~/shared/xstate';

type TProps = {
  items: TLogChecklistItem[];
}

export const SimpleCheckList = memo((_ps: TProps) => {
  return (
    <div className={classes.wrapper}>
      <div className={classes.itemWrapper}>
        WIP: SimpleCheckList component
      </div>
      <div className={classes.itemWrapper}>
        Item
      </div>
      <div className={classes.itemWrapper}>
        Add btn
      </div>
    </div>
  )
})
