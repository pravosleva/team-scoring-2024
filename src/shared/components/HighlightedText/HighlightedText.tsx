/* eslint-disable @typescript-eslint/no-namespace */
import { useMemo } from 'react'
import baseClasses from '~/App.module.scss'

namespace NSHighlighedText {
  export interface IProps {
    // inputValueRegExp: RegExp;
    comparedValue: string;
    style?: React.CSSProperties;
    testedValue: string;
  }
}

const getEscapedRegExpChars = (string: string): string => {
  return string
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]')
    .replace(/\*/g, '\\*')
    .replace(/\+/g, '\\+')
    .replace(/\./g, '\\.')
    .replace(/\$/g, '\\$')
    .replace(/\^/g, '\\^')
    .replace(/\?/g, '\\?')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}')
}

export const HighlightedText: React.FC<NSHighlighedText.IProps> = ({ comparedValue, testedValue, style }) => {
  const inputValueRegExp = useMemo(() => new RegExp(`^(.*?)(${getEscapedRegExpChars(testedValue)})(.*)$`, 'i'), [testedValue])
  const match = comparedValue.match(inputValueRegExp)

  return (
    <span style={style}>
      {match && match.length > 0 ? (
        <span>
          {match[1]}
          <b className={baseClasses.inlineCodeHighlighted}>{match[2]}</b>
          {match[3]}
        </span>
      ) : (
        <span>{comparedValue}</span>
      )}
    </span>
  )
}
