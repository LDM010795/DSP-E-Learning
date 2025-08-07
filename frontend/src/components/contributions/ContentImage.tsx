import React from "react";
import { ContentImageProps } from "./types";

const ContentImage: React.FC<ContentImageProps> = ({ src, alt, caption }) => {
  // Konstruiere den korrekten Bildpfad relativ zum DSP Root
  const imagePath = `/images/${src}`;

  return (
    <div className="my-6">
      <img
        src={imagePath}
        alt={alt}
        className="w-full h-auto rounded-lg shadow-md"
      />
      {caption && (
        <p className="text-sm text-gray-600 mt-2 text-center italic">
          {caption}
        </p>
      )}
    </div>
  );
};

export default ContentImage;
