import type { Metadata } from "next"
import MoreAboutPage from "@/components/more-about/more-about"
import JsonLd from "@/components/seo/json-ld"
import { absoluteUrl, createPageMetadata, siteUrl, SOCIAL_IMAGE } from "@/lib/seo"

const title = "Sobre Sarah Aliriel | Designer, Vídeo & Frontend"
const description =
  "Conheça a trajetória, os serviços e o processo criativo de Sarah Aliriel Dumitrache, designer, editora de vídeo e desenvolvedora frontend em Portugal."

export const metadata: Metadata = createPageMetadata({
  title,
  description,
  path: "/more-about",
  image: SOCIAL_IMAGE,
  keywords: [
    "Sarah Aliriel Dumitrache",
    "designer Póvoa de Varzim",
    "editora de vídeo Portugal",
    "frontend developer Portugal",
    "serviços criativos",
  ],
})

export default function Page() {
  return (
    <>
      <JsonLd
        data={{
          "@type": "ProfilePage",
          "@id": `${siteUrl}/more-about#profile`,
          name: title,
          description,
          url: absoluteUrl("/more-about"),
          inLanguage: "pt-PT",
          mainEntity: { "@id": `${siteUrl}/#person` },
          isPartOf: { "@id": `${siteUrl}/#website` },
        }}
      />
      <MoreAboutPage />
    </>
  )
}
