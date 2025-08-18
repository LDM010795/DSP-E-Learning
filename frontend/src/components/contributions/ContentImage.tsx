import React, { useEffect, useMemo, useRef, useState } from "react";
import { ContentImageProps } from "./types";
import { isWasabiUrl, toWasabiKey } from "../../util/videoUtils/wasabi";
import { useStoragePresignedByKey } from "../../hooks/useVideoPresignedUrl";

const ContentImage: React.FC<ContentImageProps> = ({ src, alt, caption }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isInView, setIsInView] = useState(false);

  // Lazy-activate via IntersectionObserver (prefetch ~200px vorher)
  useEffect(() => {
    if (!containerRef.current || typeof IntersectionObserver === "undefined") {
      // Fallback: ohne IO sofort aktivieren
      setIsInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { root: null, rootMargin: "200px", threshold: 0.01 }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Nur wenn sichtbar: Key extrahieren und presigned abrufen
  const key = useMemo(() => {
    if (!isInView) return null;
    return isWasabiUrl(src) ? toWasabiKey(src) : null;
  }, [src, isInView]);

  const { data: presignedUrl } = useStoragePresignedByKey(key || undefined);
  const resolvedSrc = presignedUrl || src;

  const [zoomed, setZoomed] = useState(false);
  const handleToggle = () => setZoomed((z) => !z);

  return (
    <div ref={containerRef} className="my-6 flex justify-center">
      <div className="inline-block max-w-[820px] align-top">
        <img
          src={resolvedSrc}
          alt={alt}
          loading="lazy"
          onClick={handleToggle}
          className={[
            "block max-w-full h-auto rounded-lg shadow-md object-contain cursor-zoom-in",
            zoomed ? "scale-105" : "",
          ].join(" ")}
          style={{ transition: "transform 150ms ease" }}
        />
        {caption && (
          <p className="mt-1 text-xs text-gray-500 text-left">{caption}</p>
        )}
      </div>

      {zoomed && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
          onClick={handleToggle}
          role="dialog"
          aria-label="Bild vergrößert"
          aria-modal="true"
        >
          <img
            src={resolvedSrc}
            alt={alt}
            className="max-w-[90vw] max-h-[85vh] object-contain cursor-zoom-out"
          />
        </div>
      )}
    </div>
  );
};

export default ContentImage;
