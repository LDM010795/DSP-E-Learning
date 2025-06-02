import React from "react";
import { motion } from "framer-motion";

// ✨ Props Interface
interface CardPreviewSmallProps {
  imageSrc?: string;
  youtubeId?: string;
  title: string;
  description?: string;
  progress?: number;
  onClick?: () => void;

  // Custom ClassNames
  className?: string;
  classNameTitle?: string;
  classNameDescription?: string;
  classNameImage?: string;
  classNameContentWrapper?: string;
  classNameProgressWrapper?: string;
  classNameProgressBar?: string;
  classNameProgressText?: string;
}

const CardPreviewSmall: React.FC<CardPreviewSmallProps> = ({
  imageSrc,
  youtubeId,
  title,
  description,
  progress = 0,
  onClick,
  className,
  classNameTitle,
  classNameDescription,
  classNameImage,
  classNameContentWrapper,
  classNameProgressWrapper,
  classNameProgressBar,
  classNameProgressText,
}) => {
  const displayImage = youtubeId
    ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
    : imageSrc;

  return (
    <motion.div
      className={`relative bg-white rounded-lg overflow-hidden w-full shadow-md hover:cursor-pointer ${className}`}
      onClick={onClick}
    >
      {displayImage && (
        <div className={`relative w-full aspect-video ${classNameImage}`}>
          <img
            src={displayImage}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      )}

      <div className={`p-4 pb-16 ${classNameContentWrapper}`}>
        <p className={`mb-2 text-center ${classNameTitle}`}>{title}</p>

        {description && (
          <p className={`text-base text-center ${classNameDescription}`}>
            {description}
          </p>
        )}

        <div
          className={`flex flex-col gap-1 absolute bottom-0 left-0 w-full p-4 ${classNameProgressWrapper}`}
        >
          <div className="flex justify-between text-gray-600 mt-1">
            <p>Fortschritt:</p>
            <p className={classNameProgressText}>{progress}% abgeschlossen</p>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className={`bg-dsp-orange h-2.5 rounded-full ${classNameProgressBar}`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CardPreviewSmall;
