import type { Metadata } from "next"
import DesignGallery from "@/components/gallery/design-gallery"
import Menu from "@/components/layout/menu"
import JsonLd from "@/components/seo/json-ld"
import { galleryProjects } from "@/data/gallery"
import { absoluteUrl, createPageMetadata, siteUrl } from "@/lib/seo"

const title = "Galeria de Design | Sarah Aliriel Dumitrache"
const description =
  "Explore projetos de direção de arte, identidade visual, design editorial e social media criados por Sarah Aliriel Dumitrache."

export const metadata: Metadata = createPageMetadata({
  title,
  description,
  path: "/gallery",
  keywords: [
    "portfólio de design",
    "direção de arte",
    "design editorial",
    "identidade visual",
    "social media design",
    "designer Portugal",
  ],
})

export default function Page() {
  return (
    <main className="relative min-h-svh bg-[#f4f2ec] text-[#1e1e1e]">
      <JsonLd
        data={{
          "@type": "CollectionPage",
          "@id": `${siteUrl}/gallery#collection`,
          name: title,
          description,
          url: absoluteUrl("/gallery"),
          inLanguage: "pt-PT",
          author: { "@id": `${siteUrl}/#person` },
          isPartOf: { "@id": `${siteUrl}/#website` },
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: galleryProjects.length,
            itemListElement: galleryProjects.map((project, index) => ({
              "@type": "ListItem",
              position: index + 1,
              url: absoluteUrl(`/gallery/${project.slug}`),
            })),
          },
        }}
      />
      <DesignGallery />
      <div className="relative z-10">
        <Menu />
      </div>
    </main>
  )
}
