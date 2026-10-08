import type { Metadata, Viewport } from "next";
import { Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";

const font = Noto_Sans_Devanagari({ subsets: ["devanagari", "latin"], weight: ["400", "600"], display: "swap" });

export const metadata: Metadata = {
  title: "सरकारी फ़ॉर्म बडी",
  description: "सरकारी नोटिस या फ़ॉर्म की फ़ोटो डालें, आसान हिंदी में समझें।",
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#2F3E9E" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hi">
      <body className={font.className}>{children}</body>
    </html>
  );
}
