const getNormalizedWords = (words) =>
  words.join(' ').replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')

// NOTE: v1. Совпадение по всем словам
const getMatchedByAllStrings = ({
  tested, // string;
  expected, // string[];
}) => {
  const modifiedWords = getNormalizedWords(expected)
  // Split your string at spaces & Encapsulate your words inside regex groups:
  const regexpGroups = modifiedWords.split(' ').map((w) => ['(?=.*' + w + ')'])
  // Create a regex pattern:
  const regexp = new RegExp('^' + regexpGroups.join('') + '.*$', 'im')

  return regexp.test(tested)
}
