"use client"

import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import Image from "next/image"
import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { useI18n } from "@/components/providers/i18n"

const PORTFOLIO_LETTERS = Array.from("portfolio")

const heroTitleClassName =
  "font-display font-black select-none text-center text-[clamp(88px,19vw,320px)]! text-ink leading-[0.88] tracking-[-0.055em] max-md:leading-[0.95] max-md:tracking-[-0.045em]"

type LetterBounds = {
  left: number
  top: number
  width: number
  height: number
}

export default function Hero() {
  const [introDone, setIntroDone] = useState(() => {
    if (typeof document === "undefined") return false
    return document.documentElement.dataset.intro === "done"
  })

  useLayoutEffect(() => {
    const onDone = () => setIntroDone(true)
    window.addEventListener("intro:done", onDone)

    // IntroOverlay is mounted before the page. When an intro is skipped it can
    // finish in its layout effect before this listener exists, so also read the
    // durable DOM state instead of relying exclusively on the event.
    if (document.documentElement.dataset.intro === "done") onDone()

    return () => window.removeEventListener("intro:done", onDone)
  }, [])

  return (
    <div
      className="relative min-h-svh overflow-hidden bg-base transition-[transform,filter,opacity] duration-1100ms ease-[cubic-bezier(.16,1,.22,1)]"
      style={{
        transform: introDone ? "translate3d(0,0,0) scale(1)" : "translate3d(0,10px,0) scale(1.035)",
        filter: introDone ? "blur(0px)" : "blur(2px)",
        opacity: introDone ? 1 : 0.98,
      }}
    >
      <HeroScene introDone={introDone} />
    </div>
  )
}

function HeroScene({ introDone }: { introDone: boolean }) {
  const { t } = useI18n()
  const [signaturePhase, setSignaturePhase] = useState<0 | 1 | 2 | 3>(0)

  useEffect(() => {
    if (!introDone) {
      const reset = window.setTimeout(() => setSignaturePhase(0), 0)
      return () => window.clearTimeout(reset)
    }

    const t1 = window.setTimeout(() => setSignaturePhase(1), 160)
    const t2 = window.setTimeout(() => setSignaturePhase(2), 260)
    const t3 = window.setTimeout(() => setSignaturePhase(3), 520)

    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
      window.clearTimeout(t3)
    }
  }, [introDone])

  const show = signaturePhase >= 1
  const reveal = signaturePhase >= 2

  return (
    <section id="home-hero" className="relative min-h-svh overflow-hidden text-ink">
      <div className="absolute left-4 top-5 z-30 sm:left-8 sm:top-7">
        <div className="text-[14px] backdrop-blur-xl sm:text-[15px]">{t("heroAvailable")}</div>
      </div>

      <div className="container-bleed relative z-10 flex min-h-svh flex-col pb-10 pt-28 sm:pb-12 sm:pt-32 lg:pb-14 lg:pt-36">
        <div className="flex flex-1 items-center justify-center">
          <div className="relative left-1/2 w-screen max-w-none -translate-x-1/2 -translate-y-[10vh]">
            <InteractivePortfolio introDone={introDone} />

            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div
                className={[
                  "relative select-none",
                  "transition-[transform,opacity,filter] duration-520 ease-[cubic-bezier(.16,1,.25,1)]",
                  show ? "opacity-95 translate-y-0 scale-100 blur-0" : "opacity-0 translate-y-2 scale-[1.02] blur-[6px]",
                ].join(" ")}
                style={{
                  clipPath: reveal ? "inset(0 0 0 0 round 0px)" : "inset(0 100% 0 0 round 0px)",
                  transitionProperty: "clip-path, transform, opacity, filter",
                }}
              >
                <Image
                  src="/images/profile/sarah-aliriel.png"
                  alt="Sarah Aliriel"
                  width={2600}
                  height={600}
                  preload
                  sizes="(max-width: 639px) 46vw, (max-width: 1023px) 46vw, 860px"
                  className="h-auto w-[clamp(240px,46vw,860px)] translate-y-[2%] select-none"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 text-[15px] opacity-75 sm:grid-cols-3 sm:text-[16px]">
          <div className="sm:text-left">{t("heroRole1")}</div>
          <div className="sm:text-center">{t("heroRole2")}</div>
          <div className="sm:text-right">{t("heroRole3")}</div>
        </div>
      </div>
    </section>
  )
}

