import { memo, useMemo } from 'react'
import stc from 'string-to-color'
import invert from 'invert-color'
import styles from './UserAva.module.scss'
import { TopLevelContext } from '~/shared/xstate'

type TProps = {
  userId: number,
  size: number,
  // tooltipPlacement?: TPlacement,
}

export const UserAvaAutoDetected = memo(({ userId, size }: TProps) => {
  const users = TopLevelContext.useSelector((s) => s.context.users.items)
  const targetUser = useMemo(() => users.find((u) => u.id === userId), [userId, users])
  const shortNick = !!targetUser
    ? targetUser.displayName
      .split(' ')
      .filter((_w: string, i: number) => i < 2)
      .map((word: string) => (word || typeof word)[0].toUpperCase())
      .join('')
    : String(userId)
  const personalColor = stc(targetUser?.displayName || String(userId))

  const handleClick = () => {
    window.alert(targetUser?.displayName || 'User not found')
  }

  return (
    <>
      <span
        className={styles.avaWrapper}
        style={{ cursor: 'pointer' }}
        onClick={handleClick}
      >
        <span
          className={styles.ava}
          style={{
            borderRadius: '50%',
            width: `${size}px`,
            height: `${size}px`,
            display: 'inline-flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: personalColor,
            color: invert(personalColor), // invert(personalColor, true),
          }}
        >
          <span
          // style={{
          //   border: '1px solid red',
          //   textAlign: 'center',
          //   verticalAlign: 'center',
          // }}
          >{shortNick}</span>
        </span>
      </span>
    </>
  )
})
