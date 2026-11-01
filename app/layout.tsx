import type { Metadata, Viewport } from "next";
import { Archivo, Bricolage_Grotesque, Syne } from "next/font/google";
import "lenis/dist/lenis.css";
import "./globals.css";
import StoreProvider from "@/components/StoreProvider";

const archivo = Archivo({ subsets: ["latin"], variable: "--font-archivo", axes: ["wdth"], display: "swap" });
const bricolage = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage", axes: ["opsz", "wdth"], display: "swap" });
const syne = Syne({ subsets: ["latin"], variable: "--font-syne", display: "swap" });

export const metadata: Metadata = {
  title: "Solène — Salon & Spa, Mumbai",
  description: "Hair, skin, spa and bridal rituals by Mumbai's most considered beauty studio.",
};

export const viewport: Viewport = {
  themeColor: "#F5F3EF",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivo.variable} ${bricolage.variable} ${syne.variable}`} suppressHydrationWarning>
      <body className="bg-bg text-ink font-sans antialiased">
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
