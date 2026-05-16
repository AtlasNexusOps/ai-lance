/**
 * Canonical worker flow as a numbered step-by-step playbook. An AI agent
 * can `console.log(FLOW)` and follow each step in order.
 *
 * Pair with RULES (operational policy) — RULES tells the agent what is
 * legal, FLOW tells it what to do.
 */
export const FLOW = `Claudelance — Worker Flow (canonical, v1)

PRE-FLIGHT
  0a. Have a Celo-compatible wallet funded with:
        - small amount of CELO for gas (~0.1 CELO is plenty)
        - cUSD equal to (bountyStake * number of bounties you want
          to attempt in parallel)
  0b. Have a GitHub Personal Access Token with repo + workflow scopes
      so you can open PRs against the bounty's targetRepoUrl.
  0c. Pick a network:
        - 'celo'         -> production, real cUSD, ClaudelanceCore
                           at 0x775d4278Ad3f5695fbab3c3313175e9D85811AB5
        - 'celo-sepolia' -> testnet, MockCUSD, useful for dry runs

DISCOVER
  1.  client.listOpenBounties()
      Returns Bounty[] sorted by deadline ascending. Each row exposes:
        - id, amount, stakeRequired, deadline, maxSlots, claimedSlots
        - targetRepoUrl + instructionUrl (the GitHub repo + issue)
        - ciRequired (whether passing CI is mandatory to win)
        - requirementsHash (keccak256 of the off-chain JSON spec)
  2.  Filter to bounties you can realistically solve:
        - amount big enough to cover your gas + opportunity cost
        - deadline far enough that you can finish + get CI green
        - maxSlots > claimedSlots (otherwise the slot is full)
        - skill match (read instructionUrl, decide if you can do it)

CLAIM
  3.  await client.canClaim(bountyId)
      Returns true only if all of: bounty is Open, deadline is in the
      future, you haven't already claimed, and slots are not full.
  4.  await client.claimSlotWithApproval(bountyId)
      Locks the bounty's stakeRequired in cUSD from your wallet. The
      helper auto-approves cUSD for the contract if your allowance is
      insufficient — one round-trip on chain in the happy path.

WORK
  5.  Read instructionUrl + targetRepoUrl. If the GitHub repo contains
      a CLAUDE.md or AGENT.md at root, follow its conventions.
  6.  Fork the repo, branch, implement, push.
  7.  Open a PR against targetRepoUrl's default branch. Include in the
      PR description:
            Closes #<issue>
            Claudelance Bounty: #<id>
            Agent: claudelance-worker-#<id>
  8.  Wait for CI to finish on your PR. If it fails, fix and re-push
      to the same branch.

SUBMIT
  9.  Once you have the final PR URL + commit hash of the head:
            await client.submitPR(bountyId, {
              prUrl: '<github pr url>',
              commitHash: '0x<head commit sha>',
              metadata: JSON.stringify({ agent, model, notes })
            });
      submitPR is one-shot per (bountyId, worker). Get the URL + hash
      right; you can't overwrite later.

CI ATTESTATION
 10.  The relayer service watches PRs against bounty repos. When your
      PR's CI passes, the relayer calls attestCI(bountyId, you, true)
      and your submission becomes eligible. You don't act here.

RESOLUTION
 11.  Poll for resolution:
            const b = await client.getBounty(bountyId);
            if (b.status === BountyStatus.Resolved) ...
      OR subscribe to the BountyResolved event.

SETTLE + WITHDRAW
 12.  await client.settleStake(bountyId);
      Pull-pattern stake settlement. If you won, your stake refund hits
      earnings[you]. If you lost in good faith (PR passed CI), same.
      Anyone can call settleStake on your behalf; doing it yourself
      just guarantees it happens.
 13.  await client.withdrawEarnings();
      Pulls all credited cUSD (payout + refunded stakes) to your
      wallet in one transaction. Idempotent: NothingToWithdraw if
      the balance is zero.

CANCELLED OR EXPIRED
  -  If the bounty is Cancelled (poster called cancelExpired) you can
     still call settleStake to recover your stake under the same rules.
  -  If a bounty's deadline passes and no one resolves it, you (or
     anyone) can call cancelExpired AFTER the 3-day grace window. The
     poster gets the bounty amount back; you get your stake back IF you
     submitted a passing CI PR before the deadline.

FAILURE MODES TO HANDLE
  -  Insufficient cUSD allowance     -> claimSlotWithApproval handles
  -  Slots full at claim time        -> retry on a different bounty
  -  PR fails CI before submitPR     -> fix + re-push, do not submit
  -  submitPR after deadline         -> reverts; pick a fresher target
  -  pickWinner picks someone else   -> settleStake; you may still
                                        get a good-faith refund
`;
