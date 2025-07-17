/**
 * Scroll Animation Hook - E-Learning DSP Frontend
 *
 * React Hook für Scroll-basierte Animationen:
 * - Intersection Observer API Integration
 * - Konfigurierbare Trigger-Optionen
 * - Performance-optimierte Sichtbarkeitserkennung
 * - Einmalige oder wiederholte Animationen
 * 
 * Features:
 * - Intersection Observer für bessere Performance
 * - Konfigurierbare Schwellenwerte
 * - Einmalige oder wiederholte Trigger
 * - TypeScript-Typisierung
 * - Automatisches Cleanup
 * 
 * Author: DSP Development Team
 * Created: 10.07.2025
 * Version: 1.0.0
 */

import { useState, useRef, useEffect, RefObject } from "react";

/**
 * Optionen für Scroll-Animationen
 */
interface UseScrollAnimationOptions extends IntersectionObserverInit {
  /** Ob die Animation nur einmal ausgelöst werden soll */
  triggerOnce?: boolean;
  // Mögliche zukünftige Optionen
}

/**
 * Scroll Animation Hook
 * 
 * Verwaltet Scroll-basierte Animationen mit Intersection Observer.
 * Gibt ein Ref und den Sichtbarkeitsstatus zurück.
 * 
 * @param options - Konfigurationsoptionen für die Animation
 * @returns [elementRef, isVisible] - Ref für das Element und Sichtbarkeitsstatus
 */
function useScrollAnimation<T extends Element>(
  options: UseScrollAnimationOptions = { 
    threshold: 0.1, 
    triggerOnce: true 
  }
): [RefObject<T | null>, boolean] {
  // --- State Management ---
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<T>(null);

  // --- Intersection Observer Setup ---
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
        // Optional: Logik hinzufügen, um isVisible wieder auf false zu setzen
        // else if (!options.triggerOnce) {
        //   setIsVisible(false);
        // }
      });
    }, options);

    // --- Element beobachten ---
    const currentElement = elementRef.current;
    if (currentElement) {
      observer.observe(currentElement);
    }

    // --- Cleanup ---
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
