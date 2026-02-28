import { PropsWithChildren, memo } from 'react'
import { useLocalStorageState } from '~/shared/hooks';
import { createFastContext } from '~/shared/utils'

export type TIDBSwitchers = {
  [key: string]: {
    on: 0 | 1;
  }
}
const initialState: TIDBSwitchers = {}

export const IDBSwitchersContext = createFastContext<TIDBSwitchers>(initialState)

const Logic = memo(({ children }: PropsWithChildren<unknown>) => {
  const [_idbSwitchersLSState] = useLocalStorageState<TIDBSwitchers>({
    key: 'teamScoring2024:idb-switchers',
    initialValue: {},
    isReadOnly: false,
  })

  return (
    <>
      {children}
    </>
  )
})

export const IDBSwitchersLayer = (ps: PropsWithChildren<unknown>) => {
  return (
    <IDBSwitchersContext.Provider>
      <Logic {...ps} />
    </IDBSwitchersContext.Provider>
  )
}