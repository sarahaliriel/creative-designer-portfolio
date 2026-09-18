"use client"

import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion"
import type { Variants } from "framer-motion"
import Image from "next/image"
import { useEffect, useMemo, useRef, useState } from "react"
import Menu from "@/components/layout/menu"
import ScrollProgress from "@/components/layout/scroll-progress"
import { useI18n } from "@/components/providers/i18n"
import FinalCtaContent from "@/components/shared/final-cta-content"

type TimelineItem = {
  year: string
  title: string
  body: string
}

type HelpColumn = {
  number: string
  title: string
  items: string[]
  body?: string
  featured?: boolean
}

const reveal: Variants = {
  hidden: { opacity: 0, y: 34, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1] },
  },
}

function splitItems(value: string) {
  return value.split("|").filter(Boolean)
}

function useCompactViewport() {
  const [isCompact, setIsCompact] = useState(true)

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px), (max-height: 760px)")
    const update = () => setIsCompact(media.matches)

    update()
    media.addEventListener("change", update)
    return () => media.removeEventListener("change", update)
  }, [])

  return isCompact
}

export default function MoreAboutPage() {
  const { t } = useI18n()

  const timeline = useMemo<TimelineItem[]>(
    () => [
      { year: "2019", title: t("moreAboutStory2019Title"), body: t("moreAboutStory2019Body") },
      { year: "2022", title: t("moreAboutStory2022Title"), body: t("moreAboutStory2022Body") },
      { year: "2025", title: t("moreAboutStory2025Title"), body: t("moreAboutStory2025Body") },
      { year: "2026", title: t("moreAboutStory2026Title"), body: t("moreAboutStory2026Body") },
    ],
    [t]
  )

  const help = useMemo<HelpColumn[]>(
    () => [
      { number: "01", title: t("moreAboutHelp01Title"), items: splitItems(t("moreAboutHelp01Items")) },
      { number: "02", title: t("moreAboutHelp02Title"), items: splitItems(t("moreAboutHelp02Items")) },
      { number: "03", title: t("moreAboutHelp03Title"), items: splitItems(t("moreAboutHelp03Items")) },
      {
        number: "04",
        title: t("moreAboutHelp04Title"),
        items: splitItems(t("moreAboutHelp04Items")),
        featured: true,
      },
    ],
    [t]
  )

  return (
    <main className="relative min-h-screen overflow-x-clip bg-[#e8e7e7] text-[#1e1e1e]">
      <ScrollProgress />
      <Menu />
      <Hero />
      <Story timeline={timeline} />
      <Help title={t("moreAboutHelpTitle")} columns={help} />
      <SocialProof
        kicker={t("moreAboutStatsKicker")}
        title={t("moreAboutStatsTitle")}
        intro={t("moreAboutStatsIntro")}
        stats={[
          { value: "+6", label: t("moreAboutStatYears"), chapter: t("moreAboutStatYearsChapter") },
          { value: "+100", label: t("moreAboutStatProjects"), chapter: t("moreAboutStatProjectsChapter") },
          { value: "+10M", label: t("moreAboutStatViews"), chapter: t("moreAboutStatViewsChapter") },
        ]}
      />
      <FinalCta
        titleLines={[t("moreAboutCtaLine1"), t("moreAboutCtaLine2")]}
        button={t("moreAboutCtaButton")}
      />
    </main>
  )
}

