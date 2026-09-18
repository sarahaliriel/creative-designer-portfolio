"use client"

import { useEffect, useRef, useState } from "react"

type ScrollProgressProps = {
  progress?: number
}

type ScrollTheme = "light" | "dark"

export default function ScrollProgress({ progress }: ScrollProgressProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [theme, setTheme] = useState<ScrollTheme>("light")

  const frameRef = useRef<number | null>(null)

  useEffect(() => {
    const media = window.matchMedia("(min-width: 640px)")
    const update = () => setIsVisible(media.matches)

    update()
    media.addEventListener("change", update)
    return () => media.removeEventListener("change", update)
  }, [])

  useEffect(() => {
    if (progress !== undefined || !isVisible) return

    const update = () => {
      frameRef.current = null
      const doc = document.documentElement
      const max = doc.scrollHeight - window.innerHeight
      const next = max <= 0 ? 0 : Math.min(1, Math.max(0, window.scrollY / max))
      setScrollProgress((current) => Math.abs(current - next) < 0.001 ? current : next)
    }

    const onScroll = () => {
      if (frameRef.current === null) frameRef.current = window.requestAnimationFrame(update)
    }

    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)

    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current)
    }
  }, [isVisible, progress])

  useEffect(() => {
    if (!isVisible) return

    const onMenu = (event: Event) => {
      const customEvent = event as CustomEvent<{ open: boolean }>
      setMenuOpen(Boolean(customEvent.detail?.open))
    }

    window.addEventListener("menu:state", onMenu)
    return () => window.removeEventListener("menu:state", onMenu)
  }, [isVisible])

  useEffect(() => {
    if (!isVisible) return

    let frame: number | null = null
    const updateTheme = () => {
      frame = null
      const indicatorY = window.innerHeight / 2
      const themedSections = document.querySelectorAll<HTMLElement>("[data-scroll-theme]")
      let nextTheme: ScrollTheme = "light"

      themedSections.forEach((section) => {
        const rect = section.getBoundingClientRect()
        if (rect.top <= indicatorY && rect.bottom >= indicatorY) {
          nextTheme = section.dataset.scrollTheme === "dark" ? "dark" : "light"
        }
      })

      setTheme((current) => current === nextTheme ? current : nextTheme)
    }

    const scheduleThemeUpdate = () => {
      if (frame === null) frame = window.requestAnimationFrame(updateTheme)
    }

    updateTheme()
    window.addEventListener("scroll", scheduleThemeUpdate, { passive: true })
    window.addEventListener("resize", scheduleThemeUpdate)

    return () => {
      window.removeEventListener("scroll", scheduleThemeUpdate)
      window.removeEventListener("resize", scheduleThemeUpdate)
      if (frame !== null) window.cancelAnimationFrame(frame)
    }
  }, [isVisible])

  const p = progress === undefined
    ? scrollProgress
    : Math.min(1, Math.max(0, progress))

  const pct = Math.round(p * 100)

  if (!isVisible || menuOpen) return null

  const foreground = theme === "dark" ? "text-[#f4f2ec]" : "text-[var(--accent)]"
  const progressColor = theme === "dark" ? "bg-[#f4f2ec]" : "bg-[var(--accent)]"
  const trackColor = theme === "dark" ? "bg-[#f4f2ec]/25" : "bg-ink/20"

  return (
    <div className="pointer-events-none fixed right-4 top-1/2 z-40 hidden -translate-y-1/2 sm:block">
      <div className="flex items-center gap-3">
        <div className="flex flex-col items-end gap-1">
          <div className={`text-[11px] font-semibold uppercase tracking-[0.16em] opacity-70 transition-colors duration-300 ${foreground}`}>
            Scroll
          </div>
          <div className={`text-[12px] font-medium tabular-nums opacity-70 transition-colors duration-300 ${foreground}`}>
            {pct}%
          </div>
        </div>

        <div className={`relative h-40 w-0.5 overflow-hidden rounded-full transition-colors duration-300 ${trackColor}`}>
          <div
            className={`absolute bottom-0 left-0 w-full rounded-full transition-[height,background-color] duration-300 ${progressColor}`}
            style={{ height: `${p * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}
