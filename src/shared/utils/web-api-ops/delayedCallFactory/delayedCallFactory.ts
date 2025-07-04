/* eslint-disable @typescript-eslint/no-explicit-any */

// NOTE: See also https://stackoverflow.com/a/76915071/30637683

export const delayedCallFactory = <R, A extends any[]>(
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
