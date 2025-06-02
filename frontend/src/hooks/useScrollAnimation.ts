import { useState, useRef, useEffect, RefObject } from "react";

interface UseScrollAnimationOptions extends IntersectionObserverInit {
  triggerOnce?: boolean;
  // Mögliche zukünftige Optionen
}

// Der Hook gibt ein Ref zum Anhängen und den Sichtbarkeitsstatus zurück
function useScrollAnimation<T extends Element>(
  options: UseScrollAnimationOptions = { threshold: 0.1, triggerOnce: true } // Standard: 10% sichtbar, nur einmal auslösen
): [RefObject<T | null>, boolean] {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<T>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries, observerInstance) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Wenn triggerOnce true ist, Beobachtung stoppen
          if (options.triggerOnce) {
            observerInstance.unobserve(entry.target);
          }
        }
        // Optional: Logik hinzufügen, um isVisible wieder auf false zu setzen, wenn das Element den Viewport verlässt
        // else if (!options.triggerOnce) {
        //   setIsVisible(false);
        // }
      });
    }, options);

    const currentElement = elementRef.current;
    if (currentElement) {
      observer.observe(currentElement);
    }

    // Aufräumen
    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
      observer.disconnect();
    };
  }, [options]); // Abhängigkeit von den Optionen

  return [elementRef, isVisible];
}

export default useScrollAnimation;
