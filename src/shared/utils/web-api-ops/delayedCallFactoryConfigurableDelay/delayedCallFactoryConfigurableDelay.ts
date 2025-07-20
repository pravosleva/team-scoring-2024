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
  stopPrevious?: boolean;
}) => void] => {
  let latestExecution: undefined | number = undefined;
  let timeout: NodeJS.Timeout | undefined = undefined

  return [
    (...args: A) => ({ delay, stopPrevious }) => {
      const now = performance.now()

      switch (true) {
        case stopPrevious:
          // NOTE: 3 Stop previous (new case)
          console.warn('note:3')
          console.log('(timeout cleared)')
          if (typeof timeout === 'number') {
            clearTimeout(timeout)
            timeout = undefined
          }
          break
        default:
          // NOTE: 2. Check if function has been called before
          if (typeof latestExecution === 'number') {
            // Check if next allowable function call is in the future
            const nextExecution = latestExecution + (!!delay ? delay.before : delayByDefault);

            if (nextExecution > now) {
              // Next allowed call is in the future,
              // so queue it up and advance latestExecution
              latestExecution = nextExecution
              setTimeout(() => fn(...args), nextExecution - now)
              console.warn('note:2.0')
              console.log('returned (timeout set)')
              if (!!delay) latestExecution += delay.after
              console.log(`latestExecution +${delay?.after || 0}`)
              console.log('return')

              return
            }
            else {
              if (typeof timeout === 'number') {
                // clearTimeout(timeout)
                // timeout = undefined
                // latestExecution = nextExecution
                // timeout = setTimeout(() => fn(...args), nextExecution - now)
                console.warn('note:2.1 (timeout was set)')
                console.log('nextExecution long time ago (will be called new)')
              } else {
                console.warn('note:2.2')
                console.log('nextExecution long time ago (will be called new)')
              }
            }
          } else {
            console.warn('note:2.3')
            console.log('First call...')
          }
          break
      }

      // NOTE: 1. At this point, either the function has never been called before,
      // or the next allowed function call is in the past/present.
      // So, call it right away.
      latestExecution = now + (delay?.after || 0)
      fn(...args)
    },
  ]
}
