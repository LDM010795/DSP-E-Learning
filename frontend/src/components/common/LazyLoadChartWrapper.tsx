/**
 * Lazy Load Chart Wrapper Component - E-Learning DSP Frontend
 *
 * Performance-optimierte Chart-Loading-Komponente:
 * - Intersection Observer für Lazy Loading
 * - Generische Typisierung für verschiedene Chart-Komponenten
 * - Konfigurierbare Platzhalter und Schwellenwerte
 *
 * Features:
 * - Lazy Loading für bessere Performance
 * - Generische TypeScript-Typisierung
 * - Intersection Observer API
 * - Konfigurierbare Observer-Optionen
 * - Automatisches Cleanup
 *
 * Author: DSP Development Team
 * Created: 10.07.2025
 * Version: 1.0.0
 */

import {
  useState,
  useRef,
  useEffect,
  ComponentType,
  CSSProperties,
} from "react";

/**
 * Props für LazyLoadChartWrapper Komponente
 */
interface LazyLoadChartWrapperProps<TProps> {
  /** Chart-Komponente die gelazy-loaded werden soll */
  component: ComponentType<TProps>;
  /** Mindesthöhe des Platzhalters in Pixeln */
  minHeight: number;
  /** Optionale Observer-Konfiguration */
  observerOptions?: IntersectionObserverInit;
  /** Zusätzliche Styles für den Platzhalter */
  placeholderStyle?: CSSProperties;
  /** Props die an die Chart-Komponente weitergegeben werden */
  chartProps: TProps;
}

/**
 * Lazy Load Chart Wrapper Komponente
 *
 * Lädt Chart-Komponenten erst wenn sie im Viewport sichtbar werden.
 * Verbessert die Performance durch verzögertes Laden von Charts.
 */
const LazyLoadChartWrapper = <TProps extends object>({
  component: ChartComponent,
  minHeight,
  observerOptions = { threshold: 0 },
  placeholderStyle = {},
  chartProps,
}: LazyLoadChartWrapperProps<TProps>) => {
  // --- State Management ---
  const [isVisible, setIsVisible] = useState(false);
  const placeholderRef = useRef<HTMLDivElement>(null);

  // --- Intersection Observer Setup ---
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Wichtig: Beobachtung stoppen, nachdem es sichtbar wurde
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // --- Element beobachten ---
    const currentRef = placeholderRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    // --- Cleanup ---
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
      observer.disconnect(); // Observer komplett trennen
    };
    // Abhängigkeiten: Nur Optionen ändern den Observer neu
  }, [observerOptions]);

  return (
    <div
      ref={placeholderRef}
      style={{
        minHeight: `${minHeight}px`,
        width: "100%",
        ...placeholderStyle,
      }}
    >
      {/* --- Conditional Rendering --- */}
      {
        isVisible ? (
          <ChartComponent {...chartProps} />
        ) : null /* Optional: Loading-Spinner hier */
      }
    </div>
  );
};

export default LazyLoadChartWrapper;
