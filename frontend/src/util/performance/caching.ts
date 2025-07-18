/**
 * Advanced Caching Utilities for Performance Optimization
 *
 * Provides various caching strategies including session storage, memory cache,
 * and intelligent cache invalidation for API responses and computed values.
 */

import { useRef, useCallback, useState, useEffect } from "react";

/**
 * Cache configuration options
 */
export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum cache size
  storage?: "memory" | "session" | "local";
  keyPrefix?: string;
  onExpire?: (key: string, value: any) => void;
  serialize?: (value: any) => string;
  deserialize?: (value: string) => any;
}

/**
 * Cache entry structure
 */
export interface CacheEntry<T> {
  value: T;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
}

/**
 * Generic cache implementation with multiple storage backends
 */
export class AdvancedCache<T = any> {
  private memoryCache = new Map<string, CacheEntry<T>>();
  private options: Required<CacheOptions>;

  constructor(options: CacheOptions = {}) {
    this.options = {
      ttl: 300000, // 5 minutes default
      maxSize: 100,
      storage: "memory",
      keyPrefix: "cache_",
      onExpire: () => {},
      serialize: JSON.stringify,
      deserialize: JSON.parse,
      ...options,
    };
  }

  /**
   * Generate storage key with prefix
   */
  private getStorageKey(key: string): string {
    return `${this.options.keyPrefix}${key}`;
  }

  /**
   * Check if cache entry is expired
   */
  private isExpired(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp > this.options.ttl;
  }

  /**
   * Get value from appropriate storage
   */
  private getFromStorage(key: string): CacheEntry<T> | null {
    const storageKey = this.getStorageKey(key);

    switch (this.options.storage) {
      case "session":
        try {
          const stored = sessionStorage.getItem(storageKey);
          return stored ? this.options.deserialize(stored) : null;
        } catch {
          return null;
        }

      case "local":
        try {
          const stored = localStorage.getItem(storageKey);
          return stored ? this.options.deserialize(stored) : null;
        } catch {
          return null;
        }

      case "memory":
      default:
        return this.memoryCache.get(key) || null;
    }
  }

  /**
   * Set value in appropriate storage
   */
  private setInStorage(key: string, entry: CacheEntry<T>): void {
    const storageKey = this.getStorageKey(key);

    switch (this.options.storage) {
      case "session":
        try {
          sessionStorage.setItem(storageKey, this.options.serialize(entry));
        } catch {
          // Storage quota exceeded or unavailable
        }
        break;

      case "local":
        try {
          localStorage.setItem(storageKey, this.options.serialize(entry));
        } catch {
          // Storage quota exceeded or unavailable
        }
        break;

      case "memory":
      default:
        // Implement LRU eviction for memory cache
        if (this.memoryCache.size >= this.options.maxSize) {
          this.evictLRU();
        }
        this.memoryCache.set(key, entry);
        break;
    }
  }

  /**
   * Remove least recently used entry
   */
  private evictLRU(): void {
    let oldestKey = "";
    let oldestTime = Date.now();

    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      const entry = this.memoryCache.get(oldestKey);
      if (entry) {
        this.options.onExpire(oldestKey, entry.value);
      }
      this.memoryCache.delete(oldestKey);
    }
  }

  /**
   * Remove from storage
   */
  private removeFromStorage(key: string): void {
    const storageKey = this.getStorageKey(key);

    switch (this.options.storage) {
      case "session":
        sessionStorage.removeItem(storageKey);
        break;
      case "local":
        localStorage.removeItem(storageKey);
        break;
      case "memory":
      default:
        this.memoryCache.delete(key);
        break;
    }
  }

  /**
   * Get cached value
   */
  get(key: string): T | null {
    const entry = this.getFromStorage(key);

    if (!entry) {
      return null;
    }

    if (this.isExpired(entry)) {
      this.options.onExpire(key, entry.value);
      this.removeFromStorage(key);
      return null;
    }

    // Update access statistics
    entry.lastAccessed = Date.now();
    entry.accessCount++;
    this.setInStorage(key, entry);

    return entry.value;
  }

  /**
   * Set cached value
   */
  set(key: string, value: T): void {
    const now = Date.now();
    const entry: CacheEntry<T> = {
      value,
      timestamp: now,
      lastAccessed: now,
      accessCount: 1,
    };

    this.setInStorage(key, entry);
  }

  /**
   * Check if key exists in cache
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Delete specific key
   */
  delete(key: string): boolean {
    const existed = this.has(key);
    this.removeFromStorage(key);
    return existed;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    if (this.options.storage === "memory") {
      this.memoryCache.clear();
    } else {
      // Clear storage entries with our prefix
      const storage =
        this.options.storage === "session" ? sessionStorage : localStorage;
      const keysToRemove: string[] = [];

      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key?.startsWith(this.options.keyPrefix)) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach((key) => storage.removeItem(key));
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; hitRate?: number } {
    if (this.options.storage === "memory") {
      return { size: this.memoryCache.size };
    }

    // For storage-based caches, count entries with our prefix
    const storage =
      this.options.storage === "session" ? sessionStorage : localStorage;
    let count = 0;

    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key?.startsWith(this.options.keyPrefix)) {
        count++;
      }
    }

    return { size: count };
  }
}

