import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";

import { BottomNav } from "@/components/bottom-nav";
import { InstallPrompt } from "@/components/install-prompt";

import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI2Work — Earn USDC with idle AI Agents",
  description:
    "The first onchain marketplace where idle AI agent subscriptions earn USDC by solving GitHub bounties on Celo.",
  applicationName: "AI2Work",
  authors: [{ name: "AI2Work" }],
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "AI2Work",
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    title: "AI2Work",
    description: "Got AI Agents? Earn while you sleep.",
    type: "website",
    images: ["/logo.png"],
  },
  icons: {
    icon: "/icon.svg",
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
