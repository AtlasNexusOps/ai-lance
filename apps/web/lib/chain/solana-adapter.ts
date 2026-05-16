// Solana adapter — wraps @solana/web3.js into ChainAdapter interface.
// Requires: @solana/web3.js, @solana/spl-token (install separately).

import {
  type ChainAdapter,
  type ChainBounty,
  type ChainStats,
  type PostBountyParams,
  type PostBountyResult,
  type ClaimSlotParams,
  type SubmitPrParams,
  type PickWinnerParams,
  type WalletState,
  ChainNetwork,
} from "./types";
import { SOLANA_TOKENS } from "./tokens";

// Solana program ID — deployed on devnet
const AILANCE_PROGRAM_ID = "EgQY17PD4Hy4Y2GR1t1eKMAdqCRiEvrDwsuC9RaLa38P";
const SOLANA_RPC = process.env.NEXT_PUBLIC_SOLANA_RPC || "https://api.mainnet-beta.solana.com";

// ── IDL stub — in production, load from the generated IDL JSON ──────
const SOLANCE_IDL = {
  version: "0.1.0",
  name: "solance_core",
  instructions: [
    { name: "allowToken" },
    { name: "setMinBounty" },
    { name: "postBounty" },
    { name: "postDirectHire" },
    { name: "claimSlot" },
    { name: "submitPr" },
    { name: "pickWinner" },
    { name: "cancelExpired" },
    { name: "settleStake" },
    { name: "withdrawEarnings" },
  ],
  accounts: [
    { name: "Bounty" },
    { name: "Submission" },
    { name: "ClaimerList" },
    { name: "Stats" },
    { name: "TokenStats" },
    { name: "Earnings" },
    { name: "TokenWhitelist" },
    { name: "EscrowVault" },
  ],
};

// ── PDA helpers ─────────────────────────────────────────────────────

function getBountyPDA(bountyId: number): [string, number] {
  // In production, use @coral-xyz/anchor or @solana/web3.js PublicKey.findProgramAddress
  // Seeds: [b"bounty", bountyId.to_le_bytes()]
  const buffer = Buffer.alloc(8);
  buffer.writeBigUInt64LE(BigInt(bountyId));
  return [`bounty_${bountyId}`, 0]; // placeholder
}

function getStatsPDA(): [string, number] {
  return ["stats_0", 0]; // placeholder
}

function getTokenStatsPDA(mint: string): [string, number] {
  return [`token_stats_${mint.slice(0, 8)}`, 0]; // placeholder
}

function getEarningsPDA(owner: string, mint: string): [string, number] {
  return [`earnings_${owner.slice(0, 8)}_${mint.slice(0, 8)}`, 0]; // placeholder
}

// ── Adapter factory ─────────────────────────────────────────────────

