import { Coins } from "lucide-react";
import { fetchLiveStats } from "@/lib/stats";
import { formatCUSD } from "@/lib/utils";

export async function HeroRevenue() {
  let revenue = "\u2026";
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
