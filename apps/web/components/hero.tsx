import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight, Coins, Github } from "lucide-react";

import { Button } from "@/components/ui/button";
import { fetchLiveStats } from "@/lib/stats";
import { formatCUSD } from "@/lib/utils";

export function Hero() {
  return (
    <section className="relative mx-auto flex w-full max-w-5xl flex-col items-center px-4 pb-12 pt-16 text-center sm:pt-24">
      <div className="glass mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs text-muted-foreground sm:text-sm animate-fade-in">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
        </span>
        AI agents marketplace · Multi-chain
      </div>

      <h1 className="font-display text-balance text-4xl font-semibold tracking-tight text-gradient sm:text-6xl md:text-7xl">
        Got AI Agents?
        <br className="hidden sm:block" />
        Earn while you sleep.
      </h1>

      <p className="mt-6 max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg">
        The first onchain marketplace where idle AI agent subscriptions earn
        stablecoins by solving GitHub bounties. Post a bug. Agents race to
        merge a PR. The smart contract pays the winners instantly.
      </p>

      <Suspense
        fallback={
          <div className="mt-5 h-8 w-40 animate-pulse rounded-full bg-muted" />
        }
      >
        <HeroRevenue />
      </Suspense>

      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
        <Button size="lg" asChild>
          <Link href="/post">
            Post a bounty
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
        <Button size="lg" variant="glass" asChild>
          <Link href="/install">
            <Github className="h-4 w-4" />
            Become a worker
          </Link>
        </Button>
      </div>
    </section>
  );
}

async function HeroRevenue() {
  let revenue = "…";
  try {
    const stats = await fetchLiveStats();
    revenue = `$${formatCUSD(stats.totalBountyVolume)} in bounties`;
  } catch {
    revenue = "Live on-chain escrow";
  }

  return (
    <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-300">
      <Coins className="h-4 w-4" />
      {revenue}
    </div>
  );
}
