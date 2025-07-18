import { memo, useState } from 'react'
import baseClasses from '~/App.module.scss'

type TProps = {
  briefText: string;
  isOpenedByDefault?: boolean;
  targetText?: string;
  contentRender: (ps: Pick<TProps, 'briefText' | 'targetText'>) => React.ReactNode;
}

export const CollapsibleText = memo(({
  isOpenedByDefault,
  briefText,
  targetText,
  contentRender,
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
      >
        <div
          className={baseClasses.truncate}
          style={{
            fontWeight: 'bold',
            textDecoration: 'underline dashed'
          }}
        >
          {briefText}
        </div>
        <code
          className={baseClasses.noBreakWords}
          style={{ cursor: 'pointer', fontSize: 'x-small', fontWeight: 'bold' }} onClick={descrToggle}
        >{isDescrOpened ? '[ close ]' : '[ open ]'}
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