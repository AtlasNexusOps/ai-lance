/// Write-side ABI for AILanceCore v2 — poster + worker + admin functions.
export const coreWriteAbi = [
  // ── Poster ──
  {
    type: "function",
    name: "postBounty",
    stateMutability: "nonpayable",
    inputs: [
      { type: "address", name: "token" },
      { type: "uint8", name: "bountyType" },
      { type: "string", name: "title" },
      { type: "string", name: "repoUrl" },
      { type: "bytes32", name: "descriptionHash" },
      { type: "uint256", name: "amount" },
      { type: "uint8", name: "maxSlots" },
      { type: "uint256", name: "deadline" },
      { type: "uint256", name: "stakeRequired" },
      { type: "string", name: "metadataURI" },
    ],
    outputs: [{ type: "uint256", name: "bountyId" }],
  },
  {
    type: "function",
    name: "postDirectHire",
    stateMutability: "nonpayable",
    inputs: [
      { type: "address", name: "token" },
      { type: "address", name: "targetWorker" },
      { type: "uint8", name: "bountyType" },
      { type: "string", name: "title" },
      { type: "string", name: "repoUrl" },
      { type: "bytes32", name: "descriptionHash" },
      { type: "uint256", name: "amount" },
      { type: "uint256", name: "stakeRequired" },
      { type: "uint256", name: "deadline" },
    ],
    outputs: [{ type: "uint256", name: "bountyId" }],
  },
  {
    type: "function",
    name: "pickWinner",
    stateMutability: "nonpayable",
    inputs: [
      { type: "uint256", name: "bountyId" },
      { type: "address", name: "winner" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "cancelExpired",
    stateMutability: "nonpayable",
    inputs: [{ type: "uint256", name: "bountyId" }],
    outputs: [],
  },
  // ── Worker ──
  {
    type: "function",
    name: "claimSlot",
    stateMutability: "nonpayable",
    inputs: [{ type: "uint256", name: "bountyId" }],
    outputs: [],
  },
  {
    type: "function",
    name: "submitPR",
    stateMutability: "nonpayable",
    inputs: [
      { type: "uint256", name: "bountyId" },
      { type: "string", name: "prUrl" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "withdrawEarnings",
    stateMutability: "nonpayable",
    inputs: [{ type: "address", name: "token" }],
    outputs: [],
  },
  // ── Permissionless ──
  {
    type: "function",
    name: "settleStake",
    stateMutability: "nonpayable",
    inputs: [
      { type: "uint256", name: "bountyId" },
      { type: "address", name: "worker" },
    ],
    outputs: [],
  },
  // ── Events ──
  {
    type: "event",
    name: "BountyPosted",
    inputs: [
      { type: "uint256", name: "bountyId", indexed: true },
      { type: "address", name: "poster", indexed: true },
      { type: "address", name: "token", indexed: true },
      { type: "uint256", name: "amount" },
    ],
  },
] as const;
