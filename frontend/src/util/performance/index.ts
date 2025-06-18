/**
 * Central Performance Utilities Export
 *
 * Barrel export file for easy access to all performance optimization utilities.
 * Provides a single import point for all performance-related functions and hooks.
 *
 * @example
 * ```typescript
 * import {
 *   debounce,
 *   useDebounce,
 *   AdvancedCache
 * } from '../util/performance';
 * ```
 */

// Debouncing utilities
export { debounce, useDebounce } from "./debounce";

// Throttling utilities
export { throttle, useThrottle } from "./throttle";

// Memoization utilities
export {
  memoize,
  shallowEqual,
  useMemoizedComputation,
  useShallowMemo,
  useStableCallback,
  LRUCache,
} from "./memoization";

// Lazy loading utilities removed - using specific LazyLoadChartWrapper instead

// Caching utilities
export {
  AdvancedCache,
  useCachedApi,
  useCachedComputation,
  createMemoizedFunction,
  apiCache,
} from "./caching";

// Main exports provide all necessary functionality
// Types are available through the exported functions and classes
