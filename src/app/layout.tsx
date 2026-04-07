import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#0d9488",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://vyrdict.fr"),
  title: "Vyrdict — Analyse contrôle technique | Coût réparations",
  description:
    "Déposez votre contrôle technique et obtenez le coût des réparations, un score de santé véhicule et un verdict réparer ou vendre. Gratuit, sans inscription.",
  alternates: { canonical: "https://vyrdict.fr" },
  keywords: [
    "contrôle technique", "CT", "analyse contrôle technique", "coût réparation auto",
    "contre-visite", "estimation réparation voiture", "score santé véhicule", "réparer ou vendre voiture",
  ],
  authors: [{ name: "Vyrdict" }],
  manifest: "/manifest.json",
  icons: { icon: "/favicon.svg", apple: "/icon-192.png" },
  openGraph: {
    title: "Vyrdict — Votre contrôle technique décrypté en quelques secondes",
    description: "Déposez votre procès-verbal de contrôle technique et obtenez le coût des réparations, un score de santé et un verdict clair. Gratuit et sans inscription.",
    type: "website",
    locale: "fr_FR",
    siteName: "Vyrdict",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Vyrdict - Analyseur de contrôle technique automobile" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vyrdict — Votre contrôle technique décrypté en quelques secondes",
    description: "Estimation des coûts de réparation, score de santé véhicule et verdict réparer ou vendre. Gratuit.",
    images: ["/og-image.png"],
  },
  robots: { index: true, follow: true },
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Vyrdict" },
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Vyrdict",
    url: "https://vyrdict.fr",
    description: "Analyseur de contrôle technique automobile. Déposez votre CT et obtenez le coût des réparations, un score de santé et un verdict.",
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    inLanguage: "fr",
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Comment fonctionne l'analyse du contrôle technique ?",
        acceptedAnswer: { "@type": "Answer", text: "Vous déposez une photo ou un PDF de votre procès-verbal. Notre IA identifie chaque défaillance, estime le coût de réparation et vous donne un verdict clair." },
      },
      {
        "@type": "Question",
        name: "Combien coûte l'utilisation de Vyrdict ?",
        acceptedAnswer: { "@type": "Answer", text: "Vyrdict est 100% gratuit et sans inscription. Aucune donnée personnelle n'est collectée." },
      },
      {
        "@type": "Question",
        name: "Les estimations de coût sont-elles fiables ?",
        acceptedAnswer: { "@type": "Answer", text: "Les prix sont basés sur les tarifs moyens en garage indépendant en France . Indicatifs, nous recommandons 2-3 devis." },
      },
      {
        "@type": "Question",
        name: "Que faire si mon contrôle technique est défavorable ?",
        acceptedAnswer: { "@type": "Answer", text: "Vous avez 2 mois pour réparer et passer la contre-visite. Vyrdict vous aide à prioriser les réparations et estimer le budget." },
      },
      {
        "@type": "Question",
        name: "Quels formats de fichiers sont acceptés ?",
        acceptedAnswer: { "@type": "Answer", text: "Photos (JPG, PNG, WEBP) et PDF, taille maximale 10 Mo. Sur mobile, prenez directement votre CT en photo." },
      },
    ],
  },
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${outfit.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        {children}
      </body>
    </html>
  );
}
