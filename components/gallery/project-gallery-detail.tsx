"use client"

import Image from "next/image"
import Link from "next/link"
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion"
import { useEffect, useMemo, useState, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent } from "react"
import { useI18n } from "@/components/providers/i18n"
import ScrollProgress from "@/components/layout/scroll-progress"
import ArrowDownRight from "@/components/gallery/arrow-down-right"
import RollingText from "@/components/shared/rolling-text"
import { VisualSystem } from "@/components/gallery/visual-system"
import { getNextGalleryProject, getTranslatedGalleryProject, type GalleryCarousel, type GalleryImage, type GalleryProject, type GalleryProjectConfig } from "@/data/gallery"

const EASE = [0.16, 1, 0.3, 1] as const

function HeroSection({ project, backLabel }: { project: GalleryProject; backLabel: string }) {
  const prefersReducedMotion = useReducedMotion()
  const [mockupReady, setMockupReady] = useState(false)
  const projectTitle = project.heroTitle ?? project.name
  const isFrigideira = project.slug === "frigideira-ai"
  const scrollToStory = () => document.querySelector("#project-story")?.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" })

  return (
    <section className="relative z-10 isolate min-h-svh max-w-full bg-[#f4f2ec] px-5 pb-20 pt-[clamp(76px,9vh,112px)] text-[#1e1e1e] sm:px-8 lg:flex lg:min-h-[clamp(760px,100svh,1080px)] lg:items-stretch lg:px-[clamp(40px,4.6vw,88px)] lg:pb-[clamp(72px,9vh,108px)]">
      <div className="relative z-20 flex min-w-0 w-full flex-col lg:w-[61%] lg:pr-[clamp(16px,1.5vw,30px)]">
        <motion.div initial={prefersReducedMotion ? false : { opacity: 0, y: -14 }} animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }} transition={{ duration: 0.75, ease: EASE }}>
          <Link href="/gallery" className="w-max text-[11px] font-black uppercase tracking-[0.24em] text-(--accent) transition hover:text-(--accent) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--accent)">
            <RollingText>{backLabel}</RollingText>
          </Link>
        </motion.div>

        <div className="mt-[clamp(72px,12vh,132px)] lg:mt-[clamp(112px,17vh,184px)] lg:flex lg:flex-1 lg:flex-col">
          <div>
            <motion.h1 initial={prefersReducedMotion ? false : { opacity: 0, y: 28 }} animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }} transition={{ duration: 0.85, ease: EASE, delay: 0.08 }} className={`whitespace-nowrap font-display font-black uppercase leading-[0.76] tracking-[-0.075em] text-[#030303] ${isFrigideira ? "text-[clamp(3.65rem,12vw,13.5rem)]" : "text-[clamp(3rem,7.5vw,8.8rem)]"}`}>
              {projectTitle}
            </motion.h1>

            <motion.p initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }} animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE, delay: 0.3 }} className="mt-[clamp(30px,4.5vh,52px)] max-w-[46ch] text-[clamp(0.95rem,1.2vw,1.25rem)] leading-[1.45] text-[#1e1e1e]/82">
              {project.description}
            </motion.p>
          </div>

          <motion.dl initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }} animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE, delay: 0.48 }} className="mt-[clamp(44px,6vh,72px)] grid w-full max-w-3xl grid-cols-3 gap-[clamp(22px,4.5vw,72px)] border-y border-[#1e1e1e]/15 py-[clamp(22px,2.7vh,32px)] lg:mt-auto">
            {project.caseStudy.metrics.map((metric) => (
              <div key={metric.label}>
                <dd className="font-display text-[clamp(2.25rem,4.2vw,4.6rem)] font-black leading-none tracking-[-0.04em] text-(--accent)">{metric.value}</dd>
                <dt className="mt-2.5 max-w-[14ch] text-[7px] font-black uppercase leading-[1.45] tracking-[0.18em] text-[#1e1e1e]/48 sm:text-[8px]">{metric.label}</dt>
              </div>
            ))}
          </motion.dl>

          <button type="button" onClick={scrollToStory} aria-label="Ir para a próxima seção" className="group mt-[clamp(28px,3.5vh,42px)] grid size-11 place-items-center text-[#1e1e1e]/72 transition hover:translate-y-1 hover:text-(--accent) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--accent)">
            <ArrowDownRight />
          </button>
        </div>
      </div>

      <motion.figure
        aria-busy={!mockupReady}
        initial={false}
        animate={mockupReady && !prefersReducedMotion ? { opacity: 1, x: 0, scale: 1 } : { opacity: mockupReady ? 1 : 0.2, x: mockupReady || prefersReducedMotion ? 0 : 42, scale: mockupReady || prefersReducedMotion ? 1 : 0.97 }}
        transition={{ duration: mockupReady ? 0.85 : 0, ease: EASE }}
        className="relative z-20 mt-6 h-[min(110vw,720px)] w-full lg:absolute lg:-bottom-[17vh] lg:right-[3vw] lg:mt-0 lg:h-[108%] lg:w-[53%]"
      >
        <Image src={project.heroMockup.src} alt={project.heroMockup.alt} fill sizes="(max-width: 1023px) 100vw, 53vw" className="relative z-10 object-contain object-center lg:object-right" preload onLoad={() => setMockupReady(true)} />
        <figcaption className="sr-only">{project.heroMockup.title}</figcaption>
      </motion.figure>
    </section>
  )
}

