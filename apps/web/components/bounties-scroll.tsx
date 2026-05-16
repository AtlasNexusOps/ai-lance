import { ArrowRight, CalendarClock, Coins } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

const TOKEN_STYLES: Record<string, string> = {
  cusd: "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200",
  celo: "border-amber-500/30 bg-amber-400/15 text-amber-700 dark:text-amber-200",
  usdc: "border-sky-500/25 bg-sky-500/10 text-sky-700 dark:text-sky-200",
};

type ApiBounty = {
  id?: string | number;
  title?: string;
  description?: string;
  targetRepoUrl?: string;
  instructionUrl?: string;
  token?: string;
  tokenSymbol?: string;
  amount?: string | number;
  deadline?: string | number;
  status?: number;
  claimedSlots?: number;
  maxSlots?: number;
};

type BountiesResponse = {
  items?: ApiBounty[];
  nextCursor?: string | null;
  total?: number;
};

export async function BountiesScroll() {
  let items: ApiBounty[] = [];

  try {
    // Fetch directly from API route (server-side, same process)
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const url = `${baseUrl}/api/bounties?status=open&limit=5`;
    const res = await fetch(url, {
      headers: { accept: "application/json" },
      next: { revalidate: 30 },
    });
    if (res.ok) {
      const data: BountiesResponse = await res.json();
      items = data.items ?? [];
    }
  } catch {
    // Silently fall back — bounties section will be hidden
  }

  if (items.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-5xl px-4 pb-20">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Open bounties
          </p>
          <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight">
            Latest work waiting
          </h2>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/bounties">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 scrollbar-none snap-x snap-mandatory">
        {items.map((bounty, i) => (
          <BountyMiniCard
            key={bounty.id ?? i}
            bounty={bounty}
          />
        ))}
      </div>
    </section>
  );
}

function BountyMiniCard({ bounty }: { bounty: ApiBounty }) {
  const token = normalizeToken(bounty);
  const tokenStyle =
    TOKEN_STYLES[token.toLowerCase()] ??
    "border-border bg-muted text-muted-foreground";
  const amount = formatAmount(bounty.amount);
  const deadline = formatDeadline(bounty.deadline);
  const title =
    bounty.title ?? deriveTitle(bounty);
  const href =
    bounty.instructionUrl ??
    bounty.targetRepoUrl ??
    `/bounty/${bounty.id ?? ""}`;

  return (
    <article className="glass shrink-0 w-72 snap-start rounded-2xl p-5 hover:shadow-glass-strong transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <span
          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${tokenStyle}`}
        >
          {token}
        </span>
        <span className="text-xs text-muted-foreground">
          {bounty.claimedSlots ?? 0}/{bounty.maxSlots ?? 1}
        </span>
      </div>

      <h3 className="mt-3 line-clamp-2 text-base font-semibold leading-6">
        {title}
      </h3>

      <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Coins className="h-3.5 w-3.5" />
          {amount} {token}
        </span>
        <span className="inline-flex items-center gap-1">
          <CalendarClock className="h-3.5 w-3.5" />
          {deadline}
        </span>
      </div>

      <Link
        href={href}
        className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
      >
        View bounty <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </article>
  );
}

function normalizeToken(bounty: ApiBounty) {
  const symbol = bounty.tokenSymbol ?? bounty.token ?? "cUSD";
  const normalized = symbol
    .toString()
    .replace(/^0x[a-f0-9]+$/i, "cUSD")
    .toLowerCase();
  if (normalized === "cusd") return "cUSD";
  if (normalized === "celo") return "CELO";
  if (normalized === "usdc") return "USDC";
  return symbol.toString();
}

function formatAmount(amount: ApiBounty["amount"]) {
  if (amount === undefined || amount === null || amount === "") return "0";
  const numeric = Number(amount);
  if (!Number.isFinite(numeric)) return String(amount);
  if (numeric > 1_000_000)
    return (numeric / 1e18).toLocaleString(undefined, {
      maximumFractionDigits: 2,
    });
  return numeric.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function formatDeadline(deadline: ApiBounty["deadline"]) {
  if (!deadline) return "No deadline";
  const numeric = Number(deadline);
  const date = Number.isFinite(numeric)
    ? new Date(numeric < 10_000_000_000 ? numeric * 1000 : numeric)
    : new Date(deadline as string);
  if (Number.isNaN(date.getTime())) return "No deadline";

  const diffMs = date.getTime() - Date.now();
  const diffDays = Math.ceil(diffMs / 86_400_000);
  if (diffDays <= 0) return "Expired";
  if (diffDays === 1) return "1 day left";
  return `${diffDays}d left`;
}

function deriveTitle(bounty: ApiBounty) {
  if (bounty.targetRepoUrl) {
    return bounty.targetRepoUrl
      .replace(/^https?:\/\/github\.com\//, "")
      .replace(/\/issues\/\d+$/, "");
  }
  return `Bounty ${bounty.id ?? ""}`.trim();
}
