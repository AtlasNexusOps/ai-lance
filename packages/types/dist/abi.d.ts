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
export declare const CLAUDELANCE_CORE_ABI: readonly [{
    readonly type: "constructor";
    readonly inputs: readonly [{
        readonly name: "_treasury";
        readonly type: "address";
    }, {
        readonly name: "_ciRelayer";
        readonly type: "address";
    }, {
        readonly name: "_owner";
        readonly type: "address";
    }, {
        readonly name: "_identityRegistry";
        readonly type: "address";
    }, {
        readonly name: "_reputationRegistry";
        readonly type: "address";
    }];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "ADMIN_TIMELOCK";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint64";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "BPS_DENOMINATOR";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "MAX_DEADLINE";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint64";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "MAX_SLOTS";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint8";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "MIN_DEADLINE";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint64";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "PROPOSAL_VALIDITY_WINDOW";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint64";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "PROTOCOL_FEE_BPS";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "RESOLUTION_GRACE_PERIOD";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint64";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "acceptOwnership";
    readonly inputs: readonly [];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "allowToken";
    readonly inputs: readonly [{
        readonly name: "token";
        readonly type: "address";
    }, {
        readonly name: "minBountyAmount";
        readonly type: "uint256";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "allowedToken";
    readonly inputs: readonly [{
        readonly name: "";
        readonly type: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "bool";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "applyCIRelayer";
    readonly inputs: readonly [];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "applyTreasury";
    readonly inputs: readonly [];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "attestCI";
    readonly inputs: readonly [{
        readonly name: "bountyId";
        readonly type: "uint256";
    }, {
        readonly name: "worker";
        readonly type: "address";
    }, {
        readonly name: "passed";
        readonly type: "bool";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "bountyCount";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "bountyCountByType";
    readonly inputs: readonly [{
        readonly name: "";
        readonly type: "uint8";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "cancelExpired";
    readonly inputs: readonly [{
        readonly name: "bountyId";
        readonly type: "uint256";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "cancelPendingCIRelayer";
    readonly inputs: readonly [];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "cancelPendingTreasury";
    readonly inputs: readonly [];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "ciRelayer";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "address";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "claimSlot";
    readonly inputs: readonly [{
        readonly name: "bountyId";
        readonly type: "uint256";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "earnings";
    readonly inputs: readonly [{
        readonly name: "";
        readonly type: "address";
    }, {
        readonly name: "";
        readonly type: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "getBounty";
    readonly inputs: readonly [{
        readonly name: "bountyId";
        readonly type: "uint256";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "tuple";
        readonly components: readonly [{
            readonly name: "poster";
            readonly type: "address";
        }, {
            readonly name: "amount";
            readonly type: "uint96";
        }, {
            readonly name: "winner";
            readonly type: "address";
        }, {
            readonly name: "stakeRequired";
            readonly type: "uint96";
        }, {
            readonly name: "token";
            readonly type: "address";
        }, {
            readonly name: "deadline";
            readonly type: "uint64";
        }, {
            readonly name: "maxSlots";
            readonly type: "uint8";
        }, {
            readonly name: "claimedSlots";
            readonly type: "uint8";
        }, {
            readonly name: "bountyType";
            readonly type: "uint8";
        }, {
            readonly name: "ciRequired";
            readonly type: "bool";
        }, {
            readonly name: "targetWorker";
            readonly type: "address";
        }, {
            readonly name: "status";
            readonly type: "uint8";
        }, {
            readonly name: "targetRepoUrl";
            readonly type: "string";
        }, {
            readonly name: "instructionUrl";
            readonly type: "string";
        }, {
            readonly name: "requirementsHash";
            readonly type: "bytes32";
        }];
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "getClaimers";
    readonly inputs: readonly [{
        readonly name: "bountyId";
        readonly type: "uint256";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "address[]";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "getEligibleSubmissions";
    readonly inputs: readonly [{
        readonly name: "bountyId";
        readonly type: "uint256";
    }];
    readonly outputs: readonly [{
        readonly name: "eligible";
        readonly type: "address[]";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "getStats";
    readonly inputs: readonly [{
        readonly name: "token";
        readonly type: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "volume";
        readonly type: "uint256";
    }, {
        readonly name: "revenue";
        readonly type: "uint256";
    }, {
        readonly name: "resolved";
        readonly type: "uint256";
    }, {
        readonly name: "posters";
        readonly type: "uint256";
    }, {
        readonly name: "workers";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "getSubmission";
    readonly inputs: readonly [{
        readonly name: "bountyId";
        readonly type: "uint256";
    }, {
        readonly name: "worker";
        readonly type: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "tuple";
        readonly components: readonly [{
            readonly name: "commitHash";
            readonly type: "bytes32";
        }, {
            readonly name: "submittedAt";
            readonly type: "uint64";
        }, {
            readonly name: "ciPassed";
            readonly type: "bool";
        }, {
            readonly name: "stakeRefunded";
            readonly type: "bool";
        }, {
            readonly name: "prUrl";
            readonly type: "string";
        }, {
            readonly name: "metadata";
            readonly type: "string";
        }];
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "hasClaimed";
    readonly inputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
    }, {
        readonly name: "";
        readonly type: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "bool";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "hasPosted";
    readonly inputs: readonly [{
        readonly name: "";
        readonly type: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "bool";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "hasWorked";
    readonly inputs: readonly [{
        readonly name: "";
        readonly type: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "bool";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "identityRegistry";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "address";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "minBounty";
    readonly inputs: readonly [{
        readonly name: "";
        readonly type: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "owner";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "address";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "pause";
    readonly inputs: readonly [];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "paused";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "bool";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "pendingCIRelayer";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "proposed";
        readonly type: "address";
    }, {
        readonly name: "effectiveAt";
        readonly type: "uint64";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "pendingOwner";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "address";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "pendingTreasury";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "proposed";
        readonly type: "address";
    }, {
        readonly name: "effectiveAt";
        readonly type: "uint64";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "pickWinner";
    readonly inputs: readonly [{
        readonly name: "bountyId";
        readonly type: "uint256";
    }, {
        readonly name: "winner";
        readonly type: "address";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "postBounty";
    readonly inputs: readonly [{
        readonly name: "token";
        readonly type: "address";
    }, {
        readonly name: "bountyType";
        readonly type: "uint8";
    }, {
        readonly name: "targetRepoUrl";
        readonly type: "string";
    }, {
        readonly name: "instructionUrl";
        readonly type: "string";
    }, {
        readonly name: "requirementsHash";
        readonly type: "bytes32";
    }, {
        readonly name: "amount";
        readonly type: "uint96";
    }, {
        readonly name: "maxSlots";
        readonly type: "uint8";
    }, {
        readonly name: "stake";
        readonly type: "uint96";
    }, {
        readonly name: "deadline";
        readonly type: "uint64";
    }, {
        readonly name: "ciRequired";
        readonly type: "bool";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "postDirectHire";
    readonly inputs: readonly [{
        readonly name: "token";
        readonly type: "address";
    }, {
        readonly name: "targetWorker";
        readonly type: "address";
    }, {
        readonly name: "bountyType";
        readonly type: "uint8";
    }, {
        readonly name: "targetRepoUrl";
        readonly type: "string";
    }, {
        readonly name: "instructionUrl";
        readonly type: "string";
    }, {
        readonly name: "requirementsHash";
        readonly type: "bytes32";
    }, {
        readonly name: "amount";
        readonly type: "uint96";
    }, {
        readonly name: "stake";
        readonly type: "uint96";
    }, {
        readonly name: "deadline";
        readonly type: "uint64";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "proposeCIRelayer";
    readonly inputs: readonly [{
        readonly name: "newRelayer";
        readonly type: "address";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "proposeTreasury";
    readonly inputs: readonly [{
        readonly name: "newTreasury";
        readonly type: "address";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "renounceOwnership";
    readonly inputs: readonly [];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "reputationRegistry";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "address";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "rescueERC20";
    readonly inputs: readonly [{
        readonly name: "token";
        readonly type: "address";
    }, {
        readonly name: "to";
        readonly type: "address";
    }, {
        readonly name: "amount";
        readonly type: "uint256";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "setMinBounty";
    readonly inputs: readonly [{
        readonly name: "token";
        readonly type: "address";
    }, {
        readonly name: "minBountyAmount";
        readonly type: "uint256";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "settleStake";
    readonly inputs: readonly [{
        readonly name: "bountyId";
        readonly type: "uint256";
    }, {
        readonly name: "worker";
        readonly type: "address";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "submitPR";
    readonly inputs: readonly [{
        readonly name: "bountyId";
        readonly type: "uint256";
    }, {
        readonly name: "prUrl";
        readonly type: "string";
    }, {
        readonly name: "commitHash";
        readonly type: "bytes32";
    }, {
        readonly name: "metadata";
        readonly type: "string";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "totalBountiesResolved";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "totalBountyVolume";
    readonly inputs: readonly [{
        readonly name: "";
        readonly type: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "totalProtocolRevenue";
    readonly inputs: readonly [{
        readonly name: "";
        readonly type: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "transferOwnership";
    readonly inputs: readonly [{
        readonly name: "newOwner";
        readonly type: "address";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "treasury";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "address";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "uniquePosterCount";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "uniqueWorkerCount";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "unpause";
    readonly inputs: readonly [];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "withdrawEarnings";
    readonly inputs: readonly [{
        readonly name: "token";
        readonly type: "address";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "event";
    readonly name: "BountyCancelled";
    readonly inputs: readonly [{
        readonly name: "bountyId";
        readonly type: "uint256";
        readonly indexed: true;
    }, {
        readonly name: "poster";
        readonly type: "address";
        readonly indexed: true;
    }, {
        readonly name: "refundAmount";
        readonly type: "uint96";
        readonly indexed: false;
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "BountyPosted";
    readonly inputs: readonly [{
        readonly name: "bountyId";
        readonly type: "uint256";
        readonly indexed: true;
    }, {
        readonly name: "poster";
        readonly type: "address";
        readonly indexed: true;
    }, {
        readonly name: "token";
        readonly type: "address";
        readonly indexed: true;
    }, {
        readonly name: "targetWorker";
        readonly type: "address";
        readonly indexed: false;
    }, {
        readonly name: "bountyType";
        readonly type: "uint8";
        readonly indexed: false;
    }, {
        readonly name: "amount";
        readonly type: "uint96";
        readonly indexed: false;
    }, {
        readonly name: "stakeRequired";
        readonly type: "uint96";
        readonly indexed: false;
    }, {
        readonly name: "maxSlots";
        readonly type: "uint8";
        readonly indexed: false;
    }, {
        readonly name: "targetRepoUrl";
        readonly type: "string";
        readonly indexed: false;
    }, {
        readonly name: "requirementsHash";
        readonly type: "bytes32";
        readonly indexed: false;
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "BountyResolved";
    readonly inputs: readonly [{
        readonly name: "bountyId";
        readonly type: "uint256";
        readonly indexed: true;
    }, {
        readonly name: "winner";
        readonly type: "address";
        readonly indexed: true;
    }, {
        readonly name: "winnerPayout";
        readonly type: "uint96";
        readonly indexed: false;
    }, {
        readonly name: "protocolFee";
        readonly type: "uint96";
        readonly indexed: false;
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "CIAttested";
    readonly inputs: readonly [{
        readonly name: "bountyId";
        readonly type: "uint256";
        readonly indexed: true;
    }, {
        readonly name: "worker";
        readonly type: "address";
        readonly indexed: true;
    }, {
        readonly name: "passed";
        readonly type: "bool";
        readonly indexed: false;
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "CIRelayerProposalCancelled";
    readonly inputs: readonly [{
        readonly name: "proposed";
        readonly type: "address";
        readonly indexed: true;
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "CIRelayerProposed";
    readonly inputs: readonly [{
        readonly name: "proposed";
        readonly type: "address";
        readonly indexed: true;
    }, {
        readonly name: "effectiveAt";
        readonly type: "uint64";
        readonly indexed: false;
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "CIRelayerUpdated";
    readonly inputs: readonly [{
        readonly name: "previous";
        readonly type: "address";
        readonly indexed: true;
    }, {
        readonly name: "current";
        readonly type: "address";
        readonly indexed: true;
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "ERC20Rescued";
    readonly inputs: readonly [{
        readonly name: "token";
        readonly type: "address";
        readonly indexed: true;
    }, {
        readonly name: "to";
        readonly type: "address";
        readonly indexed: true;
    }, {
        readonly name: "amount";
        readonly type: "uint256";
        readonly indexed: false;
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "EarningsWithdrawn";
    readonly inputs: readonly [{
        readonly name: "account";
        readonly type: "address";
        readonly indexed: true;
    }, {
        readonly name: "token";
        readonly type: "address";
        readonly indexed: true;
    }, {
        readonly name: "amount";
        readonly type: "uint256";
        readonly indexed: false;
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "MinBountyUpdated";
    readonly inputs: readonly [{
        readonly name: "token";
        readonly type: "address";
        readonly indexed: true;
    }, {
        readonly name: "minBounty";
        readonly type: "uint256";
        readonly indexed: false;
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "OwnershipTransferStarted";
    readonly inputs: readonly [{
        readonly name: "previousOwner";
        readonly type: "address";
        readonly indexed: true;
    }, {
        readonly name: "newOwner";
        readonly type: "address";
        readonly indexed: true;
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "OwnershipTransferred";
    readonly inputs: readonly [{
        readonly name: "previousOwner";
        readonly type: "address";
        readonly indexed: true;
    }, {
        readonly name: "newOwner";
        readonly type: "address";
        readonly indexed: true;
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "PRSubmitted";
    readonly inputs: readonly [{
        readonly name: "bountyId";
        readonly type: "uint256";
        readonly indexed: true;
    }, {
        readonly name: "worker";
        readonly type: "address";
        readonly indexed: true;
    }, {
        readonly name: "prUrl";
        readonly type: "string";
        readonly indexed: false;
    }, {
        readonly name: "commitHash";
        readonly type: "bytes32";
        readonly indexed: false;
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "Paused";
    readonly inputs: readonly [{
        readonly name: "account";
        readonly type: "address";
        readonly indexed: false;
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "ProtocolRevenueAccrued";
    readonly inputs: readonly [{
        readonly name: "token";
        readonly type: "address";
        readonly indexed: true;
    }, {
        readonly name: "amount";
        readonly type: "uint256";
        readonly indexed: false;
    }, {
        readonly name: "cumulative";
        readonly type: "uint256";
        readonly indexed: false;
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "SlotClaimed";
    readonly inputs: readonly [{
        readonly name: "bountyId";
        readonly type: "uint256";
        readonly indexed: true;
    }, {
        readonly name: "worker";
        readonly type: "address";
        readonly indexed: true;
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "StakeForfeited";
    readonly inputs: readonly [{
        readonly name: "bountyId";
        readonly type: "uint256";
        readonly indexed: true;
    }, {
        readonly name: "worker";
        readonly type: "address";
        readonly indexed: true;
    }, {
        readonly name: "amount";
        readonly type: "uint96";
        readonly indexed: false;
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "StakeRefunded";
    readonly inputs: readonly [{
        readonly name: "bountyId";
        readonly type: "uint256";
        readonly indexed: true;
    }, {
        readonly name: "worker";
        readonly type: "address";
        readonly indexed: true;
    }, {
        readonly name: "amount";
        readonly type: "uint96";
        readonly indexed: false;
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "TokenAllowed";
    readonly inputs: readonly [{
        readonly name: "token";
        readonly type: "address";
        readonly indexed: true;
    }, {
        readonly name: "minBounty";
        readonly type: "uint256";
        readonly indexed: false;
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "TreasuryProposalCancelled";
    readonly inputs: readonly [{
        readonly name: "proposed";
        readonly type: "address";
        readonly indexed: true;
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "TreasuryProposed";
    readonly inputs: readonly [{
        readonly name: "proposed";
        readonly type: "address";
        readonly indexed: true;
    }, {
        readonly name: "effectiveAt";
        readonly type: "uint64";
        readonly indexed: false;
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "TreasuryUpdated";
    readonly inputs: readonly [{
        readonly name: "previous";
        readonly type: "address";
        readonly indexed: true;
    }, {
        readonly name: "current";
        readonly type: "address";
        readonly indexed: true;
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "Unpaused";
    readonly inputs: readonly [{
        readonly name: "account";
        readonly type: "address";
        readonly indexed: false;
    }];
    readonly anonymous: false;
}, {
    readonly type: "error";
    readonly name: "AddressEmptyCode";
    readonly inputs: readonly [{
        readonly name: "target";
        readonly type: "address";
    }];
}, {
    readonly type: "error";
    readonly name: "AddressInsufficientBalance";
    readonly inputs: readonly [{
        readonly name: "account";
        readonly type: "address";
    }];
}, {
    readonly type: "error";
    readonly name: "AlreadyClaimed";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "AlreadySubmitted";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "BountyNotExpired";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "BountyNotOpen";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "BountyNotResolved";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "CannotRescueEscrowToken";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "DeadlinePassed";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "EnforcedPause";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "ExpectedPause";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "FailedInnerCall";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "GracePeriodActive";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "InvalidAddress";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "InvalidAmount";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "InvalidDeadline";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "InvalidSlots";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "InvalidStake";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "InvalidUrl";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "NoAgentIdentity";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "NoPendingChange";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "NoStakeRequired";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "NoSubmission";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "NotClaimer";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "NotPoster";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "NotRelayer";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "NotTargetedWorker";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "NothingToWithdraw";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "OwnableInvalidOwner";
    readonly inputs: readonly [{
        readonly name: "owner";
        readonly type: "address";
    }];
}, {
    readonly type: "error";
    readonly name: "OwnableUnauthorizedAccount";
    readonly inputs: readonly [{
        readonly name: "account";
        readonly type: "address";
    }];
}, {
    readonly type: "error";
    readonly name: "ProposalExpired";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "ReentrancyGuardReentrantCall";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "SafeERC20FailedOperation";
    readonly inputs: readonly [{
        readonly name: "token";
        readonly type: "address";
    }];
}, {
    readonly type: "error";
    readonly name: "SlotsFull";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "StakeAlreadySettled";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "TimelockNotElapsed";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "TokenAlreadyAllowed";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "TokenNotAllowed";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "WinnerInvalid";
    readonly inputs: readonly [];
}];
export type ClaudelanceCoreAbi = typeof CLAUDELANCE_CORE_ABI;
//# sourceMappingURL=abi.d.ts.map