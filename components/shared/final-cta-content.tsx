"use client"

import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion"
import type { MotionStyle, Variants } from "framer-motion"
import Link from "next/link"
import type { PointerEvent, Ref } from "react"
import { useEffect, useState } from "react"
import { useI18n } from "@/components/providers/i18n"
import RollingText from "@/components/shared/rolling-text"
import { getResumeFile } from "@/lib/resume"

const SOCIALS = [
  { label: "Instagram", href: "https://www.instagram.com/chazinhodociel/" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/sarah-dumitrache/" },
  { label: "GitHub", href: "https://github.com/sarahaliriel" },
  { label: "Discord", href: "https://discord.com/users/942126894478950530" },
] as const

const reveal: Variants = {
  hidden: { opacity: 0, y: 28, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1] },
  },
}

function LocalTime({ label, dark = false }: { label: string; dark?: boolean }) {
  const [localTime, setLocalTime] = useState("--:--:--")
  const [localZone, setLocalZone] = useState("Lisboa")

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat("pt-PT", {
      timeZone: "Europe/Lisbon",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZoneName: "short",
    })
    const updateTime = () => {
      const parts = formatter.formatToParts(new Date())
      setLocalTime(parts.filter((part) => part.type !== "timeZoneName").map((part) => part.value).join("").trim())
      setLocalZone(parts.find((part) => part.type === "timeZoneName")?.value ?? "Lisboa")
    }

    updateTime()
    const interval = window.setInterval(updateTime, 1000)
    return () => window.clearInterval(interval)
  }, [])

  return (
    <div className="text-center">
      <span className={`block ${dark ? "text-[#e8e7e7]/48" : "text-[#1e1e1e]/48"}`}>{label}</span>
      <time className={`mt-1.5 block font-medium tabular-nums tracking-[0.08em] sm:mt-2 ${dark ? "text-[#e8e7e7]/82" : "text-[#1e1e1e]/82"}`}>
        {localTime} {localZone}
      </time>
    </div>
  )
}

type FinalCtaContentProps = {
  titleLines: string[]
  button: string
  id?: string
  style?: MotionStyle
  buttonAnchorRef?: Ref<HTMLDivElement>
  buttonVisible?: boolean
  interactive?: boolean
  animateReveal?: boolean
  theme?: "light" | "dark"
  buttonTheme?: "light" | "dark"
}

