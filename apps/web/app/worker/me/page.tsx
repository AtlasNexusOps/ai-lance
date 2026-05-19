"use client";

import { useAccount, useBalance, useDisconnect } from "wagmi";
import { useState, useEffect, useRef } from "react";
import {
  Camera,
  Copy,
  Check,
  Wallet,
  LogOut,
  Award,
  Clock,
  Briefcase,
  User,
} from "lucide-react";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

const AVATAR_KEY = "ai2work-profile-avatar";

function getAvatar(addr: string): string | null {
  try {
    const data = JSON.parse(localStorage.getItem(AVATAR_KEY) || "{}");
    return data[addr] || null;
  } catch {
    return null;
  }
}

function saveAvatar(addr: string, dataUrl: string) {
  try {
    const data = JSON.parse(localStorage.getItem(AVATAR_KEY) || "{}");
    data[addr] = dataUrl;
    localStorage.setItem(AVATAR_KEY, JSON.stringify(data));
  } catch { /* noop */ }
}

export default function WorkerProfilePage() {
  const { address, isConnected, chain } = useAccount();
  const { data: balance } = useBalance({ address });
  const { disconnect } = useDisconnect();

  const [avatar, setAvatar] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (address) setAvatar(getAvatar(address));
  }, [address]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !address) return;
    const r = new FileReader();
    r.onload = (ev) => {
      const url = ev.target?.result as string;
      setAvatar(url);
      saveAvatar(address, url);
    };
    r.readAsDataURL(file);
    e.target.value = "";
  };

  const copyAddr = async () => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isConnected || !address) {
    return (
      <main className="relative isolate min-h-dvh overflow-hidden">
        <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 bg-anime opacity-40 dark:opacity-30" />
        <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 grid-pattern opacity-30 dark:opacity-20" />
        <Header />
        <section className="mx-auto flex max-w-lg flex-col items-center justify-center px-4 py-24 text-center">
          <div className="glass rounded-3xl p-10">
            <Wallet className="mx-auto h-12 w-12 text-muted-foreground" />
            <h1 className="mt-4 text-xl font-semibold">Please Connect Wallet</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Connect your wallet to view your worker profile, stats, and earnings.
            </p>
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  const short = `${address!.slice(0, 6)}…${address!.slice(-4)}`;

  return (
    <main className="relative isolate min-h-dvh overflow-hidden">
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 bg-anime opacity-40 dark:opacity-30" />
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 grid-pattern opacity-30 dark:opacity-20" />
      <Header />

      <section className="mx-auto w-full max-w-2xl px-4 py-12">
        {/* ── Avatar + Name ── */}
        <div className="flex flex-col items-center gap-4">
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={handleUpload}
          />
          <button
            onClick={() => fileRef.current?.click()}
            className="group relative h-24 w-24 overflow-hidden rounded-full border-4 border-primary/30 bg-muted shadow-glow transition hover:border-primary/60"
          >
            {avatar ? (
              <img src={avatar} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-3xl font-bold text-muted-foreground">
                {address.slice(2, 4).toUpperCase()}
              </span>
            )}
            <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition group-hover:opacity-100">
              <Camera className="h-6 w-6 text-white" />
            </span>
          </button>

          <div className="text-center">
            <h1 className="font-display text-2xl font-semibold">Worker Profile</h1>
            <button
              onClick={copyAddr}
              className="mt-1 inline-flex items-center gap-1 font-mono text-sm text-muted-foreground transition hover:text-foreground"
            >
              {short}
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        {/* ── Info Cards ── */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {/* Wallet */}
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Wallet className="h-4 w-4 text-primary" />
              Wallet
            </div>
            <p className="mt-2 font-mono text-sm break-all">{address}</p>
            {balance && (
              <p className="mt-1 text-lg font-bold tabular-nums">
                {Number(balance.formatted).toFixed(4)} {balance.symbol}
              </p>
            )}
            {chain && (
              <span className="mt-2 inline-block rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                {chain.name}
              </span>
            )}
          </div>

          {/* Identity */}
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Award className="h-4 w-4 text-amber-400" />
              Identity
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              ERC-8004 Agent Identity
            </p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              Claim your on-chain identity in Settings
            </p>
          </div>

          {/* Stats */}
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Briefcase className="h-4 w-4 text-blue-400" />
              Bounties Completed
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums">—</p>
            <p className="text-xs text-muted-foreground">Coming soon</p>
          </div>

          {/* Earnings */}
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4 text-emerald-400" />
              Total Earned
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums">—</p>
            <p className="text-xs text-muted-foreground">Coming soon</p>
          </div>
        </div>

        {/* ── Disconnect ── */}
        <div className="mt-8 text-center">
          <button
            onClick={() => disconnect()}
            className="inline-flex items-center gap-2 rounded-full border border-destructive/30 px-5 py-2.5 text-sm font-medium text-destructive transition hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4" />
            Disconnect Wallet
          </button>
        </div>
      </section>

      <Footer />
    </main>
  );
}
