/**
 * Lifecycle states for an on-chain bounty.
 * Mirrors `enum BountyStatus` in `ClaudelanceCore.sol`.
 */
export var BountyStatus;
(function (BountyStatus) {
    BountyStatus[BountyStatus["Open"] = 0] = "Open";
    BountyStatus[BountyStatus["Resolved"] = 1] = "Resolved";
    BountyStatus[BountyStatus["Cancelled"] = 2] = "Cancelled";
    BountyStatus[BountyStatus["Expired"] = 3] = "Expired";
})(BountyStatus || (BountyStatus = {}));
/** Helper: a bounty is open-marketplace iff its `targetWorker` is the zero address. */
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
export function isDirectHire(bounty) {
    return bounty.targetWorker.toLowerCase() !== ZERO_ADDRESS;
}
//# sourceMappingURL=bounty.js.map