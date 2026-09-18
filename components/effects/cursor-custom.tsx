"use client"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"

type FullscreenDocument = Document & {
  webkitFullscreenElement?: Element | null
  mozFullScreenElement?: Element | null
  msFullscreenElement?: Element | null
}

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const raf = useRef<number | null>(null)

  const [enabled, setEnabled] = useState(false)
  const [fsHost, setFsHost] = useState<HTMLElement | null>(null)

  const target = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)")
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)")

    const update = () => {
      const shouldEnable = finePointer.matches && !reduced.matches
      setEnabled(shouldEnable)

      if (shouldEnable) {
        document.documentElement.classList.add("cursor-hidden")
        document.body.style.cursor = "none"
      } else {
        document.documentElement.classList.remove("cursor-hidden")
        document.body.style.cursor = "auto"
      }
    }

    update()
    finePointer.addEventListener("change", update)
    reduced.addEventListener("change", update)

    return () => {
      finePointer.removeEventListener("change", update)
      reduced.removeEventListener("change", update)
      document.documentElement.classList.remove("cursor-hidden")
      document.body.style.cursor = "auto"
    }
  }, [])

  useEffect(() => {
    const onFs = () => {
      const d = document as FullscreenDocument
      const el =
        (d.fullscreenElement as HTMLElement | null) ||
        (d.webkitFullscreenElement as HTMLElement | null) ||
        (d.mozFullScreenElement as HTMLElement | null) ||
        (d.msFullscreenElement as HTMLElement | null)
      setFsHost(el ?? null)
    }

    onFs()
    document.addEventListener("fullscreenchange", onFs)
    document.addEventListener("webkitfullscreenchange", onFs)
    document.addEventListener("mozfullscreenchange", onFs)
    document.addEventListener("MSFullscreenChange", onFs)

    return () => {
      document.removeEventListener("fullscreenchange", onFs)
      document.removeEventListener("webkitfullscreenchange", onFs)
      document.removeEventListener("mozfullscreenchange", onFs)
      document.removeEventListener("MSFullscreenChange", onFs)
    }
  }, [])

  useEffect(() => {
    if (!enabled) return

    const tick = () => {
      raf.current = null
      const el = cursorRef.current
      if (!el) return

      el.style.transform = `translate3d(${target.current.x}px, ${target.current.y}px, 0) translate(-50%, -50%)`
    }

    const move = (e: PointerEvent) => {
      target.current.x = e.clientX
      target.current.y = e.clientY
      if (raf.current == null) raf.current = requestAnimationFrame(tick)
    }

    window.addEventListener("pointermove", move, { passive: true })

    return () => {
      window.removeEventListener("pointermove", move)
      if (raf.current) cancelAnimationFrame(raf.current)
    }
  }, [enabled])

  if (!enabled) return null

  const cursorNode = (
    <div ref={cursorRef} className="pointer-events-none fixed left-0 top-0 z-30000">
      <div className="size-2.5 rounded-full bg-[#552f22]" />
    </div>
  )

  if (fsHost) return createPortal(cursorNode, fsHost)
  return cursorNode
}
