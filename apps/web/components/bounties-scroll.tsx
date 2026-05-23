import { BountiesScrollClient } from "@/components/bounties-scroll-client";

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
    // Silently fall back
  }

  if (items.length === 0) return null;

  return <BountiesScrollClient items={items} />;
}
