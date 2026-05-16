// Solana wallet adapter configuration.
// Uses @solana/wallet-adapter-react for Phantom & Solflare.
// Install: pnpm add @solana/web3.js @solana/wallet-adapter-react @solana/wallet-adapter-wallets

import { useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import type { Adapter } from "@solana/wallet-adapter-base";
import type { ReactNode } from "react";

const SOLANA_RPC =
  process.env.NEXT_PUBLIC_SOLANA_RPC || "https://api.mainnet-beta.solana.com";

// Lazy-load wallet adapters to avoid build errors if not installed
async function getWallets(): Promise<Adapter[]> {
  const adapters: Adapter[] = [];
  try {
    const { PhantomWalletAdapter } = await import(
      "@solana/wallet-adapter-wallets"
    );
    adapters.push(new PhantomWalletAdapter());
  } catch {}
  try {
    const { SolflareWalletAdapter } = await import(
      "@solana/wallet-adapter-wallets"
    );
    adapters.push(new SolflareWalletAdapter());
  } catch {}
  return adapters;
}

// Fallback wallets for SSR
const FALLBACK_WALLETS: Adapter[] = [];

export function SolanaWalletProvider({ children }: { children: ReactNode }) {
  const endpoint = useMemo(() => SOLANA_RPC, []);

  // For now, use empty wallets — the ConnectWallet component handles
  // Solana connection via window.solana (injected provider).
  // Full wallet adapter integration can be enabled post-MVP.

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={FALLBACK_WALLETS} autoConnect>
        {children}
      </WalletProvider>
    </ConnectionProvider>
  );
}
