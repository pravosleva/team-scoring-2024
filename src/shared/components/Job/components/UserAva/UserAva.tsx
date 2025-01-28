import { memo } from 'react'
import stc from 'string-to-color'
import invert from 'invert-color'
import styles from './UserAva.module.scss'

type TProps = {
  name: string,
  size: number,
  // tooltipPlacement?: TPlacement,
}

export const UserAva = memo(({ name, size }: TProps) => {
  const shortNick = name.split(' ').filter((_w: string, i: number) => i < 2).map((word: string) => (word || typeof word)[0].toUpperCase()).join('')
  const personalColor = stc(name)

  return (
    <>
      <span className={styles.avaWrapper}>
        <span
          className={styles.ava}
          style={{
            borderRadius: '50%',
            width: `${size}px`,
            height: `${size}px`,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: personalColor,
            color: invert(personalColor), // invert(personalColor, true),
          }}
        >
          <span>{shortNick}</span>
        </span>
      </span>
    </>
  )
})
