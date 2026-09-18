"use client"

import type { MouseEvent } from "react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { ProjectPlayer } from "@/components/allprojects/project-player"
import { ProjectThumbs } from "@/components/allprojects/project-thumbs"
import ScrollProgress from "@/components/layout/scroll-progress"
import { useI18n } from "@/components/providers/i18n"
import { getArchiveProjects } from "@/data/all-projects"
import { pad2 } from "@/lib/format"
import { clamp, wrapIndex } from "@/lib/utils"

type FullscreenHost = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void
  mozRequestFullScreen?: () => Promise<void> | void
  msRequestFullscreen?: () => Promise<void> | void
}

type FullscreenDocument = Document & {
  webkitFullscreenElement?: Element | null
  mozFullScreenElement?: Element | null
  msFullscreenElement?: Element | null
  webkitExitFullscreen?: () => Promise<void> | void
  mozCancelFullScreen?: () => Promise<void> | void
  msExitFullscreen?: () => Promise<void> | void
}

export default function AllProjects() {
  const { lang, t } = useI18n()

  const categories = useMemo(
    () => ({
      lab: { title: t("allprojectsTitle1") },
      social: { title: t("allprojectsTitle2") },
      story: { title: t("allprojectsTitle4") },
    }),
    [t]
  )

  const projects = useMemo(() => getArchiveProjects(lang), [lang])
  const total = projects.length
  const [active, setActive] = useState(0)
  const idx = wrapIndex(active, total)
  const archiveProgress = total <= 1 ? 0 : idx / (total - 1)
  const current = projects[idx]
  const videoSrc = current.src
  const category = categories[current.category]

  const wrapRef = useRef<HTMLDivElement | null>(null)
  const railRef = useRef<HTMLDivElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const playerRef = useRef<HTMLDivElement | null>(null)
  const wheelAccum = useRef(0)
  const wheelLock = useRef(false)
  const controlsTimer = useRef<number | null>(null)
  const lastVolume = useRef(0.65)
  const seekValRef = useRef(0)

  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [volume, setVolume] = useState(0.65)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [seeking, setSeeking] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isClosed, setIsClosed] = useState(false)
  const [hoveringBar, setHoveringBar] = useState(false)
  const [hoverPct, setHoverPct] = useState(0)
  const [hoverTime, setHoverTime] = useState(0)

  const showNow = useCallback(() => {
    setShowControls(true)
    if (controlsTimer.current) window.clearTimeout(controlsTimer.current)
    controlsTimer.current = window.setTimeout(() => {
      setShowControls(false)
    }, 2300)
  }, [])

  const resetPlayerState = useCallback(() => {
    videoRef.current?.pause()
    setCurrentTime(0)
    setDuration(0)
    setPlaying(false)
    setMuted(false)
    setShowControls(true)
  }, [])

  const goTo = useCallback(
    (nextProject: number) => {
      resetPlayerState()
      setActive(wrapIndex(nextProject, total))
      setIsClosed(false)
      setIsMinimized(false)
    },
    [resetPlayerState, total]
  )

  const next = useCallback(() => {
    resetPlayerState()
    setActive((value) => wrapIndex(value + 1, total))
    setIsClosed(false)
  }, [resetPlayerState, total])

  const prev = useCallback(() => {
    resetPlayerState()
    setActive((value) => wrapIndex(value - 1, total))
    setIsClosed(false)
  }, [resetPlayerState, total])

  const togglePlay = useCallback(() => {
    const video = videoRef.current
    if (!video || !videoSrc || isClosed) return
    showNow()

    if (video.paused) {
      video
        .play()
        .then(() => setPlaying(true))
        .catch(() => setPlaying(false))
      return
    }

    video.pause()
    setPlaying(false)
  }, [isClosed, showNow, videoSrc])

  const jump = useCallback(
    (seconds: number) => {
      const video = videoRef.current
      if (!video) return
      showNow()
      const videoDuration = Number.isFinite(video.duration) ? video.duration : duration
      const nextTime = clamp((video.currentTime || 0) + seconds, 0, videoDuration || 0)
      video.currentTime = nextTime
      setCurrentTime(nextTime)
    },
    [duration, showNow]
  )

  const requestFs = async () => {
    const el = playerRef.current as FullscreenHost | null
    if (!el) return
    try {
      if (el.requestFullscreen) await el.requestFullscreen()
      else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen()
      else if (el.mozRequestFullScreen) await el.mozRequestFullScreen()
      else if (el.msRequestFullscreen) await el.msRequestFullscreen()
    } catch {}
  }

  const exitFs = async () => {
    const doc = document as FullscreenDocument
    try {
      if (doc.exitFullscreen) await doc.exitFullscreen()
      else if (doc.webkitExitFullscreen) await doc.webkitExitFullscreen()
      else if (doc.mozCancelFullScreen) await doc.mozCancelFullScreen()
      else if (doc.msExitFullscreen) await doc.msExitFullscreen()
    } catch {}
  }

  const toggleFs = () => {
    showNow()
    if (isFullscreen) exitFs()
    else requestFs()
  }

  const toggleMute = () => {
    showNow()
    if (muted || volume <= 0) {
      setMuted(false)
      setVolume(lastVolume.current > 0 ? lastVolume.current : 0.65)
      return
    }
    lastVolume.current = volume
    setMuted(true)
  }

  const setVol = (value: number) => {
    showNow()
    const nextVolume = clamp(value, 0, 1)
    setVolume(nextVolume)
    setMuted(nextVolume <= 0)
  }

  const beginSeek = () => {
    showNow()
    setSeeking(true)
  }

  const moveSeek = (value: number) => {
    showNow()
    const video = videoRef.current
    if (!video) return
    const videoDuration = Number.isFinite(video.duration) ? video.duration : duration
    const nextTime = clamp((videoDuration || 0) * value, 0, videoDuration || 0)
    seekValRef.current = nextTime
    setCurrentTime(nextTime)
  }

  const commitSeek = () => {
    const video = videoRef.current
    if (!video) {
      setSeeking(false)
      return
    }
    video.currentTime = seekValRef.current
    setCurrentTime(seekValRef.current)
    setSeeking(false)
  }

  const closePlayer = () => {
    videoRef.current?.pause()
    setPlaying(false)
    setIsClosed(true)
    setIsMinimized(false)
  }

  const progress01 = useMemo(() => {
    if (!duration) return 0
    return clamp(currentTime / duration, 0, 1)
  }, [currentTime, duration])

  useEffect(() => {
    const prevHtmlX = document.documentElement.style.overflowX
    const prevHtmlY = document.documentElement.style.overflowY
    const prevBodyX = document.body.style.overflowX
    const prevBodyY = document.body.style.overflowY
    document.documentElement.style.overflowX = "hidden"
    document.documentElement.style.overflowY = "hidden"
    document.body.style.overflowX = "hidden"
    document.body.style.overflowY = "hidden"
    return () => {
      document.documentElement.style.overflowX = prevHtmlX
      document.documentElement.style.overflowY = prevHtmlY
      document.body.style.overflowX = prevBodyX
      document.body.style.overflowY = prevBodyY
    }
  }, [])

  useEffect(() => {
    const host = wrapRef.current
    if (!host) return

    const onWheel = (event: WheelEvent) => {
      if (!window.matchMedia("(min-width: 1024px)").matches) return
      if (!host.contains(event.target as Node)) return

      event.preventDefault()
      if (wheelLock.current) return

      wheelAccum.current += event.deltaY
      if (Math.abs(wheelAccum.current) < 44) return

      const dir = wheelAccum.current > 0 ? 1 : -1
      wheelAccum.current = 0
      wheelLock.current = true
      if (dir > 0) next()
      else prev()

      window.setTimeout(() => {
        wheelLock.current = false
      }, 360)
    }

    window.addEventListener("wheel", onWheel, { passive: false })
    return () => window.removeEventListener("wheel", onWheel)
  }, [next, prev])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.controls = false
    video.playsInline = true
    video.muted = muted || volume <= 0
    video.volume = clamp(volume, 0, 1)
  }, [muted, volume, idx, isMinimized])

  useEffect(() => {
    const video = videoRef.current
    if (!video || !videoSrc || isClosed) return

    const play = () => void video.play().catch(() => setPlaying(false))
    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) play()
    else video.addEventListener("canplay", play, { once: true })

    return () => video.removeEventListener("canplay", play)
  }, [idx, videoSrc, isClosed])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const onLoaded = () => {
      setDuration(Number.isFinite(video.duration) ? video.duration : 0)
      setCurrentTime(video.currentTime || 0)
    }
    const onTime = () => {
      if (!seeking) setCurrentTime(video.currentTime || 0)
    }
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    const onError = () => setPlaying(false)

    video.addEventListener("loadedmetadata", onLoaded)
    video.addEventListener("durationchange", onLoaded)
    video.addEventListener("timeupdate", onTime)
    video.addEventListener("play", onPlay)
    video.addEventListener("pause", onPause)
    video.addEventListener("error", onError)

    return () => {
      video.removeEventListener("loadedmetadata", onLoaded)
      video.removeEventListener("durationchange", onLoaded)
      video.removeEventListener("timeupdate", onTime)
      video.removeEventListener("play", onPlay)
      video.removeEventListener("pause", onPause)
      video.removeEventListener("error", onError)
    }
  }, [idx, seeking, isMinimized])

  useEffect(() => {
    const onFs = () => {
      const doc = document as FullscreenDocument
      const el = doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement
      setIsFullscreen(Boolean(el))
    }
    document.addEventListener("fullscreenchange", onFs)
    document.addEventListener("webkitfullscreenchange", onFs)
    document.addEventListener("mozfullscreenchange", onFs)
    document.addEventListener("MSFullscreenChange", onFs)
    return () => {
      document.removeEventListener("fullscreenchange", onFs)
      document.removeEventListener("webkitfullscreenchange", onFs)
      document.removeEventListener("mozfullscreenchange", onFs)
      document.removeEventListener("MSFullscreenChange", onFs)
    }
  }, [])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const tag = target?.tagName?.toLowerCase()
      const isTyping = Boolean(target?.isContentEditable || tag === "input" || tag === "textarea" || tag === "select")

      if (isTyping) return
      if (event.code === "Space") {
        event.preventDefault()
        togglePlay()
      }
      if (event.key === "ArrowDown") {
        event.preventDefault()
        next()
      }
      if (event.key === "ArrowUp") {
        event.preventDefault()
        prev()
      }
    }

    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [next, prev, togglePlay])

  const onProgressMove = (event: MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = clamp(event.clientX - rect.left, 0, rect.width)
    const pct = rect.width ? x / rect.width : 0
    setHoverPct(pct)
    setHoverTime((duration || 0) * pct)
  }

  return (
    <section ref={wrapRef} className="h-svh w-full overflow-hidden bg-[#e8e7e7] text-[#1e1e1e]">
      <ScrollProgress progress={archiveProgress} />
      <div className="mx-auto flex h-svh w-full max-w-420 flex-col overflow-hidden px-4 pb-4 pt-18 sm:px-6 sm:pb-5 lg:px-9 lg:pb-7 lg:pt-6">
        <header className="grid shrink-0 gap-4 border-b border-[#1e1e1e]/12 pb-4 sm:grid-cols-[minmax(180px,1fr)_280px] sm:items-end lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-8 lg:pb-4">
          <div className="min-w-0">
            <h1 className="mt-1 text-[28px] font-semibold leading-none tracking-[0] sm:text-[34px] lg:text-[42px]">{t("allprojectsHeroTitle")}</h1>
          </div>

          <div className="grid min-w-0 grid-cols-2 gap-x-5 gap-y-1.5 text-[11px] uppercase tracking-[0.14em] text-[#1e1e1e]/58 sm:text-[12px] lg:mx-auto lg:w-full lg:max-w-295 lg:self-end">
            <span>{t("allprojectsFormatLabel")}</span>
            <span className="text-right text-[#552f22]">{category.title}</span>
            <span>{t("allprojectsActiveLabel")}</span>
            <span className="text-right tabular-nums">
              {pad2(idx + 1)} / {pad2(total)}
            </span>
          </div>
        </header>

        <div className="grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)_auto] gap-4 pt-4 lg:grid-cols-[240px_minmax(0,1fr)] lg:grid-rows-1 lg:gap-8 lg:pt-5">
          <ProjectThumbs activeIndex={idx} categories={categories} onSelect={goTo} projects={projects} railRef={railRef} total={total} />

          <main className="order-1 flex min-h-0 min-w-0 flex-col lg:order-2">
            <div className="mx-auto flex min-h-0 w-full max-w-295 flex-1 flex-col">
              <div className="grid shrink-0 gap-3 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
                <div key={`meta-${current.id}`} className="transition-all duration-500 animate-[apFadeUp_520ms_cubic-bezier(.2,.9,.2,1)_both]">
                  <div className="flex items-center gap-3 text-[12px] uppercase tracking-[0.18em] text-[#552f22]">
                    <span>{current.id}</span>
                    <span className="h-px w-12 bg-[#552f22]/45" />
                    <span>{current.year}</span>
                  </div>
                  <h2 className="mt-2 max-w-[18ch] truncate text-[34px] font-semibold leading-[0.96] tracking-[0] sm:text-[48px] lg:text-[62px]">{current.title}</h2>
                </div>

                <div className="grid grid-cols-[64px_minmax(0,1fr)] gap-x-3 gap-y-1 text-[12px] leading-tight text-[#1e1e1e]/68 sm:text-[13px] lg:self-end">
                  <span className="text-[#1e1e1e]/42">{t("allprojectsTagsLabel")}</span>
                  <span className="truncate">{current.tagsLine}</span>
                  <span className="text-[#1e1e1e]/42">{t("allprojectsToolsLabel")}</span>
                  <span className="truncate">{current.tools}</span>
                </div>
              </div>

              <ProjectPlayer
                closeLabel={t("allprojectsClose")}
                current={current}
                currentTime={currentTime}
                duration={duration}
                hoveringBar={hoveringBar}
                hoverPct={hoverPct}
                hoverTime={hoverTime}
                isClosed={isClosed}
                isFullscreen={isFullscreen}
                isMinimized={isMinimized}
                minimizeLabel={t("allprojectsMinimize")}
                muted={muted}
                onBeginSeek={beginSeek}
                onClose={closePlayer}
                onCommitSeek={commitSeek}
                onJump={jump}
                onMoveSeek={moveSeek}
                onProgressMove={onProgressMove}
                onSetClosed={setIsClosed}
                onSetHoveringBar={setHoveringBar}
                onSetMinimized={setIsMinimized}
                onSetVolume={setVol}
                onShowControls={showNow}
                onToggleFullscreen={toggleFs}
                onToggleMute={toggleMute}
                onTogglePlay={togglePlay}
                playerRef={playerRef}
                playing={playing}
                progress01={progress01}
                seeking={seeking}
                showControls={showControls}
                soundOffLabel={t("allprojectsSoundOff")}
                soundOnLabel={t("allprojectsSoundOn")}
                videoRef={videoRef}
                videoSrc={videoSrc}
                volume={volume}
              />
            </div>
          </main>
        </div>
      </div>
    </section>
  )
}
