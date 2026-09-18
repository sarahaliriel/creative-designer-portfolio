"use client"

import type { CSSProperties, RefObject } from "react"
import { useI18n } from "@/components/providers/i18n"
import type { ArchiveProject, CategoryKey } from "@/data/all-projects"

type CategoryMap = Record<CategoryKey, { title: string }>

type ProjectThumbsProps = {
  activeIndex: number
  categories: CategoryMap
  onSelect: (index: number) => void
  projects: ArchiveProject[]
  railRef: RefObject<HTMLDivElement | null>
  total: number
}

function carouselDistance(index: number, active: number, total: number) {
  const raw = index - active
  if (total <= 1) return 0
  if (raw > total / 2) return raw - total
  if (raw < -total / 2) return raw + total
  return raw
}

export function ProjectThumbs({ activeIndex, categories, onSelect, projects, railRef, total }: ProjectThumbsProps) {
  const { t } = useI18n()

  return (
    <aside className="order-2 min-w-0 lg:order-1 lg:h-full">
      <div
        ref={railRef}
        className="ap-rail relative max-h-26 overflow-x-auto overflow-y-hidden pb-1 lg:h-full lg:max-h-none lg:overflow-hidden lg:pb-0 lg:pr-1"
      >
        <div className="flex snap-x gap-3 lg:block">
          {projects.map((project, i) => {
            const on = i === activeIndex
            const distance = carouselDistance(i, activeIndex, total)
            const scale = Math.max(0.9, 1 - Math.min(Math.abs(distance), 3) * 0.035)
            const hiddenOnDesktop = Math.abs(distance) > 3
            return (
              <button
                key={project.id}
                type="button"
                data-project-index={i}
                onClick={() => onSelect(i)}
                style={{ "--ap-distance": distance, "--ap-scale": scale } as CSSProperties}
                className={[
                  "ap-rail-item group grid w-53.5 shrink-0 snap-center border-t pt-2.5 text-left transition-all duration-500 sm:w-58.75 lg:absolute lg:left-0 lg:top-1/2 lg:w-full lg:border-t-0 lg:pt-0",
                  hiddenOnDesktop ? "lg:pointer-events-none lg:opacity-0" : "",
                  on ? "border-[#552f22] opacity-100" : "border-[#1e1e1e]/18 opacity-48 hover:opacity-85",
                ].join(" ")}
                aria-current={on ? "true" : undefined}
                aria-label={`${t("allprojectsSelectEdit")} ${project.id}`}
              >
                <div className="min-w-0">
                  <div className="flex items-baseline gap-3">
                    <span className={["text-[11px] tabular-nums transition-colors duration-300", on ? "text-[#552f22]" : "text-[#1e1e1e]/45"].join(" ")}>
                      {project.id}
                    </span>
                    <span className={["truncate text-[13px] font-medium leading-tight sm:text-[14px] lg:text-[15px]", on ? "lg:opacity-100" : "lg:opacity-0 lg:group-hover:opacity-100"].join(" ")}>
                      {project.title}
                    </span>
                  </div>
                  <div className={["mt-1 truncate text-[10px] uppercase tracking-[0.12em] text-[#1e1e1e]/52 lg:mt-2", on ? "lg:opacity-100" : "lg:opacity-0"].join(" ")}>
                    {categories[project.category].title}
                  </div>
                  <div className="mt-0.5 truncate text-[11px] leading-tight text-[#1e1e1e]/58 lg:hidden">{project.tagsLine}</div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </aside>
  )
}
