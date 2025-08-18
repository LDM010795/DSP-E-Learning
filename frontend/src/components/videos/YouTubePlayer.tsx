/**
 * YouTube Player Component
 *
 * Spezialisierte Komponente für YouTube Video-Wiedergabe
 */

import React, { useState } from "react";
import { extractVideoId, createYouTubeEmbedUrl } from "../../util/videoUtils";
import PrePlayOverlay from "./PrePlayOverlay";
import PlaybackOverlay from "./PlaybackOverlay";

interface YouTubePlayerProps {
  videoUrl: string;
  className?: string;
  onLoadedData?: () => void;
  onCanPlay?: () => void;
  onLoadStart?: () => void;
  onError?: (e: React.SyntheticEvent<HTMLVideoElement, Event>) => void;
}

const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  videoUrl,
  className,
  onLoadedData,
  onCanPlay,
  onLoadStart,
  onError,
}) => {
  console.log(`🔍 DEBUG: YouTubePlayer - videoUrl: ${videoUrl}`);

  const videoId = extractVideoId(videoUrl);

  if (!videoId) {
    return (
      <div className="p-4 rounded-xl border text-sm text-red-600">
        <div className="font-medium mb-2">⚠️ Ungültige YouTube URL</div>
        <div className="break-all text-gray-600">{videoUrl}</div>
      </div>
    );
  }

  const embedUrl = createYouTubeEmbedUrl(videoId);
  const [hasStarted, setHasStarted] = useState(false);

  return (
    <div className="relative w-full aspect-video">
      {!hasStarted && <PrePlayOverlay onStart={() => setHasStarted(true)} />}
      {hasStarted && (
        <>
          <iframe
            className={className}
            src={`${embedUrl}&autoplay=1`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            style={{ width: "100%", height: "100%" }}
            onLoad={onLoadedData}
            onError={onError as any}
          />
          <PlaybackOverlay />
        </>
      )}
    </div>
  );
};

export default YouTubePlayer;
