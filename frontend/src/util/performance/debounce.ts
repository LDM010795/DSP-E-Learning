/**
 * Generic Debounce Utility for Performance Optimization
 *
 * Delays function execution until after a specified delay has passed since
 * the last time it was invoked. Perfect for search inputs, API calls, and
 * resize handlers to reduce unnecessary executions.
 *
 * @example
 * ```typescript
 * const debouncedSearch = debounce((query: string) => {
 *   api.search(query);
 * }, 300);
 *
 * // Usage in component
 * const handleSearch = debouncedSearch.bind(null);
 * ```
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DebouncedFunction<T extends (...args: any[]) => any> = (
  ...args: Parameters<T>
) => void;

interface DebouncedWithCancel<T extends (...args: any[]) => any>
  extends DebouncedFunction<T> {
  cancel: () => void;
  flush: () => void;
}

/**
 * Creates a debounced version of the provided function
 *
 * @param func - Function to debounce
 * @param delay - Delay in milliseconds
 * @param immediate - Execute on leading edge instead of trailing edge
 * @returns Debounced function with cancel and flush methods
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number,
  immediate = false
): DebouncedWithCancel<T> {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastArgs: Parameters<T> | null = null;

  const debouncedFunction = (...args: Parameters<T>): void => {
    lastArgs = args;

    const callNow = immediate && !timeoutId;

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      timeoutId = null;
      if (!immediate && lastArgs) {
        func(...lastArgs);
      }
    }, delay);

    if (callNow) {
      func(...args);
    }
  };

  // Cancel pending execution
  debouncedFunction.cancel = (): void => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
      lastArgs = null;
    }
  };

  // Execute immediately with last arguments
  debouncedFunction.flush = (): void => {
    if (timeoutId && lastArgs) {
      clearTimeout(timeoutId);
      func(...lastArgs);
      timeoutId = null;
      lastArgs = null;
    }
  };

  return debouncedFunction as DebouncedWithCancel<T>;
}

/**
 * React hook version of debounce for component state
 *
 * @example
 * ```typescript
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearchTerm = useDebounce(searchTerm, 300);
 *
 * useEffect(() => {
 *   if (debouncedSearchTerm) {
 *     performSearch(debouncedSearchTerm);
 *   }
 * }, [debouncedSearchTerm]);
 * ```
 */
import { useState, useEffect } from "react";

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
