import { useRef, memo, useEffect } from 'react'
import { useScrollPosition, IWindowDims } from '~/shared/hooks/useScrollPosition'
import clsx from 'clsx'
import classes from './FixedScrollTopBtn.module.scss'
import { scrollTop, scrollTopExtra } from '~/shared/components/Layout/utils'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import { useSearchParams } from 'react-router-dom'
import baseClasses from '~/App.module.scss'

export const FixedScrollTopBtn = memo(() => {
  const [, isMoreThan2Screens]: [IWindowDims, boolean] = useScrollPosition()
  const ref = useRef<HTMLDivElement>(null)
  const handleClick = () => scrollTop()

  const [urlSearchParams] = useSearchParams()
  useEffect(() => {
    scrollTopExtra()

    const jobIdToScroll = urlSearchParams.get('lastSeenJob')
    const logKeyToScroll = urlSearchParams.get('lastSeenLogKey')
    switch (true) {
      case !!logKeyToScroll:
        setTimeout(() => {
          const targetElm = document.getElementById(`log_list_item_${logKeyToScroll}`)
          if (!!targetElm) {
            targetElm.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
        }, 0)
        break
      case !!jobIdToScroll:
        setTimeout(() => {
          const targetElm = document.getElementById(`job_list_item_${jobIdToScroll}`)
          if (!!targetElm) {
            console.log(targetElm)
            targetElm.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
        }, 0)
        break
      default:
        break
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, urlSearchParams])

  return (
    <>
      {typeof window !== 'undefined' && (
        <div
          ref={ref}
          onClick={handleClick}
          className={clsx(
            classes.wrapper,
            classes.fixed,
            // baseClasses.backdropBlurLite,
            baseClasses.backdropBlurSuperLite,
            {
              [classes.isRequired]: isMoreThan2Screens,
            }
          )}
        >
          <KeyboardArrowUpIcon color='primary' />
        </div>
      )}
    </>
  )
})
