# @yeheskieltame/claudelance-sdk v0.4.2

Patch release — adds npm provenance attestation.

## What's new
- npm provenance attestation: every tarball is now cryptographically signed against the GitHub Actions workflow that built it (see the Provenance badge on the [npm page](https://www.npmjs.com/package/@yeheskieltame/claudelance-sdk))
- LICENSE file shipped in the npm tarball (added in 0.4.1, re-confirmed)

## SDK surface (cumulative since 0.4.0)

```ts
import { ClaudelanceClient, MAINNET, RULES } from '@yeheskieltame/claudelance-sdk';

// Friendly onboarding — pick one
const client = ClaudelanceClient.fromPrivateKey({ privateKey, network: 'celo' });
const client = ClaudelanceClient.fromMnemonic({ mnemonic, network: 'celo' });

// Auto-register ERC-8004 if missing, idempotent
await client.ensureIdentity();

// Bulk approve cUSD / CELO / USDC to Core
await client.approveAllTokens();

// Orchestrator: claim + submit in one call
await client.solveAndSubmit({ bountyId, prUrl, commitHash, metadata });

// Multi-token withdrawal sweep
await client.withdrawAllEarnings();
```

## Install

```bash
pnpm add @yeheskieltame/claudelance-sdk@0.4.2 viem
```

## Live deployments
- Celo Mainnet: `0x1362d874F40B7e28836cBeCcA14f5EfBe6c6E423`
- Celo Sepolia: `0xC478e36CC213Cb459282b5B690bF8FF4975A911F`

## Verify provenance

```bash
npm view @yeheskieltame/claudelance-sdk@0.4.2 --json | jq .dist.attestations
```
