# TrustMRR Submission Draft

[TrustMRR](https://trustmrr.com) is the third-party verification source that Talent Protocol pulls revenue data from. Standard TrustMRR flow expects a Stripe / Paddle / LemonSqueezy connection, but Claudelance is fully on-chain. This doc captures the materials needed for a manual review request.

## Step 1 — "Add startup" form

| Field | Value |
|-------|-------|
| Startup name | Claudelance |
| Description | The first onchain marketplace where idle Claude Code subscriptions earn cUSD/CELO/USDC by solving GitHub bounties. ERC-8004 agent identity, multi-token escrow, direct hire. Live on Celo Mainnet. |
| URL | https://github.com/yeheskieltame/claudelance |
| Founder X handle | @yeheskieltame (or current handle) |
| Industry / category | Web3 / AI agents / open-source marketplace |
| Revenue source (manual) | On-chain protocol fees, Celo Mainnet smart contract |

## Step 2 — X (Twitter) post template

TrustMRR's verification gate requires the X post to contain `I made` and a `$` sign. Suggested copy (under 280 chars):

```
I made $0.21 from @Claudelance — an onchain bounty marketplace on @Celo for AI agents. 19+ bounties resolved, 2% protocol fee accruing live to the treasury at 0xCC0cCac2... Verify: https://celoscan.io/address/0x1362d874F40B7e28836cBeCcA14f5EfBe6c6E423
@trustmrr
```

Update the `$X.XX` figure with the most recent treasury USD-equivalent from [`onchain-proof.md`](./onchain-proof.md) before posting.

## Step 3 — Manual review request body

If TrustMRR's auto-verifier rejects (no Stripe), open a support ticket with this body:

> Hi TrustMRR team,
>
> Claudelance is a fully on-chain bounty marketplace deployed on Celo Mainnet. Revenue accrues at the smart contract level (2% protocol fee on resolved bounties), not through Stripe / Paddle. There's no off-chain payment processor.
>
> Verification artifacts:
> - Core contract (verified): https://celoscan.io/address/0x1362d874F40B7e28836cBeCcA14f5EfBe6c6E423#code
> - Treasury wallet: https://celoscan.io/address/0xCC0cCac212999612BdDdEb607B33CC1a46F8A401
> - Read live revenue: `totalProtocolRevenue(token)` view on the Core, per-token
> - Event log of every accrual: `ProtocolRevenueAccrued` filtered by token topic
>
> Could TrustMRR support a "smart contract treasury" verification source for Web3-native protocols? Etherscan/Celoscan is the auditable ledger. Happy to share read-only access patterns.
>
> Thanks!

## Step 4 — After approval

Once TrustMRR shows the Claudelance project in its public feed, Talent Protocol's revenue tile should populate within their crawl cycle (24h–7d).
