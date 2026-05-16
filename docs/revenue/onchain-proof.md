# On-chain Revenue Proof

Every cent the Claudelance protocol earns is verifiable on-chain. This page is the canonical reference for auditors, judges, and revenue-tracking tools (Talent Protocol, TrustMRR, etc).

## Contracts to verify

| Component | Address | Network |
|-----------|---------|---------|
| ClaudelanceCore (verified) | [`0x1362d874F40B7e28836cBeCcA14f5EfBe6c6E423`](https://celoscan.io/address/0x1362d874F40B7e28836cBeCcA14f5EfBe6c6E423#code) | Celo Mainnet (42220) |
| Treasury wallet | [`0xCC0cCac212999612BdDdEb607B33CC1a46F8A401`](https://celoscan.io/address/0xCC0cCac212999612BdDdEb607B33CC1a46F8A401) | Celo Mainnet |

## Read `totalProtocolRevenue(token)` for each token

The 2% protocol fee plus forfeited stakes accrue into per-token counters on the Core. Anyone can read these via `cast call`:

```bash
# cUSD
cast call --rpc-url https://forno.celo.org \
  0x1362d874F40B7e28836cBeCcA14f5EfBe6c6E423 \
  "totalProtocolRevenue(address)(uint256)" \
  0x765DE816845861e75A25fCA122bb6898B8B1282a

# CELO (ERC20)
cast call --rpc-url https://forno.celo.org \
  0x1362d874F40B7e28836cBeCcA14f5EfBe6c6E423 \
  "totalProtocolRevenue(address)(uint256)" \
  0x471EcE3750Da237f93B8E339c536989b8978a438

# USDC
cast call --rpc-url https://forno.celo.org \
  0x1362d874F40B7e28836cBeCcA14f5EfBe6c6E423 \
  "totalProtocolRevenue(address)(uint256)" \
  0xcebA9300f2b948710d2653dD7B07f33A8B32118C
```

Divide each return value by the token's decimals (cUSD/CELO = 18, USDC = 6) for human-readable amount.

## Event log filter

Each fee accrual emits a `ProtocolRevenueAccrued(address indexed token, uint256 amount, uint256 cumulative)` event. Celoscan event filter:

[https://celoscan.io/address/0x1362d874F40B7e28836cBeCcA14f5EfBe6c6E423#events](https://celoscan.io/address/0x1362d874F40B7e28836cBeCcA14f5EfBe6c6E423#events)

Filter by topic[0] = `keccak256("ProtocolRevenueAccrued(address,uint256,uint256)")` and topic[1] = token address (left-padded to 32 bytes).

## Verify treasury earnings claimable balance

`earnings[treasury][token]` is the un-withdrawn portion (revenue accrued but not yet swept by `withdrawEarnings`):

```bash
cast call --rpc-url https://forno.celo.org \
  0x1362d874F40B7e28836cBeCcA14f5EfBe6c6E423 \
  "earnings(address,address)(uint256)" \
  0xCC0cCac212999612BdDdEb607B33CC1a46F8A401 \
  0x471EcE3750Da237f93B8E339c536989b8978a438
```

## Day 2 snapshot

| Metric | Value |
|--------|-------|
| Resolved bounties | 19+ |
| `totalProtocolRevenue(CELO)` | ~0.38 CELO |
| `totalProtocolRevenue(cUSD)` | 0 (no cUSD bounties yet on mainnet) |
| `totalProtocolRevenue(USDC)` | 0 (no USDC bounties yet on mainnet) |
| USD-equivalent (CELO @ ~$0.55) | ~$0.21 |

Numbers grow with every resolved bounty. Cross-check at the Celoscan link any time.
