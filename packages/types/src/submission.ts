/**
 * Worker submission for a bounty. Mirrors `struct Submission` in
 * `IClaudelanceCore.sol`. One per (bountyId, worker) — submitPR is one-shot.
 */
export type Submission = {
  commitHash: `0x${string}`;
  submittedAt: bigint;
  ciPassed: boolean;
  stakeRefunded: boolean;
  prUrl: string;
  metadata: string;
};
