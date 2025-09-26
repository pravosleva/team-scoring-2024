import { useState, useEffect, useRef } from 'react';
import { useMediaQuery } from './mantine-hooks-like';

const breakpoints = {
  DESKTOP: 1024,
}

export const useElementSizes = ({ ref }: { ref: HTMLDivElement | null }) => {
  const isMobile = useMediaQuery({
    query: `(max-width: ${breakpoints.DESKTOP - 1}px)`,
    getInitialValueInEffect: true,
    isUseLayoutEffect: true,
  });

  const [divWidth, setDivWidth] = useState(0);
  const [isDetected, setIsDetected] = useState(false);

  const [restoreCounter, setRestoreCounter] = useState(0);
  const incRestoreCounter = () => {
    setRestoreCounter((v) => v + 1);
  };
  const restoreTimer = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!ref) {
      if (restoreTimer.current) {
        clearTimeout(restoreTimer.current);
        restoreTimer.current = undefined;
      }
      restoreTimer.current = setTimeout(
        incRestoreCounter,
        1000,
      );
      return;
    }
    if (restoreTimer.current) {
      clearTimeout(restoreTimer.current);
      restoreTimer.current = undefined;
    }

    const resizeObserver = new ResizeObserver((entries) => {
      // eslint-disable-next-line prefer-const
      for (let entry of entries) {
        setDivWidth(entry.contentRect.width);
        setIsDetected(true);
      }
    });

    resizeObserver.observe(ref);

    return () => {
      resizeObserver.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restoreCounter]); // Empty dependency array ensures observer is set up once

  return {
    width: divWidth,
    isDetected,
    targetElement: {
      isMobile: divWidth < breakpoints.DESKTOP - 1,
      isDesktop: divWidth >= breakpoints.DESKTOP - 1,
    },
    externalWindow: {
      isMobile,
      isDesktop: !isMobile,
    },
  };
};
