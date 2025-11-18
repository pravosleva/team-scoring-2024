/**
 * Проверка соответствия тестируемой строки на предмет содержания хотябы одному из ожидаемых вариантов.
 * 
 * Внешние зависимости:
 * - getMatchedByRegExp({ tested, regexp })
 *
 * @param {*} arg Объект
 * @param {string} arg.tested 
 * @param {string[]} arg.expected 
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
