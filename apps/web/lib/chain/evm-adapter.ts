// Generic EVM adapter — works for Celo, Arbitrum, Base, Polygon.
// Uses the same AILanceCore ABI on all chains.

import { createPublicClient, http, type Chain as ViemChain } from "viem";
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
import { coreAbi } from "../contracts";
import { CHAIN_META, type ChainMeta } from "../chain";
import { getTokensForChain, type TokenInfo } from "./tokens";

// ── Deployment addresses — placeholder for chains without contracts ──

interface EvmDeployment {
  core: `0x${string}`;
  cUSD: `0x${string}`; // primary stablecoin for stats
}

const DEPLOYMENTS: Partial<Record<number, EvmDeployment>> = {
  // Celo Mainnet — LIVE
  42220: {
    core: "0x1362d874F40B7e28836cBeCcA14f5EfBe6c6E423",
    cUSD: "0x765DE816845861e75A25fCA122bb6898B8B1282a",
  },
  // Base — LIVE (deployed 2026-05-16)
  8453: {
    core: "0xd765e82f50ea8a03e72405c5ecc133a94a46b067",
    cUSD: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC Base
  },
  // Polygon — LIVE (deployed 2026-05-16)
  137: {
    core: "0xd765e82f50ea8a03e72405c5ecc133a94a46b067",
    cUSD: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", // USDC Polygon
  },
};

// ── Chain metadata → adapter mapping ──────────────────────────────

const CHAIN_ID_TO_NETWORK: Record<number, ChainNetwork> = {
  42220: ChainNetwork.CELO,
  8453: ChainNetwork.BASE,
  137: ChainNetwork.POLYGON,
};

// ── Adapter factory ───────────────────────────────────────────────

