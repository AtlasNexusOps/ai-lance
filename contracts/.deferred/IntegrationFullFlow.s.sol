// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Script, console2 } from "forge-std/Script.sol";
import { ClaudelanceCore } from "../src/ClaudelanceCore.sol";
import { IClaudelanceCore } from "../src/interfaces/IClaudelanceCore.sol";
import { MockCUSD } from "../src/mocks/MockCUSD.sol";

/// @notice End-to-end live broadcast against the new (post-PR-11) ClaudelanceCore.
///         Exercises: postBounty, claimSlot, submitPR, attestCI, pickWinner (O(1)),
///         settleStake (refund + forfeit paths), withdrawEarnings, proposeTreasury,
///         cancelPendingTreasury.
contract IntegrationFullFlow is Script {
    uint96 internal constant AMOUNT = 1e18;
    uint96 internal constant STAKE = 0.05e18;
    uint8 internal constant SLOTS = 2;
    uint64 internal constant DEADLINE = 1 days;

    string internal constant REPO = "github.com/yeheskieltame/claudelance-sandbox";

    function run() external {
        address coreAddr = vm.envAddress("CORE_ADDRESS");
        address cusdAddr = vm.envAddress("CUSD_ADDRESS");
        uint256 posterPk = vm.envUint("DEPLOYER_PRIVATE_KEY");
        uint256 w1Pk = vm.envUint("W1_PRIVATE_KEY");
        uint256 w2Pk = vm.envUint("W2_PRIVATE_KEY");
        uint256 relayerPk = posterPk;

        ClaudelanceCore core = ClaudelanceCore(coreAddr);
        MockCUSD cusd = MockCUSD(cusdAddr);

        address poster = vm.addr(posterPk);
        address w1 = vm.addr(w1Pk);
        address w2 = vm.addr(w2Pk);
        address treasury = core.treasury();

        console2.log("=== IntegrationFullFlow start ===");
        console2.log("core:    ", coreAddr);
        console2.log("poster:  ", poster);
        console2.log("w1:      ", w1);
        console2.log("w2:      ", w2);

        // -- Bounty A: happy path, both pass CI, w1 wins -------------------
        uint256 idA = _postBounty(core, cusd, posterPk, "issue-A");
        _claim(core, cusd, idA, w1Pk);
        _claim(core, cusd, idA, w2Pk);
        _submit(core, idA, w1Pk, "pull/A1");
        _submit(core, idA, w2Pk, "pull/A2");
        _attest(core, idA, relayerPk, w1, true);
        _attest(core, idA, relayerPk, w2, true);
        _pickWinner(core, idA, posterPk, w1);
        _settle(core, idA, w1);
        _settle(core, idA, w2);

        uint256 treasuryEarningsAfterA = core.earnings(treasury);
        console2.log("--- Bounty A resolved ---");
        console2.log("  idA:                ", idA);
        console2.log("  w1 earnings:        ", core.earnings(w1));
        console2.log("  w2 earnings:        ", core.earnings(w2));
        console2.log("  treasury earnings:  ", treasuryEarningsAfterA);

        // -- Bounty B: forfeit path, w2 never submits ----------------------
        uint256 idB = _postBounty(core, cusd, posterPk, "issue-B");
        _claim(core, cusd, idB, w1Pk);
        _claim(core, cusd, idB, w2Pk);
        _submit(core, idB, w1Pk, "pull/B1");
        // w2 deliberately does NOT submit
        _attest(core, idB, relayerPk, w1, true);
        _pickWinner(core, idB, posterPk, w1);
        _settle(core, idB, w1); // refund
        _settle(core, idB, w2); // forfeit to treasury

        uint256 treasuryDelta = core.earnings(treasury) - treasuryEarningsAfterA;
        console2.log("--- Bounty B resolved ---");
        console2.log("  idB:                ", idB);
        console2.log("  treasury delta:     ", treasuryDelta);

        // -- Admin smoke: propose + cancel pending treasury ----------------
        address stranger = address(0x000000000000000000000000000000000000c0DE);
        vm.startBroadcast(posterPk);
        core.proposeTreasury(stranger);
        core.cancelPendingTreasury();
        vm.stopBroadcast();

        // -- Worker pulls cUSD --------------------------------------------
        vm.startBroadcast(w1Pk);
        core.withdrawEarnings();
        vm.stopBroadcast();

        console2.log("=== Post-state ===");
        console2.log("bountyCount:        ", core.bountyCount());
        console2.log("totalBountiesResolved:", core.totalBountiesResolved());
        console2.log("totalProtocolRevenue:", core.totalProtocolRevenue());
        console2.log("w1 cUSD balance:    ", cusd.balanceOf(w1));

        // Assertions: both bounties resolved; bountyB credited the protocol fee + the
        // forfeited STAKE to treasury; cumulative revenue == 2 * fee + STAKE.
        uint96 fee = uint96((uint256(AMOUNT) * 200) / 10_000);
        require(treasuryDelta == uint256(fee) + STAKE, "bountyB treasury delta != fee + STAKE");
        require(core.totalBountiesResolved() >= 2, "expected 2+ resolutions");
        require(core.totalProtocolRevenue() == uint256(fee) * 2 + STAKE, "revenue math");
    }

    // ---- helpers -------------------------------------------------------

    function _postBounty(ClaudelanceCore core, MockCUSD cusd, uint256 pk, string memory tag)
        internal
        returns (uint256 id)
    {
        vm.startBroadcast(pk);
        cusd.approve(address(core), AMOUNT);
        id = core.postBounty(
            0,
            REPO,
            string.concat(REPO, "/issues/", tag),
            keccak256(abi.encodePacked(tag, block.timestamp)),
            AMOUNT,
            SLOTS,
            STAKE,
            DEADLINE,
            true
        );
        vm.stopBroadcast();
    }

    function _claim(ClaudelanceCore core, MockCUSD cusd, uint256 id, uint256 pk) internal {
        vm.startBroadcast(pk);
        cusd.approve(address(core), STAKE);
        core.claimSlot(id);
        vm.stopBroadcast();
    }

    function _submit(ClaudelanceCore core, uint256 id, uint256 pk, string memory pr) internal {
        vm.startBroadcast(pk);
        core.submitPR(id, string.concat(REPO, "/", pr), keccak256(abi.encodePacked(pr)), "");
        vm.stopBroadcast();
    }

    function _attest(ClaudelanceCore core, uint256 id, uint256 pk, address worker, bool passed) internal {
        vm.startBroadcast(pk);
        core.attestCI(id, worker, passed);
        vm.stopBroadcast();
    }

    function _pickWinner(ClaudelanceCore core, uint256 id, uint256 pk, address winner) internal {
        vm.startBroadcast(pk);
        core.pickWinner(id, winner);
        vm.stopBroadcast();
    }

    function _settle(ClaudelanceCore core, uint256 id, address worker) internal {
        // Caller is the deployer (broadcast inherits default), so anyone-can-settle.
        uint256 anyPk = vm.envUint("DEPLOYER_PRIVATE_KEY");
        vm.startBroadcast(anyPk);
        core.settleStake(id, worker);
        vm.stopBroadcast();
    }
}
