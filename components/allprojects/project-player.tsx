"use client"

import type { MouseEvent, RefObject } from "react"
import { ProjectControlIcon, ProjectControls, projectControlClass } from "@/components/allprojects/project-controls"
import type { ArchiveProject } from "@/data/all-projects"

type ProjectPlayerProps = {
  closeLabel: string
  current: ArchiveProject
  currentTime: number
  duration: number
  hoveringBar: boolean
  hoverPct: number
  hoverTime: number
  isClosed: boolean
  isFullscreen: boolean
  isMinimized: boolean
  muted: boolean
  playing: boolean
  progress01: number
  seeking: boolean
  showControls: boolean
  soundOffLabel: string
  soundOnLabel: string
  minimizeLabel: string
  volume: number
  videoRef: RefObject<HTMLVideoElement | null>
  playerRef: RefObject<HTMLDivElement | null>
  videoSrc: string
  onBeginSeek: () => void
  onClose: () => void
  onCommitSeek: () => void
  onJump: (seconds: number) => void
  onMoveSeek: (value: number) => void
  onProgressMove: (event: MouseEvent<HTMLDivElement>) => void
  onSetClosed: (value: boolean) => void
  onSetHoveringBar: (value: boolean) => void
  onSetMinimized: (value: boolean) => void
  onSetVolume: (value: number) => void
  onShowControls: () => void
  onToggleFullscreen: () => void
  onToggleMute: () => void
  onTogglePlay: () => void
}

export function ProjectPlayer({
  closeLabel,
  current,
  currentTime,
  duration,
  hoveringBar,
  hoverPct,
  hoverTime,
  isClosed,
  isFullscreen,
  isMinimized,
  minimizeLabel,
  muted,
  onBeginSeek,
  onClose,
  onCommitSeek,
  onJump,
  onMoveSeek,
  onProgressMove,
  onSetClosed,
  onSetHoveringBar,
  onSetMinimized,
  onSetVolume,
  onShowControls,
  onToggleFullscreen,
  onToggleMute,
  onTogglePlay,
  playerRef,
  playing,
  progress01,
  seeking,
  showControls,
  soundOffLabel,
  soundOnLabel,
  videoRef,
  videoSrc,
  volume,
}: ProjectPlayerProps) {
  return (
    <div className="relative mt-4 flex min-h-0 flex-1 items-center lg:mt-5">
      {isClosed ? (
        <button
          type="button"
          onClick={() => {
            onSetClosed(false)
            onSetMinimized(false)
          }}
          className="mx-auto flex aspect-video h-full max-h-full w-full max-w-295 items-center justify-center bg-black text-[12px] uppercase tracking-[0.2em] text-[#f4f2ec]/75 transition-colors duration-200 hover:text-white"
        >
          restore player
        </button>
      ) : (
        <div
          ref={playerRef}
          className={[
            "relative z-20 bg-black transition-all duration-500",
            isMinimized
              ? "fixed bottom-5 right-5 w-[min(420px,calc(100vw-40px))] shadow-[0_18px_80px_rgba(0,0,0,.35)]"
              : "mx-auto aspect-video max-h-full w-full",
            isFullscreen ? "h-full w-full max-w-none" : "",
          ].join(" ")}
          onMouseMove={onShowControls}
          onTouchStart={onShowControls}
        >
          <button type="button" onClick={onTogglePlay} className="absolute inset-0 z-10" aria-label={playing ? "Pausar" : "Reproduzir"} />

          <div key={`video-stage-${current.id}`} className="absolute inset-0 animate-[apMediaIn_560ms_cubic-bezier(.2,.9,.2,1)_both]">
            {videoSrc ? (
              <video
                ref={videoRef}
                key={`video-${current.id}-${videoSrc}`}
                autoPlay
                playsInline
                muted={muted || volume <= 0}
                controls={false}
                preload="metadata"
                className="absolute inset-0 h-full w-full object-contain"
              >
                <source src={videoSrc} type="video/mp4" />
              </video>
            ) : (
              <div className="absolute inset-0 grid place-items-center px-8 text-center">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.2em] text-[#f4f2ec]/60">video source pending</div>
                  <div className="mt-3 max-w-[42ch] text-[14px] leading-snug text-[#f4f2ec]/78">
                    Add a direct MP4 URL in <span className="text-white">src</span>.
                  </div>
                </div>
              </div>
            )}
          </div>

          {isMinimized ? (
            <div className="absolute right-2 top-2 z-40 flex gap-1">
              <button type="button" onClick={() => onSetMinimized(false)} className={projectControlClass} aria-label="Voltar do modo minimizado">
                <ProjectControlIcon name="restore" />
              </button>
              <button type="button" onClick={onClose} className={projectControlClass} aria-label={closeLabel}>
                <ProjectControlIcon name="close" />
              </button>
            </div>
          ) : null}

          <ProjectControls
            closeLabel={closeLabel}
            currentTime={currentTime}
            duration={duration}
            hoveringBar={hoveringBar}
            hoverPct={hoverPct}
            hoverTime={hoverTime}
            isFullscreen={isFullscreen}
            minimizeLabel={minimizeLabel}
            muted={muted}
            onBeginSeek={onBeginSeek}
            onClose={onClose}
            onCommitSeek={onCommitSeek}
            onJump={onJump}
            onMoveSeek={onMoveSeek}
            onProgressMove={onProgressMove}
            onSetHoveringBar={onSetHoveringBar}
            onSetMinimized={onSetMinimized}
            onSetVolume={onSetVolume}
            onToggleFullscreen={onToggleFullscreen}
            onToggleMute={onToggleMute}
            onTogglePlay={onTogglePlay}
            playing={playing}
            progress01={progress01}
            seeking={seeking}
            showControls={showControls}
            soundOffLabel={soundOffLabel}
            soundOnLabel={soundOnLabel}
            volume={volume}
          />
        </div>
      )}
    </div>
  )
}
