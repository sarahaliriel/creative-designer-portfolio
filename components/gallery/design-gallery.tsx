"use client"

import Image from "next/image"
import Link from "next/link"
import RollingText from "@/components/shared/rolling-text"
import { useEffect, useMemo, type MouseEvent } from "react"
import { useI18n } from "@/components/providers/i18n"
import FinalCtaContent from "@/components/shared/final-cta-content"
import ScrollProgress from "@/components/layout/scroll-progress"
import ArrowDownRight from "@/components/gallery/arrow-down-right"
import { getTranslatedGalleryProjects, getTranslatedPlaygroundPieces, type GalleryImage, type GalleryProject } from "@/data/gallery"

const playgroundOffset = ["", "mt-3", "mt-1", "mt-2", "", "mt-2", "mt-1"]

function scrollToSection(event: MouseEvent<HTMLAnchorElement>) {
  event.preventDefault()
  const target = document.querySelector(event.currentTarget.hash)
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  target?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" })
}

function countProjectPieces(project: GalleryProject) {
  return (
    project.pieces.length +
    (project.stories?.length ?? 0) +
    (project.carousels?.reduce((total, carousel) => total + carousel.slides.length, 0) ?? 0)
  )
}

function getProjectCover(project: GalleryProject) {
  return project.heroMockup ?? project.pieces[0] ?? project.carousels?.[0]?.slides[0]
}

function GalleryHero({ projectCount, pieceCount }: { projectCount: number; pieceCount: number }) {
  const { t } = useI18n()

  return (
    <section className="container-bleed relative isolate min-h-svh overflow-hidden pb-8 pt-12 sm:pt-13 lg:pb-12">
      <p
        aria-hidden="true"
        className="pointer-events-none absolute left-[3.3vw] top-[21svh] -z-10 hidden w-[80vw] font-sans text-[15.2vw] font-black uppercase leading-none text-transparent lg:block"
        style={{ WebkitTextStroke: "2px rgba(85, 47, 34, 0.075)" }}
      >
        {t("galleryArchiveGhost")}
      </p>
      <p
        aria-hidden="true"
        className="pointer-events-none absolute -left-[0.08em] top-[16svh] -z-10 font-sans text-[32vw] font-black uppercase leading-none text-transparent sm:text-[24vw] lg:hidden"
        style={{ WebkitTextStroke: "1px rgba(85, 47, 34, 0.08)" }}
      >
        {t("galleryArchiveGhost")}
      </p>

      <div className="grid grid-cols-[1fr_auto] items-start gap-6 pr-20 text-[10px] font-black uppercase tracking-[0.22em] text-[#1e1e1e]/50 sm:grid-cols-3 sm:pr-22">
        <span>{t("galleryHeroArchiveLabel")}</span>
        <span className="hidden justify-self-center text-[#552f22] sm:block">{t("galleryHeroSocialArchive")}</span>
        <span className="justify-self-end">2025 - 2026</span>
      </div>

      <div className="relative min-h-[calc(100svh-108px)] lg:min-h-[calc(100svh-104px)]">
        <div className="absolute left-0 top-[40svh] sm:top-[41svh] lg:left-[3.3vw] lg:top-[43svh]">
          <h1 className="whitespace-nowrap text-[clamp(3.9rem,15.6vw,7.2rem)] font-black leading-[0.76] text-[#030303] sm:text-[clamp(6.8rem,10.2vw,11.2rem)] lg:text-[clamp(7.6rem,9.2vw,11.8rem)]">
            {t("galleryHeroTitle")}
          </h1>
        </div>

        <div className="absolute left-0 top-[74svh] sm:top-[75svh] lg:top-[72svh]">
          <a
            href="#selected-projects"
            aria-label={t("gallerySelectedTitle")}
            onClick={scrollToSection}
            className="group inline-flex w-max items-center gap-5 text-[10px] font-black uppercase tracking-[0.16em] text-[#1e1e1e]/78 transition hover:text-[#552f22] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#552f22] sm:text-[11px]"
          >
            <span className="transition group-hover:translate-y-1">
              <ArrowDownRight />
            </span>
          </a>
        </div>

        <div className="absolute right-0 top-[74svh] w-full max-w-155 sm:top-[75svh] lg:top-[72svh]">
          <dl className="grid border-t border-[#1e1e1e]/18 pt-7 text-[10px] font-black uppercase tracking-[0.14em] text-[#1e1e1e]/50 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-center">
            <div className="grid gap-1 border-b border-[#1e1e1e]/10 py-3 sm:border-b-0 sm:py-0">
              <dt className="order-2">{t("galleryHeroProjectsLabel")}</dt>
              <dd className="order-1 text-base leading-none text-[#1e1e1e]">{String(projectCount).padStart(2, "0")}</dd>
            </div>
            <span aria-hidden="true" className="hidden size-1.5 rounded-full bg-[#552f22] sm:block" />
            <div className="grid gap-1 border-b border-[#1e1e1e]/10 py-3 sm:border-b-0 sm:justify-self-center sm:py-0">
              <dt className="order-2">{t("galleryHeroPiecesLabel")}</dt>
              <dd className="order-1 text-base leading-none text-[#1e1e1e]">{String(pieceCount).padStart(2, "0")}</dd>
            </div>
            <span aria-hidden="true" className="hidden size-1.5 rounded-full bg-[#552f22] sm:block" />
            <div className="grid gap-1 py-3 sm:justify-self-end sm:py-0">
              <dt className="order-2">{t("galleryHeroOrderLabel")}</dt>
              <dd className="order-1 text-base leading-none text-[#1e1e1e]">{t("galleryHeroOrderValue")}</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  )
}

