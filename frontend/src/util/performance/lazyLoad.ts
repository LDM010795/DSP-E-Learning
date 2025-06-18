/**
 * Advanced Lazy Loading Utilities for Performance Optimization
 *
 * Provides intersection observer-based lazy loading for components, images,
 * and other heavy resources to improve initial page load performance.
 */

import React, {
  useState,
  useRef,
  useEffect,
  ComponentType,
  CSSProperties,
  ReactNode,
  lazy,
  Suspense,
} from "react";

/**
 * Configuration options for intersection observer
 */
interface IntersectionOptions {
  threshold?: number | number[];
  rootMargin?: string;
  triggerOnce?: boolean;
}

/**
 * Hook for intersection observer functionality
 *
 * @example
 * ```typescript
 * const [ref, isVisible] = useIntersectionObserver({
 *   threshold: 0.1,
 *   triggerOnce: true
 * });
 * ```
 */
export function useIntersectionObserver(
  options: IntersectionOptions = {}
): [React.RefObject<HTMLElement>, boolean] {
  const { threshold = 0, rootMargin = "0px", triggerOnce = true } = options;
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isIntersecting = entry.isIntersecting;
        setIsVisible(isIntersecting);

        // Stop observing if triggerOnce is true and element is visible
        if (isIntersecting && triggerOnce) {
          observer.unobserve(element);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce]);

  return [elementRef, isVisible];
}

/**
 * Generic lazy loading wrapper for any component
 *
 * @example
 * ```typescript
 * <LazyWrapper
 *   loader={() => import('./HeavyChart')}
 *   fallback={<div>Loading chart...</div>}
 *   minHeight={400}
 * />
 * ```
 */
interface LazyWrapperProps {
  loader: () => Promise<{ default: ComponentType<any> }>;
  fallback?: ReactNode;
  minHeight?: number;
  intersectionOptions?: IntersectionOptions;
  style?: CSSProperties;
  className?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

export function LazyWrapper({
  loader,
  fallback = <div>Loading...</div>,
  minHeight,
  intersectionOptions = { threshold: 0, triggerOnce: true },
  style = {},
  className,
  onLoad,
  onError,
}: LazyWrapperProps): JSX.Element {
  const [ref, isVisible] = useIntersectionObserver(intersectionOptions);
  const [LazyComponent, setLazyComponent] = useState<ComponentType<any> | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (isVisible && !LazyComponent && !isLoading) {
      setIsLoading(true);
      setError(null);

      loader()
        .then((module) => {
          setLazyComponent(() => module.default);
          onLoad?.();
        })
        .catch((err) => {
          const error =
            err instanceof Error ? err : new Error("Failed to load component");
          setError(error);
          onError?.(error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isVisible, LazyComponent, isLoading, loader, onLoad, onError]);

  const containerStyle: CSSProperties = {
    minHeight: minHeight ? `${minHeight}px` : undefined,
    width: "100%",
    ...style,
  };

  return (
    <div ref={ref} style={containerStyle} className={className}>
      {error ? (
        <div style={{ color: "red", padding: "1rem" }}>
          Error loading component: {error.message}
        </div>
      ) : LazyComponent ? (
        <LazyComponent />
      ) : (
        fallback
      )}
    </div>
  );
}

/**
 * Optimized lazy loading for images with placeholder support
 *
 * @example
 * ```typescript
 * <LazyImage
 *   src="/large-image.jpg"
 *   alt="Description"
 *   placeholder="/tiny-placeholder.jpg"
 *   width={800}
 *   height={600}
 * />
 * ```
 */
interface LazyImageProps {
  src: string;
  alt: string;
  placeholder?: string;
  width?: number;
  height?: number;
  className?: string;
  style?: CSSProperties;
  intersectionOptions?: IntersectionOptions;
  onLoad?: () => void;
  onError?: () => void;
}

export function LazyImage({
  src,
  alt,
  placeholder,
  width,
  height,
  className,
  style = {},
  intersectionOptions = { threshold: 0, triggerOnce: true },
  onLoad,
  onError,
}: LazyImageProps): JSX.Element {
  const [ref, isVisible] = useIntersectionObserver(intersectionOptions);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
    onLoad?.();
  };

  const handleImageError = () => {
    setImageError(true);
    onError?.();
  };

  const imgStyle: CSSProperties = {
    width: width ? `${width}px` : "100%",
    height: height ? `${height}px` : "auto",
    objectFit: "cover",
    transition: "opacity 0.3s ease",
    opacity: imageLoaded ? 1 : 0,
    ...style,
  };

  const placeholderStyle: CSSProperties = {
    ...imgStyle,
    opacity: imageLoaded ? 0 : 1,
    position: imageLoaded ? "absolute" : "static",
    filter: "blur(2px)",
    transform: "scale(1.1)",
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        position: "relative",
        overflow: "hidden",
        width: width ? `${width}px` : "100%",
        height: height ? `${height}px` : "auto",
      }}
    >
      {placeholder && !imageLoaded && (
        <img
          src={placeholder}
          alt=""
          style={placeholderStyle}
          loading="eager"
        />
      )}

      {isVisible && (
        <img
          src={src}
          alt={alt}
          style={imgStyle}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading="lazy"
        />
      )}

      {imageError && (
        <div
          style={{
            ...imgStyle,
            backgroundColor: "#f0f0f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#666",
          }}
        >
          Failed to load image
        </div>
      )}
    </div>
  );
}