type ProcessItem = {
  number: string
  eyebrow: string
  title: string
  description: string
  metric: string
  metricLabel: string
  detail?: string
}

type ProcessLabels = {
  kicker: string
  heading: string
  context: string
  direction: string
  impact: string
  challenge: string
  challengeBody: string
  followers: string
  directionBody: string
  views: string
  result: string
  resultBody: string
  active: string
  visualSystem: string
  next: string
  oneYear: string
  fiveMonths: string
}

function ProjectProcess({ project, labels }: { project: GalleryProject; labels: ProcessLabels }) {
  const reducedMotion = useReducedMotion()
  const isFrigideira = project.slug === "frigideira-ai"
  const isTocha = project.slug === "the-real-tocha"
  const isSdp = project.slug === "sdp"
  const metrics = project.caseStudy.metrics
  const scrollToVisualSystem = (event: ReactMouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    document.querySelector("#visual-system")?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" })
  }
  const items: ProcessItem[] = [
    {
      number: "01",
      eyebrow: labels.context,
      title: labels.challenge,
      description: isFrigideira ? labels.challengeBody : project.caseStudy.challenge,
      metric: isFrigideira ? "+200" : isTocha ? "+10K" : isSdp ? "+1.5K" : metrics[0]?.value ?? "—",
      metricLabel: isFrigideira || isTocha || isSdp ? labels.followers : metrics[0]?.label ?? labels.context,
    },
    {
      number: "02",
      eyebrow: labels.kicker,
      title: labels.direction,
      description: isFrigideira ? labels.directionBody : project.caseStudy.solution,
      metric: isFrigideira ? "+5K" : isTocha ? "+3M" : isSdp ? "+50K" : metrics[1]?.value ?? "—",
      metricLabel: isFrigideira || isTocha || isSdp ? labels.views : metrics[1]?.label ?? labels.kicker,
    },
    {
      number: "03",
      eyebrow: labels.impact,
      title: labels.result,
      description: isFrigideira ? labels.resultBody : project.caseStudy.result,
      metric: isFrigideira || isSdp ? "5" : isTocha ? "1" : metrics[2]?.value ?? "—",
      metricLabel: isFrigideira || isSdp ? labels.fiveMonths : isTocha ? labels.oneYear : metrics[2]?.label ?? labels.impact,
    },
  ]

  return (
    <section id="project-story" data-scroll-theme="dark" className="relative z-0 bg-[#1e1e1e] px-5 pb-[clamp(64px,7vw,104px)] pt-[clamp(150px,18vw,280px)] text-[#f4f2ec] sm:px-8 lg:px-[clamp(40px,4.6vw,88px)]">
      <motion.header
        initial={reducedMotion ? false : { opacity: 0, y: 24, filter: "blur(6px)" }}
        whileInView={reducedMotion ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.85, ease: EASE }}
        className="grid gap-3 border-b border-[#f4f2ec]/14 pb-[clamp(28px,4vw,52px)] lg:grid-cols-[7.5rem_1fr] lg:items-end"
      >
        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-(--accent)">{labels.kicker}</p>
        <h2 className="max-w-[22ch] font-display text-[clamp(1.8rem,3.2vw,3.8rem)] font-black leading-[0.95] tracking-[-0.035em]">{labels.heading}</h2>
      </motion.header>

      <div>
        {items.map((item, index) => (
          <motion.article
            key={item.number}
            initial={reducedMotion ? false : { opacity: 0, y: 24, filter: "blur(6px)" }}
            whileInView={reducedMotion ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.85, delay: index * 0.05, ease: EASE }}
            className="grid gap-7 border-b border-[#f4f2ec]/14 py-[clamp(38px,5vw,72px)] md:grid-cols-[6rem_minmax(0,1fr)_minmax(16rem,1.1fr)] md:gap-x-8 lg:grid-cols-[7.5rem_minmax(17rem,0.9fr)_minmax(22rem,1.15fr)_minmax(12rem,0.55fr)] lg:items-center lg:gap-x-[clamp(28px,4vw,72px)]"
          >
            <div className="flex items-center justify-between md:block">
              <span className="font-display text-sm font-black tracking-[-0.03em] text-(--accent)">{item.number}</span>
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#f4f2ec]/38 md:mt-3 md:block">{item.eyebrow}</span>
            </div>
            <h3 className="font-display text-[clamp(2.7rem,5.6vw,6.6rem)] font-black uppercase leading-[0.78] tracking-[-0.065em]">{item.title}</h3>
            <p className="max-w-[50ch] text-[clamp(0.95rem,1.25vw,1.25rem)] leading-normal text-[#f4f2ec]/72 md:col-start-2 lg:col-start-auto">{item.description}</p>
            <motion.dl
              initial={reducedMotion ? false : { opacity: 0, y: 14 }}
              whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.75, delay: reducedMotion ? 0 : 0.16, ease: EASE }}
              className="md:col-start-3 md:justify-self-end md:text-right lg:col-start-auto"
            >
              <dd className="font-display text-[clamp(3.5rem,6.4vw,7.5rem)] font-black uppercase leading-[0.72] tracking-[-0.075em]">{item.metric}</dd>
              <dt className="mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-[#f4f2ec]/58">{item.metricLabel}</dt>
              {item.detail ? <dt className="mt-2 text-[9px] font-black uppercase tracking-[0.18em] text-(--accent)">{item.detail}</dt> : null}
            </motion.dl>
          </motion.article>
        ))}
      </div>

      <a href="#visual-system" onClick={scrollToVisualSystem} className="group ml-auto mt-[clamp(36px,5vw,64px)] flex w-max items-end gap-5 text-right focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f4f2ec]">
        <span>
          <span className="block text-[9px] font-black uppercase tracking-[0.22em] text-[#f4f2ec]/38">{labels.next}</span>
          <span className="mt-2 block font-display text-[clamp(1.4rem,2.5vw,2.8rem)] font-black uppercase leading-none tracking-[-0.04em] transition group-hover:text-(--accent)">{labels.visualSystem}</span>
        </span>
        <span className="transition group-hover:translate-y-1"><ArrowDownRight /></span>
      </a>
    </section>
  )
}

