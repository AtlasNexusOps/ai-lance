"use client";

// React context for managing the active chain adapter.
// Supports Celo, Base, Polygon (EVM) + Solana.

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import {
  type ChainAdapter,
  ChainNetwork,
} from "./types";
import { createEvmAdapter } from "./evm-adapter";
import { createSolanaAdapter } from "./solana-adapter";
import {
  celoMainnet,
  baseMainnet,
  polygonMainnet,
  CHAIN_META,
} from "../chain";

interface ChainContextValue {
  chain: ChainNetwork;
  adapter: ChainAdapter;
  switchChain: (network: ChainNetwork) => Promise<void>;
  isSwitching: boolean;
}

const ChainContext = createContext<ChainContextValue | null>(null);

// ── Lazy-init cache ───────────────────────────────────────────────

const adapterCache = new Map<ChainNetwork, ChainAdapter>();

function getAdapter(network: ChainNetwork): ChainAdapter {
  const cached = adapterCache.get(network);
  if (cached) return cached;

  let adapter: ChainAdapter;

  switch (network) {
    case ChainNetwork.CELO:
      adapter = createEvmAdapter(
        celoMainnet.id,
        celoMainnet,
        CHAIN_META[celoMainnet.id]!
      );
      break;
    case ChainNetwork.BASE:
      adapter = createEvmAdapter(
        baseMainnet.id,
        baseMainnet,
        CHAIN_META[baseMainnet.id]!
      );
      break;
    case ChainNetwork.POLYGON:
      adapter = createEvmAdapter(
        polygonMainnet.id,
        polygonMainnet,
        CHAIN_META[polygonMainnet.id]!
      );
      break;
    case ChainNetwork.SOLANA:
      adapter = createSolanaAdapter();
      break;
    default:
      adapter = createEvmAdapter(
        celoMainnet.id,
        celoMainnet,
        CHAIN_META[celoMainnet.id]!
      );
  }

  adapterCache.set(network, adapter);
  return adapter;
}

// ── Provider ───────────────────────────────────────────────────────

export function ChainProvider({ children }: { children: ReactNode }) {
  const [chain, setChain] = useState<ChainNetwork>(ChainNetwork.CELO);
  const [isSwitching, setIsSwitching] = useState(false);
  const [adapter, setAdapter] = useState<ChainAdapter>(() =>
    getAdapter(ChainNetwork.CELO)
  );

  const switchChain = useCallback(
    async (network: ChainNetwork) => {
      if (network === chain) return;
      setIsSwitching(true);
      try {
        const currentAdapter = getAdapter(chain);
        if (currentAdapter.wallet.isConnected) {
          await currentAdapter.wallet.disconnect();
        }
        setChain(network);
        setAdapter(getAdapter(network));
      } finally {
        setIsSwitching(false);
      }
    },
    [chain]
  );

  return (
    <ChainContext.Provider value={{ chain, adapter, switchChain, isSwitching }}>
      {children}
    </ChainContext.Provider>
  );
}

export function useChain(): ChainContextValue {
  const ctx = useContext(ChainContext);
  if (!ctx) {
    throw new Error("useChain must be used within a ChainProvider");
  }
  return ctx;
}
