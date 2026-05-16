#!/usr/bin/env node
/**
 * AI Lance — EVM Multi-Chain Deployer (viem)
 * Utilise le bytecode compilé localement (solc-js).
 */

import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { arbitrum, base, polygon } from 'viem/chains';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// ── Config ─────────────────────────────────────────────────────────
const PRIVATE_KEY = process.env.PRIVATE_KEY || '0x8cd12359ae19e76c38f7f3d09cac56eac407ca1913c229765b2050348af77109';
const ARTIFACT_PATH = resolve(ROOT, 'contracts/out/ClaudelanceCore.sol/ClaudelanceCore.json');

// ERC-8004 Identity registries per chain (zero address = no registry deployed yet)
const ERC8004_ADDRESSES = {
  [arbitrum.id]: '0x0000000000000000000000000000000000000000',
  [base.id]:     '0x0000000000000000000000000000000000000000',
  [polygon.id]:  '0x0000000000000000000000000000000000000000',
};

const RPC_URLS = {
  [arbitrum.id]: 'https://arb1.arbitrum.io/rpc',
  [base.id]:     'https://mainnet.base.org',
  [polygon.id]:  'https://polygon-rpc.com',
};

const CHAIN_MAP = { arbitrum, base, polygon };

// ── Setup ──────────────────────────────────────────────────────────
const account = privateKeyToAccount(PRIVATE_KEY);
const GREEN = '\x1b[32m', BLUE = '\x1b[34m', YELLOW = '\x1b[33m', RED = '\x1b[31m', NC = '\x1b[0m';

const artifact = JSON.parse(readFileSync(ARTIFACT_PATH, 'utf-8'));
const ABI = artifact.abi;
const creationBytecode = artifact.bytecode.object; // already has '0x' prefix

console.log(`${BLUE}══════════════════════════════════════════════════${NC}`);
console.log(`${BLUE}  AI Lance — EVM Multi-Chain Deployer${NC}`);
console.log(`${BLUE}══════════════════════════════════════════════════${NC}`);
console.log(`${YELLOW}Wallet:    ${account.address}${NC}`);
console.log(`${YELLOW}Bytecode:  ${creationBytecode.length} chars (${Math.round(creationBytecode.length/2/1024)} KB)${NC}\n`);

// ── Deploy ─────────────────────────────────────────────────────────
async function deployToChain(chain) {
  const rpc = RPC_URLS[chain.id];
  const erc8004 = ERC8004_ADDRESSES[chain.id];
  
  console.log(`${BLUE}── ${chain.name} ─────────────────────────────────${NC}`);
  
  const client = createPublicClient({ chain, transport: http(rpc) });
  
  // Check balance
  const balance = await client.getBalance({ address: account.address });
  const balanceEth = Number(balance) / 1e18;
  console.log(`${YELLOW}Balance:   ${balanceEth.toFixed(6)} ${chain.nativeCurrency.symbol}${NC}`);
  
  if (balance === 0n) {
    console.log(`${RED}❌ Solde = 0. Funder le wallet d'abord.${NC}`);
    console.log(`${YELLOW}   Adresse: ${account.address}${NC}\n`);
    return null;
  }
  
  // Encode constructor args: address _erc8004Identity, address _reputationRegistry
  // For now, both set to zero address (no ERC-8004 on these chains yet)
  const constructorArgs = '0x' + 
    erc8004.toLowerCase().replace('0x', '').padStart(64, '0') +
    '0000000000000000000000000000000000000000000000000000000000000000'; // reputation = 0
  
  const fullBytecode = creationBytecode + constructorArgs.slice(2);
  
  // Estimate gas
  let gasEstimate;
  try {
    gasEstimate = await client.estimateGas({
      account: account.address,
      data: fullBytecode,
    });
    console.log(`${YELLOW}Gas estimé: ${gasEstimate}${NC}`);
  } catch (e) {
    console.log(`${RED}❌ Estimation gas échouée: ${e.shortMessage || e.message?.slice(0, 100)}${NC}\n`);
    return null;
  }
  
  // Check if balance suffices
  const gasPrice = await client.getGasPrice();
  const gasCost = gasEstimate * gasPrice;
  if (gasCost > balance) {
    console.log(`${RED}❌ Solde insuffisant pour le gas.${NC}`);
    console.log(`${YELLOW}   Coût estimé: ${Number(gasCost) / 1e18} ${chain.nativeCurrency.symbol}${NC}`);
    console.log(`${YELLOW}   Solde:       ${balanceEth} ${chain.nativeCurrency.symbol}${NC}\n`);
    return null;
  }
  
  // Deploy
  try {
    const wallet = createWalletClient({ chain, transport: http(rpc), account });
    console.log(`${YELLOW}Envoi de la TX de déploiement...${NC}`);
    
    const hash = await wallet.sendTransaction({
      data: fullBytecode,
      gas: gasEstimate,
    });
    
    console.log(`${YELLOW}TX:        ${hash}${NC}`);
    console.log(`${BLUE}En attente de confirmation...${NC}`);
    
    const receipt = await client.waitForTransactionReceipt({ hash, timeout: 120_000 });
    const addr = receipt.contractAddress;
    
    console.log(`${GREEN}✅ DÉPLOYÉ !${NC}`);
    console.log(`${GREEN}   Adresse:   ${addr}${NC}`);
    console.log(`${GREEN}   Explorer:  ${chain.blockExplorers.default.url}/address/${addr}${NC}`);
    console.log(`${GREEN}   Gas utilisé: ${receipt.gasUsed}${NC}\n`);
    
    return addr;
  } catch (e) {
    console.log(`${RED}❌ Échec déploiement: ${e.shortMessage || e.message?.slice(0, 200)}${NC}\n`);
    return null;
  }
}

// ── Main ───────────────────────────────────────────────────────────
async function main() {
  const target = process.argv[2] || 'all';
  
  const chainsToDeploy = target === 'all'
    ? [arbitrum, base, polygon]
    : [CHAIN_MAP[target]].filter(Boolean);
  
  if (chainsToDeploy.length === 0) {
    console.log(`${RED}Chaîne inconnue: ${target}. Options: arbitrum, base, polygon, all${NC}`);
    process.exit(1);
  }
  
  const deployments = {};
  for (const chain of chainsToDeploy) {
    const addr = await deployToChain(chain);
    if (addr) deployments[chain.name] = addr;
  }
  
  // Summary
  console.log(`${GREEN}══════════════════════════════════════════════════${NC}`);
  console.log(`${GREEN}  RÉSUMÉ${NC}`);
  console.log(`${GREEN}══════════════════════════════════════════════════${NC}`);
  if (Object.keys(deployments).length === 0) {
    console.log(`${RED}Aucun déploiement réussi.${NC}`);
    console.log(`${YELLOW}Funder le wallet: ${account.address}${NC}`);
    console.log(`${YELLOW}Puis relancer: node scripts/deploy-evm.mjs${NC}`);
  } else {
    for (const [chain, addr] of Object.entries(deployments)) {
      console.log(`  ${GREEN}${chain}:${NC} ${addr}`);
    }
    console.log(`\n${YELLOW}Prochaine étape : mettre à jour evm-adapter.ts avec ces adresses${NC}`);
  }
}

main().catch(err => {
  console.error(`${RED}Fatal: ${err.message}${NC}`);
  process.exit(1);
});