/**
 * React hook for cached API calls with automatic invalidation
 *
 * @example
 * ```typescript
 * const { data, isLoading, error, refresh } = useCachedApi(
 *   'user-profile',
 *   () => api.getUserProfile(),
 *   { ttl: 600000 } // 10 minutes
 * );
 * ```
 */
interface UseCachedApiOptions extends CacheOptions {
  enabled?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  retryAttempts?: number;
  retryDelay?: number;
}

interface UseCachedApiResult<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  isFromCache: boolean;
}

// Global cache instance for API calls
const apiCache = new AdvancedCache({
  storage: "session",
  ttl: 300000, // 5 minutes default
  maxSize: 50,
});

export function useCachedApi<T>(
  cacheKey: string,
  apiCall: () => Promise<T>,
  options: UseCachedApiOptions = {},
): UseCachedApiResult<T> {
  const {
    enabled = true,
    onSuccess,
    onError,
    retryAttempts = 3,
    retryDelay = 1000,
    ...cacheOptions
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);
  const retryCount = useRef(0);

  // Configure cache with provided options
  const cache = useRef(new AdvancedCache<T>(cacheOptions));

  const fetchData = useCallback(
    async (force = false) => {
      if (!enabled) return;

      // Check cache first unless forced
      if (!force) {
        const cachedData = cache.current.get(cacheKey);
        if (cachedData !== null) {
          setData(cachedData);
          setIsFromCache(true);
          setError(null);
          return;
        }
      }

      setIsLoading(true);
      setError(null);
      setIsFromCache(false);

      try {
        const result = await apiCall();
        cache.current.set(cacheKey, result);
        setData(result);
        retryCount.current = 0;
        onSuccess?.(result);
      } catch (err) {
        const error = err instanceof Error ? err : new Error("API call failed");

        // Retry logic
        if (retryCount.current < retryAttempts) {
          retryCount.current++;
          setTimeout(() => fetchData(force), retryDelay * retryCount.current);
          return;
        }

        setError(error);
        onError?.(error);
      } finally {
        setIsLoading(false);
      }
    },
    [apiCall, cacheKey, enabled, onSuccess, onError, retryAttempts, retryDelay],
  );

  const refresh = useCallback(() => fetchData(true), [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refresh, isFromCache };
}

/**
 * Hook for caching computed values with dependency tracking
 *
 * @example
 * ```typescript
 * const expensiveResult = useCachedComputation(
 *   'heavy-calc',
 *   () => performHeavyCalculation(data),
 *   [data]
 * );
 * ```
 */
export function useCachedComputation<T>(
  cacheKey: string,
  computation: () => T,
  dependencies: unknown[],
  options: CacheOptions = {},
): T {
  const cache = useRef(new AdvancedCache<T>(options));
  const depsRef = useRef<unknown[]>([]);

  // Create a dependency-based cache key
  const depKey = `${cacheKey}_${JSON.stringify(dependencies)}`;

  // Check if dependencies have changed
  const depsChanged = dependencies.some(
    (dep, index) => dep !== depsRef.current[index],
  );

  if (depsChanged) {
    cache.current.delete(cacheKey);
    depsRef.current = dependencies;
  }

  let result = cache.current.get(depKey);

  if (result === null) {
    result = computation();
    cache.current.set(depKey, result);
  }

  return result;
}

/**
 * Cache for memoizing function results based on arguments
 *
 * @example
 * ```typescript
 * const memoizedFetch = createMemoizedFunction(
 *   (userId: number) => api.fetchUser(userId),
 *   { ttl: 600000 }
 * );
 * ```
 */
export function createMemoizedFunction<TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => TReturn | Promise<TReturn>,
  options: CacheOptions = {},
): (...args: TArgs) => TReturn | Promise<TReturn> {
  const cache = new AdvancedCache<TReturn>(options);

  return (...args: TArgs) => {
    const key = JSON.stringify(args);
    const cached = cache.get(key);

    if (cached !== null) {
      return cached;
    }

    const result = fn(...args);

    // Handle both sync and async functions
    if (result instanceof Promise) {
      return result.then((value) => {
        cache.set(key, value);
        return value;
      });
    } else {
      cache.set(key, result);
      return result;
    }
  };
}

// Export cache instance for external use
export { apiCache };
