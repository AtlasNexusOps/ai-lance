"use client";

import { useAccount, useConnect, useDisconnect, useBalance } from "wagmi";
import { Wallet, LogOut, Copy, Check } from "lucide-react";
import { useState, useEffect } from "react";

function hasInjectedProvider(): boolean {
  if (typeof window === "undefined") return false;
  const w = window as any;
  return !!(w.ethereum && w.ethereum.request);
}

function isMobile(): boolean {
  if (typeof window === "undefined") return false;
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export function ConnectWallet() {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors, error: wagmiError } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({ address });
  const [copied, setCopied] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    if (wagmiError) {
      setConnectError(
        wagmiError.message || "Connection failed. Make sure a wallet is installed."
      );
      setConnecting(false);
    }
  }, [wagmiError]);

  // Clear connecting state when connected
  useEffect(() => {
    if (isConnected) setConnecting(false);
  }, [isConnected]);

  const handleConnect = () => {
    setConnectError(null);
    setConnecting(true);

    if (hasInjectedProvider()) {
      // Desktop: MetaMask / browser extension
      const injectedConnector = connectors.find((c) => c.id === "injected");
      if (injectedConnector) {
        connect({ connector: injectedConnector });
      }
    } else if (isMobile()) {
      // Mobile: WalletConnect (deep-links to wallet app, persists session)
      const wcConnector = connectors.find((c) => c.id === "walletConnect");
      if (wcConnector) {
        connect({ connector: wcConnector });
      } else {
        setConnectError("WalletConnect not available.");
        setConnecting(false);
      }
    } else {
      // Desktop without extension
      setConnectError("Install MetaMask extension to connect.");
      setConnecting(false);
    }
  };

  const copyAddress = async () => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-end gap-1">
        <button
          onClick={handleConnect}
          disabled={connecting}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow transition hover:opacity-90 disabled:opacity-50"
        >
          <Wallet className="h-4 w-4" />
          <span className="hidden sm:inline">
            {connecting ? "Connecting…" : "Connect Wallet"}
          </span>
          <span className="sm:hidden">
            {connecting ? "…" : "Connect"}
          </span>
        </button>
        {connectError && (
          <p className="max-w-[180px] text-right text-xs text-red-400">
            {connectError}
          </p>
        )}
      </div>
    );
  }

  const short = `${address!.slice(0, 6)}…${address!.slice(-4)}`;

  return (
    <div className="flex items-center gap-2">
      {chain && (
        <span className="hidden rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-400 sm:inline">
          {chain.name}
        </span>
      )}

      <div className="flex items-center gap-2 rounded-full bg-card/50 px-3 py-1.5 text-sm">
        {balance && (
          <span className="hidden font-medium tabular-nums text-muted-foreground sm:inline">
            {Number(balance.formatted).toFixed(4)} {balance.symbol}
          </span>
        )}
        <button
          onClick={copyAddress}
          className="flex items-center gap-1 font-mono text-xs transition hover:text-foreground"
          title="Copy address"
        >
          {short}
          {copied ? (
            <Check className="h-3 w-3 text-emerald-400" />
          ) : (
            <Copy className="h-3 w-3 opacity-50" />
          )}
        </button>
      </div>

      <button
        onClick={() => disconnect()}
        className="rounded-full p-2 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
        title="Disconnect"
      >
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  );
}
