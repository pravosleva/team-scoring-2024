// NOTE: Special for @jammar

const delayedCall = (
  fn,
  delay,
) => {
  let latestExecution = 0;

  return [
    function throttled(...args) {
      const now = performance.now();

      // Check if function has been called before
      if (latestExecution !== null) {
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