function FormatHeader({ title, count }: { title: string; count: number }) {
  return (
    <header className="border-t border-[#1e1e1e]/22 pt-3">
      <h3 className="text-[10px] font-black uppercase tracking-[0.22em] text-[#1e1e1e]/68">{String(count).padStart(2, "0")} {title}</h3>
    </header>
  )
}

const itemOffset = ["", "mt-3", "mt-1", "mt-2", "", "mt-2"]

function EditorialImage({ image, index, sizes, tall = false }: { image: GalleryImage; index: number; sizes: string; tall?: boolean }) {
  return (
    <figure className={`min-w-0 ${itemOffset[index % itemOffset.length]}`}>
      <div className={`relative w-full ${tall ? "aspect-9/16" : "aspect-4/5"}`}>
        <Image src={image.src} alt={image.alt} fill sizes={sizes} className="object-contain" />
      </div>
      <figcaption className="sr-only">{image.title}</figcaption>
    </figure>
  )
}

function StaticPosts({ images }: { images: GalleryImage[] }) {
  return (
    <div className="grid grid-cols-2 items-start gap-x-1.5 gap-y-2 sm:grid-cols-3 sm:gap-x-2 lg:grid-cols-4">
      {images.map((image, index) => (
        <EditorialImage key={image.src} image={image} index={index} sizes="(max-width: 767px) 48vw, (max-width: 1023px) 32vw, 24vw" />
      ))}
    </div>
  )
}

