import React, { useState } from "react";
import { extractVideoId } from "../../util/videoUtils/extract_video_id";
import LogoDSP from "../../assets/dsp_no_background.png";
import { IoPlayCircleOutline } from "react-icons/io5";

interface RenderYoutubeVideoProps {
  videoUrl: string;
}

const RenderYoutubeVideo: React.FC<RenderYoutubeVideoProps> = ({
  videoUrl,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoId = extractVideoId(videoUrl);

  const containerClasses =
    "relative w-full h-0 pb-[56.25%] overflow-hidden bg-gray-200";

  if (!isPlaying) {
    return (
      <div className={`${containerClasses} rounded-xl group`}>
        <img
          src={LogoDSP}
          alt="Video Vorschau"
          className="absolute top-0 left-0 w-full h-full object-cover filter blur-md scale-105"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <button
            onClick={() => setIsPlaying(true)}
            className="relative flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-white/80 rounded-full shadow-xl backdrop-blur-sm group-hover:bg-white transition-colors duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 cursor-pointer"
            aria-label="Video abspielen"
          >
            <span className="absolute inline-flex h-full w-full rounded-full bg-white opacity-75 animate-ping"></span>
            <IoPlayCircleOutline className="relative w-14 h-14 md:w-16 md:h-16 text-dsp-orange z-10" />
          </button>
        </div>
        <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg opacity-80 hidden md:block"></div>
        <div className="absolute -right-3 -top-3 w-10 h-10 bg-orange-100 rounded-full shadow-lg opacity-70 hidden md:block"></div>
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full shadow-lg opacity-80 hidden md:block"></div>
      </div>
    );
  }

  return (
    <div className={`${containerClasses} rounded-xl`}>
      <iframe
        className="absolute top-0 left-0 w-full h-full"
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
        title="YouTube Video Player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    </div>
  );
};

export default RenderYoutubeVideo;
