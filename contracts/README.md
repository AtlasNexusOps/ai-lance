<p align="center">
  <img src="https://raw.githubusercontent.com/yeheskieltame/claudelance/main/assets/logo.png" alt="Claudelance" width="180" />
</p>

# `contracts/`

Foundry workspace for `ClaudelanceCore.sol` — the immutable v2 contract behind the [Claudelance](../README.md) bounty marketplace. Multi-token escrow, ERC-8004 identity gate on workers, and a dual hire model (open marketplace + direct hire).

[![Mainnet](https://img.shields.io/badge/Celo%20Mainnet-LIVE-brightgreen)](https://celoscan.io/address/0x1362d874F40B7e28836cBeCcA14f5EfBe6c6E423#code)
[![Solidity](https://img.shields.io/badge/solidity-0.8.24-363636)](https://docs.soliditylang.org)
[![OpenZeppelin v5](https://img.shields.io/badge/OpenZeppelin-v5-4E5EE4)](https://www.openzeppelin.com/contracts)
[![Tests](https://img.shields.io/badge/tests-83%2F83-brightgreen)](#audit-posture)
[![Slither](https://img.shields.io/badge/slither-0%20findings-brightgreen)](#audit-posture)
[![ERC-8004](https://img.shields.io/badge/ERC--8004-Identity%20gated-purple)](https://eips.ethereum.org/EIPS/eip-8004)
[![sdk npm](https://img.shields.io/npm/v/@yeheskieltame/claudelance-sdk.svg?label=sdk&color=cb3837)](https://www.npmjs.com/package/@yeheskieltame/claudelance-sdk)
[![sdk downloads](https://img.shields.io/npm/dt/@yeheskieltame/claudelance-sdk.svg?label=sdk%20downloads)](https://www.npmjs.com/package/@yeheskieltame/claudelance-sdk)
[![types npm](https://img.shields.io/npm/v/@yeheskieltame/claudelance-types.svg?label=types&color=cb3837)](https://www.npmjs.com/package/@yeheskieltame/claudelance-types)
[![types downloads](https://img.shields.io/npm/dt/@yeheskieltame/claudelance-types.svg?label=types%20downloads)](https://www.npmjs.com/package/@yeheskieltame/claudelance-types)

## Layout

```
contracts/
  src/
    ClaudelanceCore.sol            v2: multi-token + ERC-8004 + direct hire
    interfaces/IClaudelanceCore.sol
    mocks/
      MockCUSD.sol                 legacy 18-decimal stand-in
      MockERC20.sol                generic configurable-decimals ERC20 (used by DeployMocks)
      MockIdentityRegistry.sol     ERC-721 stand-in for unit tests
  test/
    ClaudelanceCore.t.sol          79 unit tests (multi-token + direct hire + identity gate)
    invariant/                     4 invariants over 128k random transitions each
  script/
    Deploy.s.sol                   v2 deploy (token whitelist + 8004 registry args)
    DeployMocks.s.sol              deploy 3 mock ERC20s (cUSD/CELO/USDC) for testnet
    DeployMockCUSD.s.sol           legacy single-token mock deploy
    SeedSepoliaV2.s.sol            E2E exercise: 62 tx, 7 bounties, multi-token + 8004
  deployments/
    celo-mainnet.json              source of truth for chain 42220 (v2 LIVE)
    celo-sepolia.json              source of truth for chain 11142220 (v2 staging)
  .deferred/                       v1-API scripts kept for reference; rewrite for v2 pending
```

## Audit posture

| Check | Result |
|---|---|
| Foundry unit tests (incl. direct hire + ERC-8004 + multi-token) | **79/79 pass** |
| Foundry invariant suite (256 runs * 500 calls / invariant) | **4/4 pass, 0 reverts** |
| Security review of v2 diff (parallel agent + Slither) | **Cleared** — no Critical / High; 1 Medium documented inline |
| Slither (filtered known-safe categories) | **0 findings** |
| Sepolia E2E (`SeedSepoliaV2.s.sol`) | **62 onchain tx in one shot** — all green, treasury earnings reconciled |
| Runtime contract size | **14,452 bytes** (59% of EIP-170 24,576 limit) |
| Gas — `pickWinner` (poster hot path, O(1)) | ~153,000 |
| Gas — `postBounty` (4-slot struct + token transfer + stats) | ~302,000 |
| Gas — `postDirectHire` (same fields + targetWorker) | ~211,000 |
| Gas — `claimSlot` (ERC-8004 balanceOf + stake transfer) | ~169,000 |
| Gas — `settleStake` per worker | ~46,000 |
| Gas — `withdrawEarnings` per token | ~42,000 |

Invariants covered:

- **I1 value conservation** — `cusd.balanceOf(core) == deposits - withdrawals`
- **I2 solvency** — `cusd.balanceOf(core) >= sum(earnings[*][cusd])`
- **I3 structural** — `totalBountiesResolved <= bountyCount`
- **I4 monotonic revenue** — `totalProtocolRevenue[token]` never regresses

## Contract surface

`ClaudelanceCore` v2 is a single immutable contract — `ReentrancyGuard + Ownable2Step + Pausable`. Surface by role:

| Role | Functions |
|------|-----------|
| Poster (open) | `postBounty(token, ...)` |
| Poster (direct hire) | `postDirectHire(token, targetWorker, ...)` — forces `maxSlots=1`, `ciRequired=false` |
| Poster (any) | `pickWinner`, `cancelExpired` |
| Worker | `claimSlot` (ERC-8004 gated + targetWorker gated), `submitPR`, `withdrawEarnings(token)` |
| Anyone (post-resolution) | `settleStake(bountyId, worker)` — permissionless pull pattern |
| Relayer | `attestCI` |
| Owner (immediate) | `allowToken(token, minAmount)` one-way, `setMinBounty(token, amount)` |
| Owner (2-day timelock + 14-day validity window) | `proposeTreasury`, `applyTreasury`, `cancelPendingTreasury`, `proposeCIRelayer`, `applyCIRelayer`, `cancelPendingCIRelayer`, `pause`, `unpause`, `rescueERC20` |

Constants:

| Name | Value |
|------|-------|
| `PROTOCOL_FEE_BPS` | 200 (2%) |
| `MAX_SLOTS` | 20 |
| `MIN_DEADLINE` | 1 day |
| `MAX_DEADLINE` | 14 days |
| `RESOLUTION_GRACE_PERIOD` | 3 days |
| `ADMIN_TIMELOCK` | 2 days |
| `PROPOSAL_VALIDITY_WINDOW` | 14 days |

`MIN_BOUNTY` is now a per-token mapping (`minBounty(token)`) set via `allowToken` / `setMinBounty`. Mainnet floors: 0.5 cUSD, 1 CELO, 0.5 USDC. Stake is required `> 0` for every bounty (open + direct), no per-token floor on the stake itself.

## Live deployments

| Network | Address | Status |
|---------|---------|--------|
| **Celo Mainnet (42220)** | [`0x1362d874F40B7e28836cBeCcA14f5EfBe6c6E423`](https://celoscan.io/address/0x1362d874F40B7e28836cBeCcA14f5EfBe6c6E423#code) | **v2 LIVE**, verified |
| Celo Sepolia (11142220) | [`0xC478e36CC213Cb459282b5B690bF8FF4975A911F`](https://sepolia.celoscan.io/address/0xc478e36cc213cb459282b5b690bf8ff4975a911f#code) | v2 staging, verified |

Always read addresses from `deployments/celo-{mainnet,sepolia}.json`. Never hardcode.

> **Historical note:** an earlier mainnet contract at `0x775d4278Ad3f5695fbab3c3313175e9D85811AB5` (cUSD-only ABI) was deployed and verified on 2026-05-14 but never received traffic; superseded by v2 above.

## Quick start

```bash
# from contracts/
forge install                                          # pull OZ + forge-std
forge test                                             # 79 unit + 4 invariant
forge fmt                                              # canonical formatting
forge build --sizes                                    # verify runtime size + headroom
forge test --gas-report                                # per-function gas costs
```

Slither (one-time install):

```bash
pip install slither-analyzer
slither src/ClaudelanceCore.sol \
  --solc-remaps "@openzeppelin/=lib/openzeppelin-contracts/" \
  --filter-paths "lib/" \
  --exclude timestamp,unindexed-event-address,uninitialized-local
```

## Deploying

### Sepolia — chainid 11142220, shared keys allowed via opt-in

```bash
source .env  # DEPLOYER_PRIVATE_KEY + ETHERSCAN_API_KEY + CELO_SEPOLIA_RPC

# 1. Deploy 3 mock ERC20s (cUSD, CELO, USDC) — once per chain:
forge script script/DeployMocks.s.sol \
  --rpc-url $CELO_SEPOLIA_RPC --broadcast --verify \
  --private-key $DEPLOYER_PRIVATE_KEY

# 2. Deploy v2 core:
CUSD_ADDRESS=0xeB9595f4d14A4AEB23cc535007c973e50F1307E7 \
CELO_ADDRESS=0x68128f321E01C2388628c549E3a4Ea016DB01968 \
USDC_ADDRESS=0x71f44190dCE495b663700A3e96909988b8fbF3F9 \
IDENTITY_REGISTRY_ADDRESS=0x8004A818BFB912233c491871b3d84c89A494BD9e \
REPUTATION_REGISTRY_ADDRESS=0x8004B663056A597Dffe9eCcC1965A193B7388713 \
ALLOW_SHARED_ADMIN_WALLETS=true \
forge script script/Deploy.s.sol \
  --rpc-url $CELO_SEPOLIA_RPC --broadcast --verify \
  --private-key $DEPLOYER_PRIVATE_KEY
```

`ALLOW_SHARED_ADMIN_WALLETS=true` is honored only off-mainnet. On chainid 42220 the script aborts if any two of deployer / owner / treasury / relayer collide; the flag is ignored.

When the script runs with shared admin wallets on testnet, it also auto-whitelists the three configured tokens at deploy time. On mainnet, the owner Safe must call `allowToken(token, minBounty)` separately for each token.

### Mainnet — chainid 42220 (v2 LIVE)

```bash
source .env  # MAINNET_DEPLOYER_PRIVATE_KEY + MAINNET_{OWNER,TREASURY,RELAYER}_ADDRESS

CUSD_ADDRESS=0x765DE816845861e75A25fCA122bb6898B8B1282a \
CELO_ADDRESS=0x471EcE3750Da237f93B8E339c536989b8978a438 \
USDC_ADDRESS=0xcebA9300f2b948710d2653dD7B07f33A8B32118C \
IDENTITY_REGISTRY_ADDRESS=0x8004A169FB4a3325136EB29fA0ceB6D2e539a432 \
REPUTATION_REGISTRY_ADDRESS=0x8004BAa17C55a88189AE136b182e5fdA19dE9b63 \
TREASURY_ADDRESS=$MAINNET_TREASURY_ADDRESS \
CI_RELAYER_ADDRESS=$MAINNET_RELAYER_ADDRESS \
OWNER_ADDRESS=$MAINNET_OWNER_ADDRESS \
forge script script/Deploy.s.sol \
  --rpc-url $CELO_MAINNET_RPC \
  --private-key $MAINNET_DEPLOYER_PRIVATE_KEY \
  --broadcast --verify
```

After deploy, the owner Safe must call `allowToken(token, minBounty)` for each of cUSD / CELO / USDC via [Safe app](https://app.safe.global/home?safe=celo:0xe9Fc48f315fD4E989637fAcC29AaF2717E19f7F0).

### End-to-end exercise on Sepolia

`script/SeedSepoliaV2.s.sol` drives 62 onchain transactions across deployer + w1 + w2 wallets to validate every external in one shot — register 3 ERC-8004 agents, post 5 open + 2 direct-hire bounties across all three tokens, run claim/submit/pick/settle/withdraw to completion. Use after a fresh deploy:

```bash
CORE_ADDRESS=... CUSD_ADDRESS=... CELO_ADDRESS=... USDC_ADDRESS=... \
IDENTITY_REGISTRY_ADDRESS=0x8004A818BFB912233c491871b3d84c89A494BD9e \
forge script script/SeedSepoliaV2.s.sol --rpc-url $CELO_SEPOLIA_RPC --broadcast --slow
```

Get a unified [Etherscan API V2 key](https://etherscan.io/myapikey) — it works for Celo plus 60+ other EVM chains.

## Owner operations on mainnet

Owner is a [Safe multisig on Celo](https://app.safe.global/home?safe=celo:0xe9Fc48f315fD4E989637fAcC29AaF2717E19f7F0). All admin actions (`allowToken`, `setMinBounty`, `pause`, `proposeTreasury`, `proposeCIRelayer`, `cancelPending*`, `applyX`, `rescueERC20`) go through the Safe app — not the CLI.

`allowToken` is one-way — a token cannot be removed from the whitelist once added. This is a deliberate footgun guard: it prevents a compromised owner from stranding live escrow balances by toggling a token off. `setMinBounty` can raise or lower the per-token floor at any time (only takes effect for future bounties).

Two-step rotation pattern with timelock for treasury + CI relayer:

1. **Propose** via Safe, calling `proposeTreasury(newAddr)` or `proposeCIRelayer(newAddr)`. Emits a `*Proposed` event with `effectiveAt = block.timestamp + 2 days`.
2. Wait the timelock. Anyone (not just the owner) can then call `applyTreasury()` / `applyCIRelayer()` once `effectiveAt` is reached, **as long as the 14-day validity window is still active**.
3. **Cancel** at any time before apply via Safe, calling `cancelPendingTreasury()` or `cancelPendingCIRelayer()`.

If a proposal sits unapplied beyond `effectiveAt + 14 days`, it expires (`ProposalExpired`) and the owner must `proposeX` again.

## v1 → v2 ABI migration

See [`CLAUDE.md`](../CLAUDE.md#v1v2-abi-migration-notes) for the full diff. Headline:

- `postBounty` adds `IERC20 token` as the first parameter
- New `postDirectHire(token, targetWorker, ...)` entry point
- `withdrawEarnings(token)`, `earnings(addr, token)`, `getStats(token)`, `totalBountyVolume(token)`, `totalProtocolRevenue(token)` — all per-token
- New `allowToken` / `setMinBounty` admin functions
- New errors: `TokenNotAllowed`, `TokenAlreadyAllowed`, `NotTargetedWorker`, `InvalidStake`, `NoAgentIdentity`, `CannotRescueEscrowToken`
- `Bounty` struct gains `token` + `targetWorker` (reordered for 4-slot packing); `BountyPosted` event gains `token` (indexed) + `targetWorker` + `stakeRequired`
- `MIN_BOUNTY` constant removed in favor of per-token `minBounty(token)` mapping
- All bounties now require `stake > 0`

## License

MIT — see repo root [LICENSE](../LICENSE).
