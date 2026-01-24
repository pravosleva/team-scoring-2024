import { PropsWithChildren, memo, useMemo, useEffect } from 'react'
// import { useLocation } from 'react-router-dom';
import { useLocalStorageState } from '~/shared/hooks';
import { createFastContext } from '~/shared/utils'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import jsonSize from 'json-size'
import { getHumanReadableSize } from '~/shared/utils/number-ops';
import { TIDBInfo, idbInstance } from '~/shared/utils/indexed-db-ops';

const APP_VERSION = import.meta.env.VITE_APP_VERSION || 'No VITE_APP_VERSION'
const BRAND_NAME = import.meta.env.VITE_BRAND_NAME || 'No VITE_BRAND_NAME'
const GIT_SHA1 = import.meta.env.VITE_GIT_SHA1 || 'No Git VITE_GIT_SHA1'
const GIT_BRANCH_NAME = import.meta.env.VITE_GIT_BRANCH_NAME || 'No VITE_GIT_BRANCH_NAME'

type TStore = {
  appVersion: string;
  brandName: string;
  createdYear: number;
  currentYear: number;
  gitSHA1: string;
  gitBranchName: string;
  isCreactedCurrentYear: boolean;
  ls: {
    sizeInfo: string | null;
  };
  idb: TIDBInfo | null;
}
const initialState: TStore = {
  appVersion: APP_VERSION,
  brandName: BRAND_NAME,
  createdYear: 2019,
  currentYear: new Date().getFullYear(),
  gitSHA1: GIT_SHA1,
  gitBranchName: GIT_BRANCH_NAME,
  isCreactedCurrentYear: false,
  ls: {
    sizeInfo: null,
  },
  idb: null,
}

export const CommonInfoContext = createFastContext<TStore>(initialState)

export const Logic = memo(({ children }: PropsWithChildren<unknown>) => {
  const [createdYear, setCommonInfoContext] = CommonInfoContext.useStore((s) => s.createdYear)
  const [currentYear] = CommonInfoContext.useStore((s) => s.currentYear)
  // const location = useLocation()
  const isCreactedCurrentYear = useMemo(() => currentYear === createdYear, [createdYear, currentYear])

  useEffect(() => {
    setCommonInfoContext({ isCreactedCurrentYear })
  }, [isCreactedCurrentYear])

  const [fullMainLSState] = useLocalStorageState({
    key: 'teamScoring2024:topLevel',
    initialValue: null,
    isReadOnly: true,
  })
  useEffect(() => {
    setCommonInfoContext({
      ls: {
        sizeInfo: getHumanReadableSize({
          bytes: jsonSize(fullMainLSState),
          decimals: 2,
        }),
      }
    })
  }, [fullMainLSState])
  useEffect(() => {
    idbInstance.getAsyncSizeInfo()
      .then(({ result }) => setCommonInfoContext({ idb: result }))
      .catch(console.warn)
  }, [])

  return (
    <>
      {children}
    </>
  )
})

export const CommonInfoLayer = (ps: PropsWithChildren<unknown>) => {
  return (
    <CommonInfoContext.Provider>
      <Logic {...ps} />
    </CommonInfoContext.Provider>
  )
}