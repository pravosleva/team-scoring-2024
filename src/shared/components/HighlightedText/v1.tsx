/* eslint-disable @typescript-eslint/no-namespace */
import { useMemo, useEffect } from 'react'
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
  const words = useMemo(() => getEscapedRegExpChars(testedValue).split(' '), [testedValue])
  useEffect(() => {
    console.log('---')
    console.log(words)

    // const results = []

    // const regex = new RegExp(`\\[${expectedKey}=(?<value>\\d+)\\]`, 'g');

    // const regexp = new RegExp(`^(.*?)(${words.join('|')})(.*)$`, 'g')
    const regexp = new RegExp(`${words.join('|')}`, 'g')
    for (let i = 0, max = words.length; i < max; i++) {
      const t = words[i]

      for (const n of t.matchAll(regexp)) {
        console.log(n.groups)
      }
    }

    // console.log(results);

    console.log('---')
  }, [words])

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
