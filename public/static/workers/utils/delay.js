const delay = ({ ms, signal, onAbort, customAbortMessage }) => new Promise((res, rej) => {
  if (signal?.aborted) {
    rej(new Error('Aborted'))
  }
  const timeoutId = setTimeout(res, ms)
  signal?.addEventListener('abort', () => {
    clearTimeout(timeoutId)
    if (typeof onAbort === 'function') {
      onAbort()
    }
    rej(new Error(customAbortMessage || 'Aborted (2)'))
  })
})
