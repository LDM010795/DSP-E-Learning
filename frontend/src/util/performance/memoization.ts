/**
 * Advanced Memoization Utilities for Performance Optimization
 *
 * Provides various memoization strategies including LRU cache, shallow comparison,
 * and deep memoization for expensive computations and API results.
 */

import { useRef, useMemo, useCallback, useState, useEffect } from "react";

/**
 * Memoization configuration options
 */
export interface MemoizationOptions {
  ttl?: number; // Time to live in milliseconds
  maxCacheSize?: number; // Maximum cache size for LRU cache
  equalityFn?: (a: unknown[], b: unknown[]) => boolean; // Custom equality function
  onCacheHit?: (key: string) => void; // Callback for cache hits
  onCacheMiss?: (key: string) => void; // Callback for cache misses
}

/**
 * LRU (Least Recently Used) Cache implementation
 * Perfect for caching API responses or expensive computations
 */
class LRUCache<K, V> {
  private cache = new Map<K, V>();
  private maxSize: number;

  constructor(maxSize = 100) {
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    if (this.cache.has(key)) {
      // Move to end (most recently used)
      const value = this.cache.get(key)!;
      this.cache.delete(key);
      this.cache.set(key, value);
      return value;
    }
    return undefined;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      // Update existing key
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Remove least recently used (first item)
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, value);
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }
}

/**
 * Memoize function with LRU cache
 *
 * @example
 * ```typescript
 * const expensiveCalculation = memoize((x: number, y: number) => {
 *   console.log('Computing...'); // Only logs once per unique input
 *   return x * y * Math.random();
 * }, 50); // Cache up to 50 results
 * ```
 */