/**
 * Higher-order component for lazy loading any component
 *
 * @example
 * ```typescript
 * const LazyChart = withLazyLoading(() => import('./Chart'), {
 *   fallback: <ChartSkeleton />,
 *   minHeight: 400
 * });
 * ```
 */
interface LazyHOCOptions {
  fallback?: ReactNode;
  minHeight?: number;
  intersectionOptions?: IntersectionOptions;
}

export function withLazyLoading<P extends object>(
  loader: () => Promise<{ default: ComponentType<P> }>,
  options: LazyHOCOptions = {}
) {
  return function LazyComponent(props: P) {
    return (
      <LazyWrapper
        loader={loader}
        fallback={options.fallback}
        minHeight={options.minHeight}
        intersectionOptions={options.intersectionOptions}
        {...props}
      />
    );
  };
}

/**
 * Utility for creating route-level code splitting
 *
 * @example
 * ```typescript
 * const LazyDashboard = createLazyRoute(() => import('./pages/Dashboard'));
 *
 * // In router
 * <Route path="/dashboard" element={<LazyDashboard />} />
 * ```
 */
export function createLazyRoute<P extends object>(
  loader: () => Promise<{ default: ComponentType<P> }>,
  fallback: ReactNode = <div>Loading...</div>
) {
  const LazyComponent = lazy(loader);

  return function LazyRoute(props: P) {
    return (
      <Suspense fallback={fallback}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

/**
 * Preload utility for eager loading of critical resources
 *
 * @example
 * ```typescript
 * // Preload critical components during idle time
 * preloadComponent(() => import('./CriticalComponent'));
 * ```
 */
export function preloadComponent(
  loader: () => Promise<{ default: ComponentType<any> }>
): void {
  // Use requestIdleCallback if available, otherwise use setTimeout
  const schedule = (callback: () => void) => {
    if (typeof requestIdleCallback !== "undefined") {
      requestIdleCallback(callback, { timeout: 2000 });
    } else {
      setTimeout(callback, 0);
    }
  };

  schedule(() => {
    loader().catch(() => {
      // Silently fail for preloading
    });
  });
}

/**
 * Bundle splitting utility for vendor libraries
 *
 * @example
 * ```typescript
 * const LazyMonacoEditor = createVendorLazy(
 *   () => import('@monaco-editor/react'),
 *   { minHeight: 400 }
 * );
 * ```
 */
export function createVendorLazy<P extends object>(
  loader: () => Promise<{ default: ComponentType<P> }>,
  options: LazyHOCOptions = {}
): ComponentType<P> {
  return withLazyLoading(loader, {
    ...options,
    intersectionOptions: {
      threshold: 0.1,
      triggerOnce: true,
      ...options.intersectionOptions,
    },
  });
}