function SelectedProjectsIntro({ projectCount }: { projectCount: number }) {
  const { t } = useI18n()

  return (
    <section id="selected-projects" className="container-bleed relative isolate overflow-hidden pb-[clamp(42px,6vw,76px)] pt-[clamp(56px,9vw,112px)]">
      <div className="relative mt-[clamp(58px,12vw,132px)] grid gap-9 border-b border-[#1e1e1e]/14 pb-[clamp(42px,7vw,82px)] lg:grid-cols-[minmax(0,0.58fr)_minmax(360px,0.42fr)] lg:items-end">
        <p
          aria-hidden="true"
          className="pointer-events-none absolute left-[8vw] top-[-0.26em] -z-10 hidden font-sans text-[15vw] font-black leading-none text-transparent lg:block"
          style={{ WebkitTextStroke: "2px rgba(85, 47, 34, 0.07)" }}
        >
          {String(projectCount).padStart(2, "0")}
        </p>

        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#552f22]">{t("gallerySelectedEyebrow")}</p>
          <h2 className="mt-5 max-w-[9ch] text-[clamp(3.35rem,12vw,6.4rem)] font-black leading-[0.92] text-[#030303] sm:text-[clamp(5.2rem,8.2vw,7.5rem)] lg:text-[clamp(4.6rem,6.2vw,6.8rem)]">
            {t("gallerySelectedTitle")}
          </h2>
        </div>

        <div className="max-w-[44ch] lg:justify-self-end lg:pb-3">
          <p className="text-base font-semibold leading-relaxed text-[#1e1e1e]/58 sm:text-xl">
            {t("gallerySelectedDescription")}
          </p>
          <a
            href="#gallery-projects"
            onClick={scrollToSection}
            className="group mt-6 inline-flex w-max items-center gap-3 text-[10px] font-black uppercase tracking-[0.16em] text-[#552f22] transition hover:text-[#1e1e1e] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#552f22] sm:text-[11px]"
          >
            <span className="transition group-hover:translate-y-1">
              <ArrowDownRight />
            </span>
            <RollingText>{t("gallerySelectedArchiveLink")}</RollingText>
          </a>
        </div>
      </div>
    </section>
  )
}

function SelectedProjectCard({ project, index }: { project: GalleryProject; index: number }) {
  const { t } = useI18n()
  const cover = getProjectCover(project)
  const pieceCount = countProjectPieces(project)

  return (
    <article className="border-b border-[#1e1e1e]/12 pb-9 lg:border-b-0 lg:pb-0">
      <div className="mb-3 grid grid-cols-[1fr_auto] items-end gap-4">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#552f22]">{String(index + 1).padStart(2, "0")}</p>
          <h2 className="mt-2 text-[clamp(1.55rem,5vw,2rem)] font-black leading-none text-[#030303]">{project.name}</h2>
        </div>
        <span className="pb-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#1e1e1e]/46">{pieceCount} {t("galleryPieceCountLabel")}</span>
      </div>

      {cover ? (
        <Link
          href={`/gallery/${project.slug}`}
          aria-label={`${t("galleryViewMorePieces")}: ${project.name}`}
          className="group block overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#552f22]"
        >
          <span className="relative block aspect-[2.45/1] lg:aspect-square">
            <Image
              src={cover.src}
              alt={cover.alt}
              fill
              sizes="(max-width: 768px) 92vw, 30vw"
              className="object-contain transition duration-700 group-hover:scale-[1.02]"
            />
          </span>
        </Link>
      ) : null}

      <div className="mt-4 flex items-center justify-between gap-4 border-b border-[#1e1e1e]/12 pb-4 text-[10px] font-black uppercase tracking-[0.15em] text-[#1e1e1e]/48 lg:border-b-0">
        <span>{project.type}</span>
        <span className="hidden lg:inline">{pieceCount} {t("galleryPieceCountLabel")}</span>
      </div>

      <p className="mt-5 hidden text-base leading-relaxed text-[#1e1e1e]/62 lg:block">{project.description}</p>
      <Link
        href={`/gallery/${project.slug}`}
        className="mt-6 inline-flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.18em] text-[#552f22] transition hover:gap-5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#552f22]"
      >
        <RollingText>{t("galleryViewMorePieces")}</RollingText> <span aria-hidden="true">→</span>
      </Link>
    </article>
  )
}

