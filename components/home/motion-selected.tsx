"use client"

import Link from "next/link"
import { motion, useInView, useReducedMotion } from "framer-motion"
import { useEffect, useRef } from "react"
import { useI18n } from "@/components/providers/i18n"
import MotionCta from "@/components/shared/motion-cta"
import TextCta from "@/components/shared/text-cta"
import { getArchiveProjects, type ArchiveProject } from "@/data/all-projects"

const EASE = [0.16, 1, 0.3, 1] as const
const selectedIds = ["01", "02", "03", "04"]

function MotionCard({
  project,
  index,
  reducedMotion,
}: {
  project: ArchiveProject
  index: number
  reducedMotion: boolean
}) {
  const { t } = useI18n()
  const cardRef = useRef<HTMLElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const isNearViewport = useInView(cardRef, { once: true, margin: "320px 0px" })
  const isVisible = useInView(cardRef, { amount: 0.12 })
  const videoSrc = project.src

  useEffect(() => {
    const video = videoRef.current
    if (!video || reducedMotion || !isVisible) {
      video?.pause()
      return
    }
    void video.play().catch(() => undefined)
  }, [isNearViewport, isVisible, reducedMotion])

  return (
    <motion.article
      ref={cardRef}
      initial={reducedMotion ? false : { opacity: 0, y: 34, filter: "blur(8px)" }}
      whileInView={reducedMotion ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.22 }}
      transition={{ duration: 0.86, delay: reducedMotion ? 0 : index * 0.08, ease: EASE }}
      className="group relative min-w-0"
    >
      <div className="relative overflow-hidden rounded-lg border border-[#f4f2ec]/10 bg-black shadow-[0_30px_90px_rgba(0,0,0,.34)]">
        <Link href="/allprojects" aria-label={`${t("motionSelectedWatch")} ${project.title}`} className="block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f4f2ec]">
          <div className="relative aspect-video overflow-hidden">
            {videoSrc && isNearViewport ? (
              <video
                ref={videoRef}
                className="h-full w-full object-cover opacity-90 transition-transform duration-1000 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.045]"
                src={videoSrc}
                muted
                loop
                playsInline
                preload="none"
              />
            ) : <div className="h-full w-full bg-black" />}

            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.08),rgba(0,0,0,.76))]" />
            <div className="absolute left-4 top-4 flex items-center gap-2 sm:left-5 sm:top-5">
              <span className="h-2 w-2 rounded-full bg-[#552f22] shadow-[0_0_18px_rgba(85,47,34,.8)]" />
              <span className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#f4f2ec]/70">
                {project.id}
              </span>
            </div>
          </div>
        </Link>

        <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <h3 className="font-display text-[clamp(1.5rem,3vw,3.8rem)] font-semibold leading-[0.95] tracking-[-0.045em] text-[#f4f2ec]">
              {project.title}
            </h3>
            <p className="mt-3 text-[10px] font-medium uppercase leading-relaxed tracking-[0.16em] text-[#f4f2ec]/44 sm:text-[11px]">
              {project.tagsLine} <span className="mx-2 text-[#5e4cff]">·</span> {project.year}
            </p>
          </div>

          <TextCta href="/allprojects" ariaLabel={`${t("motionSelectedWatch")} ${project.title}`}>{t("motionSelectedWatch")}</TextCta>
        </div>
      </div>
    </motion.article>
  )
}

export default function MotionSelected() {
  const { lang, t } = useI18n()
  const selectedProjects = selectedIds.map((id) => getArchiveProjects(lang).find((project) => project.id === id)).filter(Boolean) as ArchiveProject[]
  const reducedMotion = Boolean(useReducedMotion())
  const reveal = reducedMotion ? {} : { initial: { opacity: 0, y: 32, filter: "blur(8px)" }, whileInView: { opacity: 1, y: 0, filter: "blur(0px)" } }

  return (
    <section className="relative z-20 overflow-x-clip bg-[#1e1e1e] py-24 text-[#f4f2ec] sm:py-32 lg:py-40">
      <div className="container-bleed">
        <motion.header
          {...reveal}
          viewport={{ once: true, amount: 0.32 }}
          transition={{ duration: 0.86, ease: EASE }}
          className="relative border-b border-[#f4f2ec]/12 pb-12 sm:pb-16"
        >
          <div className="relative z-10 flex justify-end text-[9px] font-semibold uppercase tracking-[0.24em] text-[#f4f2ec]/46 sm:text-[10px]">
            <span>{t("motionSelectedKicker")}</span>
          </div>
          <div className="relative mt-9 isolate">
            <span aria-hidden="true" className="pointer-events-none absolute -top-[0.08em] left-[10vw] z-0 whitespace-nowrap font-display text-[clamp(4rem,14vw,12rem)] leading-none tracking-[-0.08em] text-[#8b6b5c]/32 blur-[1.5px] mask-[linear-gradient(90deg,transparent,black_18%,black_72%,transparent)]">
              Motion
            </span>
            <h2 className="relative z-10 max-w-6xl text-balance font-display text-[clamp(3.3rem,10.5vw,9.5rem)] font-semibold leading-[0.84] tracking-[-0.075em]">
              {t("motionSelectedTitle")}
            </h2>
          </div>
          <p className="relative z-10 mt-9 max-w-xl text-sm leading-relaxed text-[#f4f2ec]/52 sm:ml-auto sm:text-base">
            {t("motionSelectedCopy")}
          </p>
        </motion.header>

        <div className="grid gap-5 pt-20 sm:pt-28 lg:grid-cols-2 lg:gap-6">
          {selectedProjects.map((project, index) => (
            <MotionCard key={project.id} project={project} index={index} reducedMotion={reducedMotion} />
          ))}
        </div>

        <motion.div
          {...reveal}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.82, ease: EASE }}
          className="mt-16 flex justify-center sm:mt-24"
        >
          <MotionCta href="/allprojects">{t("motionSelectedCta")}</MotionCta>
        </motion.div>
      </div>
    </section>
  )
}
