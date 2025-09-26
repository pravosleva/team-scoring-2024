/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  useState, useEffect, useRef, useLayoutEffect
} from 'react';

export interface UseMediaQueryOptions {
  getInitialValueInEffect: boolean;
  isUseLayoutEffect: boolean;
}

type MediaQueryCallback = (event: { matches: boolean; media: string }) => void;

function attachMediaListener(query: MediaQueryList, callback: MediaQueryCallback) {
  try {
    query.addEventListener('change', callback);
    return () => query.removeEventListener('change', callback);
  } catch (e: any) {
    query.addListener(callback);
    return () => query.removeListener(callback);
  }
}

function getInitialValue({
  query,
  initialValue,
}: {
  query: string;
  initialValue?: boolean;
}) {
  if (typeof initialValue === 'boolean') {
    return initialValue;
  }

  if (typeof window !== 'undefined' && 'matchMedia' in window) {
    return window.matchMedia(query).matches;
  }

  return false;
}

export function useMediaQuery({
  initialValue,
  query,
  getInitialValueInEffect = true,
  isUseLayoutEffect = false,
  // ref,
}: {
  // ref: HTMLDivElement;
  query: string;
  initialValue?: boolean;
} & UseMediaQueryOptions) {
  const [matches, setMatches] = useState(getInitialValueInEffect ? initialValue : getInitialValue({
    query, initialValue
  }));
  const queryRef = useRef<MediaQueryList>();

  const effectHook = isUseLayoutEffect ? useLayoutEffect : useEffect;

  effectHook(() => {
    if ('matchMedia' in window) {
      queryRef.current = window.matchMedia(query);
      setMatches(queryRef.current.matches);
      return attachMediaListener(queryRef.current, (event) => setMatches(event.matches));
    }

    return undefined;
  }, [query]);

  return matches;
}