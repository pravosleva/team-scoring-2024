export const getNormalizedWords = (words: string[]): string =>
  words.join(' ').replace(/[-\\/\\^$*+?.()|[\]{}]/g, '\\$&')

export const getNormalizedWordsArr = (words: string[]): string[] =>
  getNormalizedWords(words).replace(/:/g, '').split(' ')

// NOTE: v1. Совпадение по всем словам
export const getMatchedByAllStrings = ({ tested, expected }: { tested: string, expected: string[] }): boolean => {
  const modifiedWords = getNormalizedWords(expected)
  // Split your string at spaces & Encapsulate your words inside regex groups:
  const regexpGroups = modifiedWords.split(' ').map((w) => ['(?=.*' + w + ')'])
  // Create a regex pattern:
  const regexp = new RegExp('^' + regexpGroups.join('') + '.*$', 'im')

  return regexp.test(tested)
}
