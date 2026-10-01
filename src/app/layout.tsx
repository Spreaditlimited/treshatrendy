import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ChristmasSaleBanner } from "@/components/christmas-sale-banner";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { siteUrl } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Treshatrendy | African Fashion Store",
  description:
    "Shop African dresses, tops, bottoms, sets, kidswear, and menswear with prices in NGN, CAD, or USD.",
  openGraph: {
    title: "Treshatrendy | African Fashion Store",
    description:
      "Shop African dresses, tops, bottoms, sets, kidswear, and menswear with prices in NGN, CAD, or USD.",
    siteName: "Treshatrendy",
    type: "website",
    url: siteUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#fbfaf7] text-[#201713]">
        <ChristmasSaleBanner />
        {children}
        <WhatsAppButton />
      </body>
    </html>
  );
}
