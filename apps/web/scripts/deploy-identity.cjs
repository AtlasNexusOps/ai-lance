#!/usr/bin/env node
/**
 * Deploy AgentIdentityRegistry to Base & Polygon via viem.
 * USAGE: cd apps/web && node scripts/deploy-identity.cjs [base|polygon|all]
 */

const { createPublicClient, createWalletClient, http } = require('viem');
const { privateKeyToAccount } = require('viem/accounts');
const { base, polygon, celo } = require('viem/chains');
const { readFileSync } = require('fs');
const { resolve } = require('path');

const PRIVATE_KEY = process.env.PRIVATE_KEY || '0x8cd12359ae19e76c38f7f3d09cac56eac407ca1913c229765b2050348af77109';
const ARTIFACT_PATH = resolve(__dirname, '..', '..', '..', 'contracts', 'out', 'AgentIdentityRegistry.sol', 'AgentIdentityRegistry.json');

const RPC_URLS = {
  [base.id]: 'https://mainnet.base.org',
  [polygon.id]: 'https://polygon-bor-rpc.publicnode.com',
  [celo.id]: 'https://forno.celo.org',
};
const CHAIN_MAP = { base, polygon, celo };

const account = privateKeyToAccount(PRIVATE_KEY);
const G='\x1b[32m', B='\x1b[34m', Y='\x1b[33m', R='\x1b[31m', N='\x1b[0m';

const artifact = JSON.parse(readFileSync(ARTIFACT_PATH, 'utf-8'));
const bytecode = artifact.bytecode.object;

console.log(`${B}AgentIdentityRegistry Deployer${N}`);
console.log(`${Y}Wallet: ${account.address}${N}\n`);

async function deploy(chain) {
  const rpc = RPC_URLS[chain.id];
  console.log(`${B}── ${chain.name} ──${N}`);
  
  const client = createPublicClient({ chain, transport: http(rpc) });
  const balance = await client.getBalance({ address: account.address });
  console.log(`${Y}Balance: ${Number(balance)/1e18} ${chain.nativeCurrency.symbol}${N}`);
  
  if (balance === 0n) { console.log(`${R}❌ Solde 0${N}\n`); return null; }
  
  // constructor(address _owner) — pad to 32 bytes
  const owner = account.address.toLowerCase().replace('0x','').padStart(64, '0');
  const fullBytecode = bytecode + owner;
  
  let gas;
  try { gas = await client.estimateGas({ account: account.address, data: fullBytecode }); }
  catch(e) { console.log(`${R}❌ Gas: ${e.shortMessage||''}${N}\n`); return null; }
  
  const gasPrice = await client.getGasPrice();
  if (gas * gasPrice > balance) { console.log(`${R}❌ Fonds insuffisants${N}\n`); return null; }
  
  try {
    const wallet = createWalletClient({ chain, transport: http(rpc), account });
    const hash = await wallet.sendTransaction({ data: fullBytecode, gas });
    console.log(`${Y}TX: ${hash}${N}`);
    const receipt = await client.waitForTransactionReceipt({ hash, timeout: 120_000 });
    console.log(`${G}✅ ${receipt.contractAddress}${N}\n`);
    return receipt.contractAddress;
  } catch(e) {
    console.log(`${R}❌ ${e.shortMessage||e.message?.slice(0,100)}${N}\n`);
    return null;
  }
}

async function main() {
  const target = process.argv[2] || 'all';
  const chains = target === 'all' ? [celo, base, polygon] : [CHAIN_MAP[target]].filter(Boolean);
  
  const results = {};
  for (const c of chains) { const addr = await deploy(c); if (addr) results[c.name] = addr; }
  
  console.log(`${G}══ Résumé ══${N}`);
  for (const [name, addr] of Object.entries(results)) console.log(`  ${G}${name}:${N} ${addr}`);
}
main().catch(e => { console.error(e.message); process.exit(1); });
