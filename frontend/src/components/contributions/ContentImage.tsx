import React, { useState } from "react";

interface ContentImageProps {
  src: string;
  alt?: string;
  caption?: string;
  className?: string;
}

const ContentImage: React.FC<ContentImageProps> = ({
  src,
  alt = "",
  caption,
  className = "",
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Konstruiere Cloud-URL (kann später konfigurierbar gemacht werden)
  const cloudBaseUrl =
    import.meta.env.VITE_CLOUD_URL ||
    "https://cloud.datasmart-point.com/uploads/";
  const imageUrl = src.startsWith("http") ? src : `${cloudBaseUrl}${src}`;

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <figure className={`my-6 ${className}`}>
      <div className="relative bg-gray-100 rounded-lg overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
              <p className="text-sm text-gray-500">Bild wird geladen...</p>
            </div>
          </div>
        )}

        {hasError ? (
          <div className="flex flex-col items-center justify-center p-8 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
            <svg
              className="w-12 h-12 text-gray-400 mb-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm text-gray-500 text-center mb-1">
              Bild konnte nicht geladen werden
            </p>
            <p className="text-xs text-gray-400 text-center">({src})</p>
          </div>
        ) : (
          <img
            src={imageUrl}
            alt={alt || caption || "Lerninhalt Bild"}
            onLoad={handleImageLoad}
            onError={handleImageError}
            className={`w-full h-auto transition-opacity duration-300 ${
              isLoading ? "opacity-0" : "opacity-100"
            }`}
          />
        )}
      </div>

      {caption && (
        <figcaption className="mt-3 text-sm text-gray-600 text-center italic">
          {caption}
        </figcaption>
      )}
    </figure>
  );
};

export default ContentImage;
