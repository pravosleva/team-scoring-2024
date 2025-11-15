/**
 * Проверка соответствия тестируемой строки на предмет содержания хотябы одному из ожидаемых вариантов.
 * 
 * Внешние зависимости:
 * - getMatchedByRegExp({ tested, regexp })
 *
 * @param {{ tested: string; expected: string[]; }} param0 
 * @param {string} param0.tested 
 * @param {string[]} param0.expected 
 * @returns {boolean}
 */
const getMatchedByAnyString = ({
  tested, // string;
  expected, // string[];
}) => {
  const modifiedWords = expected
    .join(' ')
    .replace(/[-\\^$*+?.()|[\]{}]/g, '\\$&');
  // console.log(`modifiedWords: ${expected.join(',')} -> ${modifiedWords}`);
  const regexpGroups = modifiedWords
    .split(' ')
    .map((w) => [`(?=.*${w})`]);
  const regexp = new RegExp(`^${regexpGroups.join('|')}.*$`, 'im');
  return getMatchedByRegExp({
    tested, regexp
  });
};
