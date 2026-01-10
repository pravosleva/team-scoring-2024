export const delay = ({ ms, signal, onAbort }: { ms: number; signal?: AbortSignal; onAbort?: () => void; }): Promise<void> => new Promise((res, rej) => {
  if (signal?.aborted) {
    rej(new Error('Aborted'));
  }
  const timeoutId = setTimeout(res, ms);
  signal?.addEventListener('abort', () => {
    clearTimeout(timeoutId);
    if (typeof onAbort === 'function') onAbort();
    rej('Aborted');
  });
});
