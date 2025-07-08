/* eslint-disable @typescript-eslint/no-explicit-any */

// NOTE: See also https://stackoverflow.com/a/76915071/30637683

export const delayedCallFactoryConfigurableDelay = <R, A extends any[]>(
  fn: (...args: A) => R,
  delayByDefault: number
): [(...args: A) => (ps: {
  delay?: {
    before: number;
    after: number;
  };
}) => void] => {
  let latestExecution: undefined | number = undefined;

  return [
    (...args: A) => ({ delay }) => {
      const now = performance.now()

      // NOTE: 2. Check if function has been called before
      if (typeof latestExecution === 'number') {
        // Check if next allowable function call is in the future
        const nextExecution = latestExecution + (!!delay ? delay.before : delayByDefault);

        if (nextExecution > now) {
          // Next allowed call is in the future,
          // so queue it up and advance latestExecution
          latestExecution = nextExecution;
          setTimeout(() => fn(...args), nextExecution - now)
          if (!!delay) latestExecution += delay.after

          return
        }
      }

      // NOTE: 1. At this point, either the function has never been called before,
      // or the next allowed function call is in the past/present.
      // So, call it right away.
      latestExecution = now + (delay?.after || 0)
      fn(...args)
    },
  ]
}
