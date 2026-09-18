"use client"

import { useEffect, useRef, useState } from "react"
import { usePortfolioAudio } from "@/components/providers/audio"
import styles from "./audio-player.module.css"

const FREQUENCY_BANDS = [
  [40, 160],
  [160, 400],
  [400, 1200],
  [1200, 4000],
  [4000, 10000],
] as const
const NEUTRAL_LEVEL = 0.12

export default function AudioPlayer() {
  const { hasInteracted, intensityRef, isPlaying, readAnalysisFrame, togglePlayback } = usePortfolioAudio()
  const barRefs = useRef<Array<HTMLSpanElement | null>>([])
  const levelsRef = useRef(FREQUENCY_BANDS.map(() => NEUTRAL_LEVEL))
  const animationFrameRef = useRef<number | null>(null)
  const playingRef = useRef(isPlaying)
  const playerRef = useRef<HTMLButtonElement | null>(null)
  const [isOnDarkTheme, setIsOnDarkTheme] = useState(false)

  useEffect(() => {
    let frame: number | null = null

    const updateTheme = () => {
      frame = null
      const rect = playerRef.current?.getBoundingClientRect()
      if (!rect) return

      const themeElement = document
        .elementsFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2)
        .filter((element): element is HTMLElement => element instanceof HTMLElement && !playerRef.current?.contains(element))
        .map((element) => element.closest<HTMLElement>("[data-scroll-theme]"))
        .find((element): element is HTMLElement => element !== null)

      const nextThemeIsDark = themeElement?.dataset.scrollTheme === "dark"
      setIsOnDarkTheme((current) => current === nextThemeIsDark ? current : nextThemeIsDark)
    }

    const scheduleThemeUpdate = () => {
      if (frame === null) frame = requestAnimationFrame(updateTheme)
    }

    updateTheme()
    window.addEventListener("scroll", scheduleThemeUpdate, { passive: true })
    window.addEventListener("resize", scheduleThemeUpdate)

    return () => {
      window.removeEventListener("scroll", scheduleThemeUpdate)
      window.removeEventListener("resize", scheduleThemeUpdate)
      if (frame !== null) cancelAnimationFrame(frame)
    }
  }, [])

  useEffect(() => {
    playingRef.current = isPlaying
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    let lastReducedMotionFrame = 0

    const renderFrame = (timestamp: number) => {
      if (reducedMotion && playingRef.current && timestamp - lastReducedMotionFrame < 100) {
        animationFrameRef.current = requestAnimationFrame(renderFrame)
        return
      }
      lastReducedMotionFrame = timestamp
      const analysis = playingRef.current ? readAnalysisFrame() : null
      let settled = true

      FREQUENCY_BANDS.forEach(([lowHz, highHz], index) => {
        let target = NEUTRAL_LEVEL

        if (analysis) {
          const nyquist = analysis.analyser.context.sampleRate / 2
          const firstBin = Math.max(1, Math.floor((lowHz / nyquist) * analysis.data.length))
          const lastBin = Math.min(analysis.data.length - 1, Math.ceil((highHz / nyquist) * analysis.data.length))
          let total = 0
          for (let bin = firstBin; bin <= lastBin; bin += 1) total += analysis.data[bin]
          const average = total / Math.max(1, lastBin - firstBin + 1) / 255
          target = Math.min(1, NEUTRAL_LEVEL + Math.pow(average, 0.82) * 0.88)
        }

        const smoothing = reducedMotion ? 0.12 : playingRef.current ? 0.2 : 0.14
        const next = levelsRef.current[index] + (target - levelsRef.current[index]) * smoothing
        levelsRef.current[index] = next
        barRefs.current[index]?.style.setProperty("--level", next.toFixed(3))
        if (Math.abs(next - NEUTRAL_LEVEL) > 0.008) settled = false
      })

      if (analysis) {
        const overall = levelsRef.current.reduce((sum, level) => sum + level, 0) / levelsRef.current.length
        intensityRef.current.overall = Math.max(0, Math.min(1, (overall - NEUTRAL_LEVEL) / (1 - NEUTRAL_LEVEL)))
        intensityRef.current.bass = Math.max(0, Math.min(1, (levelsRef.current[0] - NEUTRAL_LEVEL) / (1 - NEUTRAL_LEVEL)))
      } else {
        intensityRef.current.overall *= 0.86
        intensityRef.current.bass *= 0.86
      }

      if (playingRef.current || !settled) animationFrameRef.current = requestAnimationFrame(renderFrame)
      else animationFrameRef.current = null
    }

    if (animationFrameRef.current === null) animationFrameRef.current = requestAnimationFrame(renderFrame)
    return () => {
      if (animationFrameRef.current !== null) cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
  }, [intensityRef, isPlaying, readAnalysisFrame])

  const actionLabel = isPlaying ? "Pause background music" : "Play background music"

  return (
    <button
      ref={playerRef}
      type="button"
      aria-label={actionLabel}
      aria-pressed={isPlaying}
      onClick={() => void togglePlayback()}
      className={`${styles.player} ${isPlaying ? styles.playing : ""} ${isOnDarkTheme ? styles.darkTheme : ""}`}
    >
      {!hasInteracted ? <span aria-hidden="true" className={styles.initialLabel}>play sound</span> : null}
      <span aria-hidden="true" className={styles.icon}>
        <span className={`${styles.playIcon} ${isPlaying ? styles.hiddenIcon : ""}`} />
        <span className={`${styles.pauseIcon} ${isPlaying ? "" : styles.hiddenIcon}`} />
      </span>
      <span aria-hidden="true" className={styles.visualizer}>
        {FREQUENCY_BANDS.map((band, index) => (
          <span
            key={band[0]}
            ref={(element) => { barRefs.current[index] = element }}
            className={styles.bar}
            style={{ "--level": NEUTRAL_LEVEL } as React.CSSProperties}
          />
        ))}
      </span>
    </button>
  )
}
