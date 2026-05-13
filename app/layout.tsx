import type { Metadata } from "next";
import { Playfair_Display, Manrope, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.skilglass.com.ar'),
  title: {
    default: "SKILGLASS | Joyería de Autor Contemporánea en Vidrio",
    template: "%s | SKILGLASS",
  },
  description:
    "Estudio de diseño experimental y joyería de autor. Piezas únicas e irrepetibles esculpidas por el fuego, explorando la refracción lumínica mediante técnicas avanzadas de vitrofusión y vidrio soplado a la flama.",
  keywords: [
    "joyería en vidrio",
    "joyería artesanal",
    "vidrio fundido",
    "joyas de vidrio",
    "vitrofusión",
    "SKILGLASS",
    "cristal artesanal",
    "joyería contemporánea",
    "diseño argentino",
    "piezas de autor únicas",
    "soplado a la flama"
  ],
  authors: [{ name: "Skilglass" }],
  creator: "Skilglass",
  publisher: "Skilglass",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "SKILGLASS | Joyería de Autor Contemporánea en Vidrio",
    description:
      "Joyas esculpidas por el fuego, capturando la fluidez del cristal en su estado más puro y eterno. Piezas únicas de diseño argentino.",
    url: "https://www.skilglass.com.ar",
    type: "website",
    locale: "es_AR",
    siteName: "SKILGLASS",
  },
  twitter: {
    card: "summary_large_image",
    title: "SKILGLASS | Joyería de Autor en Vidrio",
    description: "Estudio de diseño experimental. Piezas únicas de joyería en vidrio.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

import { CartProvider } from "@/lib/cart-context";
import { client } from "@/lib/sanity";
import { SETTINGS_QUERY } from "@/lib/queries";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import StyledComponentsRegistry from "@/lib/registry";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await client.fetch(SETTINGS_QUERY);

  return (
    <html
      lang="es"
      className={`${playfairDisplay.variable} ${manrope.variable} ${spaceGrotesk.variable}`}
    >
      <body className="min-h-screen flex flex-col antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Skilglass",
              "url": "https://www.skilglass.com.ar",
              "logo": "https://www.skilglass.com.ar/icon.png",
              "description": "Estudio de diseño experimental y joyería de autor en vidrio. Piezas únicas esculpidas por el fuego.",
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": settings?.telefono || "+5492235584416",
                "contactType": "customer service"
              },
              "sameAs": [
                "https://www.instagram.com/skilglass/"
              ]
            })
          }}
        />
        <StyledComponentsRegistry>
          <CartProvider>
            <Navbar />
            <main className="grow">{children}</main>
            <Footer settings={settings} />
            <FloatingWhatsApp phone={settings?.telefono} />
          </CartProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
