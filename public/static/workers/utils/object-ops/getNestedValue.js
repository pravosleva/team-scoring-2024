/**
 * Получение значения поля произвольной вложенности в объекте
 *
 * @param {{ obj: any; path: string; }} param0 
 * @param {*} param0.obj Целевой объект
 * @param {string} param0.path Путь до поля
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
