import { useCallback, useState } from 'react'
import { sessionStorageWrapper } from './utils/storage'
import { useLatest } from './utils/useLatest'

type AnyFunction = (...args: unknown[]) => unknown;

function isFunction(val: unknown): val is AnyFunction {
  return typeof val === "function";
}

/**
 * Session Storage ops React hook
 * 
 * @source Abstraction for Session Storage usage
 *
 * @export
 * @template T 
 * @param {Object} arg 
 * @param {string} arg.key Key
 * @param {T|Function} arg.initialValue Initial value
 * @param {boolean} arg.isReadOnly 
 * @returns {*} 
 */
export function useSessionStorageState<T>({
  key, initialValue,
}: {
  key: string,
  initialValue: T | (() => T)
}) {
  const [value, setValue] = useState(() => {
    const savedValue = sessionStorageWrapper.get<T>(key);

    if (typeof savedValue !== "undefined") {
      return savedValue;
    }

    return isFunction(initialValue) ? initialValue() : initialValue;
  });

  const latestValue = useLatest(value);

  const updateValue = useCallback(
    (newValue: React.SetStateAction<T>) => {
      setValue(newValue);

      const actualValue = isFunction(newValue)
        ? newValue(latestValue.current)
        : newValue;

      sessionStorageWrapper.set(key, actualValue);
    },
    [key, latestValue]
  );

  return [value, updateValue] as const;
}
