/**
 * Human-readable constants mirroring the on-chain values in
 * `ClaudelanceCore.sol` (v2). The contract is the source of truth; redeploy
 * means this file gets updated too.
 *
 * Token-specific values (e.g. `minBounty`) are no longer constants — they
 * live in the contract per-token mapping. Use `client.publicClient.readContract`
 * with `functionName: 'minBounty'` to read them at runtime.
 */

/** Protocol fee in basis points (200 = 2%). */
export const PROTOCOL_FEE_BPS = 200 as const;
export const BPS_DENOMINATOR = 10_000 as const;

/** Maximum claimers per open-marketplace bounty. */
export const MAX_SLOTS = 20 as const;

/** Bounty deadline bounds (in seconds). */
export const MIN_DEADLINE_SECONDS = 86_400 as const; // 1 day
export const MAX_DEADLINE_SECONDS = 1_209_600 as const; // 14 days

/** Grace period after deadline during which only the poster may cancel. */
export const RESOLUTION_GRACE_PERIOD_SECONDS = 259_200 as const; // 3 days

/** Mandatory delay between proposing a treasury/relayer rotation and applying it. */
export const ADMIN_TIMELOCK_SECONDS = 172_800 as const; // 2 days

/** After this many seconds past `effectiveAt`, a pending rotation expires. */
export const PROPOSAL_VALIDITY_WINDOW_SECONDS = 1_209_600 as const; // 14 days

/** Bounty tier guidance (UI hints, not enforced on chain). Denominated in cUSD. */
export const BOUNTY_TIERS = {
  tiny: { minCusd: 0.5, maxCusd: 1, label: 'Tiny — typo / README' },
  small: { minCusd: 1, maxCusd: 3, label: 'Small — bug fix / test' },
  medium: { minCusd: 3, maxCusd: 8, label: 'Medium — feature / refactor' },
  large: { minCusd: 8, maxCusd: 20, label: 'Large — multi-file change' },
} as const;
