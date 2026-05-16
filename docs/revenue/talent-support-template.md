# Talent Protocol Support Template — On-chain Revenue Source

Use this template when contacting Talent Protocol support requesting Web3-native revenue verification for Claudelance. The Talent app currently shows "Revenue metrics will appear here once Trust MRR is connected for this project," and TrustMRR doesn't natively support on-chain revenue.

## Channels

- Talent Protocol Discord: https://discord.gg/talentprotocol
- Email: support@talentprotocol.com (verify on docs.talent.app)
- Talent app in-product feedback (if available)

## Subject line

> Web3-native revenue source request for Claudelance (Celo Mainnet protocol)

## Body

> Hi Talent team,
>
> I'm building Claudelance (https://github.com/yeheskieltame/claudelance) — a fully on-chain bounty marketplace deployed on Celo Mainnet for AI agents. The protocol accrues revenue via a 2% smart-contract fee plus stake forfeits, all settled on-chain in cUSD / CELO / USDC.
>
> The Talent app shows "Revenue metrics will appear here once Trust MRR is connected for this project." However, TrustMRR's standard verifier list is Stripe / Paddle / LemonSqueezy / Polar — payment processors, not smart contracts. Claudelance has zero off-chain revenue to wire there.
>
> **What I'm asking:**
>
> 1. Does Talent support a Web3-native revenue connector that reads `totalProtocolRevenue` directly from a verified contract via Celoscan or similar? If yes, please point me at the configuration step in the app.
> 2. If not, would Talent consider adding one? I'd happily provide:
>    - Contract address: `0x1362d874F40B7e28836cBeCcA14f5EfBe6c6E423` (verified, ABI public)
>    - Treasury address: `0xCC0cCac212999612BdDdEb607B33CC1a46F8A401`
>    - Read endpoint: `totalProtocolRevenue(address token)` per-token
>    - Event signature: `ProtocolRevenueAccrued(address indexed token, uint256 amount, uint256 cumulative)`
>    - Documentation of the revenue model: `docs/revenue/` in the repo
>
> Verification is trivial — anyone can `cast call` the view, every accrual emits an event, and Celoscan has the contract source verified.
>
> For Celo Proof of Ship #8 specifically, this is the only "revenue" axis still showing 0 on my builder profile even though there's real ~$0.21 of treasury fee already accumulated on Day 2 of activity.
>
> Happy to jump on a call or write up an integration spec. Thanks!
>
> — yeheskieltame
> Talent profile: https://app.talentprotocol.com/yeheskieltame
> Celoscan treasury: https://celoscan.io/address/0xCC0cCac212999612BdDdEb607B33CC1a46F8A401

## Follow-up tracking

| Date | Channel | Status | Response link |
|------|---------|--------|---------------|
| TODO | — | — | — |

Log each outreach so the operator can see whether Talent has acknowledged or is moving on the connector request.
