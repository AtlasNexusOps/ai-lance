"use client";

import { useAccount, useConnect, useDisconnect, useBalance } from "wagmi";
import { injected } from "wagmi/connectors";
import { Wallet, LogOut, Copy, Check, X } from "lucide-react";
import { useState, useEffect } from "react";

function isMobile(): boolean {
  if (typeof window === "undefined") return false;
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function hasInjectedProvider(): boolean {
  if (typeof window === "undefined") return false;
  const w = window as any;
  return !!(w.ethereum && w.ethereum.request);
}

const WALLETS = [
  {
    name: "MetaMask",
    icon: "🦊",
    getLink: (dappUrl: string) =>
      `https://metamask.app.link/dapp/${dappUrl.replace(/^https?:\/\//, "")}`,
  },
  {
    name: "Trust Wallet",
    icon: "🛡️",
    getLink: (dappUrl: string) =>
      `https://link.trustwallet.com/open_url?coin_id=60&url=${encodeURIComponent(dappUrl)}`,
  },
  {
    name: "Rainbow",
    icon: "🌈",
    getLink: (dappUrl: string) =>
      `https://rnbwapp.com/wc?uri=${encodeURIComponent(dappUrl)}`,
  },
];

export function ConnectWallet() {
  const { address, isConnected, chain } = useAccount();
  const { connect, error: wagmiError } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({ address });
  const [copied, setCopied] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [showWalletPicker, setShowWalletPicker] = useState(false);

  useEffect(() => {
    if (wagmiError) {
      setConnectError(
        wagmiError.message || "Connection failed. Make sure a wallet is installed."
      );
    }
  }, [wagmiError]);

  const handleConnect = () => {
    setConnectError(null);
    if (hasInjectedProvider()) {
      connect({ connector: injected() });
    } else if (isMobile()) {
      setShowWalletPicker(true);
    } else {
      setConnectError("Install MetaMask extension to connect.");
    }
  };

  const openWalletLink = (wallet: (typeof WALLETS)[number]) => {
    const dappUrl = window.location.origin + window.location.pathname;
    window.open(wallet.getLink(dappUrl), "_blank");
  };

  const copyAddress = async () => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isConnected) {
    return (
      <>
        <div className="flex flex-col items-end gap-1">
          <button
            onClick={handleConnect}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow transition hover:opacity-90"
          >
            <Wallet className="h-4 w-4" />
            <span className="hidden sm:inline">Connect Wallet</span>
            <span className="sm:hidden">Connect</span>
          </button>
          {connectError && (
            <p className="max-w-[180px] text-right text-xs text-red-400">
              {connectError}
            </p>
          )}
        </div>

        {showWalletPicker && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
            <div className="glass w-full max-w-sm rounded-2xl p-6 shadow-2xl">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Choose a wallet</h2>
                <button
                  onClick={() => setShowWalletPicker(false)}
                  className="rounded-full p-1 hover:bg-muted"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="mb-4 text-sm text-muted-foreground">
                Open this dApp inside your wallet browser to connect:
              </p>
              <div className="flex flex-col gap-2">
                {WALLETS.map((wallet) => (
                  <button
                    key={wallet.name}
                    onClick={() => openWalletLink(wallet)}
                    className="flex items-center gap-3 rounded-xl bg-card px-4 py-3 text-left transition hover:bg-accent"
                  >
                    <span className="text-2xl">{wallet.icon}</span>
                    <span className="font-medium">{wallet.name}</span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      Open →
                    </span>
                  </button>
                ))}
              </div>
              <p className="mt-4 text-center text-xs text-muted-foreground">
                After connecting, come back to this tab and refresh.
              </p>
            </div>
          </div>
        )}
      </>
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
