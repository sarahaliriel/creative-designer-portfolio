"use client"

import {
  motion,
  useMotionTemplate,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion"
import { useEffect, useRef, useState } from "react"
import { useI18n } from "@/components/providers/i18n"
import FinalCtaContent from "@/components/shared/final-cta-content"
import { useMobileMotion } from "@/lib/use-mobile-motion"

export default function ProjectToCtaTransition() {
  const { t } = useI18n()
  const reducedMotion = Boolean(useReducedMotion())
  const mobileMotion = useMobileMotion()
  const reduceMotion = reducedMotion || mobileMotion
  const sectionRef = useRef<HTMLElement>(null)
  const buttonAnchorRef = useRef<HTMLDivElement>(null)
  const [contentActive, setContentActive] = useState(reduceMotion)
  const [buttonVisible, setButtonVisible] = useState(reduceMotion)
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end end"] })

  useEffect(() => {
    if (!reduceMotion) return
    setContentActive(true)
    setButtonVisible(true)
  }, [reduceMotion])

  useEffect(() => {
    const scrollToCta = (behavior: ScrollBehavior) => {
      if (!sectionRef.current) return

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const finalPosition = document.documentElement.scrollHeight - window.innerHeight
          window.scrollTo({ top: finalPosition, behavior })
        })
      })
    }

    const onNav = () => scrollToCta("smooth")
    window.addEventListener("nav:contact", onNav)
    return () => window.removeEventListener("nav:contact", onNav)
  }, [])

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (reduceMotion) return
    if (latest >= 0.72) setButtonVisible(true)
    setContentActive((current) => {
      const next = latest >= 0.84
      return current === next ? current : next
    })
  })

  const rawRadius = useTransform(scrollYProgress, [0, 0.16, 0.72, 1], [4.2, 6.2, 150, 160])
  const radius = useSpring(rawRadius, { stiffness: 92, damping: 26, mass: 0.55 })
  const clipPath = useMotionTemplate`circle(${radius}vmax at 70% 58%)`
  const contentOpacity = useTransform(scrollYProgress, [0.68, 0.82, 1], [0, 1, 1])
  const contentY = useTransform(scrollYProgress, [0.68, 0.84], [44, 0])
  const contentBlur = useTransform(scrollYProgress, [0.68, 0.82], ["blur(12px)", "blur(0px)"])
  const cueOpacity = useTransform(scrollYProgress, [0, 0.12, 0.34], [0, 0.62, 0])

  return (
    <section
      id="contact"
      ref={sectionRef}
      data-project-cta-transition
      className={`relative z-30 overflow-x-clip bg-[#1e1e1e] ${reduceMotion ? "min-h-svh bg-[#e8e7e7]" : "h-[280svh] sm:h-[310svh]"}`}
    >
      <div data-orb-stage className={`${reduceMotion ? "relative" : "sticky top-0"} isolate min-h-svh w-full overflow-hidden bg-[#1e1e1e]`}>
        <motion.div
          aria-hidden="true"
          className="absolute inset-0 bg-[#e8e7e7] will-change-[clip-path]"
          style={{ clipPath: reduceMotion ? "none" : clipPath }}
        />

        <FinalCtaContent
          id="home-final-cta"
          titleLines={[t("projectCtaLine1"), t("projectCtaLine2")]}
          button={t("moreAboutCtaButton")}
          buttonTheme="dark"
          buttonAnchorRef={buttonAnchorRef}
          interactive={reduceMotion || contentActive}
          animateReveal={false}
          buttonVisible={buttonVisible}
          style={reduceMotion
            ? { opacity: 1, y: 0, filter: "blur(0px)" }
            : { opacity: contentOpacity, y: contentY, filter: contentBlur }}
        />

        {!reduceMotion ? (
          <motion.p
            aria-hidden="true"
            className="pointer-events-none absolute bottom-8 left-1/2 z-40 -translate-x-1/2 text-[9px] font-semibold uppercase tracking-[.24em] text-[#e8e7e7] sm:bottom-10 sm:text-[10px]"
            style={{ opacity: cueOpacity }}
          >
            {t("projectCtaScroll")}
          </motion.p>
        ) : null}
      </div>
    </section>
  )
}
