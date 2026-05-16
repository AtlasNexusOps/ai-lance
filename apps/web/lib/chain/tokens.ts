// Token definitions per chain.

import { ChainNetwork } from "./types";

export interface TokenInfo {
  mint: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
}

// ── Celo ──────────────────────────────────────────────────────────

export const CELO_TOKENS: TokenInfo[] = [
  {
    mint: "0x765DE816845861e75A25fCA122bb6898B8B1282a",
    symbol: "cUSD",
    name: "Celo Dollar",
    decimals: 18,
  },
  {
    mint: "0x471EcE3750Da237f93B8E339c536989b8978a438",
    symbol: "CELO",
    name: "Celo (ERC20)",
    decimals: 18,
  },
  {
    mint: "0xcebA9300f2b948710d2653dD7B07f33A8B32118C",
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
  },
];

// ── Arbitrum ──────────────────────────────────────────────────────

export const ARBITRUM_TOKENS: TokenInfo[] = [
  {
    mint: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    symbol: "USDC",
    name: "USD Coin (Arbitrum)",
    decimals: 6,
  },
  {
    mint: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
    symbol: "USDT",
    name: "Tether USD (Arbitrum)",
    decimals: 6,
  },
  {
    mint: "0x912CE59144191C1204E64559FE8253a0e49E6548",
    symbol: "ARB",
    name: "Arbitrum",
    decimals: 18,
  },
];

// ── Base ──────────────────────────────────────────────────────────

export const BASE_TOKENS: TokenInfo[] = [
  {
    mint: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    symbol: "USDC",
    name: "USD Coin (Base)",
    decimals: 6,
  },
  {
    mint: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",
    symbol: "DAI",
    name: "Dai Stablecoin (Base)",
    decimals: 18,
  },
];

// ── Polygon ───────────────────────────────────────────────────────

export const POLYGON_TOKENS: TokenInfo[] = [
  {
    mint: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
    symbol: "USDC",
    name: "USD Coin (Polygon)",
    decimals: 6,
  },
  {
    mint: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
    symbol: "USDT",
    name: "Tether USD (Polygon)",
    decimals: 6,
  },
  {
    mint: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
    symbol: "DAI",
    name: "Dai Stablecoin (Polygon)",
    decimals: 18,
  },
];

// ── Solana ────────────────────────────────────────────────────────

export const SOLANA_TOKENS: TokenInfo[] = [
  {
    mint: "So11111111111111111111111111111111111111112",
    symbol: "SOL",
    name: "Wrapped SOL",
    decimals: 9,
  },
  {
    mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    symbol: "USDC",
    name: "USD Coin (Solana)",
    decimals: 6,
  },
  {
    mint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
    symbol: "USDT",
    name: "Tether USD (Solana)",
    decimals: 6,
  },
];

// ── Lookup ────────────────────────────────────────────────────────

const TOKEN_MAP: Record<ChainNetwork, TokenInfo[]> = {
  [ChainNetwork.CELO]: CELO_TOKENS,
  [ChainNetwork.BASE]: BASE_TOKENS,
  [ChainNetwork.POLYGON]: POLYGON_TOKENS,
  [ChainNetwork.SOLANA]: SOLANA_TOKENS,
};

export function getTokensForChain(network: ChainNetwork): TokenInfo[] {
  return TOKEN_MAP[network] ?? [];
}

export function getTokenByMint(network: ChainNetwork, mint: string): TokenInfo | undefined {
  return getTokensForChain(network).find(
    (t) => t.mint.toLowerCase() === mint.toLowerCase()
  );
}