function InteractivePortfolio({ introDone }: { introDone: boolean }) {
  const { t } = useI18n()
  const prefersReducedMotion = useReducedMotion()
  const hostRef = useRef<HTMLDivElement | null>(null)
  const titleRef = useRef<HTMLHeadingElement | null>(null)
  const lastPointerTypeRef = useRef("")
  const touchWasActiveRef = useRef(false)
  const [letterBounds, setLetterBounds] = useState<LetterBounds[]>([])
  const [hostWidth, setHostWidth] = useState(0)
  const [hostHeight, setHostHeight] = useState(0)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const words = t("heroLetterWords").split("|")

  useLayoutEffect(() => {
    const host = hostRef.current
    const title = titleRef.current
    if (!host || !title) return
    let cancelled = false

    const measure = () => {
      if (cancelled) return
      const textNode = Array.from(title.childNodes).find((node) => node.nodeType === Node.TEXT_NODE)
      if (!textNode) return

      const hostRect = host.getBoundingClientRect()
      const nextBounds = PORTFOLIO_LETTERS.map((_, index) => {
        const range = document.createRange()
        range.setStart(textNode, index)
        range.setEnd(textNode, index + 1)
        const rect = range.getBoundingClientRect()
        range.detach()

        return {
          left: rect.left - hostRect.left,
          top: rect.top - hostRect.top,
          width: rect.width,
          height: rect.height,
        }
      })

      setLetterBounds(nextBounds)
      setHostWidth(hostRect.width)
      setHostHeight(hostRect.height)
    }

    measure()
    const resizeObserver = new ResizeObserver(measure)
    resizeObserver.observe(host)
    const settleTimer = window.setTimeout(measure, 680)
    document.fonts.ready.then(measure)

    return () => {
      cancelled = true
      resizeObserver.disconnect()
      window.clearTimeout(settleTimer)
    }
  }, [introDone])

  const activeBounds = activeIndex === null ? null : letterBounds[activeIndex]
  const activeWord = activeIndex === null ? null : words[activeIndex]

  return (
    <div ref={hostRef} className="relative isolate">
      <h1
        ref={titleRef}
        className={`${heroTitleClassName} relative z-10 transition-[transform,opacity,filter] duration-600 ease-[cubic-bezier(.16,1,.3,1)]
        ${introDone ? "scale-100 opacity-100 blur-0" : "scale-[1.06] opacity-0 blur-[2px]"}`}
      >
        portfolio
      </h1>

      <AnimatePresence initial={false}>
        {activeBounds && activeWord ? (
          <div
            key={`word-anchor-${activeIndex}`}
            className="pointer-events-none absolute z-20 -translate-x-1/2"
            style={{
              left: activeBounds.left + activeBounds.width / 2,
              top: hostHeight + Math.min(20, Math.max(10, hostHeight * 0.065)),
            }}
            aria-hidden="true"
          >
            <motion.span
              key={`word-${activeIndex}`}
              className="block whitespace-nowrap font-display text-[clamp(16px,1.65vw,27px)] font-bold tracking-[-0.035em] text-detail"
              style={{ color: "#552f22" }}
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 10, filter: prefersReducedMotion ? "none" : "blur(8px)" }}
              animate={{ opacity: 0.88, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: prefersReducedMotion ? 0 : -4, filter: prefersReducedMotion ? "none" : "blur(6px)" }}
              transition={{ duration: prefersReducedMotion ? 0.18 : 0.52, ease: [0.16, 1, 0.3, 1] }}
            >
              {activeWord}
            </motion.span>
          </div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {activeBounds ? (
          <motion.h1
            key={`letter-slice-${activeIndex}`}
            className={`${heroTitleClassName} pointer-events-none absolute inset-x-0 top-0 z-20`}
            style={{
              clipPath: `inset(${Math.max(0, activeBounds.top)}px ${Math.max(0, hostWidth - activeBounds.left - activeBounds.width)}px ${Math.max(0, hostHeight - activeBounds.top - activeBounds.height)}px ${Math.max(0, activeBounds.left)}px)`,
              transformOrigin: `${activeBounds.left + activeBounds.width / 2}px ${activeBounds.top + activeBounds.height / 2}px`,
            }}
            initial={{ opacity: 0, scale: 1 }}
            animate={{
              opacity: 1,
              scale: prefersReducedMotion ? 1 : 1.025,
            }}
            exit={{ opacity: 0, scale: 1 }}
            transition={{ duration: prefersReducedMotion ? 0.18 : 0.5, ease: [0.16, 1, 0.3, 1] }}
            aria-hidden="true"
          >
            portfolio
          </motion.h1>
        ) : null}
      </AnimatePresence>

      {letterBounds.map((bounds, index) => {
        const letter = PORTFOLIO_LETTERS[index]
        const word = words[index] ?? ""
        const isActive = activeIndex === index

        return (
          <button
            key={`${letter}-${index}`}
            type="button"
            className="absolute z-30 appearance-none border-0 bg-transparent p-0 outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#552f22]"
            style={{ left: bounds.left, top: bounds.top, width: bounds.width, height: bounds.height }}
            aria-label={`${t("heroLetterAria")} ${letter.toUpperCase()}: ${word}`}
            aria-pressed={isActive}
            data-portfolio-letter={letter}
            data-letter-index={index}
            data-active={isActive ? "true" : "false"}
            onPointerEnter={(event) => {
              if (event.pointerType !== "touch") setActiveIndex(index)
            }}
            onPointerLeave={(event) => {
              if (event.pointerType !== "touch" && document.activeElement !== event.currentTarget) {
                setActiveIndex(null)
              }
            }}
            onPointerDown={(event) => {
              lastPointerTypeRef.current = event.pointerType
              if (event.pointerType === "touch") touchWasActiveRef.current = isActive
            }}
            onClick={() => {
              if (lastPointerTypeRef.current === "touch") {
                setActiveIndex(touchWasActiveRef.current ? null : index)
              }
            }}
            onFocus={() => setActiveIndex(index)}
            onBlur={() => setActiveIndex((current) => (current === index ? null : current))}
          >
            <span className="sr-only">{word}</span>
          </button>
        )
      })}
    </div>
  )
}
