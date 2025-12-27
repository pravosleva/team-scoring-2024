/* eslint-disable @typescript-eslint/ban-ts-comment */

/**
 * Получение значения поля произвольной вложенности в объекте
 * 
 * @source Get object prop value by path
 *
 * @param {object} arg Argument
 * @param {object} arg.source Целевой объект
 * @param {string} arg.path Путь до поля
 * @returns {unknown} Значение поля
 */
export const getNestedValue = <T>({ source, path }: {
  source: T;
  path: string;
}) => {
  const arr = path.split(/[.[]['"]?/)
  let o = source;
  // @ts-ignore
  while (arr.length && o) o = o[arr.shift().replace(/['"]?]$/, '')]
  return o
}
