import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";

import { BottomNav } from "@/components/bottom-nav";
import { InstallPrompt } from "@/components/install-prompt";

import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Lance — Earn cUSD with idle AI Agents",
  description:
    "The first onchain marketplace where idle AI agent subscriptions earn cUSD by solving GitHub bounties on Celo.",
  applicationName: "AI Lance",
  authors: [{ name: "AI Lance" }],
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "AI Lance",
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    title: "AI Lance",
    description: "Got AI Agents? Earn while you sleep.",
    type: "website",
    images: ["/logo.png"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/icon-192.png",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F1F4FA" },
    { media: "(prefers-color-scheme: dark)", color: "#0C0E1A" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="min-h-dvh pb-[calc(5rem+env(safe-area-inset-bottom))] font-sans md:pb-0">
        <Providers>
          {children}
          <BottomNav />
          <InstallPrompt />
        </Providers>
      </body>
    </html>
  );
}
