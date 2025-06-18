/**
 * Debouncing Utilities for Performance Optimization
 *
 * Provides utilities for debouncing function calls and user inputs
 * to prevent excessive API calls and improve performance.
 */

import { useEffect, useRef, useState, useCallback } from "react";

// Type definitions
interface DebouncedFunction<T extends (...args: unknown[]) => unknown> {
  (...args: Parameters<T>): void;
  cancel: () => void;
  flush: () => void;
}

/**
 * Creates a debounced function that delays invoking func until after wait milliseconds
 * have elapsed since the last time the debounced function was invoked.
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
  immediate = false
): DebouncedFunction<T> {
  let timeoutId: number | undefined;
  let lastArgs: Parameters<T> | undefined;

  const debouncedFunction = (...args: Parameters<T>): void => {
    lastArgs = args;

    const callNow = immediate && !timeoutId;

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = window.setTimeout(() => {
      timeoutId = undefined;
      if (!immediate && lastArgs) {
        func(...lastArgs);
      }
    }, wait);

    if (callNow) {
      func(...args);
    }
  };

  debouncedFunction.cancel = (): void => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = undefined;
      lastArgs = undefined;
    }
  };

  debouncedFunction.flush = (): void => {
    if (timeoutId && lastArgs) {
      clearTimeout(timeoutId);
      func(...lastArgs);
      timeoutId = undefined;
      lastArgs = undefined;
    }
  };

  return debouncedFunction;
}

/**
 * React hook for debounced values
 *
 * @example
 * ```typescript
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearchTerm = useDebounce(searchTerm, 300);
 *
 * useEffect(() => {
 *   if (debouncedSearchTerm) {
 *     searchAPI(debouncedSearchTerm);
 *   }
 * }, [debouncedSearchTerm]);
 * ```
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * React hook for debounced callbacks
 *
 * @example
 * ```typescript
 * const debouncedCallback = useDebouncedCallback(
 *   (searchTerm: string) => {
 *     searchAPI(searchTerm);
 *   },
 *   300
 * );
 * ```
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number,
  deps: React.DependencyList = []
): T {
  const debouncedCallback = useRef<DebouncedFunction<T> | null>(null);

  const memoizedCallback = useCallback(callback, deps);

  useEffect(() => {
    debouncedCallback.current = debounce(memoizedCallback, delay);

    return () => {
      debouncedCallback.current?.cancel();
    };
  }, [memoizedCallback, delay]);

  return useCallback((...args: Parameters<T>) => {
    debouncedCallback.current?.(...args);
  }, [] as React.DependencyList) as T;
}
