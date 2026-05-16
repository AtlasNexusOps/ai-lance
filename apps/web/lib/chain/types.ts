// Chain-agnostic types shared between Celo (EVM) and Solana adapters.

export type ChainId = number | string; // EVM uses number, Solana uses string

export enum ChainNetwork {
  CELO = "celo",
  BASE = "base",
  POLYGON = "polygon",
  SOLANA = "solana",
}

export type BountyStatus = "Open" | "Resolved" | "Cancelled";

export interface ChainBounty {
  id: string; // "celo:42" or "solana:7"
  chain: ChainNetwork;
  chainId: number; // 42220 for Celo, 1 for Solana mainnet-beta
  poster: string;
  tokenMint: string;
  tokenSymbol: string;
  amount: number;
  amountFormatted: string;
  stakeRequired: number;
  maxSlots: number;
  claimedSlots: number;
  bountyType: number;
  ciRequired: boolean;
  targetWorker: string | null; // null = open marketplace
  status: BountyStatus;
  deadline: number; // unix timestamp in seconds
  winner: string | null;
  targetRepoUrl: string;
  instructionUrl: string;
  requirementsHash: string;
}

export interface ChainStats {
  bountyCount: number;
  totalVolume: number;
  totalRevenue: number;
  totalResolved: number;
  uniquePosters: number;
  uniqueWorkers: number;
  feeBps: number;
  graceSeconds: number;
}

export interface PostBountyParams {
  tokenMint: string;
  bountyType: number;
  amount: number;
  maxSlots: number;
  stake: number;
  deadlineSeconds: number;
  ciRequired: boolean;
  requirementsHash: string; // hex
  targetRepoUrl: string;
  instructionUrl: string;
  targetWorker?: string; // only for direct hire
}

export interface PostBountyResult {
  bountyId: string;
  txHash: string;
}

export interface ClaimSlotParams {
  bountyId: string;
}

export interface SubmitPrParams {
  bountyId: string;
  prUrl: string;
  commitHash: string; // hex
}

export interface PickWinnerParams {
  bountyId: string;
  winner: string;
}

export interface WalletState {
  address: string | null;
  isConnected: boolean;
  chainName: string;
  balance: number;
  balanceSymbol: string;
  balanceFormatted: string;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  switchChain?: (chainId: ChainId) => Promise<void>;
}

export interface ChainAdapter {
  readonly network: ChainNetwork;
  readonly name: string;
  readonly chainId: ChainId;
  readonly wallet: WalletState;

  // Read operations
  fetchStats(): Promise<ChainStats>;
  fetchBounties(limit?: number): Promise<ChainBounty[]>;
  fetchBounty(bountyId: string): Promise<ChainBounty>;

  // Write operations
  postBounty(params: PostBountyParams): Promise<PostBountyResult>;
  claimSlot(params: ClaimSlotParams): Promise<{ txHash: string }>;
  submitPr(params: SubmitPrParams): Promise<{ txHash: string }>;
  pickWinner(params: PickWinnerParams): Promise<{ txHash: string }>;
  cancelExpired(bountyId: string): Promise<{ txHash: string }>;
  settleStake(bountyId: string, worker: string): Promise<{ txHash: string }>;
  withdrawEarnings(tokenMint: string): Promise<{ txHash: string }>;
}
