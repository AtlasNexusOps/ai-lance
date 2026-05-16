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

export const SEPOLIA: Deployment = {
  chainId: 11142220,
  chainName: 'celo-sepolia',
  core: '0xC478e36CC213Cb459282b5B690bF8FF4975A911F',
  tokens: {
    cUSD: '0xeB9595f4d14A4AEB23cc535007c973e50F1307E7',
    CELO: '0x68128f321E01C2388628c549E3a4Ea016DB01968',
    USDC: '0x71f44190dCE495b663700A3e96909988b8fbF3F9',
  },
  identityRegistry: '0x8004A818BFB912233c491871b3d84c89A494BD9e',
  reputationRegistry: '0x8004B663056A597Dffe9eCcC1965A193B7388713',
  owner: '0x987e2ed458ddAF6f900362F94558378056dCc226',
  treasury: '0x987e2ed458ddAF6f900362F94558378056dCc226',
  ciRelayer: '0x987e2ed458ddAF6f900362F94558378056dCc226',
  explorerUrl: 'https://sepolia.celoscan.io/address/0xc478e36cc213cb459282b5b690bf8ff4975a911f#code',
};

export const MAINNET: Deployment = {
  chainId: 42220,
  chainName: 'celo-mainnet',
  core: '0x1362d874F40B7e28836cBeCcA14f5EfBe6c6E423',
  tokens: {
    cUSD: '0x765DE816845861e75A25fCA122bb6898B8B1282a',
    CELO: '0x471EcE3750Da237f93B8E339c536989b8978a438',
    USDC: '0xcebA9300f2b948710d2653dD7B07f33A8B32118C',
  },
  identityRegistry: '0x8004A169FB4a3325136EB29fA0ceB6D2e539a432',
  reputationRegistry: '0x8004BAa17C55a88189AE136b182e5fdA19dE9b63',
  owner: '0xe9Fc48f315fD4E989637fAcC29AaF2717E19f7F0',
  treasury: '0xCC0cCac212999612BdDdEb607B33CC1a46F8A401',
  ciRelayer: '0x1fEDda23c2945D59f3929e6C463cF685aC077ad5',
  explorerUrl: 'https://celoscan.io/address/0x1362d874F40B7e28836cBeCcA14f5EfBe6c6E423#code',
};

/**
 * Lookup a deployment by chain id. Returns `undefined` for unknown chains so
 * consumers can fall back gracefully (multi-chain dapps, dev workflows on
 * forks, etc.).
 */
export function deploymentByChainId(chainId: number): Deployment | undefined {
  if (chainId === MAINNET.chainId) return MAINNET;
  if (chainId === SEPOLIA.chainId) return SEPOLIA;
  return undefined;
}
