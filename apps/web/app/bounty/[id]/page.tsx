import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";

import { Header } from "@/components/header";
import { BountyDetailClient } from "@/components/bounty-detail";
import { GlassCard } from "@/components/ui/card";

type Params = Promise<{ id: string }>;

type BountyJson = {
  id: string;
  poster: string;
  amount: string;
  winner: string;
  stakeRequired: string;
  token: string;
  deadline: string;
  maxSlots: number;
  claimedSlots: number;
  bountyType: number;
  ciRequired: boolean;
  targetWorker: string;
  status: number;
  targetRepoUrl: string;
  instructionUrl: string;
  requirementsHash: string;
  claimers: string[];
  submissions: Array<{
    worker: string;
    prUrl: string;
    ciPassed: boolean;
    commitHash: string;
  }>;
  total: number;
};

async function fetchBounty(id: string): Promise<BountyJson | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/bounty/${id}`, {
      headers: { accept: "application/json" },
      next: { revalidate: 30 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function BountyDetailPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  const bounty = await fetchBounty(id);

  if (!bounty) notFound();

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

      <section className="mx-auto w-full max-w-3xl px-4 pb-24 pt-28">
        <Link
          href="/bounties"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to bounties
        </Link>

        <BountyHeader bounty={bounty} />

        <Suspense
          fallback={
            <GlassCard className="mt-6 !p-8">
              <div className="h-32 animate-pulse rounded-xl bg-muted" />
            </GlassCard>
          }
        >
          <BountyDetailClient bounty={bounty} />
        </Suspense>
      </section>
    </main>
  );
}

function BountyHeader({ bounty }: { bounty: BountyJson }) {
  const token = normalizeTokenSymbol(bounty.token);
  const status = bounty.status === 1 ? "Resolved" : "Open";
  const statusColor =
    status === "Resolved"
      ? "bg-emerald-500/12 text-emerald-600 dark:text-emerald-300"
      : "bg-primary/10 text-primary";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-muted-foreground">
          #{bounty.id}
        </span>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColor}`}>
          {status}
        </span>
        {bounty.ciRequired ? (
          <span className="rounded-full bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-600 dark:text-amber-300">
            CI required
          </span>
        ) : null}
      </div>

      <h1 className="text-balance font-display text-3xl font-semibold tracking-tight sm:text-4xl">
        {bounty.targetRepoUrl
          ? bounty.targetRepoUrl
              .replace(/^https?:\/\/github\.com\//, "")
              .replace(/\/issues\/\d+$/, "")
          : `Bounty #${bounty.id}`}
      </h1>

      {bounty.instructionUrl && (
        <a
          href={bounty.instructionUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          View on GitHub
        </a>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Reward" value={`${formatToken(bounty.amount)} ${token}`} />
        <Stat label="Stake" value={`${formatToken(bounty.stakeRequired)} CELO`} />
        <Stat
          label="Slots"
          value={`${bounty.claimedSlots}/${bounty.maxSlots}`}
        />
        <Stat label="Deadline" value={formatDeadline(bounty.deadline)} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <GlassCard className="!p-4 !rounded-2xl">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold tracking-tight">{value}</p>
    </GlassCard>
  );
}

function normalizeTokenSymbol(token: string) {
  const TOKENS: Record<string, string> = {
    "0x765DE816845861e75A25fCA122bb6898B8B1282a": "cUSD",
    "0x471EcE3750Da237f93B8E339c536989b8978a438": "CELO",
    "0xcebA9300f2b948710d2653dD7B07f33A8B32118C": "USDC",
  };
  return (
    TOKENS[token] ?? TOKENS[token.toLowerCase()] ?? token.slice(0, 6) + "..."
  );
}

function formatToken(wei: string) {
  const n = Number(wei);
  if (n > 1e18) return (n / 1e18).toFixed(2);
  return n.toString();
}

function formatDeadline(deadline: string) {
  const d = Number(deadline);
  const date = new Date(d < 10_000_000_000 ? d * 1000 : d);
  if (Number.isNaN(date.getTime())) return "—";
  const diff = date.getTime() - Date.now();
  const days = Math.ceil(diff / 86_400_000);
  if (days <= 0) return "Expired";
  if (days === 1) return "1 day left";
  return `${days} days left`;
}
