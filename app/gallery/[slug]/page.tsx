import type { Metadata } from "next"
import { notFound } from "next/navigation"
import ProjectGalleryDetail from "@/components/gallery/project-gallery-detail"
import Menu from "@/components/layout/menu"
import JsonLd from "@/components/seo/json-ld"
import { galleryProjects, getGalleryProjectConfigBySlug } from "@/data/gallery"
import { absoluteUrl, createPageMetadata, SITE_NAME, siteUrl } from "@/lib/seo"

const projectSeo = {
  "frigideira-ai": {
    name: "Frigideira AI",
    title: "Frigideira AI | Case de Design por Sarah Aliriel",
    description:
      "Case de direção de arte e design editorial para Frigideira AI, transformando tecnologia e inteligência artificial em conteúdo claro e memorável.",
  },
  "the-real-tocha": {
    name: "The Real Tocha",
    title: "The Real Tocha | Identidade Visual por Sarah Aliriel",
    description:
      "Case de identidade visual e conteúdo de autoridade para The Real Tocha, com direção de arte para empreendedorismo, investimento e comunicação.",
  },
  sdp: {
    name: "Servidor dos Programadores",
    title: "Servidor dos Programadores | Design por Sarah Aliriel",
    description:
      "Case de social media e sistema visual para o Servidor dos Programadores, conectando campanhas, eventos e uma grande comunidade de tecnologia.",
  },
} as const

type PageProps = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const project = getGalleryProjectConfigBySlug(slug)
  const seo = projectSeo[slug as keyof typeof projectSeo]

  if (!project || !seo) return {}

  return createPageMetadata({
    title: seo.title,
    description: seo.description,
    path: `/gallery/${slug}`,
    image: project.heroMockup.src,
    keywords: [seo.name, "case study de design", "direção de arte", "design editorial", "social media design", "Sarah Aliriel"],
  })
}

export function generateStaticParams() {
  return galleryProjects.map((project) => ({ slug: project.slug }))
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params
  const project = getGalleryProjectConfigBySlug(slug)
  const seo = projectSeo[slug as keyof typeof projectSeo]

  if (!project || !seo) notFound()

  return (
    <main className="relative min-h-svh bg-[#f4f2ec] text-[#1e1e1e]">
      <JsonLd
        data={{
          "@type": "CreativeWork",
          "@id": `${siteUrl}/gallery/${slug}#creative-work`,
          name: seo.name,
          headline: seo.title,
          description: seo.description,
          url: absoluteUrl(`/gallery/${slug}`),
          image: absoluteUrl(project.heroMockup.src),
          dateCreated: project.year.split(" - ")[0],
          inLanguage: "pt-PT",
          creator: { "@id": `${siteUrl}/#person`, name: SITE_NAME },
          author: { "@id": `${siteUrl}/#person` },
          isPartOf: { "@id": `${siteUrl}/#portfolio` },
          keywords: [...project.tools, "direção de arte", "design editorial", "social media"],
        }}
      />
      <ProjectGalleryDetail project={project} />
      <div className="relative z-10">
        <Menu />
      </div>
    </main>
  )
}
