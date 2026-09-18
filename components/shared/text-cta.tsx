import Link from "next/link"
import RollingText from "@/components/shared/rolling-text"

type TextCtaProps = {
  href: string
  children: string
  ariaLabel?: string
  tone?: "dark" | "light"
  className?: string
}

export default function TextCta({ href, children, ariaLabel, tone = "dark", className = "" }: TextCtaProps) {
  const colorClass = tone === "light"
    ? "text-[#1e1e1e] hover:text-[#552f22] focus-visible:outline-[#552f22]"
    : "text-[#f4f2ec] hover:text-[#5e4cff] focus-visible:outline-[#f4f2ec]"

  return (
    <Link
      href={href}
      aria-label={ariaLabel ?? children}
      className={`group/cta inline-flex w-fit items-center gap-3 border-b border-[#552f22] pb-1 text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 ${colorClass} ${className}`}
    >
      <RollingText>{children}</RollingText>
      <span className="transition-transform duration-300 group-hover/cta:translate-x-1" aria-hidden="true">→</span>
    </Link>
  )
}
