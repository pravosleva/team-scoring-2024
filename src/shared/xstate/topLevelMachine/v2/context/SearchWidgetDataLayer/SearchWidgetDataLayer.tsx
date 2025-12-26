/* eslint-disable react-refresh/only-export-components */
import { memo, useEffect } from 'react'
// import { useParams } from 'react-router-dom';
import { useLocalStorageState } from '~/shared/hooks';
import { createFastContext, debugFactory } from '~/shared/utils'

type TState = {
  isWidgetOpened: boolean;
  searchValueBasic: string;
  searchValueEnhanced: string;
}
type TProps = {
  children: React.ReactNode;
}

const initialState = {
  isWidgetOpened: false,
  searchValueBasic: '',
  searchValueEnhanced: '',
}
export const SearchWidgetDataLayerContext = createFastContext<TState>(initialState)
const { Provider, useStore } = SearchWidgetDataLayerContext
const _logger = debugFactory<{ [key: string]: string | undefined } | null, { reason: string; } | null>({
  label: 'Search widget',
})

const Logic = ({ children }: TProps) => {
  // const params = useParams()
  const [, setStore] = useStore((s) => s)
  const [searchValueBasic] = useStore((s) => s.searchValueBasic)
  const [qBasicSearchLs, saveQBasicSearchLs] = useLocalStorageState<string | null>({
    key: 'teamScoring2024:q_basic_search',
    initialValue: null,
  })
  useEffect(() => {
    // typeof params.q_enhanced_search === 'string'
    // decodeURIComponent(params.q_enhanced_search)
    setStore({ searchValueBasic: qBasicSearchLs || '' })
  }, [])
  useEffect(() => {
    saveQBasicSearchLs(searchValueBasic)
  }, [searchValueBasic, saveQBasicSearchLs])

  const [searchValueEnhanced] = useStore((s) => s.searchValueEnhanced)
  const [qEnhancedSearchLs, saveQEnhancedSearchLs] = useLocalStorageState<string | null>({
    key: 'teamScoring2024:q_enhanced_search',
    initialValue: null,
  })
  useEffect(() => {
    // typeof params.q_enhanced_search === 'string'
    // decodeURIComponent(params.q_enhanced_search)
    setStore({ searchValueEnhanced: qEnhancedSearchLs || '' })
  }, [])
  useEffect(() => {
    saveQEnhancedSearchLs(searchValueEnhanced)
  }, [searchValueEnhanced, saveQEnhancedSearchLs])

  // TODO: Get query param -> auto open?
  return (
    <>
      {children}
    </>
  )
}

export const SearchWidgetDataLayer = memo(({ children }: TProps) => {
  return (
    <Provider>
      <Logic>
        {children}
      </Logic>
    </Provider>
  )
})

export const useSearchWidgetDataLayerContextStore = useStore
