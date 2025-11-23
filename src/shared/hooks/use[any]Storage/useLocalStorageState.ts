import { useCallback, useState } from 'react'
import { localStorageWrapper } from './utils/storage'
import { useLatest } from './utils/useLatest'

type AnyFunction = (...args: unknown[]) => unknown;

function isFunction(val: unknown): val is AnyFunction {
  return typeof val === "function";
}

/**
 * Local Storage ops React hook
 * 
 * @source Abstraction for Local Storage usage
 *
 * @export
 * @template T 
 * @param {Object} arg 
 * @param {string} arg.key Key
 * @param {T|Function} arg.initialValue Initial value
 * @param {boolean} arg.isReadOnly 
 * @returns {*} 
 */
export function useLocalStorageState<T>({
  key, initialValue, isReadOnly,
}: {
  key: string,
  initialValue: T | (() => T);
  isReadOnly?: boolean;
}) {
  const [value, setValue] = useState(() => {
    const savedValue = localStorageWrapper.get<T>(key);

    if (typeof savedValue !== "undefined") {
      return savedValue;
    } else if (typeof initialValue !== 'function' && !isReadOnly) {
      localStorageWrapper.set(key, initialValue)
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

      if (!isReadOnly)
        localStorageWrapper.set(key, actualValue)
      else
        throw new Error(`LS FIELD READ ONLY in hook! ${key}`)
    },
    [key, latestValue, isReadOnly]
  );

  return [value, updateValue] as const;
}
