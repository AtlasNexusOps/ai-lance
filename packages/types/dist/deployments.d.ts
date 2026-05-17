/**
 * Live Claudelance deployment records per network.
 *
 * Source of truth lives in `contracts/deployments/celo-{mainnet,sepolia}.json`
 * within the monorepo; this module mirrors those records for npm consumers.
 *
 * v2 introduces multi-token escrow (cUSD / CELO / USDC) and an ERC-8004
 * Identity gate on `claimSlot`. v2 is live on both Celo Sepolia and Celo
 * Mainnet; the legacy v1 mainnet contract (0x775d…11AB5) is being paused.
 */
export type TokenSet = {
    /** Celo Dollar stablecoin (or Sepolia mock). */
    cUSD: `0x${string}`;
    /** CELO ERC20 (or Sepolia mock). */
    CELO: `0x${string}`;
    /** USDC (or Sepolia mock). */
    USDC: `0x${string}`;
};
export type Deployment = {
    /** EVM chain id. */
    chainId: number;
    /** Human-readable chain name. */
    chainName: string;
    /** ClaudelanceCore contract address. */
    core: `0x${string}`;
    /** Allowed escrow tokens at the time of deploy. Admin can `allowToken` more. */
    tokens: TokenSet;
    /** ERC-8004 Identity Registry (workers must hold an NFT here to claimSlot). */
    identityRegistry: `0x${string}`;
    /** ERC-8004 Reputation Registry (read for worker scores; feedback writes in Phase 2). */
    reputationRegistry: `0x${string}`;
    /** Owner address (EOA, multisig, or governance contract). */
    owner: `0x${string}`;
    /** Treasury — collects 2% protocol fee + forfeited stakes via pull pattern. */
    treasury: `0x${string}`;
    /** Relayer that signs `attestCI` calls. */
    ciRelayer: `0x${string}`;
    /** Explorer URL for the core contract (verified source page). */
    explorerUrl: string;
};
export declare const SEPOLIA: Deployment;
export declare const MAINNET: Deployment;
/**
 * Lookup a deployment by chain id. Returns `undefined` for unknown chains so
 * consumers can fall back gracefully (multi-chain dapps, dev workflows on
 * forks, etc.).
 */
export declare function deploymentByChainId(chainId: number): Deployment | undefined;
//# sourceMappingURL=deployments.d.ts.map