function SelectedProjects({ projects }: { projects: GalleryProject[] }) {
  return (
    <section id="gallery-projects" className="container-bleed pb-[clamp(56px,9vw,112px)]">
      <div className="grid gap-9 lg:grid-cols-3 lg:gap-12">
        {projects.map((project, index) => (
          <SelectedProjectCard key={project.slug} project={project} index={index} />
        ))}
      </div>
    </section>
  )
}

function PlaygroundPiece({
  piece,
  index,
}: {
  piece: GalleryImage
  index: number
}) {
  return (
    <figure className={`min-w-0 ${playgroundOffset[index % playgroundOffset.length]}`}>
      <div className="relative block aspect-4/5 w-full">
        <Image
          src={piece.src}
          alt={piece.alt}
          fill
          sizes="(max-width: 379px) 94vw, (max-width: 639px) 47vw, (max-width: 1023px) 32vw, 24vw"
          className="object-contain"
        />
      </div>
      <figcaption className="sr-only">{piece.title}</figcaption>
    </figure>
  )
}

function PlaygroundSection({ pieces }: { pieces: GalleryImage[] }) {
  const { t } = useI18n()

  return (
    <section id="creative-playground" aria-labelledby="playground-title" className="container-bleed border-t border-[#1e1e1e]/12 pb-[clamp(56px,7vw,88px)] pt-[clamp(52px,7vw,84px)]">
      <header className="grid gap-7 border-b border-[#1e1e1e]/18 pb-[clamp(32px,5vw,56px)] lg:grid-cols-[minmax(0,0.58fr)_minmax(320px,0.42fr)] lg:items-end">
        <h2 id="playground-title" className="text-[clamp(3.1rem,9vw,7.6rem)] font-black uppercase leading-[0.84] tracking-[-0.065em] text-[#1e1e1e]">
          {t("galleryPlaygroundTitle")}
        </h2>
        <div className="lg:justify-self-end">
          <p className="max-w-[44ch] text-base font-semibold leading-relaxed text-[#1e1e1e]/62 sm:text-lg">{t("galleryPlaygroundDescription")}</p>
          <p className="mt-6 text-[10px] font-black uppercase tracking-[0.22em] text-[#552f22]">
            {String(pieces.length).padStart(2, "0")} {t("galleryPlaygroundCount")}
          </p>
        </div>
      </header>

      <div className="mt-4 grid grid-cols-1 items-start gap-x-1.5 gap-y-2 min-[380px]:grid-cols-2 sm:grid-cols-3 sm:gap-x-2 lg:grid-cols-4">
        {pieces.map((piece, index) => (
          <PlaygroundPiece key={piece.src} piece={piece} index={index} />
        ))}
      </div>
    </section>
  )
}

function FinalGalleryCta() {
  const { t } = useI18n()

  return (
    <FinalCtaContent
      id="gallery-final-cta"
      titleLines={[t("galleryFinalLine1"), t("galleryFinalLine2")]}
      button={t("galleryFinalButton")}
      theme="dark"
    />
  )
}

export default function DesignGallery() {
  const { t } = useI18n()
  const projects = useMemo(() => getTranslatedGalleryProjects(t), [t])
  const playground = useMemo(() => getTranslatedPlaygroundPieces(t), [t])
  const totalPieces = projects.reduce((total, project) => total + countProjectPieces(project), playground.length)

  useEffect(() => {
    document.title = t("galleryMetaTitle")
    document.querySelector('meta[name="description"]')?.setAttribute("content", t("galleryMetaDescription"))
  }, [t])

  return (
    <div className="min-h-svh bg-[#e8e7e7] text-[#1e1e1e]">
      <ScrollProgress />
      <GalleryHero projectCount={projects.length} pieceCount={totalPieces} />
      <SelectedProjectsIntro projectCount={projects.length} />
      <SelectedProjects projects={projects} />
      <PlaygroundSection pieces={playground} />
      <FinalGalleryCta />
    </div>
  )
}
