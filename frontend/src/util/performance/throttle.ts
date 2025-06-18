/**
 * Generic Throttle Utility for Performance Optimization
 *
 * Ensures a function is called at most once in a specified time period.
 * Perfect for scroll handlers, resize events, and API rate limiting.
 *
 * @example
 * ```typescript
 * const throttledScroll = throttle((event: Event) => {
 *   updateScrollPosition(event);
 * }, 100);
 *
 * window.addEventListener('scroll', throttledScroll);
 * ```
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ThrottledFunction<T extends (...args: any[]) => any> = (
  ...args: Parameters<T>
) => void;

interface ThrottledWithCancel<T extends (...args: any[]) => any>
  extends ThrottledFunction<T> {
  cancel: () => void;
  flush: () => void;
}

/**
 * Creates a throttled version of the provided function
 *
 * @param func - Function to throttle
 * @param limit - Time limit in milliseconds
 * @param trailing - Execute on trailing edge (default: true)
 * @returns Throttled function with cancel and flush methods
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number,
  trailing = true
): ThrottledWithCancel<T> {
  let inThrottle: boolean = false;
  let lastArgs: Parameters<T> | null = null;
  let lastCallTime: number = 0;
  let timeoutId: NodeJS.Timeout | null = null;

  const throttledFunction = (...args: Parameters<T>): void => {
    const now = Date.now();
    lastArgs = args;

    if (!inThrottle) {
      // First call or after cooldown
      func(...args);
      lastCallTime = now;
      inThrottle = true;

      // Set cooldown timer
      setTimeout(() => {
        inThrottle = false;

        // Execute trailing call if enabled and there was a call during throttle
        if (trailing && lastArgs && Date.now() - lastCallTime >= limit) {
          func(...lastArgs);
          lastCallTime = Date.now();
        }
      }, limit);
    } else if (trailing) {
      // Schedule trailing execution
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        if (lastArgs) {
          func(...lastArgs);
          lastCallTime = Date.now();
        }
        timeoutId = null;
      }, limit - (now - lastCallTime));
    }
  };

  // Cancel pending execution
  throttledFunction.cancel = (): void => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    inThrottle = false;
    lastArgs = null;
    lastCallTime = 0;
  };

  // Execute immediately with last arguments
  throttledFunction.flush = (): void => {
    if (lastArgs && !inThrottle) {
      func(...lastArgs);
      lastCallTime = Date.now();
    }
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return throttledFunction as ThrottledWithCancel<T>;
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