export function createEvmAdapter(
  chainId: number,
  viemChain: ViemChain,
  meta: ChainMeta
): ChainAdapter {
  const network = CHAIN_ID_TO_NETWORK[chainId] ?? ChainNetwork.CELO;
  const deployment = DEPLOYMENTS[chainId];
  const tokens = getTokensForChain(network);
  const primaryToken = tokens[0]; // first token = primary stablecoin

  const publicClient = createPublicClient({
    chain: viemChain,
    transport: http(meta.rpcUrl),
  });

  // ── Helper: fetch a single bounty by ID ─────────────────────────

  async function fetchBountyById(id: number): Promise<ChainBounty> {
    if (!deployment) {
      throw new Error(`No deployment for chain ${chainId}`);
    }
    const raw = (await publicClient.readContract({
      address: deployment.core,
      abi: coreAbi,
      functionName: "getBounty",
      args: [BigInt(id)],
    })) as any;

    const statusMap = ["Open", "Resolved", "Cancelled"] as const;
    const token = tokens.find(
      (t) => t.mint.toLowerCase() === (raw[4] as string).toLowerCase()
    );
    const decimals = token?.decimals ?? 18;

    return {
      id: `${network}:${id}`,
      chain: network,
      chainId,
      poster: raw[0],
      tokenMint: raw[4],
      tokenSymbol: token?.symbol ?? "???",
      amount: Number(raw[1]),
      amountFormatted: (Number(raw[1]) / 10 ** decimals).toFixed(2),
      stakeRequired: Number(raw[3]),
      maxSlots: raw[6],
      claimedSlots: raw[7],
      bountyType: raw[8],
      ciRequired: raw[9],
      targetWorker:
        raw[10] === "0x0000000000000000000000000000000000000000"
          ? null
          : raw[10],
      status: (statusMap[raw[11]] ?? "Open") as ChainBounty["status"],
      deadline: Number(raw[5]),
      winner:
        raw[2] === "0x0000000000000000000000000000000000000000"
          ? null
          : raw[2],
      targetRepoUrl: raw[12],
      instructionUrl: raw[13],
      requirementsHash: raw[14],
    };
  }

  // ── Adapter ─────────────────────────────────────────────────────

  return {
    network,
    name: meta.name,
    chainId,

    get wallet(): WalletState {
      return {
        address: null,
        isConnected: false,
        chainName: meta.name,
        balance: 0,
        balanceSymbol: meta.nativeSymbol,
        balanceFormatted: "0",
        connect: async () => {},
        disconnect: async () => {},
      };
    },

    async fetchStats(): Promise<ChainStats> {
      if (!deployment || deployment.core === "0x0000000000000000000000000000000000000000") {
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

      try {
        const reads = await publicClient.multicall({
          contracts: [
            {
              address: deployment.core,
              abi: coreAbi,
              functionName: "bountyCount",
            },
            {
              address: deployment.core,
              abi: coreAbi,
              functionName: "totalBountyVolume",
              args: [deployment.cUSD],
            },
            {
              address: deployment.core,
              abi: coreAbi,
              functionName: "totalProtocolRevenue",
              args: [deployment.cUSD],
            },
            {
              address: deployment.core,
              abi: coreAbi,
              functionName: "totalBountiesResolved",
            },
            {
              address: deployment.core,
              abi: coreAbi,
              functionName: "uniquePosterCount",
            },
            {
              address: deployment.core,
              abi: coreAbi,
              functionName: "uniqueWorkerCount",
            },
            {
              address: deployment.core,
              abi: coreAbi,
              functionName: "PROTOCOL_FEE_BPS",
            },
            {
              address: deployment.core,
              abi: coreAbi,
              functionName: "RESOLUTION_GRACE_PERIOD",
            },
          ] as const,
          allowFailure: true,
        });

        const vals = reads.map((r) =>
          r.status === "success" ? (r.result as bigint) : 0n
        );

        const decimals = primaryToken?.decimals ?? 18;
        return {
          bountyCount: Number(vals[0]),
          totalVolume: Number(vals[1]) / 10 ** decimals,
          totalRevenue: Number(vals[2]) / 10 ** decimals,
          totalResolved: Number(vals[3]),
          uniquePosters: Number(vals[4]),
          uniqueWorkers: Number(vals[5]),
          feeBps: Number(vals[6]),
          graceSeconds: Number(vals[7]),
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
      if (!deployment || deployment.core === "0x0000000000000000000000000000000000000000") return [];

      try {
        const count = (await publicClient.readContract({
          address: deployment.core,
          abi: coreAbi,
          functionName: "bountyCount",
        })) as bigint;

        const total = Number(count);
        const start = Math.max(1, total - limit + 1);
        const results: ChainBounty[] = [];

        for (let i = total; i >= start; i--) {
          try {
            results.push(await fetchBountyById(i));
          } catch {
            continue;
          }
        }
        return results;
      } catch {
        return [];
      }
    },

    async fetchBounty(bountyId: string): Promise<ChainBounty> {
      const numericId = parseInt(bountyId.replace(`${network}:`, ""), 10);
      return fetchBountyById(numericId);
    },

    async postBounty(
      params: PostBountyParams
    ): Promise<PostBountyResult> {
      throw new Error(
        `${meta.name} postBounty requires wagmi write — use useWriteContract in component`
      );
    },

    async claimSlot(params: ClaimSlotParams): Promise<{ txHash: string }> {
      throw new Error(
        `${meta.name} claimSlot requires wagmi write`
      );
    },

    async submitPr(params: SubmitPrParams): Promise<{ txHash: string }> {
      throw new Error(`${meta.name} submitPr requires wagmi write`);
    },

    async pickWinner(params: PickWinnerParams): Promise<{ txHash: string }> {
      throw new Error(`${meta.name} pickWinner requires wagmi write`);
    },

    async cancelExpired(bountyId: string): Promise<{ txHash: string }> {
      throw new Error(`${meta.name} cancelExpired requires wagmi write`);
    },

    async settleStake(
      bountyId: string,
      worker: string
    ): Promise<{ txHash: string }> {
      throw new Error(`${meta.name} settleStake requires wagmi write`);
    },

    async withdrawEarnings(tokenMint: string): Promise<{ txHash: string }> {
      throw new Error(`${meta.name} withdrawEarnings requires wagmi write`);
    },
  };
}
