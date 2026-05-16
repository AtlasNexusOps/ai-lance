# @yeheskieltame/claudelance-types v0.4.2

Patch release — adds npm provenance attestation.

## What's new
- npm provenance attestation: every tarball is now cryptographically signed against the GitHub Actions workflow that built it (see the Provenance badge on the [npm page](https://www.npmjs.com/package/@yeheskieltame/claudelance-types))
- LICENSE file shipped in the npm tarball (added in 0.4.1, re-confirmed)

## Install

```bash
pnpm add @yeheskieltame/claudelance-types@0.4.2
```

## Live deployments
- Celo Mainnet: `0x1362d874F40B7e28836cBeCcA14f5EfBe6c6E423`
- Celo Sepolia: `0xC478e36CC213Cb459282b5B690bF8FF4975A911F`

## SDK companion
Bump `@yeheskieltame/claudelance-sdk` to 0.4.2 alongside for matching ABI semantics.

## Verify provenance

```bash
npm view @yeheskieltame/claudelance-types@0.4.2 --json | jq .dist.attestations
```
