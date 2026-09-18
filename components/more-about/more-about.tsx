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
  const imageScale = useTransform(scrollYProgress, [0, 1], prefersReducedMotion ? [1, 1] : [1, 1.08])
  const imageY = useSpring(y, { stiffness: 80, damping: 26, mass: 0.35 })
  const cursorX = useSpring(0, { stiffness: 80, damping: 28, mass: 0.5 })
  const cursorY = useSpring(0, { stiffness: 80, damping: 28, mass: 0.5 })

  return (
    <section
      ref={sectionRef}
      className="relative min-h-svh overflow-hidden px-4 pb-16 pt-18 sm:px-8 sm:pb-16 sm:pt-28 lg:px-12 lg:pt-30"
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
      <div className="mx-auto flex min-h-[calc(100svh-9rem)] w-full max-w-370 flex-col items-start justify-start pt-7 sm:items-center sm:justify-center sm:pt-0">
        <div className="relative flex w-full translate-y-0 justify-center sm:-translate-y-10 lg:-translate-y-14">
          <motion.div
            className="relative z-10 aspect-[5/6] w-full overflow-hidden sm:aspect-[5/3] sm:w-[min(66vw,calc(50svh*1.667))] lg:w-[min(76vw,calc(66svh*1.667))]"
            initial={{ opacity: 0, y: 34, filter: "blur(12px)", clipPath: "inset(18% 0 18% 0)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)", clipPath: "inset(0% 0 0% 0)" }}
            transition={{ duration: 1.18, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div className="absolute inset-0 sm:inset-[-6%_0]" style={{ y: imageY }}>
              <motion.div
                className="absolute inset-0"
                style={{ scale: imageScale, x: cursorX, y: cursorY }}
              >
                <picture>
                  <source media="(max-width: 639px)" srcSet="/images/moreabout/sarah-aliriel-photo.jpeg" />
                  <Image
                    src="/images/moreabout/sarah-aliriel-photo.jpeg"
                    alt="Sarah Aliriel Dumitrache"
                    fill
                    fetchPriority="high"
                    sizes="(min-width: 1024px) 76vw, (min-width: 640px) 66vw, 82vw"
                    className="scale-[1.03] object-cover object-center"
                  />
                </picture>
                <div className="absolute inset-0 border border-[#1e1e1e]/10 mix-blend-multiply" />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        <div className="relative z-20 mt-8 w-full max-w-305 sm:mt-1 lg:-mt-5 lg:w-[min(76vw,calc(66svh*1.667))] lg:max-w-none">
          <motion.div
            className="pt-0 text-[14px] leading-snug text-[#1e1e1e]/74 sm:border-t sm:border-[#1e1e1e]/24 sm:pt-6 sm:text-[15px] lg:pt-8 lg:text-base"
            initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.82, delay: 0.98, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="grid gap-3 text-left sm:grid-cols-2 lg:grid-cols-[1.5fr_1px_1fr] lg:gap-x-12 lg:gap-y-3 lg:items-start">
              <div className="mb-5 h-px w-36 bg-[#1e1e1e]/55 sm:hidden" />
              <h1 className="profile-name whitespace-nowrap text-[clamp(2.6rem,6.2vw,4rem)] font-medium tracking-[-0.04em] text-[#552f22] sm:col-span-1 sm:text-[clamp(2.1rem,4.3vw,4rem)] sm:font-extrabold sm:tracking-normal lg:row-span-2 lg:self-center lg:text-center lg:!text-[clamp(3.8rem,3.6vw,4.6rem)] lg:!font-extrabold lg:leading-[0.96] lg:tracking-[-0.045em]">
                {t("moreAboutName")}
              </h1>
              <div className="hidden lg:col-start-2 lg:row-span-2 lg:block lg:self-stretch lg:bg-[#1e1e1e]/24" />
              <p className="text-[1.25rem] leading-[1.3] sm:text-right sm:text-[15px] lg:col-start-3 lg:text-left lg:text-base">
                {t("moreAboutRole1")} <span className="text-[#1e1e1e]/34">/</span> {t("moreAboutRole2")}{" "}
                <span className="hidden text-[#1e1e1e]/34 sm:inline">/</span> <span className="block sm:inline lg:inline">{t("moreAboutRole3")}</span>
              </p>
              <p className="text-[0.9rem] text-[#1e1e1e]/52 sm:col-span-2 sm:text-center sm:text-[15px] sm:text-[#1e1e1e]/74 lg:col-start-3 lg:text-left lg:text-base">{t("moreAboutLocation")}</p>
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
