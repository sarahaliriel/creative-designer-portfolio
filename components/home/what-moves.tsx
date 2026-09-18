"use client"

import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion"
import type { MotionValue } from "framer-motion"
import Link from "next/link"
import type { PointerEvent } from "react"
import { useRef } from "react"
import { useI18n } from "@/components/providers/i18n"
import RollingText from "@/components/shared/rolling-text"
import { useMobileMotion } from "@/lib/use-mobile-motion"

const moveKeywords = /^(pararem|sentirem|lembrarem|stop|feel|remember|detengan|sientan|recuerden)[,.]?$/i

function MovingWord({
  children,
  index,
  total,
  progress,
  emphasized,
  reducedMotion,
}: {
  children: string
  index: number
  total: number
  progress: MotionValue<number>
  emphasized: boolean
  reducedMotion: boolean
}) {
  const hasFinalPeriod = children.endsWith(".")
  const word = hasFinalPeriod ? children.slice(0, -1) : children
  const start = 0.03 + (index / total) * 0.68
  const end = Math.min(start + (emphasized ? 0.22 : 0.16), 0.92)
  const opacity = useTransform(progress, [start, end], reducedMotion ? [1, 1] : [emphasized ? 0.06 : 0.18, 1])
  const y = useTransform(progress, [start, end], reducedMotion ? [0, 0] : [emphasized ? 34 : 22, 0])
  const filter = useTransform(
    progress,
    [start, end],
    reducedMotion ? ["blur(0px)", "blur(0px)"] : [emphasized ? "blur(9px)" : "blur(6px)", "blur(0px)"]
  )

  return (
    <motion.span
      className={emphasized ? "inline-block font-black text-[#552f22]" : "inline-block"}
      style={{ opacity, y, filter }}
    >
      {word}
      {hasFinalPeriod ? <span className="text-[#f4f2ec]">.</span> : null}
    </motion.span>
  )
}

function MagneticAboutButton({ reducedMotion }: { reducedMotion: boolean }) {
  const { t } = useI18n()
  const buttonX = useMotionValue(0)
  const buttonY = useMotionValue(0)
  const contentX = useMotionValue(0)
  const contentY = useMotionValue(0)
  const springConfig = { stiffness: 170, damping: 18, mass: 0.45 }
  const x = useSpring(buttonX, springConfig)
  const y = useSpring(buttonY, springConfig)
  const innerX = useSpring(contentX, springConfig)
  const innerY = useSpring(contentY, springConfig)

  const resetPosition = () => {
    buttonX.set(0)
    buttonY.set(0)
    contentX.set(0)
    contentY.set(0)
  }

  const handlePointerMove = (event: PointerEvent<HTMLAnchorElement>) => {
    if (reducedMotion || event.pointerType === "touch") return

    const rect = event.currentTarget.getBoundingClientRect()
    const offsetX = event.clientX - (rect.left + rect.width / 2)
    const offsetY = event.clientY - (rect.top + rect.height / 2)

    buttonX.set(offsetX * 0.12)
    buttonY.set(offsetY * 0.12)
    contentX.set(offsetX * 0.22)
    contentY.set(offsetY * 0.22)
  }

  return (
    <motion.div
      className="relative z-20 self-center"
      style={reducedMotion ? undefined : { x, y }}
      whileHover={reducedMotion ? undefined : { scale: 1.06 }}
      transition={{ type: "spring", stiffness: 190, damping: 17, mass: 0.5 }}
    >
      <Link
        href="/more-about"
        aria-label={t("moreAboutMovesCta")}
        onPointerMove={handlePointerMove}
        onPointerLeave={resetPosition}
        onBlur={resetPosition}
        className="group relative inline-flex aspect-square w-[clamp(132px,38vw,156px)] items-center justify-center overflow-hidden rounded-full border border-transparent bg-[#552f22] p-5 text-center font-display text-[clamp(.72rem,.9vw,.88rem)] font-semibold uppercase leading-tight text-[#f4f2ec] transition-[transform,box-shadow,color] duration-700 ease-[cubic-bezier(.16,1,.3,1)] hover:text-[#552f22] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#552f22] sm:w-[clamp(158px,12vw,188px)]"
      >
        <span
          className="absolute inset-0 origin-bottom scale-y-0 rounded-full bg-[#f4f2ec] transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-y-100"
          aria-hidden="true"
        />
        <motion.span
          className="relative z-10 grid min-w-[8.5em] place-items-center tracking-[0.04em]"
          style={reducedMotion ? undefined : { x: innerX, y: innerY }}
        >
          <RollingText variant="strong" hoverText={t("moreAboutMovesCtaHover")}>{t("moreAboutMovesCta")}</RollingText>
        </motion.span>
      </Link>
    </motion.div>
  )
}

export default function WhatMoves() {
  const { t } = useI18n()
  const sectionRef = useRef<HTMLElement | null>(null)
  const prefersReducedMotion = useReducedMotion()
  const mobileMotion = useMobileMotion()
  const reduceMotion = Boolean(prefersReducedMotion || mobileMotion)
  const quote = t("moreAboutMovesQuote")
  const words = quote.split(/\s+/)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  })

  return (
    <section
      ref={sectionRef}
      className={
        reduceMotion
          ? "relative z-20 overflow-x-clip bg-transparent px-4 py-24 text-[#f4f2ec] sm:px-8 sm:py-32 lg:px-12"
          : "relative z-20 h-[180svh] overflow-x-clip bg-transparent px-4 text-[#f4f2ec] sm:px-8 lg:px-12"
      }
    >
      <div className={reduceMotion ? "mx-auto w-full" : "sticky top-0 mx-auto flex h-svh w-full items-center"}>
        <div className="mx-auto flex w-full max-w-280 flex-col py-[clamp(2.5rem,6svh,5rem)] sm:w-[72vw]">
          <p
            className="w-full text-balance text-center font-display text-[clamp(2.4rem,13vw,4.2rem)] font-medium leading-[0.96] tracking-[-0.045em] sm:text-[clamp(3.2rem,6.8vw,7.2rem)] sm:leading-[0.94]"
          >
            <span className="sr-only">{quote}</span>
            {words.map((word, index) => {
              const emphasized = moveKeywords.test(word)

              return (
                <span key={`${word}-${index}`} aria-hidden="true">
                  <MovingWord
                    index={index}
                    total={words.length}
                    progress={scrollYProgress}
                    emphasized={emphasized}
                    reducedMotion={reduceMotion}
                  >
                    {word}
                  </MovingWord>
                  {index < words.length - 1 ? " " : null}
                </span>
              )
            })}
          </p>

          <div className="mt-[clamp(2.75rem,6svh,5rem)] flex w-full justify-center">
            <MagneticAboutButton reducedMotion={reduceMotion} />
          </div>
        </div>
      </div>
    </section>
  )
}