export function memoize<TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => TReturn,
  maxCacheSize = 100,
  keyGenerator?: (...args: TArgs) => string,
): (...args: TArgs) => TReturn {
  const cache = new LRUCache<string, TReturn>(maxCacheSize);

  const defaultKeyGenerator = (...args: TArgs): string => {
    return JSON.stringify(args);
  };

  const generateKey = keyGenerator || defaultKeyGenerator;

  return (...args: TArgs): TReturn => {
    const key = generateKey(...args);

    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

/**
 * Shallow comparison for object equality
 * More performant than deep comparison for most use cases
 */
export function shallowEqual(
  obj1: Record<string, unknown>,
  obj2: Record<string, unknown>,
): boolean {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (const key of keys1) {
    if (obj1[key] !== obj2[key]) {
      return false;
    }
  }

  return true;
}

/**
 * React hook for memoizing expensive computations with dependency tracking
 *
 * @example
 * ```typescript
 * const expensiveResult = useMemoizedComputation(
 *   () => heavyCalculation(data),
 *   [data], // Dependencies
 *   shallowEqual // Custom equality function
 * );
 * ```
 */
export function useMemoizedComputation<T>(
  computation: () => T,
  deps: unknown[],
  equalityFn: (a: unknown[], b: unknown[]) => boolean = (a, b) =>
    a.length === b.length && a.every((val, i) => val === b[i]),
): T {
  const depsRef = useRef<unknown[]>(deps);
  const resultRef = useRef<T | undefined>(undefined);
  const hasComputedRef = useRef(false);

  // Check if dependencies have changed
  const depsChanged = !equalityFn(deps, depsRef.current);

  if (!hasComputedRef.current || depsChanged) {
    resultRef.current = computation();
    depsRef.current = deps;
    hasComputedRef.current = true;
  }

  return resultRef.current!;
}

/**
 * React hook for memoizing objects with shallow comparison
 * Prevents unnecessary re-renders when object contents haven't changed
 *
 * @example
 * ```typescript
 * const memoizedUser = useShallowMemo(() => ({
 *   id: user.id,
 *   name: user.name,
 *   email: user.email
 * }), [user.id, user.name, user.email]);
 * ```
 */
export function useShallowMemo<T extends Record<string, unknown>>(
  factory: () => T,
  deps: unknown[],
): T {
  const prevResult = useRef<T | undefined>(undefined);

  return useMemo(() => {
    const result = factory();

    if (prevResult.current && shallowEqual(prevResult.current, result)) {
      return prevResult.current;
    }

    prevResult.current = result;
    return result;
  }, deps);
}

/**
 * React hook for stable callback references with dependency comparison
 * More efficient than useCallback for complex dependency arrays
 *
 * @example
 * ```typescript
 * const handleSubmit = useStableCallback((data: FormData) => {
 *   api.submit(data, user.id, settings);
 * }, [user.id, settings], shallowEqual);
 * ```
 */
export function useStableCallback<TArgs extends unknown[], TReturn>(
  callback: (...args: TArgs) => TReturn,
  deps: unknown[],
  equalityFn: (a: unknown[], b: unknown[]) => boolean = (a, b) =>
    a.length === b.length && a.every((val, i) => val === b[i]),
): (...args: TArgs) => TReturn {
  const depsRef = useRef<unknown[]>(deps);
  const callbackRef = useRef(callback);

  // Update callback and deps only if dependencies have changed
  if (!equalityFn(deps, depsRef.current)) {
    depsRef.current = deps;
    callbackRef.current = callback;
  }

  return useCallback(
    (...args: TArgs) => {
      return callbackRef.current(...args);
    },
    [callbackRef],
  );
}

/**
 * Hook for memoizing API responses with automatic cache invalidation
 *
 * @example
 * ```typescript
 * const { data, isLoading, error } = useApiMemo(
 *   () => api.fetchUser(userId),
 *   `user-${userId}`,
 *   [userId],
 *   { ttl: 300000 } // 5 minutes cache
 * );
 * ```
 */
interface ApiMemoOptions {
  ttl?: number; // Time to live in milliseconds
  maxRetries?: number;
  onError?: (error: Error) => void;
}

interface ApiMemoResult<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  invalidate: () => void;
}

const apiCache = new Map<
  string,
  { data: unknown; timestamp: number; promise?: Promise<unknown> }
>();

export function useApiMemo<T>(
  apiCall: () => Promise<T>,
  cacheKey: string,
  deps: unknown[],
  options: ApiMemoOptions = {},
): ApiMemoResult<T> {
  const { ttl = 300000, maxRetries = 3, onError } = options;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const retryCountRef = useRef(0);

  const invalidate = useCallback(() => {
    apiCache.delete(cacheKey);
    setData(null);
    setError(null);
  }, [cacheKey]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Check cache first
      const cached = apiCache.get(cacheKey);
      const now = Date.now();

      if (cached && now - cached.timestamp < ttl) {
        setData(cached.data as T);
        setIsLoading(false);
        return;
      }

      // Return existing promise if already fetching
      if (cached?.promise) {
        const result = (await cached.promise) as T;
        setData(result);
        setIsLoading(false);
        return;
      }

      // Make new API call
      const promise = apiCall();
      apiCache.set(cacheKey, {
        data: null,
        timestamp: now,
        promise,
      });

      const result = await promise;

      // Update cache with result
      apiCache.set(cacheKey, {
        data: result,
        timestamp: now,
      });

      setData(result);
      retryCountRef.current = 0;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("API call failed");

      // Retry logic
      if (retryCountRef.current < maxRetries) {
        retryCountRef.current++;
        setTimeout(fetchData, 1000 * retryCountRef.current);
        return;
      }

      setError(error);
      onError?.(error);
      apiCache.delete(cacheKey);
    } finally {
      setIsLoading(false);
    }
  }, [apiCall, cacheKey, ttl, maxRetries, onError]);

  useEffect(() => {
    fetchData();
  }, deps);

  return { data, isLoading, error, invalidate };
}

// Export LRUCache for external use
export { LRUCache };
