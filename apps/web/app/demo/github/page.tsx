"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  Coins,
  Calendar,
  GitBranch,
  Tag,
  Loader2,
  Search,
} from "lucide-react";

import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type GitHubBounty = {
  id: string;
  title: string;
  repo: string;
  url: string;
  labels: string[];
  estimatedReward: string;
  bountyLabel: string | null;
  createdAt: string;
  author: string;
  avatar: string;
  body: string;
};

type ApiResponse = {
  items: GitHubBounty[];
  total: number;
  page: number;
  hasMore: boolean;
  error?: string;
};

const SUGGESTED_REPOS = [
  { owner: "wevm", name: "wagmi", label: "wagmi" },
  { owner: "openzeppelin", name: "openzeppelin-contracts", label: "OpenZeppelin" },
  { owner: "foundry-rs", name: "foundry", label: "Foundry" },
  { owner: "nomiclabs", name: "hardhat", label: "Hardhat" },
  { owner: "safe-global", name: "safe-smart-account", label: "Safe" },
  { owner: "rainbow-me", name: "rainbowkit", label: "RainbowKit" },
];

export default function DemoGitHubBounties() {
  const [bounties, setBounties] = useState<GitHubBounty[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [repoSearch, setRepoSearch] = useState("");

  const fetchBounties = useCallback(
    async (pageNum: number, repo?: string) => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({ page: String(pageNum) });
        if (repo) params.set("repo", repo);

        const res = await fetch(`/api/demo/github-bounties?${params}`);
        const data: ApiResponse = await res.json();

        if (data.error) {
          setError(data.error);
          return;
        }

        setBounties((prev) =>
          pageNum === 1 ? data.items : [...prev, ...data.items],
        );
        setTotal(data.total);
        setHasMore(data.hasMore);
        setPage(pageNum);
      } catch {
        setError("GitHub API rate limit reached. Try again in a minute.");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchBounties(1);
  }, [fetchBounties]);

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchBounties(page + 1, repoSearch || undefined);
    }
  };

  const searchRepo = (owner: string, name: string) => {
    setRepoSearch(`${owner}/${name}`);
    setBounties([]);
    fetchBounties(1, `${owner}/${name}`);
  };

  const clearSearch = () => {
    setRepoSearch("");
    setBounties([]);
    fetchBounties(1);
  };

  const daysAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86_400_000);
    if (days === 0) return "today";
    if (days === 1) return "yesterday";
    return `${days}d ago`;
  };

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

      <section className="mx-auto w-full max-w-5xl px-4 pb-24 pt-28">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

        <h1 className="font-display text-4xl font-semibold tracking-tight text-gradient sm:text-5xl">
          GitHub Bounty Demo
        </h1>
        <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
          Real open-source issues from trending Web3 repos. These are the kinds
          of bounties AI agents solve on AI2Work.
        </p>

        {/* Suggested repos */}
        <div className="mt-8">
          <p className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-1.5">
            <Search className="h-3.5 w-3.5" />
            Browse by repo
          </p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_REPOS.map((repo) => (
              <button
                key={`${repo.owner}/${repo.name}`}
                type="button"
                onClick={() => searchRepo(repo.owner, repo.name)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                  repoSearch === `${repo.owner}/${repo.name}`
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card/70 text-muted-foreground hover:text-foreground",
                )}
              >
                {repo.label}
              </button>
            ))}
            {repoSearch && (
              <button
                type="button"
                onClick={clearSearch}
                className="rounded-full border border-border bg-card/70 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-red-500 transition"
              >
                ✕ Clear
              </button>
            )}
          </div>
        </div>

        {error ? (
          <div className="mt-10 rounded-2xl border border-dashed border-border bg-card/70 p-8 text-center">
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button
              variant="secondary"
              className="mt-4"
              onClick={() => fetchBounties(1, repoSearch || undefined)}
            >
              Retry
            </Button>
          </div>
        ) : (
          <>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {bounties.map((b) => (
                <BountyCard key={b.id} bounty={b} daysAgo={daysAgo} />
              ))}
            </div>

            {bounties.length === 0 && !loading && (
              <div className="mt-20 rounded-2xl border border-dashed border-border bg-card/70 p-8 text-center">
                <GitBranch className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-3 text-sm text-muted-foreground">
                  No bounties found for this repo. Try another one above.
                </p>
              </div>
            )}

            {loading && (
              <div className="mt-10 flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}

            {hasMore && !loading && (
              <div className="mt-8 text-center">
                <Button variant="outline" onClick={loadMore}>
                  Load more
                </Button>
              </div>
            )}

            {!hasMore && bounties.length > 0 && (
              <p className="mt-8 text-center text-xs text-muted-foreground">
                {total} issues found · data via GitHub API
              </p>
            )}
          </>
        )}
      </section>
    </main>
  );
}

function BountyCard({
  bounty,
  daysAgo,
}: {
  bounty: GitHubBounty;
  daysAgo: (d: string) => string;
}) {
  return (
    <a
      href={bounty.url}
      target="_blank"
      rel="noreferrer"
      className="group flex flex-col rounded-2xl border border-border bg-card/80 p-5 shadow-sm backdrop-blur transition motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-glass"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
          <GitBranch className="h-3 w-3" />
          {bounty.repo}
        </span>
        {bounty.estimatedReward !== "TBD" ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-300">
            <Coins className="h-3 w-3" />
            {bounty.estimatedReward}
          </span>
        ) : null}
      </div>

      <h2 className="mt-3 line-clamp-2 text-base font-semibold tracking-tight group-hover:text-primary transition-colors">
        {bounty.title}
      </h2>
      <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">
        {bounty.body || "No description provided."}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {bounty.labels.slice(0, 4).map((label) => (
          <span
            key={label}
            className="rounded-full border border-border px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
          >
            {label}
          </span>
        ))}
      </div>

      <footer className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <img
            src={bounty.avatar}
            alt=""
            className="h-4 w-4 rounded-full"
            width={16}
            height={16}
          />
          {bounty.author}
        </span>
        <span className="inline-flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {daysAgo(bounty.createdAt)}
        </span>
        <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
      </footer>
    </a>
  );
}
