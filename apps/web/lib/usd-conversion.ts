/**
 * Convert a token wei amount to a human USD number.
 *
 * Phase 1: hardcoded oracle rates (cUSD and USDC peg, CELO ≈ $0.55).
 *
 * TODO: replace with a live read against the Mento SortedOracles contract at
 * 0xefB84935239dAcdecF7c5bA76d8dE40b077B7b33 on Celo Mainnet — the same
 * oracle Mento uses to mint cUSD against CELO collateral. That gives us a
 * trusted on-chain feed without an off-chain dependency.
 */
export type SupportedToken = "cUSD" | "CELO" | "USDC";

const HARDCODED_USD: Record<SupportedToken, number> = {
  cUSD: 1, // USD stablecoin
  USDC: 1, // USD stablecoin
  CELO: 0.55, // recent Mento oracle reading; update or replace with live feed
};

const DECIMALS: Record<SupportedToken, number> = {
  cUSD: 18,
  CELO: 18,
  USDC: 6,
};

export function tokenToUsd(token: SupportedToken, amount: bigint): number {
  const decimals = DECIMALS[token];
  const rate = HARDCODED_USD[token];
  const float = Number(amount) / 10 ** decimals;
  return float * rate;
}
