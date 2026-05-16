#!/usr/bin/env node
/**
 * Compile AgentIdentityRegistry.sol → bytecode via solc-js
 */

import solc from 'solc';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONTRACTS_DIR = resolve(__dirname, '..', 'contracts');
const SRC_DIR = join(CONTRACTS_DIR, 'src');
const LIB_DIR = join(CONTRACTS_DIR, 'lib');
const OUT_DIR = join(CONTRACTS_DIR, 'out', 'AgentIdentityRegistry.sol');

const REMAPPINGS = {
  '@openzeppelin/': join(LIB_DIR, 'openzeppelin-contracts/'),
};

function resolveImport(importPath) {
  for (const [prefix, fsPath] of Object.entries(REMAPPINGS)) {
    if (importPath.startsWith(prefix)) {
      const mapped = join(fsPath, importPath.slice(prefix.length));
      if (existsSync(mapped)) return mapped;
    }
  }
  return null;
}

function findImports(importPath) {
  const resolved = resolveImport(importPath);
  if (!resolved) return { error: `File not found: ${importPath}` };
  try {
    return { contents: readFileSync(resolved, 'utf-8') };
  } catch (e) {
    return { error: `Read error: ${e.message}` };
  }
}

console.log('Compilation de AgentIdentityRegistry.sol...');

const source = readFileSync(join(SRC_DIR, 'AgentIdentityRegistry.sol'), 'utf-8');

const input = {
  language: 'Solidity',
  sources: {
    'AgentIdentityRegistry.sol': { content: source },
  },
  settings: {
    optimizer: { enabled: true, runs: 200 },
    viaIR: true,
    outputSelection: {
      '*': { '*': ['evm.bytecode.object', 'evm.deployedBytecode.object', 'abi'] },
    },
  },
};

const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));

if (output.errors) {
  const errors = output.errors.filter(e => e.severity === 'error');
  if (errors.length) {
    console.error('Errors:', JSON.stringify(errors.slice(0, 3), null, 2));
    process.exit(1);
  }
}

const contract = output.contracts['AgentIdentityRegistry.sol']?.['AgentIdentityRegistry'];
if (!contract) {
  console.error('Contract not found');
  process.exit(1);
}

const bytecode = '0x' + contract.evm.bytecode.object;
const deployedBytecode = '0x' + contract.evm.deployedBytecode.object;

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(join(OUT_DIR, 'AgentIdentityRegistry.json'), JSON.stringify({
  bytecode: { object: bytecode },
  deployedBytecode: { object: deployedBytecode },
  abi: contract.abi,
}, null, 2));

console.log(`✓ Compilé !`);
console.log(`  Bytecode: ${bytecode.length} chars (${Math.round(bytecode.length/2)} bytes)`);
