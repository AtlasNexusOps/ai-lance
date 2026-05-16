// Chain definitions — Celo + Base + Polygon.
// All are built-in viem chains.

import {
  celo,
  celoAlfajores,
  base,
  polygon,
} from "viem/chains";
import { type Chain } from "viem";

// ── Production chains ────────────────────────────────────────────

export const celoMainnet = celo;
export const baseMainnet = base;
export const polygonMainnet = polygon;

// ── Testnet chains ───────────────────────────────────────────────

export const celoSepolia = celoAlfajores;

// ── All supported chains ─────────────────────────────────────────

export const ALL_CHAINS: readonly [Chain, ...Chain[]] = [
  celoMainnet,
  baseMainnet,
  polygonMainnet,
  celoSepolia,
] as const;

// ── Lookup ───────────────────────────────────────────────────────

export const DEFAULT_CHAIN_ID = celoMainnet.id; // 42220

const CHAIN_MAP = new Map<number, Chain>();
for (const c of ALL_CHAINS) {
  CHAIN_MAP.set(c.id, c);
}

export function chainById(chainId: number): Chain | undefined {
  return CHAIN_MAP.get(chainId);
}

// ── Chain metadata for UI ────────────────────────────────────────

export interface ChainMeta {
  id: number;
  name: string;
  shortName: string;
  color: string;
  textColor: string;
  borderColor: string;
  hoverColor: string;
  rpcUrl: string;
  explorerUrl: string;
  nativeSymbol: string;
  status: "live" | "soon";
}

export const CHAIN_META: Record<number, ChainMeta> = {
  [celoMainnet.id]: {
    id: celoMainnet.id,
    name: "Celo",
    shortName: "CELO",
    color: "bg-emerald-500",
    textColor: "text-emerald-400",
    borderColor: "border-emerald-500/30",
    hoverColor: "hover:bg-emerald-500/10",
    rpcUrl: "https://forno.celo.org",
    explorerUrl: "https://celoscan.io",
    nativeSymbol: "CELO",
    status: "live",
  },
  [baseMainnet.id]: {
    id: baseMainnet.id,
    name: "Base",
    shortName: "BASE",
    color: "bg-indigo-500",
    textColor: "text-indigo-400",
    borderColor: "border-indigo-500/30",
    hoverColor: "hover:bg-indigo-500/10",
    rpcUrl: "https://mainnet.base.org",
    explorerUrl: "https://basescan.org",
    nativeSymbol: "ETH",
    status: "soon",
  },
  [polygonMainnet.id]: {
    id: polygonMainnet.id,
    name: "Polygon",
    shortName: "MATIC",
    color: "bg-purple-500",
    textColor: "text-purple-400",
    borderColor: "border-purple-500/30",
    hoverColor: "hover:bg-purple-500/10",
    rpcUrl: "https://polygon-bor-rpc.publicnode.com",
    explorerUrl: "https://polygonscan.com",
    nativeSymbol: "MATIC",
    status: "soon",
  },
} as const;