function Hero() {
  const { t } = useI18n()
  const prefersReducedMotion = useReducedMotion()
  const sectionRef = useRef<HTMLElement | null>(null)
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] })
  const y = useTransform(scrollYProgress, [0, 1], prefersReducedMotion ? [0, 0] : [0, 86])
  const signatureY = useTransform(scrollYProgress, [0, 1], prefersReducedMotion ? [0, 0] : [0, 34])
  const imageScale = useTransform(scrollYProgress, [0, 1], prefersReducedMotion ? [1, 1] : [1, 1.08])
  const signatureOpacity = useTransform(scrollYProgress, [0, 0.72], prefersReducedMotion ? [1, 1] : [1, 0])
  const signatureBlur = useTransform(scrollYProgress, [0, 0.72], prefersReducedMotion ? ["blur(0px)", "blur(0px)"] : ["blur(0px)", "blur(8px)"])
  const imageY = useSpring(y, { stiffness: 80, damping: 26, mass: 0.35 })
  const signatureSpringY = useSpring(signatureY, { stiffness: 70, damping: 30, mass: 0.5 })
  const cursorX = useSpring(0, { stiffness: 80, damping: 28, mass: 0.5 })
  const cursorY = useSpring(0, { stiffness: 80, damping: 28, mass: 0.5 })

  return (
    <section
      ref={sectionRef}
      className="relative min-h-svh overflow-hidden px-4 pb-16 pt-20 sm:px-8 sm:pb-16 sm:pt-28 lg:px-12 lg:pt-30"
      onMouseMove={(event) => {
        if (prefersReducedMotion) return
        const rect = event.currentTarget.getBoundingClientRect()
        cursorX.set(((event.clientX - rect.left) / rect.width - 0.5) * 16)
        cursorY.set(((event.clientY - rect.top) / rect.height - 0.5) * 16)
      }}
      onMouseLeave={() => {
        cursorX.set(0)
        cursorY.set(0)
      }}
    >
      <div className="mx-auto flex min-h-[calc(100svh-9rem)] w-full max-w-370 flex-col items-center justify-center">
        <div className="relative flex w-full -translate-y-2 justify-center sm:-translate-y-8 lg:-translate-y-10">
          <motion.div
            className="pointer-events-none absolute left-1/2 top-1/2 z-0 w-[clamp(520px,90vw,1460px)] -translate-x-1/2 -translate-y-[64%] select-none mix-blend-multiply"
            style={{ y: signatureSpringY, opacity: signatureOpacity, filter: signatureBlur }}
          >
            <motion.div
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 18, filter: "blur(10px)" }}
              animate={{ opacity: 0.065, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 1.15, delay: 0.74, ease: [0.16, 1, 0.3, 1] }}
            >
              <Image
                src="/images/profile/sarah-aliriel.png"
                alt="Assinatura Sarah Aliriel"
                width={1920}
                height={1080}
                className="h-auto w-full"
              />
            </motion.div>
          </motion.div>

          <motion.div
            className="relative z-10 h-[62svh] min-h-96 w-[min(84vw,calc(62svh*0.61))] max-w-155 overflow-hidden sm:h-[74svh] sm:min-h-120 sm:w-[min(68vw,calc(74svh*0.61))] lg:h-[78svh] lg:min-h-155 lg:w-[min(46vw,calc(78svh*0.61))]"
            initial={{ opacity: 0, y: 34, filter: "blur(12px)", clipPath: "inset(18% 0 18% 0)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)", clipPath: "inset(0% 0 0% 0)" }}
            transition={{ duration: 1.18, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div className="absolute inset-[-6%_0]" style={{ y: imageY }}>
              <motion.div
                className="absolute inset-0"
                style={{ scale: imageScale, x: cursorX, y: cursorY }}
              >
                <Image
                  src="/images/moreabout/aboutme-photo.png"
                  alt="Sarah Aliriel Dumitrache"
                  fill
                  preload
                  sizes="(min-width: 1024px) 46vw, (min-width: 640px) 68vw, 82vw"
                  className="scale-[1.03] object-cover object-center"
                />
                <div className="absolute inset-0 border border-[#1e1e1e]/10 mix-blend-multiply" />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        <div className="relative z-20 mt-0 w-full max-w-305 sm:mt-1">
          <motion.div
            className="border-t border-[#1e1e1e]/24 pt-5 text-[14px] leading-snug text-[#1e1e1e]/74 sm:pt-6 sm:text-[15px] lg:text-base"
            initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.82, delay: 0.98, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="grid gap-3 text-center sm:grid-cols-2 sm:text-left lg:grid-cols-[1fr_1.4fr_1fr] lg:items-start">
              <h1 className="profile-name whitespace-nowrap sm:col-span-1">
                {t("moreAboutName")}
              </h1>
              <p className="sm:text-right lg:text-center">
                {t("moreAboutRole1")} <span className="text-[#1e1e1e]/34">/</span> {t("moreAboutRole2")}{" "}
                <span className="text-[#1e1e1e]/34">/</span> {t("moreAboutRole3")}
              </p>
              <p className="sm:col-span-2 sm:text-center lg:col-span-1 lg:text-right">{t("moreAboutLocation")}</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function Story({ timeline }: { timeline: TimelineItem[] }) {
  const { t } = useI18n()

  return (
    <section className="px-4 py-24 sm:px-8 sm:py-32 lg:px-12">
      <div className="mx-auto w-full max-w-330">
        <motion.div className="mb-14 sm:mb-20" variants={reveal} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }}>
          <span className="kicker">{t("moreAboutStoryKicker")}</span>
          <h2 className="mt-5 max-w-4xl font-display text-[clamp(3rem,8vw,8rem)] font-black uppercase leading-[0.88] tracking-[0]">
            {t("moreAboutStoryTitle")}
          </h2>
        </motion.div>

        <div>
          {timeline.map((item) => (
            <motion.article
              key={item.year}
              className="grid gap-6 border-t border-[#1e1e1e]/18 py-10 last:border-b md:grid-cols-[130px_230px_minmax(0,1fr)] md:gap-8 md:py-14 lg:grid-cols-[170px_320px_minmax(0,1fr)] lg:gap-12"
              variants={reveal}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.35 }}
            >
              <div className="font-display text-[clamp(2rem,4vw,4.5rem)] font-black leading-none text-[#552f22]">{item.year}</div>
              <h3 className="max-w-75 font-display text-[clamp(1.45rem,2.4vw,2.65rem)] font-semibold leading-[1.02] tracking-[0]">{item.title}</h3>
              <p className="max-w-2xl text-base leading-relaxed text-[#1e1e1e]/68 sm:text-lg">{item.body}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}

function Help({ title, columns }: { title: string; columns: HelpColumn[] }) {
  const [activeColumn, setActiveColumn] = useState<string | null>(null)

  return (
    <section className="px-4 py-24 sm:px-8 sm:py-32 lg:px-12">
      <div className="mx-auto mb-14 w-full max-w-330 sm:mb-20">
        <motion.h2
          className="max-w-5xl font-display text-[clamp(3rem,7vw,8.5rem)] font-black leading-[0.9] tracking-[0]"
          variants={reveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
        >
          {title}
        </motion.h2>
      </div>

      <div className="mx-auto w-full max-w-370">
        <div className="grid border-t border-[#1e1e1e]/18 md:grid-cols-2 lg:grid-cols-4" onMouseLeave={() => setActiveColumn(null)}>
          {columns.map((column, index) => (
            <motion.div
              key={column.number}
              variants={reveal}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.25 }}
              transition={{ delay: index * 0.05 }}
            >
              <motion.article
                className={[
                  "relative min-h-0 border-b border-[#1e1e1e]/18 px-0 py-8 md:min-h-95 md:px-7 lg:border-r lg:last:border-r-0",
                  column.featured ? "text-[#1e1e1e]" : "",
                ].join(" ")}
                animate={{
                  opacity: activeColumn && activeColumn !== column.number ? 0.48 : 1,
                  y: activeColumn === column.number ? -6 : 0,
                  backgroundColor: activeColumn === column.number ? "rgba(255,255,255,0.23)" : "rgba(255,255,255,0)",
                }}
                onMouseEnter={() => setActiveColumn(column.number)}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <motion.div
                  className="absolute -inset-x-px top-0 h-1 origin-left bg-[#552f22]"
                  animate={{ scaleX: activeColumn === column.number || (!activeColumn && column.featured) ? 1 : 0 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                />
                <div className="flex items-start justify-between gap-6">
                  <span className="font-display text-[13px] font-semibold text-[#552f22]">{column.number}</span>
                  {column.featured ? <span className="h-2.5 w-2.5 rounded-full bg-[#552f22]" aria-hidden="true" /> : null}
                </div>
                <h3 className="mt-10 font-display text-[clamp(1.55rem,2vw,2.4rem)] font-semibold leading-tight tracking-[0]">{column.title}</h3>
                <ul className="mt-8 space-y-3 text-[15px] leading-snug text-[#1e1e1e]/72 sm:text-base">
                  {column.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                {column.body ? <p className="mt-10 max-w-xs text-lg font-medium leading-snug text-[#1e1e1e]">{column.body}</p> : null}
              </motion.article>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

type Stat = { value: string; label: string; chapter: string }

function SocialProof({ kicker, title, intro, stats }: { kicker: string; title: string; intro: string; stats: Stat[] }) {
  return (
    <section className="overflow-hidden px-4 py-28 sm:px-8 sm:py-40 lg:px-12 lg:py-48">
      <div className="mx-auto w-full max-w-370">
        <motion.header
          className="grid gap-10 border-t border-[#1e1e1e]/18 pt-7 sm:pt-10 lg:grid-cols-[minmax(0,1.55fr)_minmax(18rem,.65fr)] lg:items-end lg:gap-20"
          variants={reveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.35 }}
        >
          <div>
            <span className="kicker text-[#552f22]">{kicker}</span>
            <h2 className="mt-6 max-w-[11ch] font-display text-[clamp(3.2rem,7.5vw,8.4rem)] font-black leading-[0.88] tracking-[-0.045em]">
              {title}
            </h2>
          </div>
          <p className="max-w-md text-base leading-relaxed text-[#1e1e1e]/65 sm:text-lg">{intro}</p>
        </motion.header>

        <div className="mt-24 sm:mt-36 lg:mt-48">
          {stats.map((stat, index) => (
            <motion.article
              key={stat.label}
              className="group relative grid min-h-0 gap-7 border-t border-[#1e1e1e]/18 py-10 sm:min-h-80 sm:gap-8 sm:py-14 lg:grid-cols-[8rem_minmax(0,1.25fr)_minmax(17rem,.65fr)] lg:items-center lg:gap-12 lg:py-16"
              variants={reveal}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.35 }}
              transition={{ delay: index * 0.08 }}
            >
              <motion.span
                className="absolute inset-x-0 top-0 h-0.75 origin-left bg-[#552f22]"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true, amount: 0.7 }}
                transition={{ duration: 1.1, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
                aria-hidden="true"
              />
              <div className="flex items-center justify-between lg:block">
                <span className="font-display text-xs font-semibold tracking-[0.12em] text-[#552f22]">0{index + 1}</span>
                <span className="text-[10px] uppercase tracking-[0.18em] text-[#1e1e1e]/35 lg:mt-4 lg:block">{stat.chapter}</span>
              </div>
              <strong className="block font-display text-[clamp(5.6rem,14vw,13.5rem)] font-black leading-[0.72] tracking-[-0.075em] text-[#552f22] transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:translate-x-2 sm:leading-[0.74]">
                {stat.value}
              </strong>
              <p className="max-w-[12ch] font-display text-[clamp(1.65rem,3vw,3.25rem)] font-semibold leading-[0.98] tracking-[-0.025em]">
                {stat.label}
              </p>
            </motion.article>
          ))}
          <div className="border-t border-[#1e1e1e]/18" />
        </div>
      </div>
    </section>
  )
}

function FinalCta({ titleLines, button }: { titleLines: string[]; button: string }) {
  const prefersReducedMotion = useReducedMotion()
  const isCompactViewport = useCompactViewport()
  const disablePinnedTransition = Boolean(prefersReducedMotion) || isCompactViewport
  const transitionRef = useRef<HTMLElement | null>(null)
  const { scrollYProgress } = useScroll({ target: transitionRef, offset: ["start start", "end end"] })
  const ctaY = useTransform(scrollYProgress, [0, 0.72], prefersReducedMotion ? ["0%", "0%"] : ["100%", "0%"])

  return (
    <section
      id="final-cta"
      ref={transitionRef}
      className={disablePinnedTransition ? "relative z-20" : "relative z-20 -mt-[100svh] h-[220svh]"}
    >
      <div className={disablePinnedTransition ? "relative" : "sticky top-0 h-svh overflow-hidden"}>
        <FinalCtaContent
          titleLines={titleLines}
          button={button}
          theme="dark"
          style={disablePinnedTransition ? undefined : { y: ctaY }}
        />
      </div>
    </section>
  )
}
