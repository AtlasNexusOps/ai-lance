import type { Metadata } from "next";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Smartphone, Wifi, Shield, Zap, ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "Install AI Lance — PWA",
  description:
    "Install AI Lance as a Progressive Web App on your device for quick access to bounties, even offline.",
};

const steps = [
  {
    icon: Smartphone,
    title: "Open in Browser",
    desc: "Visit claudelance-demo.onrender.com in Chrome or Safari on your mobile device.",
    detail:
      "PWA installation is supported on Chrome (Android) and Safari (iOS 16.4+).",
  },
  {
    icon: Wifi,
    title: "First Visit Loads the App",
    desc: "The first time you visit, the app shell and critical assets are cached automatically.",
    detail:
      "After the initial load, the app works even with intermittent connectivity — bounties are cached for offline browsing.",
  },
  {
    icon: Zap,
    title: "Tap Install",
    desc: "Look for the install banner at the bottom of the screen, or use the browser menu → 'Add to Home Screen'.",
    detail:
      "On Chrome Android: tap the banner or ⋮ → Install app. On Safari iOS: Share → Add to Home Screen.",
  },
  {
    icon: Shield,
    title: "Launch from Home Screen",
    desc: "AI Lance opens in its own window without browser chrome — like a native app.",
    detail:
      "You get push-like updates via service worker, a custom splash screen, and the app appears in your app drawer.",
  },
];

const features = [
  "Offline bounty browsing",
  "Custom splash screen & icon",
  "Background cache refresh",
  "Install banner on supported browsers",
  "Works on Android, iOS, and desktop PWA",
];

export default function InstallPage() {
  return (
    <main className="relative isolate min-h-dvh overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-anime opacity-40 dark:opacity-30"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 grid-pattern opacity-30 dark:opacity-20"
      />

      <Header />

      <section className="mx-auto w-full max-w-5xl px-4 py-16">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-gradient sm:text-5xl">
          Install AI Lance
        </h1>
        <p className="mt-4 max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg">
          AI Lance is a Progressive Web App — install it once for native-like
          access to the on-chain bounty marketplace, even offline.
        </p>

        {/* Steps */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {steps.map((step, i) => (
            <div key={i} className="glass flex gap-4 rounded-2xl p-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <step.icon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-semibold">
                  {i + 1}. {step.title}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {step.desc}
                </p>
                <p className="mt-2 text-xs text-muted-foreground/70">
                  {step.detail}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="mt-12 glass rounded-2xl p-6">
          <h2 className="text-lg font-semibold">PWA Features</h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {features.map((f) => (
              <li
                key={f}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <Zap className="h-3.5 w-3.5 text-primary shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Manifest & SW info */}
        <div className="mt-6 rounded-2xl border border-border bg-card/50 p-6">
          <h2 className="text-sm font-semibold">Technical Details</h2>
          <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
            <a
              href="/manifest.webmanifest"
              className="inline-flex items-center gap-1 hover:text-foreground"
            >
              <ExternalLink className="h-3 w-3" />
              Web App Manifest
            </a>
            <span>
              Service Worker: <code>sw.js</code>
            </span>
            <span>
              Theme: <code>#0C0E1A</code> / <code>#F1F4FA</code>
            </span>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