function CarouselCard({ carousel, index }: { carousel: GalleryCarousel; index: number }) {
  const [slide, setSlide] = useState(0)
  const total = carousel.slides.length
  const step = (direction: 1 | -1) => setSlide((current) => (current + direction + total) % total)
  return (
    <article className={`min-w-0 ${itemOffset[index % itemOffset.length]}`}>
      <div className="relative aspect-4/5 w-full">
        <Image src={carousel.slides[slide].src} alt={carousel.slides[slide].alt} fill sizes="(max-width: 767px) 48vw, (max-width: 1023px) 32vw, 24vw" className="object-contain" />
      </div>
      <div className="mt-1 flex items-center justify-center gap-2 text-[#1e1e1e]/60">
        <button type="button" onClick={() => step(-1)} aria-label={`Slide anterior de ${carousel.title}`} className="grid size-7 place-items-center text-sm transition hover:text-(--accent) focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-(--accent)">←</button>
        <span className="text-[9px] font-black tabular-nums tracking-[0.12em]">{String(slide + 1).padStart(2, "0")}/{String(total).padStart(2, "0")}</span>
        <button type="button" onClick={() => step(1)} aria-label={`Próximo slide de ${carousel.title}`} className="grid size-7 place-items-center text-sm transition hover:text-(--accent) focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-(--accent)">→</button>
      </div>
    </article>
  )
}

function Stories({ images }: { images: GalleryImage[] }) {
  return <div className="mt-4 grid grid-cols-2 items-start gap-x-1.5 gap-y-2 sm:grid-cols-3 sm:gap-x-2 lg:grid-cols-4">
    {images.map((image, index) => <EditorialImage key={image.src} image={image} index={index} tall sizes="(max-width: 639px) 48vw, (max-width: 1023px) 32vw, 24vw" />)}
  </div>
}

type GalleryLabels = { posts: string; carousels: string; stories: string }

function EditorialGallery({ project, labels }: { project: GalleryProject; labels: GalleryLabels }) {
  return (
    <section id="designs" aria-label="Designs" className="scroll-mt-0 px-2 pb-[clamp(56px,7vw,96px)] sm:px-3 lg:px-4">
      <div className="space-y-[clamp(44px,5vw,72px)]">
        {project.pieces.length ? <section><FormatHeader title={labels.posts} count={project.pieces.length} /><div className="mt-4"><StaticPosts images={project.pieces} /></div></section> : null}
        {project.carousels?.length ? <section><FormatHeader title={labels.carousels} count={project.carousels.length} /><div className="mt-4 grid grid-cols-2 items-start gap-x-1.5 gap-y-3 sm:grid-cols-3 sm:gap-x-2 lg:grid-cols-4">{project.carousels.map((carousel, index) => <CarouselCard key={carousel.title} carousel={carousel} index={index} />)}</div></section> : null}
        {project.stories?.length ? <section><FormatHeader title={labels.stories} count={project.stories.length} /><Stories images={project.stories} /></section> : null}
      </div>
    </section>
  )
}

const chapterSlugs = ["frigideira-ai", "the-real-tocha", "sdp"] as const

const ctaReveal = {
  hidden: {},
  show: { transition: { staggerChildren: 0.13, delayChildren: 0.08 } },
}

const ctaRevealItem = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE } },
}

