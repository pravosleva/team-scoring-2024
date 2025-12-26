/* eslint-disable @typescript-eslint/no-namespace */
import { useMemo, memo } from 'react'

// Основная функция для подсветки совпадений
const HighlightMatches = ({ text, searchWords }: { text: string, searchWords: string[] }) => {
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
  const html = text.replace(regex, `<b class="highlighted-inline-code">$&</b>`)

  return (
    <span dangerouslySetInnerHTML={{ __html: html }} />
  )
}

namespace NSHighlighedText {
  export interface IProps {
    comparedValue: string;
    style?: React.CSSProperties;
    testedValue: string;
  }
}

// React компонент для подсветки текста
export const HighlightedText = memo(({ comparedValue: text, testedValue: searchQuery, style }: NSHighlighedText.IProps) => {
  // Разбиваем поисковый запрос на слова
  const searchWords = useMemo(() => searchQuery ? searchQuery.split(/\s+/) : [], [searchQuery])
  const highlightedText = useMemo(() => HighlightMatches({ text, searchWords }), [text, searchWords])

  return <span style={style}>{highlightedText}</span>;
})
