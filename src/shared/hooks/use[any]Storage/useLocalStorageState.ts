import { useCallback, useState } from 'react'
import { localStorageWrapper } from './utils/storage'
import { useLatest } from './utils/useLatest'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFunction = (...args: any[]) => any;

function isFunction(val: unknown): val is AnyFunction {
  return typeof val === "function";
}

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
