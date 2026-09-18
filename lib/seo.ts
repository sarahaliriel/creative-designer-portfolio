import type { Metadata } from "next"

export const SITE_NAME = "Sarah Aliriel Dumitrache"
export const SITE_TITLE = "Sarah Aliriel Dumitrache | Designer, Video Editor & Frontend Developer"
export const SITE_DESCRIPTION =
  "Creative portfolio of Sarah Aliriel Dumitrache, combining design, video editing and frontend development to create distinctive digital experiences."
export const SOCIAL_IMAGE = "/images/branding/preview-hero-seo.png"

export const SOCIAL_LINKS = [
  "https://www.instagram.com/chazinhodociel/",
  "https://www.linkedin.com/in/sarah-dumitrache/",
  "https://github.com/sarahaliriel",
]

const FALLBACK_URL = "https://sarahaliriel.work"

function normalizeUrl(value: string) {
  const url = value.startsWith("http") ? value : `https://${value}`
  return url.replace(/\/$/, "")
}

export const siteUrl = normalizeUrl(
  process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.VERCEL_PROJECT_PRODUCTION_URL ??
    process.env.VERCEL_URL ??
    FALLBACK_URL,
)

export const absoluteUrl = (path = "/") => new URL(path, `${siteUrl}/`).toString()

type PageMetadata = {
  title: string
  description: string
  path: string
  image?: string
  keywords?: string[]
}

export function createPageMetadata({
  title,
  description,
  path,
  image = SOCIAL_IMAGE,
  keywords = [],
}: PageMetadata): Metadata {
  const canonical = absoluteUrl(path)
  const imageUrl = absoluteUrl(image)

  return {
    title,
    description,
    keywords,
    alternates: { canonical },
    openGraph: {
      type: "website",
      locale: "pt_PT",
      url: canonical,
      siteName: SITE_NAME,
      title,
      description,
      images: [{ url: imageUrl, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  }
}

export const personSchema = {
  "@type": "Person",
  "@id": `${siteUrl}/#person`,
  name: SITE_NAME,
  alternateName: "Sarah Aliriel",
  url: siteUrl,
  image: absoluteUrl("/images/moreabout/sarah-aliriel-photo.jpeg"),
  jobTitle: ["Designer", "Editora de Vídeo", "Desenvolvedora Frontend"],
  email: "mailto:dumitrachebusiness@gmail.com",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Póvoa de Varzim",
    addressCountry: "PT",
  },
  sameAs: SOCIAL_LINKS,
  knowsAbout: [
    "Direção de arte",
    "Design gráfico",
    "Identidade visual",
    "Social media design",
    "Edição de vídeo",
    "Motion design",
    "Desenvolvimento frontend",
  ],
}

export const websiteSchema = {
  "@type": "WebSite",
  "@id": `${siteUrl}/#website`,
  url: siteUrl,
  name: `${SITE_NAME} — Portfólio`,
  description: SITE_DESCRIPTION,
  inLanguage: "pt-PT",
  author: { "@id": `${siteUrl}/#person` },
  publisher: { "@id": `${siteUrl}/#person` },
}

export const portfolioSchema = {
  "@type": "CreativeWork",
  "@id": `${siteUrl}/#portfolio`,
  name: `${SITE_NAME} — Portfólio Criativo`,
  url: siteUrl,
  description: SITE_DESCRIPTION,
  inLanguage: ["pt-PT", "en", "es"],
  creator: { "@id": `${siteUrl}/#person` },
  isPartOf: { "@id": `${siteUrl}/#website` },
  keywords: "design, edição de vídeo, motion design, frontend, direção de arte, social media",
}
