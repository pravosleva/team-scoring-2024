/**
 * Получение значения поля произвольной вложенности в объекте
 *
 * @param {Object} arg For example: { obj: unknown; path: string; }
 * @param {*} arg.obj Целевой объект
 * @param {string} arg.path Путь до поля
 * @returns {unknown} Значение поля
 */
const getNestedValue = ({ obj, path }) => {
  const arr = path.split(/[.[]['"]?/)
  let o = obj;
  while (arr.length && o) {
    o = o[arr.shift().replace(/['"]?]$/, '')]
  }
  return o
}