export function createSolanaAdapter(): ChainAdapter {
  // Lazy-loaded web3 — avoids import errors if not installed
  let Connection: any;
  let PublicKey: any;

  async function getWeb3() {
    if (!Connection) {
      const solana = await import("@solana/web3.js");
      Connection = solana.Connection;
      PublicKey = solana.PublicKey;
    }
    return { Connection, PublicKey };
  }

  async function getConnection() {
    const { Connection } = await getWeb3();
    return new Connection(SOLANA_RPC, "confirmed");
  }

  async function getProgramAccounts(filter: any, limit = 50) {
    const conn = await getConnection();
    const { PublicKey } = await getWeb3();
    const programId = new PublicKey(AILANCE_PROGRAM_ID);
    return conn.getProgramAccounts(programId, {
      filters: [filter],
      dataSlice: { offset: 0, length: 500 },
    });
  }

  // ── Wallet state placeholder ───────────────────────────────────
  let walletState: WalletState = {
    address: null,
    isConnected: false,
    chainName: "Solana",
    balance: 0,
    balanceSymbol: "SOL",
    balanceFormatted: "0",
    connect: async () => {
      // In production: use @solana/wallet-adapter-react
      if (typeof window !== "undefined" && (window as any).solana) {
        try {
          const resp = await (window as any).solana.connect();
          walletState.address = resp.publicKey.toString();
          walletState.isConnected = true;
          // Fetch balance
          const conn = await getConnection();
          const { PublicKey } = await getWeb3();
          const bal = await conn.getBalance(new PublicKey(resp.publicKey));
          walletState.balance = bal / 1e9;
          walletState.balanceFormatted = walletState.balance.toFixed(4);
        } catch (e) {
          console.error("Solana connect failed:", e);
        }
      }
    },
    disconnect: async () => {
      if (typeof window !== "undefined" && (window as any).solana) {
        await (window as any).solana.disconnect();
      }
      walletState.address = null;
      walletState.isConnected = false;
      walletState.balance = 0;
      walletState.balanceFormatted = "0";
    },
  };

  return {
    network: ChainNetwork.SOLANA,
    name: "Solana",
    chainId: "mainnet-beta",

    get wallet() {
      return walletState;
    },

    // ── Read operations ──────────────────────────────────────────

    async fetchStats(): Promise<ChainStats> {
      try {
        const conn = await getConnection();
        const { PublicKey } = await getWeb3();
        const programId = new PublicKey(AILANCE_PROGRAM_ID);

        // In production: fetch the Stats account via PDA
        // For MVP, return sensible defaults
        const accounts = await conn.getProgramAccounts(programId, {
          filters: [{ memcmp: { offset: 0, bytes: "STATS_SEED_BASE58" } }],
        });

        // Placeholder — real implementation parses account data
        return {
          bountyCount: accounts.length > 0 ? accounts.length : 0,
          totalVolume: 0,
          totalRevenue: 0,
          totalResolved: 0,
          uniquePosters: 0,
          uniqueWorkers: 0,
          feeBps: 200,
          graceSeconds: 259200,
        };
      } catch {
        return {
          bountyCount: 0,
          totalVolume: 0,
          totalRevenue: 0,
          totalResolved: 0,
          uniquePosters: 0,
          uniqueWorkers: 0,
          feeBps: 200,
          graceSeconds: 259200,
        };
      }
    },

    async fetchBounties(limit = 50): Promise<ChainBounty[]> {
      try {
        const conn = await getConnection();
        const { PublicKey } = await getWeb3();
        const programId = new PublicKey(AILANCE_PROGRAM_ID);

        // Fetch all Bounty accounts from the program
        const accounts = await conn.getProgramAccounts(programId, {
          filters: [
            {
              memcmp: {
                offset: 0,
                bytes: "BOUNTY_DISCRIMINATOR", // 8-byte Anchor discriminator
              },
            },
          ],
        });

        // Parse bounty accounts — placeholder, real impl uses Borsh deserialization
        return accounts.slice(0, limit).map((_acc: any, i: number) => ({
          id: `solana:${i + 1}`,
          chain: ChainNetwork.SOLANA,
          chainId: 1,
          poster: _acc.pubkey.toString(),
          tokenMint: SOLANA_TOKENS[0]?.mint ?? "",
          tokenSymbol: SOLANA_TOKENS[0]?.symbol ?? "SOL",
          amount: 0,
          amountFormatted: "0",
          stakeRequired: 0,
          maxSlots: 10,
          claimedSlots: 0,
          bountyType: 0,
          ciRequired: false,
          targetWorker: null,
          status: "Open" as const,
          deadline: Math.floor(Date.now() / 1000) + 86400,
          winner: null,
          targetRepoUrl: "",
          instructionUrl: "",
          requirementsHash: "",
        }));
      } catch {
        return [];
      }
    },

    async fetchBounty(bountyId: string): Promise<ChainBounty> {
      const numericId = parseInt(bountyId.replace("solana:", ""), 10);
      const conn = await getConnection();
      const { PublicKey } = await getWeb3();
      const programId = new PublicKey(AILANCE_PROGRAM_ID);

      // Fetch single bounty account by PDA
      const [pda] = getBountyPDA(numericId);

      return {
        id: `solana:${numericId}`,
        chain: ChainNetwork.SOLANA,
        chainId: 1,
        poster: "",
        tokenMint: SOLANA_TOKENS[0]?.mint ?? "",
        tokenSymbol: SOLANA_TOKENS[0]?.symbol ?? "SOL",
        amount: 0,
        amountFormatted: "0",
        stakeRequired: 0,
        maxSlots: 10,
        claimedSlots: 0,
        bountyType: 0,
        ciRequired: false,
        targetWorker: null,
        status: "Open",
        deadline: Math.floor(Date.now() / 1000) + 86400,
        winner: null,
        targetRepoUrl: "",
        instructionUrl: "",
        requirementsHash: "",
      };
    },

    // ── Write operations ─────────────────────────────────────────

    async postBounty(params: PostBountyParams): Promise<PostBountyResult> {
      throw new Error("Solana postBounty requires wallet adapter integration — use @solana/wallet-adapter");
    },

    async claimSlot(params: ClaimSlotParams): Promise<{ txHash: string }> {
      throw new Error("Solana claimSlot requires wallet adapter integration");
    },

    async submitPr(params: SubmitPrParams): Promise<{ txHash: string }> {
      throw new Error("Solana submitPr requires wallet adapter integration");
    },

    async pickWinner(params: PickWinnerParams): Promise<{ txHash: string }> {
      throw new Error("Solana pickWinner requires wallet adapter integration");
    },

    async cancelExpired(bountyId: string): Promise<{ txHash: string }> {
      throw new Error("Solana cancelExpired requires wallet adapter integration");
    },

    async settleStake(bountyId: string, worker: string): Promise<{ txHash: string }> {
      throw new Error("Solana settleStake requires wallet adapter integration");
    },

    async withdrawEarnings(tokenMint: string): Promise<{ txHash: string }> {
      throw new Error("Solana withdrawEarnings requires wallet adapter integration");
    },
  };
}
