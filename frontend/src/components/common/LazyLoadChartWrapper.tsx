import {
  useState,
  useRef,
  useEffect,
  ComponentType,
  CSSProperties,
} from "react";

// Machen die Props generisch für die Chart-Props
interface LazyLoadChartWrapperProps<TProps> {
  component: ComponentType<TProps>; // Typisiert die Komponente mit ihren Props
  minHeight: number; // Mindesthöhe des Platzhalters in Pixeln
  observerOptions?: IntersectionObserverInit; // Optionale Observer-Konfiguration
  placeholderStyle?: CSSProperties;
  chartProps: TProps; // Explizite Prop für die Chart-Argumente
  // [key: string]: any; // Entfernt
}

// Definieren die Komponente als generische Funktion
const LazyLoadChartWrapper = <TProps extends object>({
  // Füge Constraint hinzu
  component: ChartComponent,
  minHeight,
  observerOptions = { threshold: 0 }, // Geändert von 0.1 zu 0
  placeholderStyle = {},
  chartProps, // Entpacke die chartProps
}: // ...rest // Entfernt
LazyLoadChartWrapperProps<TProps>) => {
  const [isVisible, setIsVisible] = useState(false);
  const placeholderRef = useRef<HTMLDivElement>(null);

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

    const currentRef = placeholderRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    // Aufräumfunktion
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
      {
        isVisible ? (
          <ChartComponent {...chartProps} />
        ) : null /* Optional: Loading-Spinner hier */
      }
    </div>
  );
};

export default LazyLoadChartWrapper;
