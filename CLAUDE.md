# AI Lance — Working Notes

> On-chain marketplace where AI agents compete to solve GitHub bounties and earn stablecoins.
> Multi-chain: Celo, Base, Polygon (EVM) + Solana (pending).
> Demo: https://claudelance-demo.onrender.com
> Repo: https://github.com/AtlasNexusOps/ai-lance

## Locked decisions

| Topic | Decision |
|-------|----------|
| Project name | AI Lance |
| GitHub org | AtlasNexusOps |
| Branding | "Earn while you sleep" — AI agents marketplace |
| EVM contracts | AILanceCore.sol (Solidity 0.8.24, OZ v5) |
| Solana program | a Lance-core (Rust/Anchor 0.30.1) |
| Frontend | Next.js 15, viem, wagmi, shadcn/ui |
| Render deployment | claudelance-demo.onrender.com (To be migrated) |

## Networks & Deployments

| Chain | Contract | Address | Status |
|-------|----------|---------|--------|
| Celo | AILanceCore v2 | `0x1362d874F40B7e28836cBeCcA14f5EfBe6c6E423` | Live |
| Base | AILanceCore | `0xd765e82f50ea8a03e72405c5ecc133a94a46b067` | Live |
| Polygon | AILanceCore | `0xd765e82f50ea8a03e72405c5ecc133a94a46b067` | Live |
| Solana | a Lance-core | TBD | Pending deploy |

Deployment wallet: `0x93a96A14209aDAC1C1540f1164a854E5844ee39F`

## Token addresses (Celo mainnet)

- cUSD: `0x765DE816845861e75A25fCA122bb6898B8B1282a`
- CELO ERC20: `0x471EcE3750Da237f93B8E339c536989b8978a438`
- USDC: `0xcebA9300f2b948710d2653dD7B07f33A8B32118C`

## Repo structure

| Path | Notes |
|------|-------|
| `contracts/` | Solidity contracts (Foundry + solc-js) |
| `solana/` | Anchor program (ailance-core) |
| `apps/web/` | Next.js 15 frontend |
| `scripts/` | Compilation + deployment scripts |
| `packages/types/` | Shared ABI + types (upstream: @yeheskieltame/claudelance-types) |

## Scripts

| Script | Usage |
|--------|-------|
| `scripts/compile.mjs` | Compile Solidity via solc-js (Android/Termux compat) |
| `scripts/deploy-evm.mjs` | Deploy contracts via viem (any platform) |
| `scripts/deploy-solana.sh` | Deploy Solana program (needs Anchor CLI on laptop) |

## Tool compatibility (Termux/Android ARM64)

- Foundry (forge/cast): ❌ TLS segment alignment issue
- solc-js (npm): ✅ Compiles Solidity on any platform
- viem (npm): ✅ Deploy + interact with EVM chains
- Anchor CLI: ❌ Needs x86_64 laptop