export default function FinalCtaContent({
  titleLines,
  button,
  id = "final-cta",
  style,
  buttonAnchorRef,
  buttonVisible = true,
  interactive = true,
  animateReveal = true,
  theme = "light",
  buttonTheme,
}: FinalCtaContentProps) {
  const { lang, t } = useI18n()
  const resumeFile = getResumeFile(lang)
  const reducedMotion = Boolean(useReducedMotion())
  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const x = useSpring(rawX, { stiffness: 70, damping: 18, mass: 0.8 })
  const y = useSpring(rawY, { stiffness: 70, damping: 18, mass: 0.8 })
  const revealProps = animateReveal && !reducedMotion
    ? { variants: reveal, initial: "hidden" as const, whileInView: "show" as const, viewport: { once: true, amount: 0.18 } }
    : {}
  const isDark = theme === "dark"
  const isDarkButton = buttonTheme === "dark" || isDark
  const mutedInk = isDark ? "text-[#e8e7e7]/48" : "text-[#1e1e1e]/48"
  const detailInk = isDark ? "text-[#e8e7e7]/82" : "text-[#1e1e1e]/82"
  const pillClassName = `group relative inline-flex h-13 w-full max-w-sm items-center justify-center overflow-hidden rounded-full border px-5 text-center text-[11px] font-medium transition-[border-color,color,transform] duration-500 ease-[cubic-bezier(.16,1,.3,1)] hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 sm:h-16 sm:w-72 sm:px-7 sm:text-[13px] lg:h-18 ${
    isDark
      ? "border-[#e8e7e7]/30 text-[#e8e7e7]/86 hover:border-[#e8e7e7]/70 hover:text-[#1e1e1e] focus-visible:outline-[#e8e7e7]"
      : "border-[#1e1e1e]/30 text-[#1e1e1e]/86 hover:border-[#1e1e1e]/70 hover:text-[#e8e7e7] focus-visible:outline-[#1e1e1e]"
  }`
  const pillFill = isDark ? "bg-[#e8e7e7]" : "bg-[#1e1e1e]"

  const move = (event: PointerEvent<HTMLElement>) => {
    if (reducedMotion || !interactive || event.pointerType === "touch") return
    const rect = event.currentTarget.getBoundingClientRect()
    rawX.set(((event.clientX - rect.left) / rect.width - 0.5) * 24)
    rawY.set(((event.clientY - rect.top) / rect.height - 0.5) * 24)
  }

  const reset = () => {
    rawX.set(0)
    rawY.set(0)
  }

  return (
    <motion.section
      id={id}
      data-scroll-theme={theme}
      aria-labelledby={`${id}-title`}
      aria-hidden={!interactive}
      inert={!interactive}
      style={style}
      onPointerMove={move}
      onPointerLeave={reset}
      className={`relative flex min-h-svh w-full overflow-x-clip px-4 pb-24 pt-24 sm:overflow-hidden sm:px-8 sm:pb-24 sm:pt-16 lg:px-12 lg:pb-10 lg:pt-20 ${isDark ? "bg-[#1e1e1e] text-[#e8e7e7]" : "bg-[#e8e7e7] text-[#1e1e1e]"}`}
    >
      <div className="relative mx-auto flex w-full max-w-370 flex-1 flex-col justify-between gap-8 sm:gap-10">
        <div className="flex flex-1 flex-col items-center justify-center text-center sm:items-stretch sm:pb-10 sm:text-left lg:pb-14">
          <motion.h2
            id={`${id}-title`}
            className="relative z-10 font-display uppercase"
            style={{
              fontSize: "clamp(1.75rem, 8.2vw, 6rem)",
              fontWeight: 500,
              lineHeight: 0.83,
              letterSpacing: "-0.07em",
            }}
            {...revealProps}
          >
            {titleLines.map((line) => (
              <span key={line} className="block sm:whitespace-nowrap">{line}</span>
            ))}
          </motion.h2>

          <div className={`relative z-20 mt-14 w-full border-t sm:mt-[clamp(2.5rem,6vh,5.5rem)] ${isDark ? "border-[#e8e7e7]/28" : "border-[#1e1e1e]/28"}`}>
            <div
              ref={buttonAnchorRef}
              className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 sm:left-auto sm:right-[clamp(1rem,8vw,8rem)] sm:translate-x-0"
            >
              <motion.div
                initial={false}
                animate={buttonVisible
                  ? { opacity: 1, scale: 1, x: 0 }
                  : { opacity: 0, scale: 0.72, x: "-42vw" }}
                transition={{ duration: reducedMotion ? 0 : 1.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <motion.div style={{ x, y }}>
                  <Link
                    href="mailto:dumitrachebusiness@gmail.com"
                    aria-label={button}
                    tabIndex={interactive ? undefined : -1}
                    className={`group relative inline-flex aspect-square w-34 items-center justify-center overflow-hidden rounded-full bg-[#552f22] p-5 text-center font-display text-[11px] font-semibold uppercase leading-tight text-[#e8e7e7] transition-[transform,box-shadow,color] duration-700 hover:scale-[1.07] focus-visible:outline-2 focus-visible:outline-offset-4 sm:w-[clamp(112px,13vw,202px)] sm:text-[clamp(.68rem,.9vw,.88rem)] ${isDarkButton ? "hover:text-[#552f22] focus-visible:outline-[#e8e7e7]" : "focus-visible:outline-[#1e1e1e]"}`}
                  >
                    <span aria-hidden="true" className={`absolute inset-0 origin-bottom scale-y-0 rounded-full transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-y-100 ${isDarkButton ? "bg-[#e8e7e7]" : "bg-[#1e1e1e]"}`} />
                    <span className="relative z-10 flex flex-col items-center gap-1.5 sm:flex-row sm:gap-2.5">
                      <span className="max-w-[10ch] whitespace-normal leading-[1.05] tracking-[0.02em] sm:hidden">{button}</span>
                      <span className="hidden sm:inline-block">
                        <RollingText variant="strong">{button}</RollingText>
                      </span>
                      <span aria-hidden="true" className="hidden text-base leading-none transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1 sm:inline">↗</span>
                    </span>
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </div>

          <motion.div
            className="mt-20 flex w-full max-w-sm flex-col items-center gap-2.5 sm:mt-9 sm:max-w-152 sm:flex-row sm:items-stretch sm:gap-4 lg:mt-11"
            {...revealProps}
          >
            <a href="mailto:dumitrachebusiness@gmail.com" tabIndex={interactive ? undefined : -1} className={pillClassName}>
              <span aria-hidden="true" className={`absolute inset-0 origin-bottom scale-y-0 rounded-full transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-y-100 ${pillFill}`} />
              <RollingText variant="subtle" className="relative z-10">dumitrachebusiness@gmail.com</RollingText>
            </a>
            <a href={resumeFile.href} download={resumeFile.downloadName} tabIndex={interactive ? undefined : -1} className={pillClassName} aria-label={t("moreAboutCtaResume")}>
              <span aria-hidden="true" className={`absolute inset-0 origin-bottom scale-y-0 rounded-full transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-y-100 ${pillFill}`} />
              <RollingText variant="strong" className="relative z-10 uppercase">{t("moreAboutCtaResume")}</RollingText>
            </a>
          </motion.div>
        </div>

        <footer className={`grid grid-cols-2 gap-x-4 gap-y-5 border-t pt-5 text-center text-[9px] uppercase tracking-[0.12em] sm:grid-cols-[1fr_1fr_1fr] sm:items-end sm:gap-6 sm:border-0 sm:pt-0 sm:text-left sm:text-[11px] lg:text-xs ${isDark ? "border-[#e8e7e7]/16" : "border-[#1e1e1e]/16"}`}>
          <div className="sm:text-left">
            <span className={`block ${mutedInk}`}>{t("moreAboutFooterEdition")}</span>
            <span className={`mt-1.5 block tracking-normal sm:mt-2 ${detailInk}`}>2026 © Sarah Aliriel</span>
          </div>
          <LocalTime label={t("moreAboutFooterLocalTime")} dark={isDark} />
          <nav aria-label={t("moreAboutFooterSocials")} className="col-span-2 sm:col-span-1">
            <span className={`block sm:text-right ${mutedInk}`}>{t("moreAboutFooterSocials")}</span>
            <div className="mt-1 flex flex-wrap justify-center gap-x-2 gap-y-0 tracking-normal sm:mt-2 sm:justify-end sm:gap-x-5 sm:gap-y-2">
              {SOCIALS.map((social) => (
                <a key={social.label} href={social.href} target="_blank" rel="noreferrer" tabIndex={interactive ? undefined : -1} className={`link-underline-invert inline-flex min-h-11 items-center px-1 normal-case sm:min-h-0 sm:px-0 ${detailInk}`}>
                  <RollingText variant="subtle">{social.label}</RollingText>
                </a>
              ))}
            </div>
          </nav>
        </footer>
      </div>
    </motion.section>
  )
}
