/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Throttle
 * 
 * Функция возвращает абстракцию с настраиваемым таймером отмены лишних последующих вызовов
 *
 * @template R 
 * @template {any[]} A 
 * @param {(...args: A) => R} fn 
 * @param {number} delay Значение задержки (ms)
 * @returns {Function[]} Массив функций: [0] Целевая, [1] WIP, [2] Отмена ожидания
 */
export const throttleFactory = <R, A extends any[]>(
  fn: (...args: A) => R,
  delay: number
): [(...args: A) => R | undefined, () => void, () => void] => {
  let wait = false;
  let timeout: undefined | number;
  let cancelled = false;

  function resetWait() {
    wait = false;
  }

  return [
    (...args: A) => {
      console.log('-- [throttle] called')
      if (cancelled) {
        console.log('-- [throttle] cancelled.')
        return undefined;
      }
      if (wait) {
        console.log('-- [throttle] wait...')
        return undefined;
      }
      console.log('-- [throttle] run...')

      const val = fn(...args);

      wait = true;

      timeout = window.setTimeout(resetWait, delay);

      return val;
    },
    () => {
      cancelled = true;
      clearTimeout(timeout);
    },
    () => {
      clearTimeout(timeout);
      resetWait();
    },
  ];
};