const ctaSocials = [
  { label: "Instagram", href: "https://www.instagram.com/chazinhodociel/" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/sarah-dumitrache/" },
  { label: "GitHub", href: "https://github.com/sarahaliriel" },
  { label: "Discord", href: "https://discord.com/users/942126894478950530" },
] as const

function CtaLocalTime({ label }: { label: string }) {
  const [time, setTime] = useState("--:--:--")

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat("pt-PT", { timeZone: "Europe/Lisbon", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false, timeZoneName: "short" })
    const update = () => setTime(formatter.format(new Date()))
    update()
    const interval = window.setInterval(update, 1000)
    return () => window.clearInterval(interval)
  }, [])

  return <div className="text-center"><span className="block text-[#f4f2ec]/38">{label}</span><time className="mt-2 block tracking-[0.08em] text-[#f4f2ec]/82">{time}</time></div>
}

function FinalCta({ currentProject, nextProject, labels }: { currentProject: GalleryProject; nextProject: GalleryProject; labels: { eyebrow: string; continue: string; viewProject: string; edition: string; localTime: string; socials: string } }) {
  const reducedMotion = Boolean(useReducedMotion())
  const [canHover, setCanHover] = useState(false)
  const [mockupHovered, setMockupHovered] = useState(false)
  const pointerX = useMotionValue(0)
  const pointerY = useMotionValue(0)
  const cursorX = useSpring(pointerX, { stiffness: 105, damping: 22, mass: 0.72 })
  const cursorY = useSpring(pointerY, { stiffness: 105, damping: 22, mass: 0.72 })
  const currentIndex = Math.max(0, chapterSlugs.indexOf(currentProject.slug as (typeof chapterSlugs)[number]))
  const nextTitle = nextProject.heroTitle ?? nextProject.name
  const compactTitle = nextTitle.length > 18

  useEffect(() => {
    const hoverQuery = window.matchMedia("(hover: hover) and (pointer: fine)")
    const update = () => {
      const enabled = hoverQuery.matches && !reducedMotion
      setCanHover(enabled)
      if (!enabled) setMockupHovered(false)
    }
    update()
    hoverQuery.addEventListener("change", update)
    return () => hoverQuery.removeEventListener("change", update)
  }, [reducedMotion])

  const moveMockupCursor = (event: ReactPointerEvent<HTMLElement>) => {
    if (!canHover) return
    pointerX.set(event.clientX)
    pointerY.set(event.clientY)
  }

  return (
    <motion.section
      initial={reducedMotion ? false : "hidden"}
      whileInView={reducedMotion ? undefined : "show"}
      viewport={{ once: true, amount: 0.18 }}
      variants={ctaReveal}
      aria-labelledby="next-project-title"
      data-scroll-theme="dark"
      className="relative flex min-h-svh overflow-hidden bg-[#1e1e1e] px-5 pb-6 pt-[clamp(48px,6vh,76px)] text-[#f4f2ec] sm:px-8 sm:pb-8 lg:px-12 lg:pb-9"
    >
      <div className="relative mx-auto flex w-full max-w-450 flex-1 flex-col">
        <div className="flex flex-1 flex-col items-center pt-[clamp(46px,6vh,72px)] text-center">
        <motion.div variants={ctaRevealItem} className="order-2 relative mt-[clamp(4px,1vh,12px)] h-[clamp(245px,35vh,390px)] w-[min(86vw,550px)]">
          <Link
            href={`/gallery/${nextProject.slug}`}
            scroll
            aria-label={`${labels.viewProject}: ${nextProject.name}`}
            onPointerEnter={(event) => {
              if (!canHover) return
              pointerX.set(event.clientX)
              pointerY.set(event.clientY)
              setMockupHovered(true)
            }}
            onPointerMove={moveMockupCursor}
            onPointerLeave={() => setMockupHovered(false)}
            className="absolute inset-x-0 bottom-0 top-[clamp(-104px,-9vh,-72px)] overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--accent)"
          >
            <motion.span
              initial={false}
              animate={canHover && mockupHovered ? { y: -88, scale: 1.035 } : { y: 0, scale: 1 }}
              transition={{ duration: 0.95, ease: EASE }}
              className="absolute inset-x-0 -bottom-24 top-[clamp(72px,9vh,104px)] origin-top"
            >
              <Image src={nextProject.heroMockup.src} alt={nextProject.heroMockup.alt} fill sizes="(max-width: 640px) 86vw, 550px" className="object-cover object-top drop-shadow-[0_28px_70px_rgba(0,0,0,0.32)]" />
            </motion.span>
          </Link>
        </motion.div>

        <motion.header variants={{ hidden: { opacity: 0, y: 22, filter: "blur(10px)" }, show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.95, ease: EASE } } }} className="order-1 relative z-10">
          <p className="font-display text-[clamp(1rem,1.2vw,1.35rem)] font-medium tracking-[-0.035em] text-[#f4f2ec]/72">{labels.eyebrow}</p>
          <motion.h2 initial={false} animate={canHover && mockupHovered ? { opacity: 0.16 } : { opacity: 1 }} transition={{ duration: 0.8, ease: EASE }} id="next-project-title" className={`mx-auto mt-[clamp(8px,1.5vh,16px)] max-w-[96vw] text-balance font-display font-black uppercase leading-[0.78] tracking-[-0.065em] ${compactTitle ? "text-[clamp(2.55rem,6.2vw,7.25rem)]" : "text-[clamp(4.8rem,10vw,11.5rem)]"}`}>
            {nextTitle}
          </motion.h2>
        </motion.header>

        <motion.div variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 1.05, ease: EASE } } }} className="order-3 relative z-10 -mt-px h-3px w-[min(88vw,960px)] origin-left rounded-full bg-[#f4f2ec]" />

        <motion.ol variants={ctaRevealItem} aria-label="Progresso dos projetos" className="order-4 mt-4 grid w-[min(82vw,760px)] grid-cols-3">
            {chapterSlugs.map((slug, index) => {
              const active = index === currentIndex
              return (
                <li key={slug} aria-current={active ? "step" : undefined} className="grid justify-items-center gap-2 text-[9px] font-black tracking-[0.18em] text-[#f4f2ec]/32">
                  <span aria-hidden="true" className={`size-1.5 rounded-full border ${active ? "border-(--accent) bg-(--accent) shadow-[0_0_14px_rgba(85,47,34,0.3)]" : "border-[#f4f2ec]/32"}`} />
                  <span className={active ? "text-[#f4f2ec]/82" : undefined}>{String(index + 1).padStart(2, "0")}</span>
                </li>
              )
            })}
        </motion.ol>

          <motion.div variants={ctaRevealItem} className="order-5 mt-[clamp(22px,3vh,34px)]">
            <Link href={`/gallery/${nextProject.slug}`} scroll aria-label={`${labels.continue}: ${nextProject.name}`} className="group relative inline-flex h-13 w-[min(68vw,300px)] items-center justify-center overflow-hidden rounded-full border border-[#f4f2ec]/20 px-8 font-display text-[10px] font-semibold uppercase tracking-[0.24em] text-[#f4f2ec] transition-[border-color,transform] duration-500 hover:-translate-y-0.5 hover:border-[#f4f2ec]/60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--accent) sm:h-15 sm:w-74 sm:text-[11px]">
              <span aria-hidden="true" className="absolute inset-0 origin-bottom scale-y-0 rounded-full bg-[#f4f2ec] transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-y-100" />
              <span className="relative z-10 flex items-center gap-4 transition-colors duration-500 group-hover:text-[#1e1e1e]"><RollingText variant="strong">{labels.continue}</RollingText><span aria-hidden="true" className="text-base transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1">↗</span></span>
            </Link>
          </motion.div>
        </div>

        <motion.footer variants={ctaRevealItem} className="mt-[clamp(38px,5vh,66px)] grid gap-5 text-center text-[9px] uppercase tracking-[0.14em] sm:grid-cols-3 sm:items-end sm:text-[11px] sm:text-left">
          <div><span className="block text-[#f4f2ec]/38">{labels.edition}</span><span className="mt-2 block tracking-normal text-[#f4f2ec]/82">2026 © Sarah Aliriel</span></div>
          <CtaLocalTime label={labels.localTime} />
          <nav aria-label={labels.socials}>
            <span className="block text-[#f4f2ec]/38 sm:text-right">{labels.socials}</span>
            <div className="mt-2 flex flex-wrap justify-center gap-x-5 gap-y-2 normal-case tracking-normal sm:justify-end">
              {ctaSocials.map((social) => <a key={social.label} href={social.href} target="_blank" rel="noreferrer" className="text-[#f4f2ec]/82 transition hover:text-[#f4f2ec]"><RollingText variant="subtle">{social.label}</RollingText></a>)}
            </div>
          </nav>
        </motion.footer>
      </div>

      {canHover ? (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none fixed left-0 top-0 z-30001"
          style={{ x: cursorX, y: cursorY }}
          initial={false}
          animate={mockupHovered ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.72 }}
          transition={{ duration: 0.38, ease: EASE }}
        >
          <span className="grid size-36 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-(--accent) px-6 text-center font-display text-[11px] font-medium uppercase leading-tight tracking-[0.12em] text-[#f4f2ec] shadow-[0_18px_54px_rgba(0,0,0,0.28)] backdrop-blur-sm">
            {labels.viewProject}
          </span>
        </motion.div>
      ) : null}
    </motion.section>
  )
}

