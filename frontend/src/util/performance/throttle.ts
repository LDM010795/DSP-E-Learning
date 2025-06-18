/**
 * Throttling Utilities for Performance Optimization
 *
 * Provides utilities for throttling function calls to prevent excessive
 * execution of expensive operations like scroll handlers and API calls.
 */

export function throttle<T extends (...args: any[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function (this: ThisParameterType<T>, ...args: Parameters<T>): void {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;

      window.setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * React hook for throttling state updates
 *
 * @example
 * ```typescript
 * const [scrollY, setScrollY] = useState(0);
 * const throttledScrollY = useThrottle(scrollY, 100);
 *
 * useEffect(() => {
 *   const handleScroll = () => setScrollY(window.scrollY);
 *   window.addEventListener('scroll', handleScroll);
 *   return () => window.removeEventListener('scroll', handleScroll);
 * }, []);
 * ```
 */
import { useState, useEffect, useRef } from "react";

export function useThrottle<T>(value: T, limit: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastExecuted = useRef<number>(Date.now());

  useEffect(() => {
    const now = Date.now();
    const timeSinceLastExecution = now - lastExecuted.current;

    if (timeSinceLastExecution >= limit) {
      setThrottledValue(value);
      lastExecuted.current = now;
    } else {
      const timeoutId = setTimeout(() => {
        setThrottledValue(value);
        lastExecuted.current = Date.now();
      }, limit - timeSinceLastExecution);

      return () => clearTimeout(timeoutId);
    }
  }, [value, limit]);

  return throttledValue;
}
