import { createPublicClient, http } from "viem";

import { celoSepolia, DEFAULT_CHAIN_ID, chainById } from "./chain";
import { coreAbi, getDeployment } from "./contracts";

export type LiveStats = {
  bountyCount: bigint;
  totalBountyVolume: bigint;
  totalProtocolRevenue: bigint;
  totalBountiesResolved: bigint;
  uniquePosterCount: bigint;
  uniqueWorkerCount: bigint;
  feeBps: bigint;
  graceSeconds: bigint;
};

const rpcOverrides: Partial<Record<number, string>> = {
  [celoSepolia.id]: process.env.NEXT_PUBLIC_CELO_SEPOLIA_RPC,
  42_220: process.env.NEXT_PUBLIC_CELO_MAINNET_RPC,
};

export async function fetchLiveStats(chainId: number = DEFAULT_CHAIN_ID): Promise<LiveStats> {
  const chain = chainById(chainId);
  if (!chain) throw new Error(`Unsupported chain id ${chainId}`);
  const rpc = rpcOverrides[chainId] ?? chain.rpcUrls.default.http[0];
  const client = createPublicClient({ chain, transport: http(rpc) });
  const deploy = getDeployment(chainId);

  const reads = await client.multicall({
    contracts: [
      { address: deploy.core, abi: coreAbi, functionName: "bountyCount" },
      { address: deploy.core, abi: coreAbi, functionName: "totalBountyVolume", args: [deploy.cUSD] },
      { address: deploy.core, abi: coreAbi, functionName: "totalProtocolRevenue", args: [deploy.cUSD] },
      { address: deploy.core, abi: coreAbi, functionName: "totalBountiesResolved" },
      { address: deploy.core, abi: coreAbi, functionName: "uniquePosterCount" },
      { address: deploy.core, abi: coreAbi, functionName: "uniqueWorkerCount" },
      { address: deploy.core, abi: coreAbi, functionName: "PROTOCOL_FEE_BPS" },
      { address: deploy.core, abi: coreAbi, functionName: "RESOLUTION_GRACE_PERIOD" },
    ] as const,
    allowFailure: true,
  });

  const [
    bountyCount,
    totalBountyVolume,
    totalProtocolRevenue,
    totalBountiesResolved,
    uniquePosterCount,
    uniqueWorkerCount,
    feeBps,
    graceSeconds,
  ] = reads;

  return {
    bountyCount: bountyCount.status === "success" ? (bountyCount.result as bigint) : 0n,
    totalBountyVolume: totalBountyVolume.status === "success" ? (totalBountyVolume.result as bigint) : 0n,
    totalProtocolRevenue: totalProtocolRevenue.status === "success" ? (totalProtocolRevenue.result as bigint) : 0n,
    totalBountiesResolved: totalBountiesResolved.status === "success" ? (totalBountiesResolved.result as bigint) : 0n,
    uniquePosterCount: uniquePosterCount.status === "success" ? (uniquePosterCount.result as bigint) : 0n,
    uniqueWorkerCount: uniqueWorkerCount.status === "success" ? (uniqueWorkerCount.result as bigint) : 0n,
    feeBps: feeBps.status === "success" ? (feeBps.result as bigint) : 200n,
    graceSeconds: graceSeconds.status === "success" ? (graceSeconds.result as bigint) : 259200n,
  };
}
