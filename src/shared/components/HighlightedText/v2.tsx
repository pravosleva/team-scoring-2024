/* eslint-disable @typescript-eslint/no-namespace */
import clsx from 'clsx';
import { useMemo, memo } from 'react'
import { useParams } from 'react-router-dom';
// import { useSearchWidgetDataLayerContextStore } from '~/shared/xstate';

// Основная функция для подсветки совпадений
const HighlightMatches = ({ text, searchWords, isSpecial }: { text: string, searchWords: string[]; isSpecial: boolean }) => {
  if (!text || !searchWords || searchWords.length === 0) {
    return text;
  }

  // Фильтруем пустые слова и экранируем специальные символы
  const filteredWords = searchWords
    .filter(word => word.trim().length > 0)
    .map(word => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))

  if (filteredWords.length === 0) {
    return <span>{text}</span>
  }

  // Создаем регулярное выражение для поиска целых слов
  const regex = new RegExp(`(${filteredWords.join('|')})`, 'gi')
  const html = text.replace(regex, `<b class="${clsx('highlighted-inline-code', isSpecial ? 'highlighted-inline-code--special' : 'highlighted-inline-code--simple')}">$&</b>`)

  return (
    <span dangerouslySetInnerHTML={{ __html: html }} />
  )
}

namespace NSHighlighedText {
  export interface IProps {
    comparedValue: string;
    style?: React.CSSProperties;
    testedValue: string;
    className?: string;
  }
}

// React компонент для подсветки текста
export const HighlightedText = memo(({ comparedValue: text, testedValue: searchQuery, style, className }: NSHighlighedText.IProps) => {
  // const [searchValueBasic] = useSearchWidgetDataLayerContextStore((s) => s.searchValueBasic)
  // const [searchValueEnhanced] = useSearchWidgetDataLayerContextStore((s) => s.searchValueEnhanced)

  // Разбиваем поисковый запрос на слова
  const searchWords = useMemo(() => searchQuery ? searchQuery.split(/\s+/) : [], [searchQuery])
  const params = useParams()
  const isSpecificSearchMode = useMemo(() => !!params.job_id || !!params.job_ids || !!params.log_ts, [params.job_id, params.job_ids, params.log_ts])

  const highlightedText = useMemo(() => HighlightMatches({ text, searchWords, isSpecial: isSpecificSearchMode }), [text, searchWords, isSpecificSearchMode])

  return <span style={style} className={className}>{highlightedText}</span>;
})
