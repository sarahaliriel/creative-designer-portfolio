"use client"

import Image from "next/image"
import { motion, useReducedMotion } from "framer-motion"
import { useI18n } from "@/components/providers/i18n"
import MotionCta from "@/components/shared/motion-cta"
import { getSelectedWork, type SelectedWorkItem } from "@/data/selected-work"

const PROJECT_TOTAL = "03"
const EASE = [0.16, 1, 0.3, 1] as const

const layouts = [
  "lg:grid-cols-[minmax(0,1.4fr)_minmax(390px,1fr)]",
  "lg:grid-cols-[minmax(390px,1fr)_minmax(0,1.4fr)]",
  "lg:grid-cols-[minmax(0,1.4fr)_minmax(390px,1fr)]",
]

type WorkMediaProps = {
  item: SelectedWorkItem
  reducedMotion: boolean
}

function WorkMedia({ item, reducedMotion }: WorkMediaProps) {
  const preview = item.image
  const isLeftMockup = item.id === "01" || item.id === "03"
  const isRightMockup = item.id === "02"

  if (!preview) return null

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 38, scale: 0.985, filter: "blur(10px)" }}
      whileInView={reducedMotion ? undefined : { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.14 }}
      transition={{ duration: 0.95, ease: EASE }}
      className="min-w-0"
    >
      <div className={`group/media relative mx-auto aspect-4/5 w-[74%] min-w-55 max-w-140 sm:w-[58%] lg:w-[88%] lg:max-w-175 ${isLeftMockup ? "lg:-ml-[clamp(1rem,3vw,3.5rem)] lg:mr-0" : isRightMockup ? "lg:ml-auto lg:-mr-[clamp(.5rem,2vw,2rem)]" : ""}`}>
        <Image
          src={preview}
          alt={item.title}
          fill
          sizes="(max-width: 640px) 67vw, (max-width: 1024px) 58vw, 62vw"
          quality={88}
          className="object-contain transition-transform duration-1000 ease-[cubic-bezier(.16,1,.3,1)] group-hover/media:scale-[1.025]"
        />
      </div>
    </motion.div>
  )
}

function WorkDetails({ item, reducedMotion }: { item: SelectedWorkItem; reducedMotion: boolean }) {
  const { t } = useI18n()
  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 24, filter: "blur(7px)" }}
      whileInView={reducedMotion ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.28 }}
      transition={{ duration: 0.8, delay: reducedMotion ? 0 : 0.14, ease: EASE }}
      className="flex min-w-0 flex-col justify-end pt-7 lg:max-w-155 lg:pb-0 lg:pt-0"
    >
      <div className="flex items-center justify-between gap-5 text-[9px] font-semibold uppercase tracking-[0.22em] text-[#f4f2ec]/42 sm:text-[10px]">
        <span>{item.id} / {PROJECT_TOTAL}</span>
        <span>{t("selectedWorkDesign")} · {item.year}</span>
      </div>
      <h3 className="mt-5 text-balance font-display text-[clamp(1.9rem,3.1vw,3.65rem)] leading-[0.96] tracking-[-0.045em] lg:text-[clamp(3.2rem,5.25vw,6.4rem)]">
        {item.title}
      </h3>
      <p className="mt-4 max-w-[34ch] text-[13px] leading-relaxed text-[#f4f2ec]/58 sm:text-sm lg:mt-7 lg:max-w-[58ch] lg:text-[15px]">{item.description}</p>
      <p className="mt-7 text-[9px] font-medium uppercase leading-relaxed tracking-[0.16em] text-[#f4f2ec]/30 lg:mt-10">
        {item.category} <span aria-hidden="true" className="mx-1.5 text-[#5e4cff]/80">·</span> {item.tools}
      </p>
    </motion.div>
  )
}

function ArchiveLink() {
  const { t } = useI18n()

  return (
    <div className="flex w-full justify-center">
      <MotionCta href="/gallery" ariaLabel={t("selectedWorkCta")}>{t("selectedWorkCtaHover")}</MotionCta>
    </div>
  )
}

export default function SelectedWork() {
  const { t } = useI18n()
  const reducedMotion = Boolean(useReducedMotion())
  const projects = getSelectedWork(t)
  const reveal = reducedMotion ? {} : { initial: { opacity: 0, y: 32, filter: "blur(8px)" }, whileInView: { opacity: 1, y: 0, filter: "blur(0px)" } }

  return (
    <section id="work" className="relative z-20 overflow-x-clip bg-[#1e1e1e] pb-28 pt-24 text-[#f4f2ec] sm:pb-40 sm:pt-32 lg:pt-44">
      <div className="container-bleed">
        <header className="relative border-b border-[#f4f2ec]/12 pb-12 sm:pb-16">
          <motion.div {...reveal} viewport={{ once: true, amount: 0.35 }} transition={{ duration: 0.85, ease: EASE }}>
            <div className="relative z-10 flex justify-end text-[9px] font-semibold uppercase tracking-[0.24em] text-[#f4f2ec]/46 sm:text-[10px]">
              <span>{t("selectedWorkCount")}</span>
            </div>
            <div className="relative mt-9 isolate">
              <span aria-hidden="true" className="pointer-events-none absolute -top-[0.08em] left-[10vw] z-0 whitespace-nowrap font-display text-[clamp(4rem,14vw,12rem)] leading-none tracking-[-0.08em] text-[#8b6b5c]/32 blur-[1.5px] mask-[linear-gradient(90deg,transparent,black_18%,black_72%,transparent)]">
                {t("selectedWorkGhost")}
              </span>
              <h2 className="relative z-10 max-w-6xl text-balance font-display text-[clamp(3.3rem,10.5vw,9.5rem)] leading-[0.84] tracking-[-0.075em]">
                {t("selectedWorkTitle")}
              </h2>
            </div>
            <p className="relative z-10 mt-9 max-w-xl text-sm leading-relaxed text-[#f4f2ec]/52 sm:ml-auto sm:text-base">
              {t("selectedWorkDescription")}
            </p>
          </motion.div>
        </header>

        <div className="space-y-28 pt-20 sm:space-y-40 sm:pt-28 lg:space-y-56">
          {projects.map((item, index) => {
            const mediaFirst = index % 2 === 0

            return (
              <article key={item.id} className={`group relative grid min-w-0 gap-0 lg:items-center lg:gap-[clamp(1rem,2.4vw,3.25rem)] ${layouts[index]}`}>
                {mediaFirst ? (
                  <>
                    <WorkMedia item={item} reducedMotion={reducedMotion} />
                    <WorkDetails item={item} reducedMotion={reducedMotion} />
                  </>
                ) : (
                  <>
                    <div className="order-2 lg:order-1"><WorkDetails item={item} reducedMotion={reducedMotion} /></div>
                    <div className="order-1 lg:order-2"><WorkMedia item={item} reducedMotion={reducedMotion} /></div>
                  </>
                )}
              </article>
            )
          })}
        </div>

        <motion.div
          {...reveal}
          viewport={{ once: true, amount: 0.18 }}
          transition={{ duration: 0.9, ease: EASE }}
          className="mt-32 sm:mt-48"
        >
          <ArchiveLink />
        </motion.div>
      </div>
    </section>
  )
}
