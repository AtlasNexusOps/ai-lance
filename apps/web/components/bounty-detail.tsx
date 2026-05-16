"use client";

import * as React from "react";
import { useAccount } from "wagmi";
import Link from "next/link";
import { CheckCircle2, ExternalLink, ShieldCheck, Upload } from "lucide-react";

import { GlassCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Submission = {
  worker: string;
  prUrl: string;
  ciPassed: boolean;
  commitHash: string;
};

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
  status: number;
  ciRequired: boolean;
  targetWorker: string;
  instructionUrl: string;
  claimers: string[];
  submissions: Submission[];
};

export function BountyDetailClient({ bounty }: { bounty: BountyJson }) {
  const { address, isConnected } = useAccount();
  const normalizedAddress = address?.toLowerCase();

  const isPoster =
    isConnected && normalizedAddress === bounty.poster.toLowerCase();
  const isClaimer =
    isConnected && bounty.claimers.some((c) => c.toLowerCase() === normalizedAddress);
  const hasSubmission = isClaimer
    ? bounty.submissions.some(
        (s) => s.worker.toLowerCase() === normalizedAddress
      )
    : false;
  const isOpen = bounty.status === 0;
  const hasSubmissions = bounty.submissions.length > 0;

  return (
    <div className="mt-6 space-y-6">
      {/* Submissions list */}
      {bounty.submissions.length > 0 && (
        <GlassCard className="!p-6">
          <h2 className="font-display text-lg font-semibold">
            Submissions ({bounty.submissions.length})
          </h2>
          <ul className="mt-4 divide-y divide-border">
            {bounty.submissions.map((sub) => (
              <li
                key={sub.worker}
                className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    {sub.worker.slice(0, 6)}...{sub.worker.slice(-4)}
                  </p>
                  {sub.prUrl && (
                    <a
                      href={sub.prUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View PR
                    </a>
                  )}
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium",
                    sub.ciPassed
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
                      : "bg-amber-400/10 text-amber-600 dark:text-amber-300"
                  )}
                >
                  <CheckCircle2 className="mr-1 inline h-3 w-3" />
                  {sub.ciPassed ? "CI passed" : "Pending CI"}
                </span>
              </li>
            ))}
          </ul>
        </GlassCard>
      )}

      {/* Claimers */}
      {bounty.claimers.length > 0 && (
        <GlassCard className="!p-6">
          <h2 className="font-display text-lg font-semibold">
            Claimers ({bounty.claimers.length})
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {bounty.claimers.map((claimer) => (
              <span
                key={claimer}
                className="rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-mono text-muted-foreground"
              >
                {claimer.slice(0, 6)}...{claimer.slice(-4)}
              </span>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Role-based actions */}
      {!isConnected && isOpen && (
        <GlassCard className="!p-6 text-center">
          <ShieldCheck className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">
            Connect your wallet to claim, submit, or pick a winner.
          </p>
          <Button className="mt-4" size="sm" asChild>
            <Link href="/">Connect wallet</Link>
          </Button>
        </GlassCard>
      )}

      {/* Poster: pick winner */}
      {isPoster && isOpen && hasSubmissions && (
        <PickWinnerCard bountyId={bounty.id} />
      )}

      {/* Claimer: submit PR */}
      {isClaimer && isOpen && !hasSubmission && (
        <SubmitPRCard bountyId={bounty.id} />
      )}

      {/* Worker: claim slot */}
      {isConnected && !isPoster && !isClaimer && isOpen && (
        <ClaimSlotCard
          bountyId={bounty.id}
          claimedSlots={bounty.claimedSlots}
          maxSlots={bounty.maxSlots}
        />
      )}

      {/* Already submitted notice */}
      {isClaimer && hasSubmission && (
        <GlassCard className="!p-6 text-center">
          <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500" />
          <p className="mt-3 text-sm font-medium text-emerald-600 dark:text-emerald-300">
            You&apos;ve submitted your PR. Waiting for the poster to pick a
            winner.
          </p>
        </GlassCard>
      )}

      {/* Resolved state */}
      {bounty.status === 1 && (
        <GlassCard className="!p-6 text-center">
          <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500" />
          <p className="mt-3 text-sm font-medium text-emerald-600 dark:text-emerald-300">
            This bounty has been resolved.
          </p>
          {bounty.winner !== "0x0000000000000000000000000000000000000000" && (
            <p className="mt-1 text-xs text-muted-foreground">
              Winner: {bounty.winner.slice(0, 6)}...{bounty.winner.slice(-4)}
            </p>
          )}
        </GlassCard>
      )}
    </div>
  );
}

function PickWinnerCard({ bountyId }: { bountyId: string }) {
  return (
    <GlassCard className="!p-6">
      <div className="flex items-start gap-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <CheckCircle2 className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold">Pick a winner</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            As the poster, you can select the winning submission. This action is
            final and triggers payout on-chain.
          </p>
          <Button size="sm" className="mt-4">
            Pick winner
          </Button>
        </div>
      </div>
    </GlassCard>
  );
}

function SubmitPRCard({ bountyId }: { bountyId: string }) {
  return (
    <GlassCard className="!p-6">
      <div className="flex items-start gap-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Upload className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold">Submit your PR</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            You&apos;ve claimed this bounty. Submit your pull request URL and
            commit hash to complete your entry.
          </p>
          <Button size="sm" className="mt-4">
            Submit PR
          </Button>
        </div>
      </div>
    </GlassCard>
  );
}

function ClaimSlotCard({
  bountyId,
  claimedSlots,
  maxSlots,
}: {
  bountyId: string;
  claimedSlots: number;
  maxSlots: number;
}) {
  const isFull = claimedSlots >= maxSlots;

  return (
    <GlassCard className="!p-6">
      <div className="flex items-start gap-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <ShieldCheck className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold">
            {isFull ? "Slots full" : "Claim this bounty"}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {isFull
              ? `All ${maxSlots} slots are claimed. Check back later or browse other bounties.`
              : `Claim a slot by staking ${"0.1"} CELO. You'll need an ERC-8004 Agent Identity on Celo Mainnet.`}
          </p>
          {!isFull && (
            <Button size="sm" className="mt-4">
              Claim slot
            </Button>
          )}
        </div>
      </div>
    </GlassCard>
  );
}
