"use client";

import { useState, useCallback } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { keccak256, toBytes } from "viem";
import { useRouter } from "next/navigation";
import { Plus, Loader2, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

import { getDeployment } from "@/lib/contracts";
import { coreWriteAbi } from "@/lib/write-abi";
import { celoMainnet, celoSepolia, DEFAULT_CHAIN_ID } from "@/lib/chain";

const TOKENS: { symbol: string; address: `0x${string}`; chainId: number }[] = [
  {
    symbol: "cUSD",
    address: "0x765DE816845861e75A25fCA122bb6898B8B1282a",
    chainId: celoMainnet.id,
  },
  {
    symbol: "CELO",
    address: "0x471EcE3750Da237f93B8E339c536989b8978a438",
    chainId: celoMainnet.id,
  },
  {
    symbol: "USDC",
    address: "0xcebA9300f2b948710d2653dD7B07f33A8B32118C",
    chainId: celoMainnet.id,
  },
];

const BOUNTY_TYPE: Record<string, number> = {
  Code: 0,
  Content: 1,
  Video: 2,
  Design: 3,
};

export default function PostBountyPage() {
  const router = useRouter();
  const { isConnected, chain } = useAccount();
  const {
    writeContract,
    data: txHash,
    isPending: isWriting,
    error: writeError,
  } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const [form, setForm] = useState({
    title: "",
    repoUrl: "",
    description: "",
    amount: "",
    token: "USDC",
    bountyType: "Code",
    maxSlots: "3",
    deadlineDays: "7",
  });

  const [submitted, setSubmitted] = useState(false);

  const chainId = chain?.id ?? DEFAULT_CHAIN_ID;
  const deploy = getDeployment(chainId)!;
  const selectedToken = TOKENS.find((t) => t.symbol === form.token) ?? TOKENS[0]!;
  const tokenAddr = selectedToken.address;

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!isConnected) return;

      const amountWei = BigInt(
        Math.floor(parseFloat(form.amount || "0") * 1e18)
      );
      const deadline =
        BigInt(Math.floor(Date.now() / 1000)) +
        BigInt(parseInt(form.deadlineDays) * 86400);
      const descHash = keccak256(toBytes(form.description || ""));

      writeContract({
        address: deploy.core,
        abi: coreWriteAbi,
        functionName: "postBounty",
        args: [
          tokenAddr,
          BOUNTY_TYPE[form.bountyType] ?? 0,
          form.title,
          form.repoUrl,
          descHash,
          amountWei,
          parseInt(form.maxSlots),
          deadline,
          0n, // stakeRequired — 0 by default
          "", // metadataURI
        ],
        chainId,
      });

      setSubmitted(true);
    },
    [isConnected, form, deploy.core, tokenAddr, chainId, writeContract]
  );

  if (isSuccess) {
    return (
      <main className="relative isolate flex min-h-dvh items-center justify-center overflow-hidden px-4">
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 -z-10 bg-anime opacity-40 dark:opacity-30"
        />
        <div className="glass mx-auto max-w-md rounded-3xl p-8 text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-emerald-400" />
          <h1 className="mt-4 text-2xl font-bold">Bounty Posted!</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Transaction confirmed. Your bounty is now live on Celo.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Link
              href="/bounties"
              className="rounded-full bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground shadow-glow"
            >
              View Bounties
            </Link>
            <button
              onClick={() => {
                setSubmitted(false);
                setForm({
                  title: "",
                  repoUrl: "",
                  description: "",
                  amount: "",
                  token: "USDC",
                  bountyType: "Code",
                  maxSlots: "3",
                  deadlineDays: "7",
                });
              }}
              className="rounded-full px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
            >
              Post Another
            </button>
          </div>
        </div>
      </main>
    );
  }

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

      <div className="mx-auto w-full max-w-2xl px-4 py-16">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

        <h1 className="font-display text-4xl font-semibold tracking-tight text-gradient sm:text-5xl">
          Post a Bounty
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Create a new bounty on Celo. You&apos;ll need USDC or CELO in
          your wallet to fund it.
        </p>

        {!isConnected ? (
          <div className="glass mt-10 rounded-2xl p-6 text-center">
            <AlertCircle className="mx-auto h-10 w-10 text-amber-400" />
            <p className="mt-3 font-semibold">Connect your wallet to post</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Use the Connect button in the header to get started.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-10 space-y-6">
            {/* Token + Type row */}
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium">Token</span>
                <select
                  value={form.token}
                  onChange={(e) =>
                    setForm({ ...form, token: e.target.value })
                  }
                  className="mt-1.5 w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm"
                >
                  {TOKENS.map((t) => (
                    <option key={t.symbol} value={t.symbol}>
                      {t.symbol}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium">Bounty Type</span>
                <select
                  value={form.bountyType}
                  onChange={(e) =>
                    setForm({ ...form, bountyType: e.target.value })
                  }
                  className="mt-1.5 w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm"
                >
                  {Object.keys(BOUNTY_TYPE).map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {/* Title */}
            <label className="block">
              <span className="text-sm font-medium">Title</span>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Fix landing page responsive layout"
                className="mt-1.5 w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm"
              />
            </label>

            {/* Repo URL */}
            <label className="block">
              <span className="text-sm font-medium">Repository URL</span>
              <input
                type="url"
                required
                value={form.repoUrl}
                onChange={(e) => setForm({ ...form, repoUrl: e.target.value })}
                placeholder="https://github.com/user/repo"
                className="mt-1.5 w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm"
              />
            </label>

            {/* Description */}
            <label className="block">
              <span className="text-sm font-medium">Description</span>
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Describe what needs to be done..."
                className="mt-1.5 w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm resize-y"
              />
            </label>

            {/* Amount */}
            <label className="block">
              <span className="text-sm font-medium">
                Amount ({form.token})
              </span>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="50"
                className="mt-1.5 w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm"
              />
            </label>

            {/* Max Slots + Deadline */}
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium">Max Slots</span>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={form.maxSlots}
                  onChange={(e) =>
                    setForm({ ...form, maxSlots: e.target.value })
                  }
                  className="mt-1.5 w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium">Deadline (days)</span>
                <input
                  type="number"
                  min="1"
                  max="14"
                  value={form.deadlineDays}
                  onChange={(e) =>
                    setForm({ ...form, deadlineDays: e.target.value })
                  }
                  className="mt-1.5 w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm"
                />
              </label>
            </div>

            {/* Error */}
            {writeError && (
              <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {writeError.message.slice(0, 200)}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isWriting || isConfirming}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition hover:opacity-90 disabled:opacity-50"
            >
              {isWriting || isConfirming ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isConfirming ? "Confirming…" : "Sign in wallet…"}
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Post Bounty
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
