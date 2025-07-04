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

/**
 * Preloads critical resources for better SPA performance
 * Should be called early in the application lifecycle
 */
export const preloadCriticalResources = () => {
  // Preload heavy libraries that might be used soon
  const preloadPromises = [];

  // Preload Monaco Editor for code editing pages
  preloadPromises.push(
    import("monaco-editor").catch(() => {
      console.warn("Monaco Editor preload failed");
    })
  );

  // Preload ECharts for statistics pages
  preloadPromises.push(
    import("echarts-for-react").catch(() => {
      console.warn("ECharts preload failed");
    })
  );

  return Promise.allSettled(preloadPromises);
};

/**
 * Preloads resources when the user hovers over navigation links
 * Provides instant loading feeling for anticipated navigation
 */
export const preloadOnHover = (resourceType: "monaco" | "charts") => {
  switch (resourceType) {
    case "monaco":
      return import("monaco-editor").catch(() => {
        console.warn("Monaco Editor hover preload failed");
      });
    case "charts":
      return import("echarts-for-react").catch(() => {
        console.warn("ECharts hover preload failed");
      });
    default:
      return Promise.resolve();
  }
};

/**
 * Resource prefetching for common user flows
 * Call this when user lands on dashboard to prefetch likely next resources
 */
export const prefetchCommonResources = () => {
  // Prefetch after a short delay to not block initial rendering
  setTimeout(() => {
    preloadCriticalResources();
  }, 1000);
};

// Main exports provide all necessary functionality
// Types are available through the exported functions and classes
