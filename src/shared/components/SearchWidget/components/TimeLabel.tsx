import { memo } from 'react'
import dayjs from 'dayjs'
import __TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en'
import ru from 'javascript-time-ago/locale/ru'
import clsx from 'clsx'
import baseClasses from '~/App.module.scss'

__TimeAgo.addDefaultLocale(en)
__TimeAgo.addLocale(ru)

const timeAgo = new __TimeAgo('en-US')

type TProps = { ts: number; showTimeAgo: boolean }

export const TimeLabel = memo(({ ts, showTimeAgo }: TProps) => {
  return (
    <span
      style={{
        color: '#959eaa',
        // whiteSpace: 'pre-wrap',
        fontSize: 'x-small',
        fontWeight: 'bold',
        display: 'flex',
        flexDirection: 'row',
        gap: '6px',
        alignItems: 'center',
        // justifyContent: 'space-between',
      }}
    >
      <span
        style={{
          color: '#FFF',
          borderRadius: '16px',
          padding: '1px 6px',
          // backgroundColor: 'black',
          lineHeight: '16px',
        }}
        className={clsx(baseClasses.backdropBlurDark)}
      >
        {dayjs(ts).format('DD.MM.YYYY HH:mm')}
      </span>
      {
        showTimeAgo && (
          <span>({timeAgo.format(ts)})</span>
        )
      }
    </span>
  )
})
