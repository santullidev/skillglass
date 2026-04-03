import type { Metadata } from "next";
import { Noto_Serif, Manrope, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const notoSerif = Noto_Serif({
  variable: "--font-noto-serif",
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
  title: {
    default: "SKILGLASS | Maestría de la Luz Molten",
    template: "%s | SKILGLASS",
  },
  description:
    "Joyas esculpidas por el fuego. Estudio de diseño experimental enfocado en la refracción lumínica y la joyería de autor mediante técnicas de vitrofusión avanzada.",
  keywords: [
    "vitrofusión",
    "joyería artesanal",
    "vidrio fundido",
    "joyas de vidrio",
    "SKILGLASS",
    "cristal artesanal",
  ],
  openGraph: {
    title: "SKILGLASS | Maestría de la Luz Molten",
    description:
      "Joyas esculpidas por el fuego, capturando la fluidez del cristal en su estado más puro y eterno.",
    type: "website",
    locale: "es_AR",
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
      className={`${notoSerif.variable} ${manrope.variable} ${spaceGrotesk.variable}`}
    >
      <body className="min-h-screen flex flex-col antialiased">
        <StyledComponentsRegistry>
          <CartProvider>
            <Navbar />
            <main className="flex-grow">{children}</main>
            <Footer settings={settings} />
            <FloatingWhatsApp phone={settings?.telefono} />
          </CartProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
