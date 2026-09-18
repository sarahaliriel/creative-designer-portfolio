"use client"

import Image from "next/image"
import { motion, useReducedMotion } from "framer-motion"
import type { MouseEvent } from "react"
import ArrowDownRight from "@/components/gallery/arrow-down-right"
import type { GalleryVisualSystem } from "@/data/gallery"

type VisualSystemLabels = {
  system: string
  objective: string
  purpose: string
  typography: string
  colors: string
  next: string
  designs: string
}

const EASE = [0.16, 1, 0.3, 1] as const

export function VisualSystem({ system, labels }: { system: GalleryVisualSystem; labels: VisualSystemLabels }) {
  const reducedMotion = useReducedMotion()
  const reveal = reducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 26, filter: "blur(7px)" },
        whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
        viewport: { once: true, amount: 0.25 },
        transition: { duration: 0.82, ease: EASE },
      }

  const scrollToDesigns = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    document.querySelector("#designs")?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" })
  }

  return (
    <section id="visual-system" className="scroll-mt-0 bg-[#f4f2ec] text-[#1e1e1e] [--visual-line:rgba(30,30,30,.14)] [--visual-line-soft:rgba(30,30,30,.10)] [--visual-muted:rgba(30,30,30,.52)]">
      <div className="px-5 sm:px-8 lg:px-[clamp(40px,4.6vw,88px)]">
        <header className="flex items-end justify-between border-b border-[var(--visual-line)] py-[clamp(24px,3vw,42px)]">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[var(--accent)]">{labels.system}</p>
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--visual-muted)]">01—02</p>
        </header>

        <motion.article {...reveal} className="grid gap-10 border-b border-[var(--visual-line)] py-[clamp(56px,7vw,96px)] lg:grid-cols-12 lg:items-center lg:gap-x-[clamp(36px,6vw,104px)]">
          <div className="lg:col-span-7">
            <ChapterLabel number="01" title={labels.objective} />
            <p className="mt-[clamp(36px,5vw,68px)] max-w-[16ch] text-balance font-display text-[clamp(2.55rem,5.7vw,6.8rem)] font-black leading-[0.9] tracking-[-0.055em]">
              {system.objective}
            </p>
            <div className="mt-[clamp(28px,3.5vw,46px)] grid gap-4 sm:grid-cols-[8rem_1fr] sm:items-start">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--accent)]">{labels.purpose}</p>
              <p className="max-w-[48ch] text-[clamp(0.95rem,1.15vw,1.15rem)] leading-[1.55] text-[var(--visual-muted)]">{system.objectiveBody}</p>
            </div>
          </div>
          <figure className="relative aspect-[4/5] w-full max-w-[520px] justify-self-end lg:col-span-5">
            <Image src={system.objectiveMockup.src} alt={system.objectiveMockup.alt} fill sizes="(max-width: 1023px) 90vw, 38vw" className="object-contain" />
            <figcaption className="sr-only">{system.objectiveMockup.title}</figcaption>
          </figure>
        </motion.article>

        <motion.article {...reveal} className="border-b border-[var(--visual-line)] py-[clamp(56px,7vw,96px)]">
          <ChapterLabel number="02" title={labels.system} />
          <div className="mt-[clamp(38px,5vw,68px)] grid gap-[clamp(64px,8vw,120px)] lg:grid-cols-2 lg:gap-[clamp(48px,7vw,112px)]">
            <div className="border-t border-[var(--visual-line)] pt-5">
              <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[var(--accent)]">{labels.typography}</p>
              <dl className="mt-[clamp(40px,5vw,64px)] divide-y divide-[var(--visual-line-soft)]">
                {system.fonts.map((font, index) => (
                  <motion.div
                    key={`${font.role}-${font.name}`}
                    initial={reducedMotion ? false : { opacity: 0, y: 16 }}
                    whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.7 }}
                    transition={{ duration: 0.65, delay: index * 0.06, ease: EASE }}
                    className="grid grid-cols-[6rem_1fr] items-baseline gap-5 py-[clamp(20px,2.5vw,32px)] first:pt-0"
                  >
                    <dt className="text-[9px] font-black uppercase tracking-[0.18em] text-[var(--visual-muted)]">{font.role}</dt>
                    <dd style={{ fontFamily: font.family }} className="font-display text-[clamp(1.9rem,3.6vw,4.2rem)] font-black leading-none tracking-[-0.045em]">{font.name}</dd>
                  </motion.div>
                ))}
              </dl>
            </div>

            <div className="border-t border-[var(--visual-line)] pt-5">
              <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[var(--accent)]">{labels.colors}</p>
              <div className="mt-[clamp(40px,5vw,64px)] space-y-[clamp(24px,3vw,38px)]">
                {system.colors.map((color, index) => (
                  <div key={`${color.hex}-${color.role}`}>
                    <motion.div
                      initial={reducedMotion ? false : { scaleX: 0 }}
                      whileInView={reducedMotion ? undefined : { scaleX: 1 }}
                      viewport={{ once: true, amount: 0.8 }}
                      transition={{ duration: 0.85, delay: index * 0.06, ease: EASE }}
                      className="h-[clamp(42px,4.5vw,66px)] origin-left border border-[var(--visual-line-soft)]"
                      style={{ backgroundColor: color.hex }}
                    />
                    <div className="mt-3 flex items-baseline justify-between gap-4">
                      <span className="font-display text-[clamp(1.05rem,1.7vw,1.6rem)] font-black tracking-[-0.03em]">{color.hex}</span>
                      <span className="text-[9px] font-black uppercase tracking-[0.18em] text-[var(--visual-muted)]">{color.role}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.article>

        <a href="#designs" onClick={scrollToDesigns} className="group ml-auto flex w-max items-end gap-5 py-[clamp(36px,4vw,56px)] text-right focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]">
          <span>
            <span className="block text-[9px] font-black uppercase tracking-[0.22em] text-[var(--visual-muted)]">{labels.next}</span>
            <span className="mt-2 block font-display text-[clamp(1.8rem,3vw,3.5rem)] font-black uppercase leading-none tracking-[-0.045em] transition group-hover:text-[var(--accent)]">{labels.designs}</span>
          </span>
          <span className="transition group-hover:translate-y-1"><ArrowDownRight /></span>
        </a>
      </div>
    </section>
  )
}

function ChapterLabel({ number, title }: { number: string; title: string }) {
  return (
    <div className="flex items-baseline gap-4">
      <span className="font-display text-xs font-black text-[var(--accent)]">{number}</span>
      <h2 className="text-[10px] font-black uppercase tracking-[0.24em] text-[var(--visual-muted)]">{title}</h2>
    </div>
  )
}
