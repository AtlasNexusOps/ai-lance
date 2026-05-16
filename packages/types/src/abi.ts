/**
 * ABI for ClaudelanceCore v2 — extracted from foundry artifact.
 * Declared `as const` so viem/wagmi/abitype infer parameter and return
 * types at compile time.
 *
 * Verified on Celoscan against compiled bytecode at
 *   - sepolia 0xC478e36CC213Cb459282b5B690bF8FF4975A911F
 *
 * Mainnet v2 deploy is deferred until Sepolia E2E validation completes.
 */
export const CLAUDELANCE_CORE_ABI = [
  {
    "type": "constructor",
    "inputs": [
      {
        "name": "_treasury",
        "type": "address"
      },
      {
        "name": "_ciRelayer",
        "type": "address"
      },
      {
        "name": "_owner",
        "type": "address"
      },
      {
        "name": "_identityRegistry",
        "type": "address"
      },
      {
        "name": "_reputationRegistry",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "ADMIN_TIMELOCK",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint64"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "BPS_DENOMINATOR",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "MAX_DEADLINE",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint64"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "MAX_SLOTS",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "MIN_DEADLINE",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint64"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "PROPOSAL_VALIDITY_WINDOW",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint64"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "PROTOCOL_FEE_BPS",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "RESOLUTION_GRACE_PERIOD",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint64"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "acceptOwnership",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "allowToken",
    "inputs": [
      {
        "name": "token",
        "type": "address"
      },
      {
        "name": "minBountyAmount",
        "type": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "allowedToken",
    "inputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "applyCIRelayer",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "applyTreasury",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "attestCI",
    "inputs": [
      {
        "name": "bountyId",
        "type": "uint256"
      },
      {
        "name": "worker",
        "type": "address"
      },
      {
        "name": "passed",
        "type": "bool"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "bountyCount",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "bountyCountByType",
    "inputs": [
      {
        "name": "",
        "type": "uint8"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "cancelExpired",
    "inputs": [
      {
        "name": "bountyId",
        "type": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "cancelPendingCIRelayer",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "cancelPendingTreasury",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "ciRelayer",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "claimSlot",
    "inputs": [
      {
        "name": "bountyId",
        "type": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "earnings",
    "inputs": [
      {
        "name": "",
        "type": "address"
      },
      {
        "name": "",
        "type": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getBounty",
    "inputs": [
      {
        "name": "bountyId",
        "type": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "tuple",
        "components": [
          {
            "name": "poster",
            "type": "address"
          },
          {
            "name": "amount",
            "type": "uint96"
          },
          {
            "name": "winner",
            "type": "address"
          },
          {
            "name": "stakeRequired",
            "type": "uint96"
          },
          {
            "name": "token",
            "type": "address"
          },
          {
            "name": "deadline",
            "type": "uint64"
          },
          {
            "name": "maxSlots",
            "type": "uint8"
          },
          {
            "name": "claimedSlots",
            "type": "uint8"
          },
          {
            "name": "bountyType",
            "type": "uint8"
          },
          {
            "name": "ciRequired",
            "type": "bool"
          },
          {
            "name": "targetWorker",
            "type": "address"
          },
          {
            "name": "status",
            "type": "uint8"
          },
          {
            "name": "targetRepoUrl",
            "type": "string"
          },
          {
            "name": "instructionUrl",
            "type": "string"
          },
          {
            "name": "requirementsHash",
            "type": "bytes32"
          }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getClaimers",
    "inputs": [
      {
        "name": "bountyId",
        "type": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "address[]"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getEligibleSubmissions",
    "inputs": [
      {
        "name": "bountyId",
        "type": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "eligible",
        "type": "address[]"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getStats",
    "inputs": [
      {
        "name": "token",
        "type": "address"
      }
    ],
    "outputs": [
      {
        "name": "volume",
        "type": "uint256"
      },
      {
        "name": "revenue",
        "type": "uint256"
      },
      {
        "name": "resolved",
        "type": "uint256"
      },
      {
        "name": "posters",
        "type": "uint256"
      },
      {
        "name": "workers",
        "type": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getSubmission",
    "inputs": [
      {
        "name": "bountyId",
        "type": "uint256"
      },
      {
        "name": "worker",
        "type": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "tuple",
        "components": [
          {
            "name": "commitHash",
            "type": "bytes32"
          },
          {
            "name": "submittedAt",
            "type": "uint64"
          },
          {
            "name": "ciPassed",
            "type": "bool"
          },
          {
            "name": "stakeRefunded",
            "type": "bool"
          },
          {
            "name": "prUrl",
            "type": "string"
          },
          {
            "name": "metadata",
            "type": "string"
          }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "hasClaimed",
    "inputs": [
      {
        "name": "",
        "type": "uint256"
      },
      {
        "name": "",
        "type": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "hasPosted",
    "inputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "hasWorked",
    "inputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "identityRegistry",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "minBounty",
    "inputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "owner",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "pause",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "paused",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "pendingCIRelayer",
    "inputs": [],
    "outputs": [
      {
        "name": "proposed",
        "type": "address"
      },
      {
        "name": "effectiveAt",
        "type": "uint64"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "pendingOwner",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "pendingTreasury",
    "inputs": [],
    "outputs": [
      {
        "name": "proposed",
        "type": "address"
      },
      {
        "name": "effectiveAt",
        "type": "uint64"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "pickWinner",
    "inputs": [
      {
        "name": "bountyId",
        "type": "uint256"
      },
      {
        "name": "winner",
        "type": "address"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "postBounty",
    "inputs": [
      {
        "name": "token",
        "type": "address"
      },
      {
        "name": "bountyType",
        "type": "uint8"
      },
      {
        "name": "targetRepoUrl",
        "type": "string"
      },
      {
        "name": "instructionUrl",
        "type": "string"
      },
      {
        "name": "requirementsHash",
        "type": "bytes32"
      },
      {
        "name": "amount",
        "type": "uint96"
      },
      {
        "name": "maxSlots",
        "type": "uint8"
      },
      {
        "name": "stake",
        "type": "uint96"
      },
      {
        "name": "deadline",
        "type": "uint64"
      },
      {
        "name": "ciRequired",
        "type": "bool"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "postDirectHire",
    "inputs": [
      {
        "name": "token",
        "type": "address"
      },
      {
        "name": "targetWorker",
        "type": "address"
      },
      {
        "name": "bountyType",
        "type": "uint8"
      },
      {
        "name": "targetRepoUrl",
        "type": "string"
      },
      {
        "name": "instructionUrl",
        "type": "string"
      },
      {
        "name": "requirementsHash",
        "type": "bytes32"
      },
      {
        "name": "amount",
        "type": "uint96"
      },
      {
        "name": "stake",
        "type": "uint96"
      },
      {
        "name": "deadline",
        "type": "uint64"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "proposeCIRelayer",
    "inputs": [
      {
        "name": "newRelayer",
        "type": "address"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "proposeTreasury",
    "inputs": [
      {
        "name": "newTreasury",
        "type": "address"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "renounceOwnership",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "reputationRegistry",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "rescueERC20",
    "inputs": [
      {
        "name": "token",
        "type": "address"
      },
      {
        "name": "to",
        "type": "address"
      },
      {
        "name": "amount",
        "type": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "setMinBounty",
    "inputs": [
      {
        "name": "token",
        "type": "address"
      },
      {
        "name": "minBountyAmount",
        "type": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "settleStake",
    "inputs": [
      {
        "name": "bountyId",
        "type": "uint256"
      },
      {
        "name": "worker",
        "type": "address"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "submitPR",
    "inputs": [
      {
        "name": "bountyId",
        "type": "uint256"
      },
      {
        "name": "prUrl",
        "type": "string"
      },
      {
        "name": "commitHash",
        "type": "bytes32"
      },
      {
        "name": "metadata",
        "type": "string"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "totalBountiesResolved",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "totalBountyVolume",
    "inputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "totalProtocolRevenue",
    "inputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "transferOwnership",
    "inputs": [
      {
        "name": "newOwner",
        "type": "address"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "treasury",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "uniquePosterCount",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "uniqueWorkerCount",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "unpause",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "withdrawEarnings",
    "inputs": [
      {
        "name": "token",
        "type": "address"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "event",
    "name": "BountyCancelled",
    "inputs": [
      {
        "name": "bountyId",
        "type": "uint256",
        "indexed": true
      },
      {
        "name": "poster",
        "type": "address",
        "indexed": true
      },
      {
        "name": "refundAmount",
        "type": "uint96",
        "indexed": false
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "BountyPosted",
    "inputs": [
      {
        "name": "bountyId",
        "type": "uint256",
        "indexed": true
      },
      {
        "name": "poster",
        "type": "address",
        "indexed": true
      },
      {
        "name": "token",
        "type": "address",
        "indexed": true
      },
      {
        "name": "targetWorker",
        "type": "address",
        "indexed": false
      },
      {
        "name": "bountyType",
        "type": "uint8",
        "indexed": false
      },
      {
        "name": "amount",
        "type": "uint96",
        "indexed": false
      },
      {
        "name": "stakeRequired",
        "type": "uint96",
        "indexed": false
      },
      {
        "name": "maxSlots",
        "type": "uint8",
        "indexed": false
      },
      {
        "name": "targetRepoUrl",
        "type": "string",
        "indexed": false
      },
      {
        "name": "requirementsHash",
        "type": "bytes32",
        "indexed": false
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "BountyResolved",
    "inputs": [
      {
        "name": "bountyId",
        "type": "uint256",
        "indexed": true
      },
      {
        "name": "winner",
        "type": "address",
        "indexed": true
      },
      {
        "name": "winnerPayout",
        "type": "uint96",
        "indexed": false
      },
      {
        "name": "protocolFee",
        "type": "uint96",
        "indexed": false
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "CIAttested",
    "inputs": [
      {
        "name": "bountyId",
        "type": "uint256",
        "indexed": true
      },
      {
        "name": "worker",
        "type": "address",
        "indexed": true
      },
      {
        "name": "passed",
        "type": "bool",
        "indexed": false
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "CIRelayerProposalCancelled",
    "inputs": [
      {
        "name": "proposed",
        "type": "address",
        "indexed": true
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "CIRelayerProposed",
    "inputs": [
      {
        "name": "proposed",
        "type": "address",
        "indexed": true
      },
      {
        "name": "effectiveAt",
        "type": "uint64",
        "indexed": false
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "CIRelayerUpdated",
    "inputs": [
      {
        "name": "previous",
        "type": "address",
        "indexed": true
      },
      {
        "name": "current",
        "type": "address",
        "indexed": true
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "ERC20Rescued",
    "inputs": [
      {
        "name": "token",
        "type": "address",
        "indexed": true
      },
      {
        "name": "to",
        "type": "address",
        "indexed": true
      },
      {
        "name": "amount",
        "type": "uint256",
        "indexed": false
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "EarningsWithdrawn",
    "inputs": [
      {
        "name": "account",
        "type": "address",
        "indexed": true
      },
      {
        "name": "token",
        "type": "address",
        "indexed": true
      },
      {
        "name": "amount",
        "type": "uint256",
        "indexed": false
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "MinBountyUpdated",
    "inputs": [
      {
        "name": "token",
        "type": "address",
        "indexed": true
      },
      {
        "name": "minBounty",
        "type": "uint256",
        "indexed": false
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "OwnershipTransferStarted",
    "inputs": [
      {
        "name": "previousOwner",
        "type": "address",
        "indexed": true
      },
      {
        "name": "newOwner",
        "type": "address",
        "indexed": true
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "OwnershipTransferred",
    "inputs": [
      {
        "name": "previousOwner",
        "type": "address",
        "indexed": true
      },
      {
        "name": "newOwner",
        "type": "address",
        "indexed": true
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "PRSubmitted",
    "inputs": [
      {
        "name": "bountyId",
        "type": "uint256",
        "indexed": true
      },
      {
        "name": "worker",
        "type": "address",
        "indexed": true
      },
      {
        "name": "prUrl",
        "type": "string",
        "indexed": false
      },
      {
        "name": "commitHash",
        "type": "bytes32",
        "indexed": false
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "Paused",
    "inputs": [
      {
        "name": "account",
        "type": "address",
        "indexed": false
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "ProtocolRevenueAccrued",
    "inputs": [
      {
        "name": "token",
        "type": "address",
        "indexed": true
      },
      {
        "name": "amount",
        "type": "uint256",
        "indexed": false
      },
      {
        "name": "cumulative",
        "type": "uint256",
        "indexed": false
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "SlotClaimed",
    "inputs": [
      {
        "name": "bountyId",
        "type": "uint256",
        "indexed": true
      },
      {
        "name": "worker",
        "type": "address",
        "indexed": true
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "StakeForfeited",
    "inputs": [
      {
        "name": "bountyId",
        "type": "uint256",
        "indexed": true
      },
      {
        "name": "worker",
        "type": "address",
        "indexed": true
      },
      {
        "name": "amount",
        "type": "uint96",
        "indexed": false
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "StakeRefunded",
    "inputs": [
      {
        "name": "bountyId",
        "type": "uint256",
        "indexed": true
      },
      {
        "name": "worker",
        "type": "address",
        "indexed": true
      },
      {
        "name": "amount",
        "type": "uint96",
        "indexed": false
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "TokenAllowed",
    "inputs": [
      {
        "name": "token",
        "type": "address",
        "indexed": true
      },
      {
        "name": "minBounty",
        "type": "uint256",
        "indexed": false
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "TreasuryProposalCancelled",
    "inputs": [
      {
        "name": "proposed",
        "type": "address",
        "indexed": true
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "TreasuryProposed",
    "inputs": [
      {
        "name": "proposed",
        "type": "address",
        "indexed": true
      },
      {
        "name": "effectiveAt",
        "type": "uint64",
        "indexed": false
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "TreasuryUpdated",
    "inputs": [
      {
        "name": "previous",
        "type": "address",
        "indexed": true
      },
      {
        "name": "current",
        "type": "address",
        "indexed": true
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "Unpaused",
    "inputs": [
      {
        "name": "account",
        "type": "address",
        "indexed": false
      }
    ],
    "anonymous": false
  },
  {
    "type": "error",
    "name": "AddressEmptyCode",
    "inputs": [
      {
        "name": "target",
        "type": "address"
      }
    ]
  },
  {
    "type": "error",
    "name": "AddressInsufficientBalance",
    "inputs": [
      {
        "name": "account",
        "type": "address"
      }
    ]
  },
  {
    "type": "error",
    "name": "AlreadyClaimed",
    "inputs": []
  },
  {
    "type": "error",
    "name": "AlreadySubmitted",
    "inputs": []
  },
  {
    "type": "error",
    "name": "BountyNotExpired",
    "inputs": []
  },
  {
    "type": "error",
    "name": "BountyNotOpen",
    "inputs": []
  },
  {
    "type": "error",
    "name": "BountyNotResolved",
    "inputs": []
  },
  {
    "type": "error",
    "name": "CannotRescueEscrowToken",
    "inputs": []
  },
  {
    "type": "error",
    "name": "DeadlinePassed",
    "inputs": []
  },
  {
    "type": "error",
    "name": "EnforcedPause",
    "inputs": []
  },
  {
    "type": "error",
    "name": "ExpectedPause",
    "inputs": []
  },
  {
    "type": "error",
    "name": "FailedInnerCall",
    "inputs": []
  },
  {
    "type": "error",
    "name": "GracePeriodActive",
    "inputs": []
  },
  {
    "type": "error",
    "name": "InvalidAddress",
    "inputs": []
  },
  {
    "type": "error",
    "name": "InvalidAmount",
    "inputs": []
  },
  {
    "type": "error",
    "name": "InvalidDeadline",
    "inputs": []
  },
  {
    "type": "error",
    "name": "InvalidSlots",
    "inputs": []
  },
  {
    "type": "error",
    "name": "InvalidStake",
    "inputs": []
  },
  {
    "type": "error",
    "name": "InvalidUrl",
    "inputs": []
  },
  {
    "type": "error",
    "name": "NoAgentIdentity",
    "inputs": []
  },
  {
    "type": "error",
    "name": "NoPendingChange",
    "inputs": []
  },
  {
    "type": "error",
    "name": "NoStakeRequired",
    "inputs": []
  },
  {
    "type": "error",
    "name": "NoSubmission",
    "inputs": []
  },
  {
    "type": "error",
    "name": "NotClaimer",
    "inputs": []
  },
  {
    "type": "error",
    "name": "NotPoster",
    "inputs": []
  },
  {
    "type": "error",
    "name": "NotRelayer",
    "inputs": []
  },
  {
    "type": "error",
    "name": "NotTargetedWorker",
    "inputs": []
  },
  {
    "type": "error",
    "name": "NothingToWithdraw",
    "inputs": []
  },
  {
    "type": "error",
    "name": "OwnableInvalidOwner",
    "inputs": [
      {
        "name": "owner",
        "type": "address"
      }
    ]
  },
  {
    "type": "error",
    "name": "OwnableUnauthorizedAccount",
    "inputs": [
      {
        "name": "account",
        "type": "address"
      }
    ]
  },
  {
    "type": "error",
    "name": "ProposalExpired",
    "inputs": []
  },
  {
    "type": "error",
    "name": "ReentrancyGuardReentrantCall",
    "inputs": []
  },
  {
    "type": "error",
    "name": "SafeERC20FailedOperation",
    "inputs": [
      {
        "name": "token",
        "type": "address"
      }
    ]
  },
  {
    "type": "error",
    "name": "SlotsFull",
    "inputs": []
  },
  {
    "type": "error",
    "name": "StakeAlreadySettled",
    "inputs": []
  },
  {
    "type": "error",
    "name": "TimelockNotElapsed",
    "inputs": []
  },
  {
    "type": "error",
    "name": "TokenAlreadyAllowed",
    "inputs": []
  },
  {
    "type": "error",
    "name": "TokenNotAllowed",
    "inputs": []
  },
  {
    "type": "error",
    "name": "WinnerInvalid",
    "inputs": []
  }
] as const;

export type ClaudelanceCoreAbi = typeof CLAUDELANCE_CORE_ABI;