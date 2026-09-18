"use client"

import type { CSSProperties, MouseEvent } from "react"
import { formatTime } from "@/lib/format"

type IconName = "play" | "pause" | "back" | "forward" | "mute" | "volume" | "full" | "exit" | "min" | "restore" | "close"

export function ProjectControlIcon({ name }: { name: IconName }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-hidden": true,
  }

  if (name === "play") {
    return (
      <svg {...common}>
        <path d="M8.5 6.7v10.6c0 .9 1 1.4 1.8.9l7.8-5.3c.7-.5.7-1.5 0-1.9l-7.8-5.3c-.8-.5-1.8 0-1.8.9Z" fill="currentColor" />
      </svg>
    )
  }

  if (name === "pause") {
    return (
      <svg {...common}>
        <rect x="6.5" y="5" width="4" height="14" rx="1" fill="currentColor" />
        <rect x="13.5" y="5" width="4" height="14" rx="1" fill="currentColor" />
      </svg>
    )
  }

  if (name === "back" || name === "forward") {
    const flip = name === "back" ? "scaleX(-1)" : undefined
    return (
      <svg {...common} style={{ transform: flip }}>
        <path d="M7 7h5.2a5 5 0 1 1-4.1 7.9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M7 7v4.5M7 7h4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 13.9h3.8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    )
  }

  if (name === "mute" || name === "volume") {
    return (
      <svg {...common}>
        <path d="M11 6.6 7.9 9H5a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2.9l3.1 2.4c1 .8 2.5.1 2.5-1.1V7.7c0-1.2-1.5-1.9-2.5-1.1Z" fill="currentColor" />
        {name === "mute" ? (
          <>
            <path d="m16.6 9.6 4.2 4.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="m20.8 9.6-4.2 4.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </>
        ) : (
          <>
            <path d="M17 9.2a4.5 4.5 0 0 1 0 5.6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M19.8 7a8.5 8.5 0 0 1 0 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.65" />
          </>
        )}
      </svg>
    )
  }

  if (name === "full" || name === "exit") {
    const inward = name === "exit"
    return (
      <svg {...common}>
        <path d={inward ? "M9 9H5V5" : "M9 5H5v4"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d={inward ? "M15 9h4V5" : "M15 5h4v4"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d={inward ? "M9 15H5v4" : "M9 19H5v-4"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d={inward ? "M15 15h4v4" : "M15 19h4v-4"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  if (name === "close") {
    return (
      <svg {...common}>
        <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    )
  }

  return (
    <svg {...common}>
      {name === "min" ? (
        <path d="M7 12h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      ) : (
        <path d="M7 14h7V7M14 7l-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  )
}

type ProjectControlsProps = {
  currentTime: number
  duration: number
  hoveringBar: boolean
  hoverPct: number
  hoverTime: number
  isFullscreen: boolean
  muted: boolean
  playing: boolean
  progress01: number
  seeking: boolean
  showControls: boolean
  volume: number
  onBeginSeek: () => void
  onClose: () => void
  onCommitSeek: () => void
  onJump: (seconds: number) => void
  onMoveSeek: (value: number) => void
  onProgressMove: (event: MouseEvent<HTMLDivElement>) => void
  onSetHoveringBar: (value: boolean) => void
  onSetMinimized: (value: boolean) => void
  onSetVolume: (value: number) => void
  onToggleFullscreen: () => void
  onToggleMute: () => void
  onTogglePlay: () => void
  soundOffLabel: string
  soundOnLabel: string
  minimizeLabel: string
  closeLabel: string
}

const controlClass =
  "grid h-11 w-11 place-items-center text-[#f4f2ec] transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45 sm:h-10 sm:w-10"

export function ProjectControls({
  closeLabel,
  currentTime,
  duration,
  hoveringBar,
  hoverPct,
  hoverTime,
  isFullscreen,
  minimizeLabel,
  muted,
  onBeginSeek,
  onClose,
  onCommitSeek,
  onJump,
  onMoveSeek,
  onProgressMove,
  onSetHoveringBar,
  onSetMinimized,
  onSetVolume,
  onToggleFullscreen,
  onToggleMute,
  onTogglePlay,
  playing,
  progress01,
  seeking,
  showControls,
  soundOffLabel,
  soundOnLabel,
  volume,
}: ProjectControlsProps) {
  const displayedProgress = seeking ? (duration ? currentTime / duration : 0) : progress01

  return (
    <div
      className={[
        "absolute inset-x-0 bottom-0 z-30 transition-opacity duration-300",
        showControls || !playing ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
      ].join(" ")}
    >
      <div className="absolute inset-x-0 bottom-0 h-36 bg-linear-to-t from-black/85 via-black/30 to-transparent" />
      <div className="relative px-4 pb-4 sm:px-6 sm:pb-5">
        <div
          className="relative mb-3"
          onMouseEnter={() => onSetHoveringBar(true)}
          onMouseLeave={() => onSetHoveringBar(false)}
          onMouseMove={onProgressMove}
        >
          <div
            className={["absolute -top-9 z-30 transition-opacity duration-150", hoveringBar ? "opacity-100" : "opacity-0"].join(" ")}
            style={{ left: `${hoverPct * 100}%`, transform: "translateX(-50%)" }}
          >
            <div className="bg-black/60 px-2.5 py-1 text-[11px] tracking-[0.14em] text-[#f4f2ec] backdrop-blur-md">{formatTime(hoverTime)}</div>
          </div>
          <input
            type="range"
            min={0}
            max={1000}
            value={Math.round(displayedProgress * 1000)}
            onMouseDown={onBeginSeek}
            onTouchStart={onBeginSeek}
            onChange={(e) => onMoveSeek(Number(e.target.value) / 1000)}
            onMouseUp={onCommitSeek}
            onTouchEnd={onCommitSeek}
            className="ap-progress"
            style={{ "--ap-fill": `${displayedProgress * 100}%` } as CSSProperties}
            aria-label="Progresso do vídeo"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 sm:flex-nowrap sm:gap-2">
          <button type="button" onClick={onTogglePlay} className={controlClass} aria-label={playing ? "Pausar" : "Reproduzir"}>
            <ProjectControlIcon name={playing ? "pause" : "play"} />
          </button>
          <button type="button" onClick={() => onJump(-5)} className={controlClass} aria-label="Voltar 5 segundos">
            <ProjectControlIcon name="back" />
          </button>
          <button type="button" onClick={() => onJump(5)} className={controlClass} aria-label="Avançar 5 segundos">
            <ProjectControlIcon name="forward" />
          </button>

          <div className="min-w-23 text-[11px] tracking-[0.12em] text-[#f4f2ec]/80 tabular-nums sm:min-w-28">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>

          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            <button type="button" onClick={onToggleMute} className={controlClass} aria-label={muted ? soundOnLabel : soundOffLabel}>
              <ProjectControlIcon name={muted || volume <= 0 ? "mute" : "volume"} />
            </button>
            <input
              className="ap-vol hidden w-20 sm:block"
              type="range"
              min={0}
              max={100}
              value={Math.round(volume * 100)}
              onChange={(e) => onSetVolume(Number(e.target.value) / 100)}
              style={{ "--ap-fill": `${volume * 100}%` } as CSSProperties}
              aria-label="Volume"
            />
            <button type="button" onClick={() => onSetMinimized(true)} className={controlClass} aria-label={minimizeLabel}>
              <ProjectControlIcon name="min" />
            </button>
            <button type="button" onClick={onToggleFullscreen} className={controlClass} aria-label={isFullscreen ? "Sair de ecrã inteiro" : "Ecrã inteiro"}>
              <ProjectControlIcon name={isFullscreen ? "exit" : "full"} />
            </button>
            <button type="button" onClick={onClose} className={controlClass} aria-label={closeLabel}>
              <ProjectControlIcon name="close" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export { controlClass as projectControlClass }
