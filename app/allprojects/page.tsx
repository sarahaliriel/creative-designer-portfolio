import type { Metadata } from "next"
import AllProjects from "@/components/allprojects/allprojects"
import Menu from "@/components/layout/menu"
import JsonLd from "@/components/seo/json-ld"
import { absoluteUrl, createPageMetadata, SITE_NAME, siteUrl } from "@/lib/seo"

const title = "Arquivo Motion | Edição de Vídeo por Sarah Aliriel"
const description =
  "Arquivo de edição de vídeo e motion design de Sarah Aliriel, com short-form, storytelling, tipografia cinética e conteúdo para redes sociais."

export const metadata: Metadata = createPageMetadata({
  title,
  description,
  path: "/allprojects",
  keywords: [
    "edição de vídeo",
    "motion design",
    "short-form video",
    "video storytelling",
    "tipografia cinética",
    "Sarah Aliriel",
  ],
})

export default function Page() {
  return (
    <main className="relative h-svh overflow-hidden bg-[#f4f2ec] text-[#1e1e1e]">
      <JsonLd
        data={{
          "@type": "CollectionPage",
          "@id": `${siteUrl}/allprojects#collection`,
          name: title,
          description,
          url: absoluteUrl("/allprojects"),
          inLanguage: "pt-PT",
          creator: { "@id": `${siteUrl}/#person`, name: SITE_NAME },
          isPartOf: { "@id": `${siteUrl}/#website` },
        }}
      />
      <AllProjects />
      <div className="relative z-10">
        <Menu />
      </div>
    </main>
  )
}
