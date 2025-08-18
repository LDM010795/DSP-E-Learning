import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  IoPause,
  IoPlay,
  IoVolumeHigh,
  IoVolumeMute,
  IoSettings,
  IoTimeOutline,
} from "react-icons/io5";
import { BiFullscreen, BiExitFullscreen } from "react-icons/bi";

type Props = {
  isPlaying: boolean;
  onTogglePlay: () => void;
  currentTime: number; // seconds
  duration: number; // seconds
  onSeek: (time: number) => void;
  buffered?: number; // seconds already buffered
  volume: number; // 0..1
  onVolumeChange: (v: number) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  playbackRate: number;
  onChangePlaybackRate: (rate: number) => void;
  onToggleFullscreen: () => void;
  isFullscreen?: boolean;
  className?: string;
};

const formatTime = (seconds: number): string => {
  if (!isFinite(seconds) || seconds < 0) return "0:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const pad = (n: number) => (n < 10 ? `0${n}` : String(n));
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
};

const rates = [0.75, 1, 1.25, 1.5, 2];

const VideoControls: React.FC<Props> = ({
  isPlaying,
  onTogglePlay,
  currentTime,
  duration,
  onSeek,
  buffered = 0,
  volume,
  onVolumeChange,
  isMuted,
  onToggleMute,
  playbackRate,
  onChangePlaybackRate,
  onToggleFullscreen,
  className,
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const volumeBarRef = useRef<HTMLDivElement | null>(null);
  const [isDraggingVolume, setIsDraggingVolume] = useState(false);

  const setVolumeFromClientX = (clientX: number) => {
    const el = volumeBarRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = clientX - rect.left;
    const ratio = Math.min(1, Math.max(0, x / rect.width));
    onVolumeChange(ratio);
  };

  useEffect(() => {
    if (!isDraggingVolume) return;
    const handleMove = (e: MouseEvent) => setVolumeFromClientX(e.clientX);
    const handleUp = () => setIsDraggingVolume(false);
    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleUp, { once: true });
    return () => {
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleUp);
    };
  }, [isDraggingVolume]);

  const progressPercent = useMemo(
    () =>
      duration > 0
        ? Math.min(100, Math.max(0, (currentTime / duration) * 100))
        : 0,
    [currentTime, duration]
  );
  const bufferedPercent = useMemo(
    () =>
      duration > 0
        ? Math.min(100, Math.max(0, (buffered / duration) * 100))
        : 0,
    [buffered, duration]
  );

  return (
    <div
      className={`absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/50 via-black/20 to-transparent ${className ?? ""}`}
    >
      {/* Progress bar */}
      <div className="group">
        <div
          className="relative h-2 w-full bg-white/20 rounded-full cursor-pointer"
          role="slider"
          aria-valuemin={0}
          aria-valuemax={duration || 0}
          aria-valuenow={currentTime}
          onClick={(e) => {
            const rect = (
              e.currentTarget as HTMLDivElement
            ).getBoundingClientRect();
            const x = e.clientX - rect.left;
            const ratio = Math.min(1, Math.max(0, x / rect.width));
            onSeek(ratio * duration);
          }}
        >
          {/* Buffered amount */}
          <div
            className="absolute inset-y-0 left-0 bg-white/40 rounded-full"
            style={{ width: `${bufferedPercent}%` }}
          />
          {/* Played progress */}
          <div
            className="absolute inset-y-0 left-0 bg-dsp-orange rounded-full"
            style={{ width: `${progressPercent}%` }}
          >
            <div className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-white shadow group-hover:scale-110 transition-transform cursor-grab active:cursor-grabbing" />
          </div>
        </div>
      </div>

      {/* Controls row */}
      <div className="mt-3 flex items-center justify-between text-white">
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label={isPlaying ? "Pause" : "Play"}
            onClick={onTogglePlay}
            className="inline-flex items-center justify-center w-9 h-9 rounded-md bg-white/15 hover:bg-white/25 transition-colors cursor-pointer"
          >
            {isPlaying ? (
              <IoPause className="w-5 h-5" />
            ) : (
              <IoPlay className="w-5 h-5" />
            )}
          </button>

          <div className="flex items-center gap-1 ml-2">
            <IoTimeOutline className="w-4 h-4 text-white/80" />
            <span className="text-xs tabular-nums">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Volume */}
          <button
            type="button"
            aria-label={isMuted ? "Unmute" : "Mute"}
            onClick={onToggleMute}
            className="inline-flex items-center justify-center w-9 h-9 rounded-md bg-white/15 hover:bg-white/25 transition-colors cursor-pointer"
          >
            {isMuted || volume === 0 ? (
              <IoVolumeMute className="w-5 h-5" />
            ) : (
              <IoVolumeHigh className="w-5 h-5" />
            )}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={isMuted ? 0 : volume}
            aria-label="Lautstärke"
            onChange={(e) => onVolumeChange(Number(e.target.value))}
            className="w-24 accent-dsp-orange cursor-pointer"
          />

          {/* Settings */}
          <div className="relative">
            <button
              type="button"
              aria-label="Einstellungen"
              onClick={() => setShowSettings((s) => !s)}
              className="inline-flex items-center justify-center w-9 h-9 rounded-md bg-white/15 hover:bg-white/25 transition-colors cursor-pointer"
            >
              <IoSettings className="w-5 h-5" />
            </button>
            {showSettings && (
              <div className="absolute right-0 bottom-11 min-w-[160px] rounded-md border border-white/10 bg-black/85 backdrop-blur p-2 shadow-xl">
                <div className="text-xs text-white/60 mb-1 px-1">
                  Wiedergabegeschwindigkeit
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {rates.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => {
                        onChangePlaybackRate(r);
                        setShowSettings(false);
                      }}
                      className={`px-2 py-1 rounded text-xs ${
                        playbackRate === r
                          ? "bg-dsp-orange text-white"
                          : "bg-white/10 hover:bg-white/20 text-white"
                      } cursor-pointer`}
                    >
                      {r}x
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Fullscreen */}
          <button
            type="button"
            aria-label="Vollbild"
            onClick={onToggleFullscreen}
            className="inline-flex items-center justify-center w-9 h-9 rounded-md bg-white/15 hover:bg-white/25 transition-colors cursor-pointer"
          >
            {className?.includes("fullscreen") ? (
              <BiExitFullscreen className="w-5 h-5" />
            ) : (
              <BiFullscreen className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoControls;
