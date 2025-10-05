import { memo, useState } from 'react'
import baseClasses from '~/App.module.scss'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
// import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandCircleDownIcon from '@mui/icons-material/ExpandCircleDown'

type TProps = {
  briefText: React.ReactNode | string;
  isOpenedByDefault?: boolean;
  targetText?: string;
  contentRender: (ps: Pick<TProps, 'briefText' | 'targetText'>) => React.ReactNode;
  isClickableBrief?: boolean;
}

export const CollapsibleText = memo(({
  isOpenedByDefault,
  briefText,
  targetText,
  contentRender,
  isClickableBrief,
}: TProps) => {
  const [isDescrOpened, setIsDescrOpened] = useState(isOpenedByDefault)
  const descrToggle = () => setIsDescrOpened((v) => !v)

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        fontSize: 'small',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '6px',
        }}
        onClick={isClickableBrief ? descrToggle : undefined}
      >
        <div
          className={baseClasses.truncate}
          style={{
            fontWeight: 'bold',
            textDecoration: isClickableBrief ? 'underline dashed' : 'none'
          }}
        >
          {briefText}
        </div>
        <code
          className={baseClasses.noBreakWords}
          onClick={!isClickableBrief ? descrToggle : undefined}
          style={{
            cursor: 'pointer',
            fontSize: 'x-small',
            fontWeight: 'bold',
            display: 'inline-flex',
            flexDirection: 'row',
            gap: '5px',
            alignItems: 'center',
            // border: '1px solid red'
          }}
        >
          {/* <span>[</span> */}
          {
            isDescrOpened
              ? (
                <ExpandLessIcon sx={{ fontSize: '20px' }} />
              )
              : (
                <ExpandCircleDownIcon sx={{ fontSize: '20px' }} />
              )
          }
          {/* <span>]</span> */}
        </code>
      </div>
      {
        isDescrOpened && (
          <>
            {
              contentRender({ briefText, targetText })
            }
          </>
        )
      }
    </div>
  )
})