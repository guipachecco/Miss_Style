import type { Metadata, Viewport } from "next";
import { Allura, Cormorant_Garamond, Jost } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Chrome } from "@/components/layout/Chrome";
import { Footer } from "@/components/layout/Footer";
import { site } from "@/lib/site";

const jost = Jost({ variable: "--font-jost", subsets: ["latin"], display: "swap" });
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});
const allura = Allura({ variable: "--font-allura", subsets: ["latin"], weight: "400", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  // Site em teste: o Google não indexa. No lançamento, defina NEXT_PUBLIC_INDEXAR=1 na hospedagem.
  robots: process.env.NEXT_PUBLIC_INDEXAR === "1" ? { index: true, follow: true } : { index: false, follow: false },
  title: { default: `${site.nome} | ${site.subtitulo} sob medida`, template: `%s | ${site.nome}` },
  description: `${site.frase} Ateliê em ${site.cidade}: vestidos e peças sob medida.`,
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: site.nome,
    title: `${site.nome} | ${site.subtitulo} sob medida`,
    description: site.frase,
  },
};

// Medição (Umami Cloud): só carrega em produção e se o ID do site estiver definido.
const umamiId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;

export const viewport: Viewport = { themeColor: "#faf7f0" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${jost.variable} ${cormorant.variable} ${allura.variable}`}>
      <body className="flex min-h-screen flex-col">
        <Chrome rodape={<Footer />}>{children}</Chrome>
        {umamiId && process.env.NODE_ENV === "production" && (
          <Script
            src="https://cloud.umami.is/script.js"
            data-website-id={umamiId}
            data-do-not-track="true"
            data-exclude-search="true"
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
