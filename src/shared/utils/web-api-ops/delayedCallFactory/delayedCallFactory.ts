/**
 * Простой отложенный вызов.
 * Это превращает существующую функцию в её ограниченную версию.
 * Она не использует очередь, а вместо этого планирует вызовы функции через setTimeout, если они происходят слишком часто.
 * See also {@link https://stackoverflow.com/a/76915071/30637683 stackoverflow}
 *
 * @template R 
 * @template {unknown[]} A Аргументы для вызова
 * @param {Function} fn Целевая функция
 * @param {number} delay Задержка в миллисекундах
 * @returns {Function[]} Массив функций
 */
export const delayedCallFactory = <R, A extends unknown[]>(
  fn: (...args: A) => R,
  delay: number
): [(...args: A) => void] => {
  let latestExecution: undefined | number = undefined;

  return [
    function throttled(...args: A) {
      const now = performance.now();

      // Check if function has been called before
      if (typeof latestExecution === 'number') {
        // Check if next allowable function call is in the future
        const nextExecution = latestExecution + delay;

        if (nextExecution > now) {
          // Next allowed call is in the future,
          // so queue it up and advance latestExecution
          latestExecution = nextExecution;
          setTimeout(() => fn(...args), nextExecution - now);

          return;
        }
      }

      // At this point, either the function has never been called before,
      // or the next allowed function call is in the past/present.
      // So, call it right away.
      latestExecution = now;
      fn(...args);
    },
  ]
}
