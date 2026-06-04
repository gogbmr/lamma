"use client";

import { useRef, useState } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward } from "lucide-react";

interface VideoPlayerProps {
  src: string;
  poster?: string;
}

export default function VideoPlayer({ src, poster }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState("0:00");
  const [duration, setDuration] = useState("0:00");

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const pct = (videoRef.current.currentTime / videoRef.current.duration) * 100;
    setProgress(pct);
    setCurrentTime(formatTime(videoRef.current.currentTime));
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(formatTime(videoRef.current.duration));
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = pct * videoRef.current.duration;
  };

  const skip = (seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime += seconds;
  };

  const handleFullscreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  return (
    <div className="relative group bg-black rounded-2xl overflow-hidden">
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        onClick={togglePlay}
        className="w-full aspect-video cursor-pointer"
        playsInline
      />

      {/* Custom Controls Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {/* Progress Bar */}
        <div
          className="w-full h-1.5 bg-white/20 rounded-full cursor-pointer mb-3 group/bar"
          onClick={handleSeek}
        >
          <div
            className="h-full bg-primary rounded-full relative transition-all"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-primary rounded-full opacity-0 group-hover/bar:opacity-100 transition-opacity shadow-lg" />
          </div>
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <button onClick={() => skip(-10)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
              <SkipBack className="h-4 w-4" />
            </button>
            <button onClick={togglePlay} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </button>
            <button onClick={() => skip(10)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
              <SkipForward className="h-4 w-4" />
            </button>
            <button onClick={toggleMute} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
            <span className="text-xs font-mono ml-2">
              {currentTime} / {duration}
            </span>
          </div>
          <button onClick={handleFullscreen} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
            <Maximize className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Center Play Button (when paused) */}
      {!isPlaying && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors"
        >
          <div className="w-16 h-16 bg-primary/90 rounded-full flex items-center justify-center shadow-2xl hover:scale-105 transition-transform">
            <Play className="h-7 w-7 text-primary-foreground ml-1" />
          </div>
        </button>
      )}
    </div>
  );
}
