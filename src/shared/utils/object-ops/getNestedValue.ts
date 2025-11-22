/* eslint-disable @typescript-eslint/ban-ts-comment */

/**
 * Получение значения поля произвольной вложенности в объекте
 *
 * @param {Object} arg For example: { obj: unknown; path: string; }
 * @param {*} arg.obj Целевой объект
 * @param {string} arg.path Путь до поля
 * @returns {unknown} Значение поля
 */
export const getNestedValue = <T>({ obj, path }: {
  obj: T;
  path: string;
}) => {
  const arr = path.split(/[.[]['"]?/)
  let o = obj;
  // @ts-ignore
  while (arr.length && o) o = o[arr.shift().replace(/['"]?]$/, '')]
  return o
}
