import type { MetadataRoute } from "next"
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — Portfólio Criativo`,
    short_name: "Sarah Aliriel",
    description: SITE_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#f4f2ec",
    theme_color: "#552f22",
    lang: "pt-PT",
    icons: [
      { src: "/images/branding/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/images/branding/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  }
}
