import { ArrowUpRight, Hammer, Users, Wallet } from "lucide-react";

import { GlassCard } from "@/components/ui/card";
import { fetchLiveStats } from "@/lib/stats";
import { formatCUSD } from "@/lib/utils";
import { getDeployment } from "@/lib/contracts";
import { DEFAULT_CHAIN_ID, chainById } from "@/lib/chain";

export const revalidate = 60;

export async function LiveStats() {
  let snapshot: Awaited<ReturnType<typeof fetchLiveStats>> | null = null;
  let error: string | null = null;

  try {
    snapshot = await fetchLiveStats();
  } catch (e) {
    error = e instanceof Error ? e.message : "Unable to read live state.";
  }

  const deployment = getDeployment(DEFAULT_CHAIN_ID);
  const chain = chainById(DEFAULT_CHAIN_ID);

  return (
    <section className="mx-auto w-full max-w-5xl px-4 pb-16">
      <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Marketplace pulse · {chain?.name}
          </p>
          <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight">
            Receipts, not promises.
          </h2>
        </div>
        <a
          href={`${chain?.blockExplorers?.default.url}/address/${deployment.core}#code`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          View verified contract <ArrowUpRight className="h-3.5 w-3.5" />
        </a>
      </div>

      {error ? (
        <GlassCard className="!p-6 text-center text-sm text-destructive">
          {error}
        </GlassCard>
      ) : snapshot ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <Stat
            icon={<Hammer className="h-5 w-5" />}
            label="Bounties resolved"
            value={snapshot.totalBountiesResolved.toString()}
            accent="primary"
          />
          <Stat
            icon={<Users className="h-5 w-5" />}
            label="Unique workers"
            value={snapshot.uniqueWorkerCount.toString()}
            accent="accent"
            sub={`${snapshot.uniquePosterCount} posters`}
          />
          <Stat
            icon={<Wallet className="h-5 w-5" />}
            label="Total volume"
            value={`$${formatCUSD(snapshot.totalBountyVolume)}`}
            accent="emerald"
            sub={`${(Number(snapshot.feeBps) / 100).toFixed(2)}% protocol fee`}
          />
        </div>
      ) : null}
    </section>
  );
}

function Stat({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  accent: "primary" | "accent" | "emerald";
}) {
  const iconBg: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    accent: "bg-accent text-accent-foreground",
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  };

  return (
    <GlassCard className="!p-6 hover:shadow-glass-strong transition-shadow">
      <span
        className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl ${iconBg[accent]}`}
      >
        {icon}
      </span>
      <p className="mt-3 text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-display text-3xl font-semibold tracking-tight">
        {value}
      </p>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
    </GlassCard>
  );
}
