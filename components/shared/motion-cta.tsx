import Link from "next/link"
import RollingText from "@/components/shared/rolling-text"

type MotionCtaProps = {
  href: string
  children: string
  ariaLabel?: string
  className?: string
}

export default function MotionCta({ href, children, ariaLabel, className = "" }: MotionCtaProps) {
  return (
    <Link
      href={href}
      aria-label={ariaLabel ?? children}
      className={`group relative inline-flex min-h-14 items-center justify-center overflow-hidden rounded-full border border-[#e8e7e7]/16 px-8 text-center text-[12px] font-semibold uppercase tracking-[0.18em] text-[#e8e7e7] transition-colors duration-500 hover:border-[#552f22] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e8e7e7] ${className}`}
    >
      <span className="absolute inset-0 origin-left scale-x-0 bg-[#552f22] transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-x-100" aria-hidden="true" />
      <span className="relative z-10 flex items-center gap-3">
        <RollingText variant="strong">{children}</RollingText>
        <span className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">↗</span>
      </span>
    </Link>
  )
}
