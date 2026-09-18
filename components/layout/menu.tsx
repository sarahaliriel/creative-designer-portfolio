"use client"

import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import Image from "next/image"
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type RefObject } from "react"
import { createPortal } from "react-dom"
import { usePathname, useRouter } from "next/navigation"
import { useI18n } from "@/components/providers/i18n"
import RollingText from "@/components/shared/rolling-text"
import { MENU_NAVIGATION_ITEMS, type MenuNavigationItem } from "@/data/menu-navigation"

type FullscreenDocument = Document & {
  webkitFullscreenElement?: Element | null
  mozFullScreenElement?: Element | null
  msFullscreenElement?: Element | null
  webkitExitFullscreen?: () => Promise<void> | void
  mozCancelFullScreen?: () => Promise<void> | void
  msExitFullscreen?: () => Promise<void> | void
}

const MENU_ID = "portfolio-menu"
const SOCIALS = [
  { label: "Instagram", href: "https://www.instagram.com/chazinhodociel/" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/sarah-dumitrache/" },
  { label: "GitHub", href: "https://github.com/sarahaliriel" },
  { label: "Discord", href: "https://discord.com/users/942126894478950530" },
] as const

export default function Menu() {
  const { t } = useI18n()
  const pathname = usePathname()
  const router = useRouter()
  const reducedMotion = Boolean(useReducedMotion())
  const [menuOpen, setMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [showMenuObjects, setShowMenuObjects] = useState(false)
  const [highlightedItemId, setHighlightedItemId] = useState<string | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const navigationZoneRef = useRef<HTMLUListElement>(null)
  const footerZoneRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    const objectViewport = window.matchMedia("(min-width: 768px) and (min-height: 700px)")
    const updateObjectVisibility = () => setShowMenuObjects(objectViewport.matches)

    updateObjectVisibility()
    objectViewport.addEventListener("change", updateObjectVisibility)
    return () => objectViewport.removeEventListener("change", updateObjectVisibility)
  }, [])

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("menu:state", { detail: { open: menuOpen } }))

    if (!menuOpen) return

    const previousOverflow = document.body.style.overflow
    const previousPaddingRight = document.body.style.paddingRight
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = "hidden"
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`

    const backgroundElements = Array.from(document.body.children)
      .filter((element): element is HTMLElement => element instanceof HTMLElement)
      .filter((element) => !element.contains(triggerRef.current) && !element.contains(dialogRef.current))
      .map((element) => ({
        element,
        inert: element.inert,
        ariaHidden: element.getAttribute("aria-hidden"),
      }))

    backgroundElements.forEach(({ element }) => {
      element.inert = true
      element.setAttribute("aria-hidden", "true")
    })

    dialogRef.current?.querySelector<HTMLButtonElement>("[data-menu-item]")?.focus()

    return () => {
      document.body.style.overflow = previousOverflow
      document.body.style.paddingRight = previousPaddingRight
      backgroundElements.forEach(({ element, inert, ariaHidden }) => {
        element.inert = inert
        if (ariaHidden === null) element.removeAttribute("aria-hidden")
        else element.setAttribute("aria-hidden", ariaHidden)
      })
    }
  }, [menuOpen])

  useEffect(() => {
    if (!menuOpen) return

    const documentWithFullscreen = document as FullscreenDocument
    const fullscreenElement =
      documentWithFullscreen.fullscreenElement ||
      documentWithFullscreen.webkitFullscreenElement ||
      documentWithFullscreen.mozFullScreenElement ||
      documentWithFullscreen.msFullscreenElement

    if (!fullscreenElement) return

    const exitFullscreen =
      documentWithFullscreen.exitFullscreen ||
      documentWithFullscreen.webkitExitFullscreen ||
      documentWithFullscreen.mozCancelFullScreen ||
      documentWithFullscreen.msExitFullscreen

    try {
      void exitFullscreen?.call(documentWithFullscreen)
    } catch {
      // Some browsers reject fullscreen exit while their native UI is transitioning.
    }
  }, [menuOpen])

  useEffect(() => {
    if (!menuOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false)
        setHighlightedItemId(null)
        triggerRef.current?.focus()
        return
      }

      if (event.key !== "Tab") return

      const dialogElements = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>("button:not([disabled]), a[href]") ?? []
      )
      const focusableElements = [triggerRef.current, ...dialogElements].filter(
        (element): element is HTMLElement => element !== null
      )
      const firstElement = focusableElements[0]
      const lastElement = focusableElements.at(-1)

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault()
        lastElement?.focus()
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault()
        firstElement?.focus()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [menuOpen])

  const closeMenu = (restoreFocus = false) => {
    setMenuOpen(false)
    setHighlightedItemId(null)
    if (restoreFocus) triggerRef.current?.focus()
  }

  const setHash = (id: string) => {
    const hash = `#${id}`
    if (window.location.hash !== hash) window.history.replaceState(null, "", hash)
  }

  const navigate = (item: MenuNavigationItem) => {
    closeMenu()

    if (item.navigation === "contact") {
      if (pathname !== "/") {
        router.push(item.href)
        return
      }

      setHash(item.id)
      window.dispatchEvent(new CustomEvent("nav:contact"))
      return
    }

    router.push(item.href)
  }

  const isActive = (item: MenuNavigationItem) => {
    if (item.navigation === "contact") {
      return pathname === "/" && window.location.hash === "#contact"
    }

    if (item.href === "/") return pathname === "/" && window.location.hash !== "#contact"
    return pathname === item.href || pathname.startsWith(`${item.href}/`)
  }

  if (!mounted) return null

  const routeActiveItem = MENU_NAVIGATION_ITEMS.find(isActive)
  // Hovering a link should only play its RollingText animation. The visual
  // selection remains tied to the current route/section at all times.
  const activeItemId = routeActiveItem?.id ?? null
  const highlightItem = (itemId: string) => setHighlightedItemId(itemId)
  const clearHighlightedItem = (itemId: string) => {
    setHighlightedItemId((current) => current === itemId ? null : current)
  }
  const activateObject = (objectId: MenuObjectId, touch: boolean) => {
    const itemId = MENU_OBJECT_ITEM_IDS[objectId]
    const item = MENU_NAVIGATION_ITEMS.find((candidate) => candidate.id === itemId)
    if (!item) return
    if (touch && highlightedItemId !== item.id) {
      highlightItem(item.id)
      return
    }
    navigate(item)
  }

  const fastDuration = reducedMotion ? 0.1 : 0.22
  const enterDuration = reducedMotion ? 0.12 : 0.5
  const entranceDelay = (delay: number) => (reducedMotion ? 0 : delay)

  return (
    <>
      {createPortal(
        <motion.button
          ref={triggerRef}
          type="button"
          aria-label={menuOpen ? t("menuClose") : t("menuOpen")}
          aria-controls={MENU_ID}
          aria-expanded={menuOpen}
          onClick={(event) => {
            event.stopPropagation()
            if (menuOpen) setHighlightedItemId(null)
            setMenuOpen(!menuOpen)
          }}
          whileHover={reducedMotion ? undefined : { scale: 1.035 }}
          whileTap={{ scale: 0.96 }}
          transition={{ duration: fastDuration }}
          className="fixed right-3 top-3 z-20010 grid h-14 w-14 place-items-center rounded-full border border-white/35 bg-[#1e1e1e] shadow-[0_18px_70px_rgba(0,0,0,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4f2ec] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1e1e1e] sm:right-5 sm:top-5 sm:h-16 sm:w-16"
        >
          <span aria-hidden="true" className="relative block h-6 w-6">
            <motion.span
              className="absolute left-0 top-1/2 h-px w-6 bg-[#f4f2ec]"
              initial={false}
              animate={{ rotate: menuOpen ? 45 : 0, y: menuOpen ? 0 : -4 }}
              transition={{ duration: fastDuration, ease: [0.22, 1, 0.36, 1] }}
            />
            <motion.span
              className="absolute left-0 top-1/2 h-px w-6 bg-[#f4f2ec]"
              initial={false}
              animate={{ rotate: menuOpen ? -45 : 0, y: menuOpen ? 0 : 4 }}
              transition={{ duration: fastDuration, ease: [0.22, 1, 0.36, 1] }}
            />
          </span>
        </motion.button>,
        document.body
      )}

      {createPortal(
        <AnimatePresence initial={false}>
          {menuOpen ? (
            <motion.div
              ref={dialogRef}
              id={MENU_ID}
              role="dialog"
              aria-modal="true"
              aria-label={t("menuNav")}
              onMouseDown={(event) => {
                if (!event.currentTarget.querySelector("nav")?.contains(event.target as Node)) closeMenu(true)
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: fastDuration } }}
              transition={{ duration: enterDuration, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-0 z-9999 overflow-y-auto bg-[#1e1e1e] text-[#f4f2ec]"
            >
              <motion.div
                aria-hidden="true"
                className="pointer-events-none fixed inset-0"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 50% 88%, rgba(139,107,92,.14), transparent 34%), repeating-radial-gradient(circle at 50% 50%, rgba(232,231,231,.018) 0, rgba(232,231,231,.018) .5px, transparent .8px, transparent 3px)",
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                transition={{ duration: enterDuration }}
              />
              <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(115deg,#1e1e1e00,#17171766)] shadow-[inset_0_0_120px_rgba(0,0,0,.18)]" aria-hidden="true" />
              {showMenuObjects ? (
                <MenuObjects
                  activeItemId={activeItemId}
                  closeButtonRef={triggerRef}
                  footerZoneRef={footerZoneRef}
                  navigationZoneRef={navigationZoneRef}
                  onHighlightItem={highlightItem}
                  onClearItem={clearHighlightedItem}
                  onActivateObject={activateObject}
                />
              ) : null}

              <nav className="pointer-events-none relative z-10 mx-auto flex min-h-svh w-full max-w-248 flex-col px-3 pb-3 pt-20 [@media(max-width:639px)_and_(max-height:640px)]:pt-16 sm:px-8 sm:pb-8 sm:pt-24 md:px-12 md:py-9 lg:px-16">
                <div className="flex flex-1 flex-col justify-center py-2 [@media(max-width:639px)_and_(max-height:640px)]:py-0 sm:py-5 md:block md:flex-none md:py-0">
                  <motion.p
                    data-menu-safe
                    className="mx-auto mb-3 w-full max-w-90 border-b border-[#f4f2ec]/16 pb-2 text-center text-[9px] uppercase tracking-[0.22em] text-[#f4f2ec]/42 sm:mx-0 sm:max-w-none sm:border-0 sm:pb-0 sm:text-left md:mb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, transition: { duration: fastDuration } }}
                  transition={{ duration: fastDuration, delay: entranceDelay(0.25) }}
                  >
                    {t("menuNav")}
                  </motion.p>

                  <motion.ul
                    ref={navigationZoneRef}
                    data-menu-safe
                    data-menu-navigation-zone
                    className="pointer-events-auto mx-auto flex w-full max-w-120 flex-col gap-[clamp(.65rem,2.2vh,1.35rem)] [@media(max-width:639px)_and_(max-height:640px)]:gap-1 sm:block sm:max-w-none sm:divide-y sm:divide-[#f4f2ec]/16 sm:border-y sm:border-[#f4f2ec]/16"
                  initial="closed"
                  animate="open"
                  exit="closed"
                  variants={{
                    open: { transition: { delayChildren: entranceDelay(0.28), staggerChildren: reducedMotion ? 0 : 0.055 } },
                    closed: { transition: { staggerChildren: reducedMotion ? 0 : 0.025, staggerDirection: -1 } },
                  }}
                  >
                  {MENU_NAVIGATION_ITEMS.map((item) => {
                    const active = activeItemId === item.id

                    return (
                      <motion.li
                        key={item.id}
                        className="overflow-hidden"
                        variants={{
                          open: { opacity: 1, y: 0, transition: { duration: reducedMotion ? 0.1 : 0.36, ease: [0.22, 1, 0.36, 1] } },
                          closed: { opacity: 0, y: reducedMotion ? 0 : 8, transition: { duration: fastDuration } },
                        }}
                      >
                        <button
                          data-menu-item={item.id}
                          type="button"
                          aria-current={active && item.navigation === "route" ? "page" : undefined}
                          onClick={() => navigate(item)}
                          className={`group flex w-full flex-col items-center py-0 text-center transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#552f22] sm:grid sm:grid-cols-[3rem_1fr] sm:items-start sm:gap-x-2.5 sm:py-3 sm:text-left md:grid-cols-[3.75rem_1fr] md:py-[clamp(.65rem,1.5vh,1.15rem)] ${active ? "text-[#f4f2ec]" : "text-[#f4f2ec]/46 hover:text-[#f4f2ec]/64 focus-visible:text-[#f4f2ec]/64 sm:text-[#f4f2ec]/30"}`}
                        >
                          <span className={`mb-1 text-[8px] tabular-nums tracking-[0.18em] [@media(max-width:639px)_and_(max-height:640px)]:mb-0 sm:mb-0 sm:pt-1 sm:text-[9px] ${active ? "font-semibold text-[#8b6b5c]" : "text-current"}`}>
                            {item.number}
                          </span>
                          <span className="w-full">
                            <span className="mx-auto block max-w-full font-display text-[clamp(2.6rem,10vw,4.6rem)] font-semibold uppercase leading-[0.9] tracking-[-0.045em] [@media(max-width:639px)_and_(max-height:640px)]:leading-[0.82] sm:mx-0 sm:text-[clamp(1.75rem,5.2vw,4.75rem)] sm:leading-[0.82] sm:tracking-[-0.055em]">
                              <RollingText variant="strong">{t(item.labelKey)}</RollingText>
                            </span>
                            {active ? (
                              <span className="mx-auto mt-1.5 block max-w-64 text-[10px] leading-relaxed text-[#f4f2ec]/64 sm:mx-0 sm:max-w-lg md:text-[11px]">
                                {t(item.descriptionKey)}
                              </span>
                            ) : null}
                          </span>
                        </button>
                      </motion.li>
                    )
                  })}
                  </motion.ul>
                </div>

                <div className="hidden min-h-[clamp(9rem,20vh,13rem)] flex-1 md:block" aria-hidden="true" />

                <motion.footer
                  ref={footerZoneRef}
                  data-menu-footer-zone
                  className="pointer-events-auto relative left-1/2 grid w-[calc(100vw-1.5rem)] max-w-370 -translate-x-1/2 grid-cols-2 items-end gap-x-3 gap-y-2 border-t border-[#f4f2ec]/16 pt-2.5 text-center text-[8px] uppercase tracking-widest [@media(max-width:639px)_and_(max-height:640px)]:gap-y-1 [@media(max-width:639px)_and_(max-height:640px)]:pt-2 sm:w-[calc(100vw-4rem)] sm:grid-cols-[1fr_1fr_1fr] sm:gap-6 sm:border-0 sm:pt-0 sm:text-left sm:text-[11px] sm:tracking-[0.12em] lg:w-[calc(100vw-6rem)] lg:text-xs"
                  initial={{ opacity: 0, y: reducedMotion ? 0 : 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: reducedMotion ? 0 : 4, transition: { duration: fastDuration } }}
                  transition={{ duration: reducedMotion ? 0.1 : 0.35, delay: entranceDelay(0.65) }}
                >
                  <div data-menu-safe className="sm:text-left">
                    <span className="block text-[#f4f2ec]/48">{t("moreAboutFooterEdition")}</span>
                    <span className="mt-1 block tracking-normal text-[#f4f2ec]/82 sm:mt-2">2026 © Sarah Aliriel</span>
                  </div>
                  <MenuLocalTime label={t("moreAboutFooterLocalTime")} />
                  <div data-menu-safe className="col-span-2 sm:col-span-1">
                    <span className="block text-[#f4f2ec]/48 sm:text-right">{t("moreAboutFooterSocials")}</span>
                    <div className="mt-1 flex flex-wrap justify-center gap-x-2 gap-y-0 tracking-normal sm:mt-2 sm:justify-end sm:gap-x-5 sm:gap-y-2">
                      {SOCIALS.map((social) => (
                        <a key={social.label} href={social.href} target="_blank" rel="noreferrer" className="link-underline-invert inline-flex min-h-8 items-center px-1 normal-case text-[#f4f2ec]/82 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#552f22] sm:min-h-0 sm:px-0">
                          <RollingText variant="subtle">{social.label}</RollingText>
                        </a>
                      ))}
                    </div>
                  </div>
                </motion.footer>
              </nav>
            </motion.div>
          ) : null}
        </AnimatePresence>,
        document.body
      )}
    </>
  )
}

const objectImageClassName = "h-auto w-full select-none opacity-100 brightness-[.98] contrast-105 saturate-95 drop-shadow-[0_16px_24px_rgba(0,0,0,0.2)] transition-[scale,filter] duration-300 ease-out group-hover/object:scale-[1.02] group-hover/object:drop-shadow-[0_16px_26px_rgba(139,107,92,0.18)]"

type MenuObjectId = "headphones" | "tea" | "macbook" | "tablet"

const MENU_OBJECT_ITEM_IDS: Record<MenuObjectId, string> = {
  macbook: "about",
  tablet: "design-gallery",
  headphones: "motion-archive",
  tea: "contact",
}

type MenuObjectsProps = {
  activeItemId: string | null
  closeButtonRef: RefObject<HTMLButtonElement | null>
  footerZoneRef: RefObject<HTMLElement | null>
  navigationZoneRef: RefObject<HTMLUListElement | null>
  onHighlightItem: (itemId: string) => void
  onClearItem: (itemId: string) => void
  onActivateObject: (objectId: MenuObjectId, touch: boolean) => void
}

type MenuObjectBody = {
  id: MenuObjectId
  node: HTMLDivElement | null
  hitArea: HTMLDivElement | null
  visualNode: HTMLDivElement | null
  mass: number
  deceleration: number
  maxRotation: number
  rotationResponse: number
  x: number
  y: number
  vx: number
  vy: number
  rotation: number
  angularVelocity: number
  dragging: boolean
  pointerId: number | null
  lastPointerX: number
  lastPointerY: number
  lastPointerTime: number
  pointerTravel: number
  lastPointerType: string
  lastInteraction: number
}

const MENU_OBJECT_CONFIG: Record<MenuObjectId, Pick<MenuObjectBody, "mass" | "deceleration" | "maxRotation" | "rotationResponse">> = {
  macbook: { mass: 3.4, deceleration: 6.8, maxRotation: 1.8, rotationResponse: 0.002 },
  tablet: { mass: 2.1, deceleration: 5.7, maxRotation: 3, rotationResponse: 0.003 },
  headphones: { mass: 0.72, deceleration: 3.1, maxRotation: 9, rotationResponse: 0.009 },
  tea: { mass: 1.65, deceleration: 5, maxRotation: 4, rotationResponse: 0.004 },
}

const createMenuObjectBody = (id: MenuObjectId): MenuObjectBody => ({
  id,
  ...MENU_OBJECT_CONFIG[id],
  node: null,
  hitArea: null,
  visualNode: null,
  x: 0,
  y: 0,
  vx: 0,
  vy: 0,
  rotation: 0,
  angularVelocity: 0,
  dragging: false,
  pointerId: null,
  lastPointerX: 0,
  lastPointerY: 0,
  lastPointerTime: 0,
  pointerTravel: 0,
  lastPointerType: "mouse",
  lastInteraction: 0,
})

function MenuObjects({
  activeItemId,
  closeButtonRef,
  footerZoneRef,
  navigationZoneRef,
  onHighlightItem,
  onClearItem,
  onActivateObject,
}: MenuObjectsProps) {
  const bodiesRef = useRef<Record<MenuObjectId, MenuObjectBody>>({
    headphones: createMenuObjectBody("headphones"),
    tea: createMenuObjectBody("tea"),
    macbook: createMenuObjectBody("macbook"),
    tablet: createMenuObjectBody("tablet"),
  })
  const frameRef = useRef<number | null>(null)
  const proximityFrameRef = useRef<number | null>(null)
  const pointerPositionRef = useRef({ x: 0, y: 0 })
  const lastFrameRef = useRef(0)
  const reducedMotionRef = useRef(false)

  const applyBodyTransform = (body: MenuObjectBody) => {
    if (!body.node) return
    body.node.style.transform = `translate3d(${body.x}px, ${body.y}px, 0) rotate(${reducedMotionRef.current ? 0 : body.rotation}deg)`
  }

  const keepHitAreaInside = (body: MenuObjectBody) => {
    if (!body.hitArea) return
    const rect = body.hitArea.getBoundingClientRect()
    const visualOffset = 4
    const footerTop = footerZoneRef.current?.getBoundingClientRect().top ?? window.innerHeight
    const lowerBoundary = Math.min(window.innerHeight, footerTop) - visualOffset

    if (rect.left < visualOffset) {
      body.x += visualOffset - rect.left
      body.vx = 0
    } else if (rect.right > window.innerWidth - visualOffset) {
      body.x += window.innerWidth - visualOffset - rect.right
      body.vx = 0
    }
    if (rect.top < visualOffset) {
      body.y += visualOffset - rect.top
      body.vy = 0
    } else if (rect.bottom > lowerBoundary) {
      body.y += lowerBoundary - rect.bottom
      body.vy = 0
    }
  }

  const separateFromProtectedArea = (body: MenuObjectBody, protectedRect: DOMRect, previousRect?: DOMRect) => {
    if (!body.hitArea) return
    const rect = body.hitArea.getBoundingClientRect()
    const padding = 8
    const left = protectedRect.left - padding
    const right = protectedRect.right + padding
    const top = protectedRect.top - padding
    const bottom = protectedRect.bottom + padding
    const sweptRect = previousRect ? {
      left: Math.min(previousRect.left, rect.left),
      right: Math.max(previousRect.right, rect.right),
      top: Math.min(previousRect.top, rect.top),
      bottom: Math.max(previousRect.bottom, rect.bottom),
    } : rect
    if (sweptRect.right <= left || sweptRect.left >= right || sweptRect.bottom <= top || sweptRect.top >= bottom) return

    const moves = previousRect && previousRect.right <= left
      ? [{ axis: "x", amount: left - rect.right }] as const
      : previousRect && previousRect.left >= right
        ? [{ axis: "x", amount: right - rect.left }] as const
        : previousRect && previousRect.bottom <= top
          ? [{ axis: "y", amount: top - rect.bottom }] as const
          : previousRect && previousRect.top >= bottom
            ? [{ axis: "y", amount: bottom - rect.top }] as const
            : [
                { axis: "x", amount: left - rect.right },
                { axis: "x", amount: right - rect.left },
                { axis: "y", amount: top - rect.bottom },
                { axis: "y", amount: bottom - rect.top },
              ] as const
    const correction = moves.reduce((smallest, move) => Math.abs(move.amount) < Math.abs(smallest.amount) ? move : smallest)
    if (correction.axis === "x") {
      body.x += correction.amount
      body.vx = 0
    } else {
      body.y += correction.amount
      body.vy = 0
    }
  }

  const constrainBody = (body: MenuObjectBody, previousRect?: DOMRect) => {
    if (!body.hitArea) return
    applyBodyTransform(body)
    keepHitAreaInside(body)
    applyBodyTransform(body)

    if (navigationZoneRef.current) {
      separateFromProtectedArea(body, navigationZoneRef.current.getBoundingClientRect(), previousRect)
      applyBodyTransform(body)
    }
    if (closeButtonRef.current) {
      separateFromProtectedArea(body, closeButtonRef.current.getBoundingClientRect(), previousRect)
      applyBodyTransform(body)
    }

    keepHitAreaInside(body)
    applyBodyTransform(body)
  }

  const resolveObjectCollisions = (bodies: MenuObjectBody[], now: number) => {
    for (let firstIndex = 0; firstIndex < bodies.length; firstIndex += 1) {
      const first = bodies[firstIndex]
      if (!first.hitArea) continue
      const firstRect = first.hitArea.getBoundingClientRect()
      const firstRadius = Math.min(firstRect.width, firstRect.height) * 0.46
      const firstCenter = { x: firstRect.left + firstRect.width / 2, y: firstRect.top + firstRect.height / 2 }

      for (let secondIndex = firstIndex + 1; secondIndex < bodies.length; secondIndex += 1) {
        const second = bodies[secondIndex]
        if (!second.hitArea) continue
        if (first.lastInteraction === 0 && second.lastInteraction === 0) continue
        const secondRect = second.hitArea.getBoundingClientRect()
        const secondRadius = Math.min(secondRect.width, secondRect.height) * 0.46
        const secondCenter = { x: secondRect.left + secondRect.width / 2, y: secondRect.top + secondRect.height / 2 }
        const dx = secondCenter.x - firstCenter.x
        const dy = secondCenter.y - firstCenter.y
        const distance = Math.hypot(dx, dy) || 0.001
        const overlap = firstRadius + secondRadius - distance
        if (overlap <= 0) continue
        const combinedSpeed = Math.hypot(first.vx, first.vy) + Math.hypot(second.vx, second.vy)
        if (!first.dragging && !second.dragging && combinedSpeed < 4) continue

        const normalX = dx / distance
        const normalY = dy / distance
        const firstShare = second.mass / (first.mass + second.mass)
        const secondShare = first.mass / (first.mass + second.mass)
        if (!first.dragging) {
          first.x -= normalX * overlap * firstShare
          first.y -= normalY * overlap * firstShare
        }
        if (!second.dragging) {
          second.x += normalX * overlap * secondShare
          second.y += normalY * overlap * secondShare
        }

        const relativeVelocity = (second.vx - first.vx) * normalX + (second.vy - first.vy) * normalY
        if (relativeVelocity < 0) {
          const impulse = (-(1.08) * relativeVelocity) / (1 / first.mass + 1 / second.mass)
          if (!first.dragging) {
            first.vx -= (impulse * normalX) / first.mass
            first.vy -= (impulse * normalY) / first.mass
          }
          if (!second.dragging) {
            second.vx += (impulse * normalX) / second.mass
            second.vy += (impulse * normalY) / second.mass
          }
        }
        if (first.dragging || second.dragging || Math.abs(relativeVelocity) > 6) {
          first.lastInteraction = now
          second.lastInteraction = now
        }
      }
    }
  }

  const runPhysics = (timestamp: number) => {
    const bodies = Object.values(bodiesRef.current)
    const delta = Math.min((timestamp - (lastFrameRef.current || timestamp)) / 1000, 0.032)
    lastFrameRef.current = timestamp
    const reducedMotion = reducedMotionRef.current
    let shouldContinue = false

    bodies.forEach((body) => {
      if (body.dragging) {
        shouldContinue = true
        return
      }

      const previousRect = body.hitArea?.getBoundingClientRect()

      const decay = Math.exp(-body.deceleration * delta)
      body.vx *= decay
      body.vy *= decay
      body.angularVelocity *= Math.exp(-7 * delta)

      body.x += body.vx * delta
      body.y += body.vy * delta
      if (!reducedMotion) {
        body.angularVelocity += (body.vx * body.rotationResponse - body.rotation) * delta * 4
        body.rotation += body.angularVelocity * delta
        body.rotation = Math.max(-body.maxRotation, Math.min(body.maxRotation, body.rotation))
      } else {
        body.rotation = 0
        body.angularVelocity = 0
      }
      constrainBody(body, previousRect)

      const moving = Math.hypot(body.vx, body.vy) >= 2 || Math.abs(body.angularVelocity) >= 0.02 || Math.abs(body.rotation) >= 0.1
      if (body.lastInteraction > 0 && moving) {
        shouldContinue = true
      } else if (body.lastInteraction > 0) {
        body.vx = 0
        body.vy = 0
        body.angularVelocity = 0
        applyBodyTransform(body)
      }
    })

    if (!reducedMotion) {
      resolveObjectCollisions(bodies, timestamp)
      bodies.forEach((body) => {
        constrainBody(body)
        const moving = Math.hypot(body.vx, body.vy) >= 2 || Math.abs(body.angularVelocity) >= 0.02
        if (body.dragging || moving) shouldContinue = true
      })
    }

    if (shouldContinue) frameRef.current = requestAnimationFrame(runPhysics)
    else {
      frameRef.current = null
      lastFrameRef.current = 0
    }
  }

  const startEngine = () => {
    if (frameRef.current !== null) return
    lastFrameRef.current = 0
    frameRef.current = requestAnimationFrame(runPhysics)
  }

  const handlePointerDown = (id: MenuObjectId, event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    const body = bodiesRef.current[id]
    constrainBody(body)
    body.dragging = true
    body.pointerId = event.pointerId
    body.lastPointerX = event.clientX
    body.lastPointerY = event.clientY
    body.lastPointerTime = event.timeStamp
    body.pointerTravel = 0
    body.lastPointerType = event.pointerType
    body.vx = 0
    body.vy = 0
    body.lastInteraction = event.timeStamp
    event.currentTarget.setPointerCapture(event.pointerId)
    startEngine()
  }

  const handlePointerMove = (id: MenuObjectId, event: ReactPointerEvent<HTMLDivElement>) => {
    const body = bodiesRef.current[id]
    if (!body.dragging || body.pointerId !== event.pointerId) return
    event.preventDefault()
    const previousRect = body.hitArea?.getBoundingClientRect()
    const now = event.timeStamp
    const elapsed = Math.max(now - body.lastPointerTime, 8)
    let dx = event.clientX - body.lastPointerX
    let dy = event.clientY - body.lastPointerY
    if (reducedMotionRef.current) {
      const nextDistance = Math.hypot(body.x + dx, body.y + dy)
      if (nextDistance > 24) {
        const scale = 24 / nextDistance
        dx = (body.x + dx) * scale - body.x
        dy = (body.y + dy) * scale - body.y
      }
    }
    body.x += dx
    body.y += dy
    body.pointerTravel += Math.hypot(dx, dy)
    body.vx = (dx / elapsed) * 1000
    body.vy = (dy / elapsed) * 1000
    body.angularVelocity = reducedMotionRef.current ? 0 : body.vx * body.rotationResponse * 0.65
    body.lastPointerX = event.clientX
    body.lastPointerY = event.clientY
    body.lastPointerTime = now
    body.lastInteraction = now
    constrainBody(body, previousRect)
  }

  const handlePointerEnd = (id: MenuObjectId, event: ReactPointerEvent<HTMLDivElement>) => {
    const body = bodiesRef.current[id]
    if (body.pointerId !== event.pointerId) return
    body.dragging = false
    body.pointerId = null
    body.lastInteraction = event.timeStamp
    if (reducedMotionRef.current) {
      body.vx = 0
      body.vy = 0
    } else {
      body.vx /= body.mass
      body.vy /= body.mass
    }
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    startEngine()
  }

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
    let layoutConstraintFrame = 0
    const scheduleConstraint = () => {
      cancelAnimationFrame(layoutConstraintFrame)
      layoutConstraintFrame = requestAnimationFrame(() => {
        Object.values(bodiesRef.current).forEach((body) => constrainBody(body))
      })
    }
    const updateReducedMotion = () => {
      reducedMotionRef.current = reducedMotion.matches
      if (reducedMotion.matches) {
        Object.values(bodiesRef.current).forEach((body) => {
          if (body.visualNode) body.visualNode.style.transform = "translate3d(0, 0, 0)"
        })
      }
    }
    const handleResize = () => {
      resetProximity()
      scheduleConstraint()
    }
    const resetProximity = () => {
      Object.values(bodiesRef.current).forEach((body) => {
        if (body.visualNode) body.visualNode.style.transform = "translate3d(0, 0, 0)"
      })
    }
    const updateProximity = () => {
      proximityFrameRef.current = null
      if (reducedMotionRef.current) {
        resetProximity()
        return
      }
      const pointer = pointerPositionRef.current
      Object.values(bodiesRef.current).forEach((body) => {
        if (!body.visualNode || !body.hitArea || body.dragging) return
        const rect = body.hitArea.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2
        const dx = centerX - pointer.x
        const dy = centerY - pointer.y
        const distance = Math.hypot(dx, dy)
        const radius = 190
        const strength = distance < radius ? (1 - distance / radius) * 4 : 0
        const offsetX = distance > 0 ? (dx / distance) * strength : 0
        const offsetY = distance > 0 ? (dy / distance) * strength : 0
        body.visualNode.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0)`
      })
    }
    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return
      pointerPositionRef.current = { x: event.clientX, y: event.clientY }
      if (proximityFrameRef.current === null) proximityFrameRef.current = requestAnimationFrame(updateProximity)
    }
    const handlePointerOut = (event: PointerEvent) => {
      if (event.relatedTarget === null) resetProximity()
    }

    updateReducedMotion()
    const constraintStartedAt = performance.now()
    let constraintFrame = 0
    const constrainDuringEntrance = () => {
      Object.values(bodiesRef.current).forEach((body) => constrainBody(body))
      if (performance.now() - constraintStartedAt < 1200) {
        constraintFrame = requestAnimationFrame(constrainDuringEntrance)
      }
    }
    constraintFrame = requestAnimationFrame(constrainDuringEntrance)
    const boundaryObserver = new ResizeObserver(scheduleConstraint)
    const observedBoundaries = [navigationZoneRef.current, footerZoneRef.current, closeButtonRef.current]
      .filter((element): element is HTMLElement => element !== null)
    observedBoundaries.forEach((element) => boundaryObserver.observe(element))
    const navigationContentObserver = new MutationObserver(scheduleConstraint)
    if (navigationZoneRef.current) {
      navigationContentObserver.observe(navigationZoneRef.current, {
        characterData: true,
        childList: true,
        subtree: true,
      })
    }
    reducedMotion.addEventListener("change", updateReducedMotion)
    window.addEventListener("resize", handleResize)
    window.addEventListener("pointermove", handlePointerMove, { passive: true })
    window.addEventListener("pointerout", handlePointerOut)
    return () => {
      reducedMotion.removeEventListener("change", updateReducedMotion)
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerout", handlePointerOut)
      boundaryObserver.disconnect()
      navigationContentObserver.disconnect()
      cancelAnimationFrame(layoutConstraintFrame)
      cancelAnimationFrame(constraintFrame)
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
      if (proximityFrameRef.current !== null) cancelAnimationFrame(proximityFrameRef.current)
    }
    // The physics listeners and their initial constraint pass are installed once per menu mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const renderObject = (id: MenuObjectId, src: string, hitAreaClassName: string) => {
    const itemId = MENU_OBJECT_ITEM_IDS[id]
    const active = activeItemId === itemId

    return (
      <div className={`menu-object-enter menu-object-enter--${id} h-full w-full`}>
        <div
          ref={(node) => { bodiesRef.current[id].node = node }}
          className="group/object relative h-full w-full will-change-transform"
        >
          <div
            ref={(node) => { bodiesRef.current[id].visualNode = node }}
            className="h-full w-full transition-transform duration-150 ease-out will-change-transform"
          >
            <Image
              src={src}
              alt=""
              width={1080}
              height={1350}
              draggable={false}
              className={`${objectImageClassName} ${active ? "scale-[1.025] drop-shadow-[0_16px_26px_rgba(139,107,92,0.2)]" : ""}`}
            />
          </div>
          <div
            ref={(node) => { bodiesRef.current[id].hitArea = node }}
            data-menu-object={id}
            className={`pointer-events-auto absolute cursor-grab touch-none rounded-[35%] active:cursor-grabbing ${hitAreaClassName}`}
            onMouseDown={(event) => event.stopPropagation()}
            onMouseEnter={() => {
              if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) onHighlightItem(itemId)
            }}
            onMouseLeave={() => {
              if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) onClearItem(itemId)
            }}
            onPointerDown={(event) => handlePointerDown(id, event)}
            onPointerMove={(event) => handlePointerMove(id, event)}
            onPointerUp={(event) => handlePointerEnd(id, event)}
            onPointerCancel={(event) => handlePointerEnd(id, event)}
            onClick={(event) => {
              event.stopPropagation()
              const body = bodiesRef.current[id]
              if (body.pointerTravel <= 7) onActivateObject(id, body.lastPointerType === "touch")
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <div
      data-menu-objects
      className="pointer-events-none fixed bottom-[clamp(6.8rem,12vh,9rem)] left-1/2 z-0 h-[clamp(9.5rem,20vh,12.5rem)] w-[clamp(17.5rem,31vw,23.75rem)] -translate-x-1/2"
      aria-hidden="true"
    >
      <div className="absolute -left-[8%] bottom-[-8%] z-20 w-[62%] -rotate-6">
        {renderObject("headphones", "/images/menu/fones.png", "left-[26%] top-[29%] h-[36%] w-[53%]")}
      </div>
      <div className="absolute left-[14%] bottom-[-27%] z-40 w-[52%] rotate-2">
        {renderObject("tea", "/images/menu/cha.png", "left-[21%] top-[34%] h-[27%] w-[58%]")}
      </div>
      <div className="absolute left-[20%] top-[-55%] z-30 w-[72%] -rotate-2">
        {renderObject("tablet", "/images/menu/mesa-digitalizadora.png", "left-[23%] top-[26%] h-[43%] w-[60%]")}
      </div>
      <div className="absolute -right-[11%] bottom-[-25%] z-10 w-[79%] rotate-3">
        {renderObject("macbook", "/images/menu/macbook.png", "left-[26%] top-[35%] h-[29%] w-[46%]")}
      </div>
    </div>
  )
}

function MenuLocalTime({ label }: { label: string }) {
  const [time, setTime] = useState("--:--:--")
  const [zone, setZone] = useState("Lisboa")

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat("pt-PT", {
      timeZone: "Europe/Lisbon",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZoneName: "short",
    })
    const update = () => {
      const parts = formatter.formatToParts(new Date())
      setTime(parts.filter((part) => part.type !== "timeZoneName").map((part) => part.value).join("").trim())
      setZone(parts.find((part) => part.type === "timeZoneName")?.value ?? "Lisboa")
    }

    update()
    const interval = window.setInterval(update, 1000)
    return () => window.clearInterval(interval)
  }, [])

  return (
    <div data-menu-safe className="text-center">
      <span className="block text-[#f4f2ec]/48">{label}</span>
      <time className="mt-1.5 block font-medium tabular-nums tracking-[0.08em] text-[#f4f2ec]/82 sm:mt-2">
        {time} {zone}
      </time>
    </div>
  )
}