export default function ProjectGalleryDetail({ project: projectConfig }: { project: GalleryProjectConfig }) {
  const { t } = useI18n()
  const project = useMemo(() => getTranslatedGalleryProject(projectConfig, t), [projectConfig, t])
  const nextProject = useMemo(() => getNextGalleryProject(project.slug, t), [project.slug, t])
  const labels = useMemo(
    () => ({
      hero: { back: t("galleryDetailBack") },
      process: {
        kicker: t("galleryProcessKicker"), heading: t("galleryProcessHeading"), context: t("galleryProcessContext"), direction: t("galleryProcessDirection"), impact: t("galleryProcessImpact"),
        challenge: t("galleryProcessChallenge"), challengeBody: t("galleryProcessChallengeBody"), followers: t("galleryProcessFollowers"), directionBody: t("galleryProcessDirectionBody"),
        views: t("galleryProcessViews"), result: t("galleryProcessResult"), resultBody: t("galleryProcessResultBody"), active: t("galleryProcessActive"), visualSystem: t("galleryProcessVisualSystem"),
        next: t("galleryProcessNext"), oneYear: t("galleryProcessOneYear"), fiveMonths: t("galleryProcessFiveMonths"),
      },
      gallery: {
        posts: t("galleryDesignPosts"), carousels: t("galleryDesignCarousels"), stories: t("galleryDesignStories"),
      },
      visualSystem: {
        system: t("galleryVisualSystem"), objective: t("galleryVisualObjective"), purpose: t("galleryVisualPurpose"),
        typography: t("galleryVisualTypography"), colors: t("galleryVisualColors"), next: t("galleryProcessNext"), designs: t("galleryVisualDesigns"),
      },
      cta: { eyebrow: t("galleryDetailCtaEyebrow"), continue: t("galleryDetailCtaContinue"), viewProject: t("galleryDetailCtaViewProject"), edition: t("moreAboutFooterEdition"), localTime: t("moreAboutFooterLocalTime"), socials: t("moreAboutFooterSocials") },
    }),
    [t],
  )
  useEffect(() => {
    document.title = `${project.name} | ${t("galleryDetailMetaSuffix")}`
    document.querySelector('meta[name="description"]')?.setAttribute("content", project.description)
  }, [project.description, project.name, t])

  return (
    <div className="min-h-svh max-w-full overflow-x-clip bg-[#f4f2ec] text-[#1e1e1e]">
      <ScrollProgress />
      <HeroSection project={project} backLabel={labels.hero.back} />

      <ProjectProcess project={project} labels={labels.process} />
      <VisualSystem system={project.visualSystem} labels={labels.visualSystem} />
      <EditorialGallery project={project} labels={labels.gallery} />
      <FinalCta currentProject={project} nextProject={nextProject} labels={labels.cta} />
    </div>
  )
}
