"use client";

import { useAccount, useConnect, useDisconnect, useBalance } from "wagmi";
import { Wallet, LogOut, Copy, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { useIsMounted } from "@/hooks/use-is-mounted";

export function ConnectWallet() {
  const mounted = useIsMounted();
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors, error: wagmiError } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({ address });
  const [copied, setCopied] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

function getHelpfulError(rawError: string | undefined): string {
  if (!rawError) return "";
  const msg = rawError.toLowerCase();
  // MetaMask SDK connection errors — guide user to install MetaMask
  if (
    msg.includes("metamask") ||
    msg.includes("provider") ||
    msg.includes("connector") ||
    msg.includes("timed out") ||
    msg.includes("not installed")
  ) {
    return "Open MetaMask app to connect. Don't have it? Install from your app store.";
  }
  return rawError || "Connection failed.";
}

  useEffect(() => {
    if (wagmiError) {
      setConnectError(getHelpfulError(wagmiError.message));
      setConnecting(false);
    }
  }, [wagmiError]);

  useEffect(() => {
    if (isConnected) setConnecting(false);
  }, [isConnected]);

  const handleConnect = () => {
    setConnectError(null);
    setConnecting(true);

    // Try injected first (MiniPay / Opera / browser wallets), fallback to MetaMask SDK
    const connector =
      connectors.find((c) => c.id === "injected") ||
      connectors.find((c) => c.id === "metaMaskSDK" || c.id === "metaMask");
    if (connector) {
      connect({ connector });
    } else {
      setConnectError("No wallet connector found. Refresh the page.");
      setConnecting(false);
    }
  };

  const copyAddress = async () => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Prevent SSR hydration mismatch — render placeholder until client-side mount
  if (!mounted) {
    return (
      <div className="flex flex-col items-end gap-1">
        <button
          disabled
          className="inline-flex items-center gap-2 rounded-full bg-primary/50 px-4 py-2 text-sm font-semibold text-primary-foreground/50"
        >
          <Wallet className="h-4 w-4" />
          <span className="hidden sm:inline">Connect Wallet</span>
          <span className="sm:hidden">Connect</span>
        </button>
      </div>
    );
  }

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
          <p className="max-w-[200px] text-right text-xs text-red-400">
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
