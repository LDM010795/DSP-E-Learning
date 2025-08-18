/**
 * Video Player Component
 *
 * Haupt-Komponente für Video-Wiedergabe mit automatischer URL-Erkennung
 */

import React from "react";
import { isYouTubeUrl, isWasabiUrl } from "../../util/videoUtils";
import YouTubePlayer from "./YouTubePlayer";
import WasabiPlayer from "./WasabiPlayer";

interface VideoPlayerProps {
  videoUrl: string;
  contentId?: number;
  className?: string;
  onLoadedData?: () => void;
  onCanPlay?: () => void;
  onLoadStart?: () => void;
  onError?: (e: React.SyntheticEvent<HTMLVideoElement, Event>) => void;
  crossOrigin?: "anonymous" | "use-credentials";
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  contentId,
  className,
  onLoadedData,
  onCanPlay,
  onLoadStart,
  onError,
  crossOrigin,
}) => {
  console.log(
    `🔍 DEBUG: VideoPlayer - Eingang: videoUrl=${videoUrl}, contentId=${contentId}`
  );

  if (!videoUrl) {
    return (
      <div className="p-4 rounded-xl border text-sm text-gray-500">
        Keine Video-URL verfügbar
      </div>
    );
  }

  // YouTube Videos
  if (isYouTubeUrl(videoUrl)) {
    console.log(`🔍 DEBUG: VideoPlayer - YouTube URL erkannt: ${videoUrl}`);
    return (
      <YouTubePlayer
        videoUrl={videoUrl}
        className={className}
        onLoadedData={onLoadedData}
        onCanPlay={onCanPlay}
        onLoadStart={onLoadStart}
        onError={onError}
      />
    );
  }

  // Wasabi/Cloud Storage Videos
  if (isWasabiUrl(videoUrl)) {
    console.log(`🔍 DEBUG: VideoPlayer - Wasabi URL erkannt: ${videoUrl}`);
    return (
      <WasabiPlayer
        contentId={contentId}
        dbUrl={videoUrl}
        className={className}
        onLoadedData={onLoadedData}
        onCanPlay={onCanPlay}
        onLoadStart={onLoadStart}
        onError={onError}
        crossOrigin={crossOrigin}
      />
    );
  }

  // Fallback für unbekannte Video-Formate
  console.log(`🔍 DEBUG: VideoPlayer - Unbekanntes Video-Format: ${videoUrl}`);
  return (
    <div className="p-4 rounded-xl border text-sm">
      <div className="font-medium mb-2">
        ⚠️ Nicht unterstütztes Video-Format
      </div>
      <div className="break-all text-gray-600">{videoUrl}</div>
    </div>
  );
};

export default VideoPlayer;
