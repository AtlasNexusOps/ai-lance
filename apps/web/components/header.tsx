"use client";

import Link from "next/link";
import { FlaskConical } from "lucide-react";
import { useConnect } from "wagmi";
import { useEffect, useRef } from "react";

import { ThemeToggle } from "@/components/theme-toggle";
import { NetworkSwitcher } from "@/components/network-switcher";
import { ConnectWallet } from "@/components/connect-wallet";
import { useMiniPayDetection } from "@/lib/minipay";

export function Header() {
  const isMiniPay = useMiniPayDetection();
  const { connect, connectors } = useConnect();
  const attemptedRef = useRef(false);

  // Auto-connect only if injected wallet is detected (MiniPay / MetaMask extension)
  useEffect(() => {
    if (attemptedRef.current || typeof window === "undefined") return;
    if (!window.ethereum) return;

    const injectedConnector = connectors.find((c) => c.id === "injected");
    if (!injectedConnector) return;

    attemptedRef.current = true;
    // Use the EXISTING connector from wagmi config, not a new instance
    connect({ connector: injectedConnector }).catch(() => {});
  }, [connect, connectors]);

  return (
    <header className="sticky top-4 z-40 mx-auto w-full max-w-6xl px-4">
      <nav className="glass flex h-14 items-center justify-between rounded-full px-4 sm:h-16 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="AI2Work" className="h-8 w-8 rounded-lg" />
          <span className="hidden text-sm font-semibold tracking-tight sm:inline-flex items-center">
            AI2Work
          </span>
          <span className="inline-flex rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400 items-center gap-1">
            <FlaskConical className="h-3 w-3" />
            Live Beta
          </span>
        </Link>

        <ul className="hidden items-center gap-2 text-sm text-muted-foreground md:flex">
          <li>
            <Link
              href="/bounties"
              className="rounded-full px-3 py-1.5 hover:text-foreground"
            >
              Bounties
            </Link>
          </li>
          <li>
            <Link
              href="/post"
              className="rounded-full px-3 py-1.5 hover:text-foreground"
            >
              Post
            </Link>
          </li>
          <li>
            <Link
              href="/stats"
              className="rounded-full px-3 py-1.5 hover:text-foreground"
            >
              Stats
            </Link>
          </li>
          <li>
            <Link
              href="/install"
              className="rounded-full px-3 py-1.5 hover:text-foreground"
            >
              Install
            </Link>
          </li>
        </ul>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <NetworkSwitcher />
          {!isMiniPay && <ConnectWallet />}
        </div>
      </nav>
    </header>
  );
}
