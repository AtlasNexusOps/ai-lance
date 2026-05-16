#!/usr/bin/env node
/**
 * Mint agent NFTs via AgentIdentityRegistry.registerAgent() on Celo.
 * 
 * USAGE:
 *   PRIVATE_KEY=0x... node scripts/mint-agents.mjs '[]'
 * 
 * AGENTS_JSON format:
 *   [{"address": "0x...", "metadata": "ipfs://..."}, ...]
 * 
 * CONTRACT: AgentIdentityRegistry 0xc87465cc48288c64391fb0cc13008ee8857db05b (Celo)
 */

const { createWalletClient, createPublicClient, http } = require('viem');
const { privateKeyToAccount } = require('viem/accounts');
const { celo } = require('viem/chains');

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || '0xc87465cc48288c64391fb0cc13008ee8857db05b';
const RPC_URL = process.env.CELO_RPC || 'https://forno.celo.org';

if (!process.env.PRIVATE_KEY) {
  console.error('PRIVATE_KEY env var required');
  process.exit(1);
}

const agents = JSON.parse(process.argv[2] || '[]');
if (agents.length === 0) {
  console.error('Usage: PRIVATE_KEY=0x... node mint-agents.mjs \'[{"address":"0x...","metadata":"..."}]\'');
  process.exit(1);
}

const ABB = [
  'function registerAgent(address agent, string metadata) returns (uint256)',
  'function totalAgents() view returns (uint256)',
  'function isAgent(address) view returns (bool)',
  'function owner() view returns (address)',
];

const account = privateKeyToAccount(process.env.PRIVATE_KEY);
const walletClient = createWalletClient({ chain: celo, transport: http(RPC_URL), account });
const publicClient = createPublicClient({ chain: celo, transport: http(RPC_URL) });

async function main() {
  console.log(`Wallet: ${account.address}`);
  
  const owner = await publicClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: ABB,
    functionName: 'owner',
  });
  
  if (owner.toLowerCase() !== account.address.toLowerCase()) {
    console.error(`❌ Not the owner. Owner is ${owner}, you are ${account.address}`);
    process.exit(1);
  }
  
  console.log(`✅ Owner confirmed`);
  console.log(`Minting ${agents.length} agents...\n`);

  for (const agent of agents) {
    const { address, metadata } = agent;
    
    const already = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: ABB,
      functionName: 'isAgent',
      args: [address],
    });
    
    if (already) {
      console.log(`⏭️  ${address} — already registered, skip`);
      continue;
    }
    
    try {
      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi: ABB,
        functionName: 'registerAgent',
        args: [address, metadata],
      });
      
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      console.log(`✅ ${address} — tx: ${hash} — token minted`);
    } catch (e) {
      console.error(`❌ ${address} — ${e.shortMessage || e.message}`);
    }
  }
}

main().catch(e => { console.error(e.message); process.exit(1); });
