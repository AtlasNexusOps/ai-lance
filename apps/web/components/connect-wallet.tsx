"use client";

import { useAccount, useConnect, useDisconnect, useBalance } from "wagmi";
import { injected } from "wagmi/connectors";
import { Wallet, LogOut, ChevronDown, Copy, Check } from "lucide-react";
import { useState } from "react";

export function ConnectWallet() {
  const { address, isConnected, chain } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({ address });
  const [copied, setCopied] = useState(false);

  const handleConnect = () => {
    connect({ connector: injected() });
  };

  const copyAddress = async () => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isConnected) {
    return (
      <button
        onClick={handleConnect}
        className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow transition hover:opacity-90"
      >
        <Wallet className="h-4 w-4" />
        <span className="hidden sm:inline">Connect Wallet</span>
      </button>
    );
  }

  const short = `${address!.slice(0, 6)}…${address!.slice(-4)}`;

  return (
    <div className="flex items-center gap-2">
      {/* chain badge */}
      {chain && (
        <span className="hidden rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-400 sm:inline">
          {chain.name}
        </span>
      )}

      {/* balance + address */}
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

      {/* disconnect */}
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
