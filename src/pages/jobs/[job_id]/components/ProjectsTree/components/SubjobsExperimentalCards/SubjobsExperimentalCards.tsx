import { CSSProperties, memo } from 'react'
import classes from './SubjobsExperimentalCards.module.scss'

const genericMemo: <T>(component: T) => T = memo

type TProps<T> = {
  wrapperStyles?: CSSProperties;
  items: T[];
  cardRenderer: (ps: { itemData: T }) => React.ReactNode;
  getItemKey: (itemData: T) => string;
}

function _SubjobsExperimentalCards<TItem>({
  wrapperStyles,
  items,
  cardRenderer,
  getItemKey,
}: TProps<TItem>) {
  return (
    <>
      {
        items.length > 0 && (
          <div
            style={wrapperStyles}
            className={classes.wrapper}
          >
            {
              items.map((item) => {
                return (
                  <div
                    className={classes.cardWrapper}
                    key={getItemKey(item)}

                  >
                    {cardRenderer({ itemData: item })}
                  </div>
                )
              })
            }
          </div>
        )
      }
    </>
  )
}

export const SubjobsExperimentalCards = genericMemo(_SubjobsExperimentalCards)
