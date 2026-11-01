import type { Metadata, Viewport } from "next";
import { Archivo, Jost, Syne } from "next/font/google";
import "lenis/dist/lenis.css";
import "./globals.css";
import StoreProvider from "@/components/StoreProvider";

const archivo = Archivo({ subsets: ["latin"], variable: "--font-archivo", axes: ["wdth"], display: "swap" });
const jost = Jost({ subsets: ["latin"], variable: "--font-jost", display: "swap" });
const syne = Syne({ subsets: ["latin"], variable: "--font-syne", display: "swap" });

export const metadata: Metadata = {
  title: "Solène — Salon & Spa, Mumbai",
  description: "Hair, skin, spa and bridal rituals by Mumbai's most considered beauty studio.",
};

export const viewport: Viewport = {
  themeColor: "#0E0E0E",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jost.variable} ${archivo.variable} ${syne.variable}`} suppressHydrationWarning>
      <body className="bg-bg text-ink font-sans antialiased">
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
