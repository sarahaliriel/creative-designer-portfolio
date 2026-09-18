"use client"

import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { useEffect, useRef, useState } from "react"
import { Lang, useI18n } from "@/components/providers/i18n"

const LANGUAGES: ReadonlyArray<{ code: Lang; short: string; label: string }> = [
  { code: "pt", short: "PT", label: "Português" },
  { code: "en", short: "EN", label: "English" },
  { code: "es", short: "ES", label: "Español" },
]

export default function LanguageToggle() {
  const { lang, setLang, t } = useI18n()
  const [open, setOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([])
  const reducedMotion = useReducedMotion()
  const current = LANGUAGES.find((language) => language.code === lang) ?? LANGUAGES[0]

  useEffect(() => {
    const onMenuState = (event: Event) => {
      const menuEvent = event as CustomEvent<{ open?: boolean }>
      setMenuOpen(Boolean(menuEvent.detail?.open))
      if (menuEvent.detail?.open) setOpen(false)
    }

    window.addEventListener("menu:state", onMenuState)
    return () => window.removeEventListener("menu:state", onMenuState)
  }, [])

  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: PointerEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }

    window.addEventListener("pointerdown", onPointerDown)
    window.addEventListener("keydown", onKeyDown)
    return () => {
      window.removeEventListener("pointerdown", onPointerDown)
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [open])

  const openSelector = () => {
    setOpen(true)
    window.requestAnimationFrame(() => optionRefs.current[LANGUAGES.findIndex(({ code }) => code === lang)]?.focus())
  }

  const pick = (language: Lang) => {
    setLang(language)
    setOpen(false)
  }

  const handleOptionKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number | undefined
    if (event.key === "ArrowDown") nextIndex = (index + 1) % LANGUAGES.length
    if (event.key === "ArrowUp") nextIndex = (index - 1 + LANGUAGES.length) % LANGUAGES.length
    if (event.key === "Home") nextIndex = 0
    if (event.key === "End") nextIndex = LANGUAGES.length - 1
    if (nextIndex === undefined) return
    event.preventDefault()
    optionRefs.current[nextIndex]?.focus()
  }

  return (
    <div
      ref={wrapRef}
      aria-hidden={menuOpen}
      inert={menuOpen}
      className={`fixed bottom-[max(.75rem,env(safe-area-inset-bottom))] right-3 z-96 transition-[opacity,transform] duration-200 sm:bottom-5 sm:right-5 ${menuOpen ? "pointer-events-none translate-y-2 opacity-0" : "opacity-100"}`}
    >
      <motion.div
        layout
        initial={false}
        animate={{ width: open ? 232 : 48, height: open ? 270 : 36 }}
        transition={{ duration: reducedMotion ? 0.12 : 0.48, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-[18px] bg-[#191919] text-[#f4f2ec] ring-1 ring-white/8"
      >
        <AnimatePresence initial={false} mode="popLayout">
          {!open ? (
            <motion.button
              key="closed"
              type="button"
              aria-label={`${t("langLabel")}: ${current.label}`}
              aria-expanded="false"
              aria-haspopup="menu"
              tabIndex={menuOpen ? -1 : undefined}
              onClick={openSelector}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: reducedMotion ? 0 : -3 }}
              transition={{ duration: reducedMotion ? 0.08 : 0.2 }}
              className="group grid h-9 w-12 place-items-center rounded-[18px] text-[10px] font-semibold tracking-[0.16em] transition-colors duration-300 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#552f22] active:text-white/70"
            >
              <span className="transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.06]">
                {current.short}
              </span>
            </motion.button>
          ) : (
            <motion.div
              key="open"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reducedMotion ? 0.08 : 0.24, delay: reducedMotion ? 0 : 0.08 }}
              className="flex h-full w-full flex-col px-5 pb-4 pt-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-display text-[11px] font-semibold uppercase tracking-[0.16em] text-[#f4f2ec]">
                    {t("langLabel")}
                  </p>
                  <p className="mt-2 text-[11px] leading-relaxed text-white/45">{t("langPrompt")}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label={t("langClose")}
                  className="-mr-2 -mt-2 grid size-8 place-items-center rounded-full text-lg font-light text-white/35 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-[#552f22]"
                >
                  <span aria-hidden="true">×</span>
                </button>
              </div>

              <div className="my-4 h-px w-full origin-left bg-white/12" />

              <motion.div
                role="menu"
                aria-label={t("langLabel")}
                initial="closed"
                animate="open"
                variants={{
                  open: { transition: { staggerChildren: reducedMotion ? 0 : 0.05, delayChildren: reducedMotion ? 0 : 0.1 } },
                  closed: {},
                }}
                className="flex flex-1 flex-col justify-center gap-1"
              >
                {LANGUAGES.map((language, index) => {
                  const active = language.code === lang
                  return (
                    <motion.button
                      key={language.code}
                      ref={(element) => { optionRefs.current[index] = element }}
                      type="button"
                      role="menuitemradio"
                      aria-checked={active}
                      onClick={() => pick(language.code)}
                      onKeyDown={(event) => handleOptionKeyDown(event, index)}
                      variants={{
                        closed: { opacity: 0, y: reducedMotion ? 0 : 7 },
                        open: { opacity: 1, y: 0, transition: { duration: reducedMotion ? 0.1 : 0.32, ease: [0.16, 1, 0.3, 1] } },
                      }}
                      className="group relative flex min-h-10 w-full items-center gap-3 text-left text-[13px] text-white/55 focus-visible:outline-none focus-visible:text-white"
                    >
                      <span className={`size-1.5 shrink-0 rounded-full bg-[#552f22] transition-[opacity,transform] duration-300 ${active ? "scale-100 opacity-100" : "scale-0 opacity-0"}`} />
                      <span className={`relative transition-[color,font-weight,transform] duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:translate-x-1 group-hover:scale-[1.025] group-hover:text-white group-focus-visible:translate-x-1 ${active ? "font-semibold text-[#f4f2ec]" : "font-normal"}`}>
                        {language.label}
                        <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-[#552f22] transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-x-100 group-focus-visible:scale-x-100" />
                      </span>
                    </motion.button>
                  )
                })}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
