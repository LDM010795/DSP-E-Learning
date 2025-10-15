/**
 * Wasabi Player Component
 *
 * Spezialisierte Komponente für Wasabi Cloud Storage Videos mit presigned URLs
 */

import React, { useEffect, useRef, useState } from "react";
import LogoDSP from "../../assets/dsp_no_background.png";
import { isWasabiUrl, toWasabiKey } from "../../util/videoUtils";
import {
  usePresignedById,
  usePresignedByKey,
} from "../../hooks/useVideoPresignedUrl";
import PrePlayOverlay from "./PrePlayOverlay";
import PlaybackOverlay from "./PlaybackOverlay";
import VideoControls from "./controls/VideoControls";

interface WasabiPlayerProps {
  contentId?: number;
  dbUrl?: string; // Die aus der DB kommende URL (kann nackte Wasabi-URL sein)
  className?: string;
  onLoadedData?: () => void;
  onCanPlay?: () => void;
  onLoadStart?: () => void;
  onError?: (e: React.SyntheticEvent<HTMLVideoElement, Event>) => void;
  crossOrigin?: "anonymous" | "use-credentials";
}

const WasabiPlayer: React.FC<WasabiPlayerProps> = (props) => {
  const {
    contentId,
    dbUrl,
    className,
    onLoadedData,
    onCanPlay,
    onError,
    crossOrigin,
  } = props;

  console.log(`🔍 DEBUG: WasabiPlayer - contentId: ${contentId}`);
  console.log(`🔍 DEBUG: WasabiPlayer - dbUrl: ${dbUrl}`);

  // Hooks aufrufen (immer auf Top-Level)
  const key = isWasabiUrl(dbUrl ?? "") ? toWasabiKey(dbUrl!) : null;
  const {
    data: urlById,
    isFetching: fId,
    error: eId,
  } = usePresignedById(contentId);
  const {
    data: urlByKey,
    isFetching: fKey,
    error: eKey,
  } = usePresignedByKey(!urlById ? key || undefined : undefined);

  const presignedUrl = urlById ?? urlByKey ?? null;
  const loading = fId || fKey;

  console.log(
    `🔍 DEBUG: WasabiPlayer - urlById: ${urlById ? "verfügbar" : "nicht verfügbar"}`,
  );
  console.log(`🔍 DEBUG: WasabiPlayer - key: ${key}`);
  console.log(
    `🔍 DEBUG: WasabiPlayer - urlByKey: ${urlByKey ? "verfügbar" : "nicht verfügbar"}`,
  );
  console.log(
    `🔍 DEBUG: WasabiPlayer - presignedUrl: ${presignedUrl ? "verfügbar" : "nicht verfügbar"}`,
  );
  console.log(`🔍 DEBUG: WasabiPlayer - loading: ${loading}`);

  const [hasStarted, setHasStarted] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [showChrome, setShowChrome] = useState(true);
  const hideTimeoutRef = useRef<number | null>(null);

  const resetHideTimer = () => {
    setShowChrome(true);
    if (hideTimeoutRef.current) {
      window.clearTimeout(hideTimeoutRef.current);
    }
    hideTimeoutRef.current = window.setTimeout(
      () => setShowChrome(false),
      2000,
    );
  };

  // Fallback: Verwende direkte URL wenn presigned URL nicht verfügbar
  const videoUrl = presignedUrl || dbUrl;

  // Zeige Loading nur wenn noch geladen wird und keine URL verfügbar ist
  if (loading && !videoUrl) {
    return (
      <div className="p-4 rounded-xl border text-sm">
        <div className="font-medium mb-2">🚧 Video lädt …</div>
        <div>
          contentId: {String(contentId)} | key: {key ?? "—"}
        </div>
        {dbUrl && <div className="break-all">DB-URL: {dbUrl}</div>}
        <div className="mt-2">Hole presigned URL …</div>
      </div>
    );
  }

  // Zeige Fehler nur wenn keine URL verfügbar ist
  if (!videoUrl && (eId || eKey)) {
    return (
      <div className="p-4 rounded-xl border text-sm">
        <div className="font-medium mb-2 text-red-600">⚠️ Video-Fehler</div>
        <div>
          contentId: {String(contentId)} | key: {key ?? "—"}
        </div>
        {dbUrl && <div className="break-all">DB-URL: {dbUrl}</div>}
        <div className="mt-2 text-red-600">
          {eId && `Fehler (byId): ${(eId as Error).message}`}
          <br />
          {eKey && `Fehler (byKey): ${(eKey as Error).message}`}
        </div>
      </div>
    );
  }

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  const handleTogglePlay = () => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      el.play();
    } else {
      el.pause();
    }
  };

  const handleSeek = (t: number) => {
    const el = videoRef.current;
    if (!el || !isFinite(t)) return;
    el.currentTime = t;
  };

  const handleVolumeChange = (v: number) => {
    const el = videoRef.current;
    if (!el) return;
    el.volume = v;
    setVolume(v);
    if (v > 0 && isMuted) {
      el.muted = false;
      setIsMuted(false);
    }
  };

  const handleToggleMute = () => {
    const el = videoRef.current;
    if (!el) return;
    el.muted = !el.muted;
    setIsMuted(el.muted);
  };

  const handleChangePlaybackRate = (r: number) => {
    const el = videoRef.current;
    if (!el) return;
    el.playbackRate = r;
    setPlaybackRate(r);
  };

  // Autoplay direkt nach Klick auf das Pre-Play Overlay
  useEffect(() => {
    if (!hasStarted) return;
    const el = videoRef.current;
    if (!el) return;
    try {
      const maybePromise = el.play();
      if (maybePromise && typeof (maybePromise as any).then === "function") {
        (maybePromise as Promise<void>).catch(() => {
          // Autoplay konnte blockiert werden – ignoriere still
        });
      }
    } catch {
      // noop
    }
  }, [hasStarted]);

  const [isFullscreen, setIsFullscreen] = useState<boolean>(
    !!document.fullscreenElement,
  );

  const handleToggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      el.requestFullscreen();
    }
  };

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  // Video rendern mit Pre-Play Overlay
  return (
    <div
      ref={containerRef}
      className={`relative group w-full h-full overflow-hidden ${showChrome ? "" : "cursor-none"}`}
      onMouseMove={resetHideTimer}
      onMouseEnter={resetHideTimer}
    >
      {!hasStarted && <PrePlayOverlay onStart={() => setHasStarted(true)} />}
      {hasStarted && (
        <>
          <video
            ref={videoRef}
            className={`${className ?? ""} w-full h-full object-cover bg-transparent`}
            src={videoUrl}
            preload="auto"
            autoPlay
            playsInline
            crossOrigin={crossOrigin}
            poster={LogoDSP}
            onLoadedData={(e) => {
              const el = e.currentTarget;
              setDuration(el.duration || 0);
              setVolume(el.volume);
              setIsMuted(el.muted);
              onLoadedData?.();
            }}
            onLoadStart={() => setIsBuffering(true)}
            onWaiting={() => setIsBuffering(true)}
            onPlaying={() => setIsBuffering(false)}
            onTimeUpdate={(e) => {
              setCurrentTime(e.currentTarget.currentTime || 0);
              const buf = e.currentTarget.buffered;
              if (buf && buf.length) {
                setBuffered(buf.end(buf.length - 1));
              }
            }}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onCanPlay={onCanPlay}
            onError={onError}
            style={{}}
            // Buffer-Einstellungen für smoothere Wiedergabe
            muted
            // Warte bis genug Daten geladen sind
            onCanPlayThrough={(e) => {
              console.log("🔍 DEBUG: Video kann durchgängig abgespielt werden");
              // Entmute erst wenn genug gepuffert ist
              e.currentTarget.muted = false;
              setIsBuffering(false);
            }}
            // Bessere Buffer-Einstellungen
            onLoadedMetadata={(e) => {
              console.log("🔍 DEBUG: Video Metadaten geladen");
              const video = e.currentTarget;
              // Setze Buffer-Größe für smoothere Wiedergabe
              video.preload = "auto";
            }}
          />
          {isBuffering && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/5 backdrop-blur-[2px]">
              <div className="h-10 w-10 rounded-full border-2 border-white/40 border-t-dsp-orange animate-spin" />
            </div>
          )}
          <PlaybackOverlay />
          <VideoControls
            isPlaying={isPlaying}
            onTogglePlay={handleTogglePlay}
            currentTime={currentTime}
            duration={duration}
            onSeek={handleSeek}
            buffered={buffered}
            volume={volume}
            onVolumeChange={handleVolumeChange}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            playbackRate={playbackRate}
            onChangePlaybackRate={handleChangePlaybackRate}
            onToggleFullscreen={handleToggleFullscreen}
            isFullscreen={isFullscreen}
            className={`${showChrome ? "opacity-100" : "opacity-0"} group-hover:opacity-100 transition-opacity ${isFullscreen ? "fullscreen" : ""}`}
          />
        </>
      )}
    </div>
  );
};

export default WasabiPlayer;
