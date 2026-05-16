#!/usr/bin/env node
/**
 * Compile ClaudelanceCore.sol → bytecode via solc-js
 * Résout les imports OpenZeppelin + Foundry remappings.
 */

import solc from 'solc';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname, join, basename } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONTRACTS_DIR = resolve(__dirname, '..', 'contracts');
const SRC_DIR = join(CONTRACTS_DIR, 'src');
const LIB_DIR = join(CONTRACTS_DIR, 'lib');
const OUT_DIR = join(CONTRACTS_DIR, 'out', 'ClaudelanceCore.sol');

const REMAPPINGS = {
  '@openzeppelin/': join(LIB_DIR, 'openzeppelin-contracts/'),
  'forge-std/': join(LIB_DIR, 'forge-std/src/'),
};

function resolveImport(importPath) {
  // Try remappings first
  for (const [prefix, fsPath] of Object.entries(REMAPPINGS)) {
    if (importPath.startsWith(prefix)) {
      const mapped = join(fsPath, importPath.slice(prefix.length));
      if (existsSync(mapped)) return mapped;
    }
  }
  // Relative import
  const relPath = join(SRC_DIR, importPath);
  if (existsSync(relPath)) return relPath;
  // Try as-is from contracts dir
  const absPath = join(CONTRACTS_DIR, importPath);
  if (existsSync(absPath)) return absPath;
  
  console.error(`WARN: Cannot resolve: ${importPath}`);
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

// ── Main ───────────────────────────────────────────────────────────
console.log('Compilation de ClaudelanceCore.sol...');

const mainSource = readFileSync(join(SRC_DIR, 'ClaudelanceCore.sol'), 'utf-8');

const input = {
  language: 'Solidity',
  sources: {
    'ClaudelanceCore.sol': { content: mainSource },
  },
  settings: {
    optimizer: { enabled: true, runs: 200 },
    viaIR: true,
    outputSelection: {
      '*': {
        '*': ['evm.bytecode.object', 'evm.deployedBytecode.object', 'abi'],
      },
    },
  },
};

const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));

if (output.errors) {
  const errors = output.errors.filter(e => e.severity === 'error');
  const warnings = output.errors.filter(e => e.severity === 'warning');
  if (warnings.length) console.error('Warnings:', warnings.length);
  if (errors.length) {
    console.error('Errors:', JSON.stringify(errors.slice(0, 3), null, 2));
    process.exit(1);
  }
}

const contract = output.contracts['ClaudelanceCore.sol']?.['ClaudelanceCore'];
if (!contract) {
  console.error('Contract not found in output');
  console.error('Available:', Object.keys(output.contracts['ClaudelanceCore.sol'] || {}));
  process.exit(1);
}

const bytecode = '0x' + contract.evm.bytecode.object;
const deployedBytecode = '0x' + contract.evm.deployedBytecode.object;

// Save artifacts
mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(join(OUT_DIR, 'ClaudelanceCore.json'), JSON.stringify({
  bytecode: { object: bytecode },
  deployedBytecode: { object: deployedBytecode },
  abi: contract.abi,
}, null, 2));

console.log(`✓ Compilé !`);
console.log(`  Bytecode: ${bytecode.length} chars (${Math.round(bytecode.length/2)} bytes)`);
console.log(`  Deployed: ${deployedBytecode.length} chars (${Math.round(deployedBytecode.length/2)} bytes)`);
console.log(`  Output: ${OUT_DIR}/ClaudelanceCore.json`);
