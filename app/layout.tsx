import "./globals.css"
import type { Metadata, Viewport } from "next"
import { Montserrat, Inter } from "next/font/google"
import { LanguageProvider } from "@/components/providers/i18n"
import CustomCursor from "@/components/effects/cursor-custom"
import IntroOverlay from "@/components/effects/intro-overlay"
import LanguageToggle from "@/components/layout/language-toggle"
import AudioPlayer from "@/components/layout/audio-player"
import { AudioProvider } from "@/components/providers/audio"
import JsonLd from "@/components/seo/json-ld"
import Analytics from "@/components/analytics/analytics"
import { Analytics as VercelAnalytics } from "@vercel/analytics/next"
import {
  portfolioSchema,
  personSchema,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
  siteUrl,
  websiteSchema,
} from "@/lib/seo"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  applicationName: `${SITE_NAME} — Portfólio`,
  authors: [{ name: SITE_NAME, url: siteUrl }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "portfolio",
  keywords: [
    "Sarah Aliriel Dumitrache",
    "designer em Portugal",
    "editora de vídeo",
    "motion designer",
    "desenvolvedora frontend",
    "direção de arte",
    "social media design",
    "portfólio criativo",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "pt_PT",
    url: "/",
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/images/profile/signature-sarah-aliriel.png",
        width: 1080,
        height: 1350,
        alt: `Portfólio de ${SITE_NAME}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/images/branding/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/images/branding/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/images/branding/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.webmanifest",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
    other: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
      ? { "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION }
      : undefined,
  },
}

export const viewport: Viewport = {
  themeColor: "#e8e7e7",
  colorScheme: "light dark",
}

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: "variable",
  variable: "--font-montserrat",
})

const inter = Inter({
  subsets: ["latin"],
  weight: "variable",
  variable: "--font-inter",
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt" className={`${montserrat.variable} ${inter.variable}`}>
      <body>
        <JsonLd data={[personSchema, websiteSchema, portfolioSchema]} />
        <Analytics />
        <VercelAnalytics />
        <LanguageProvider>
          <AudioProvider>
            <CustomCursor />
            <IntroOverlay />
            {children}
            <AudioPlayer />
            <LanguageToggle />
          </AudioProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
