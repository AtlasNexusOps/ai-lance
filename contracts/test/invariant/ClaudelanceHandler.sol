// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { CommonBase } from "forge-std/Base.sol";
import { StdCheats } from "forge-std/StdCheats.sol";
import { StdUtils } from "forge-std/StdUtils.sol";

import { ClaudelanceCore } from "../../src/ClaudelanceCore.sol";
import { IClaudelanceCore } from "../../src/interfaces/IClaudelanceCore.sol";
import { MockCUSD } from "../../src/mocks/MockCUSD.sol";
import { MockIdentityRegistry } from "../../src/mocks/MockIdentityRegistry.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @notice Drives Foundry's invariant fuzzer against a `ClaudelanceCore` instance.
contract ClaudelanceHandler is CommonBase, StdCheats, StdUtils {
    ClaudelanceCore public immutable core;
    MockCUSD public immutable cusd;
    MockIdentityRegistry public immutable identity;
    address public immutable treasury;
    address public immutable relayer;

    address[] public actors;
    uint256[] public bountyIds;

    uint256 public totalDepositedByActors;
    uint256 public totalWithdrawnByActors;
    mapping(bytes32 => uint256) public callCounts;

    uint96 internal constant MIN_AMOUNT = 0.5e18;
    uint96 internal constant MAX_AMOUNT = 100e18;
    uint96 internal constant MIN_STAKE = 0.01e18;
    uint96 internal constant MAX_STAKE = 5e18;
    uint64 internal constant MIN_DEADLINE = 1 days;
    uint64 internal constant MAX_DEADLINE = 14 days;

    modifier countCall(bytes32 name) {
        callCounts[name]++;
        _;
    }

    constructor(
        ClaudelanceCore _core,
        MockCUSD _cusd,
        MockIdentityRegistry _identity,
        address _treasury,
        address _relayer,
        address[] memory _actors
    ) {
        core = _core;
        cusd = _cusd;
        identity = _identity;
        treasury = _treasury;
        relayer = _relayer;
        actors = _actors;
        for (uint256 i = 0; i < _actors.length; i++) {
            identity.register(_actors[i]);
        }
    }

    function _actor(uint256 seed) internal view returns (address) {
        return actors[seed % actors.length];
    }

    function _bounty(uint256 seed) internal view returns (uint256 id, bool ok) {
        if (bountyIds.length == 0) return (0, false);
        return (bountyIds[seed % bountyIds.length], true);
    }

    // -- state transitions ---------------------------------------------------

    function postBounty(
        uint256 actorSeed,
        uint96 amount,
        uint96 stake,
        uint8 maxSlots,
        uint64 deadline,
        bool ciRequired
    ) external countCall("postBounty") {
        address poster = _actor(actorSeed);
        amount = uint96(bound(amount, MIN_AMOUNT, MAX_AMOUNT));
        stake = uint96(bound(stake, MIN_STAKE, MAX_STAKE));
        maxSlots = uint8(bound(maxSlots, 1, core.MAX_SLOTS()));
        deadline = uint64(bound(deadline, MIN_DEADLINE, MAX_DEADLINE));

        cusd.mint(poster, amount);
        vm.prank(poster);
        cusd.approve(address(core), type(uint256).max);

        totalDepositedByActors += amount;

        vm.prank(poster);
        try core.postBounty(
            IERC20(address(cusd)), 0, "g/h", "g/h/i/1", bytes32(0), amount, maxSlots, stake, deadline, ciRequired
        ) returns (uint256 id) {
            bountyIds.push(id);
        } catch {
            // refund accounting if the call reverts (won't actually transfer cUSD)
            totalDepositedByActors -= amount;
        }
    }

    function claimSlot(uint256 actorSeed, uint256 bountySeed) external countCall("claimSlot") {
        (uint256 id, bool ok) = _bounty(bountySeed);
        if (!ok) return;
        address worker = _actor(actorSeed);
        IClaudelanceCore.Bounty memory b = core.getBounty(id);
        if (b.stakeRequired > 0) {
            cusd.mint(worker, b.stakeRequired);
            vm.prank(worker);
            cusd.approve(address(core), type(uint256).max);
            totalDepositedByActors += b.stakeRequired;
        }
        vm.prank(worker);
        try core.claimSlot(id) {
            // success
        } catch {
            if (b.stakeRequired > 0) totalDepositedByActors -= b.stakeRequired;
        }
    }

    function submitPR(uint256 actorSeed, uint256 bountySeed) external countCall("submitPR") {
        (uint256 id, bool ok) = _bounty(bountySeed);
        if (!ok) return;
        address worker = _actor(actorSeed);
        vm.prank(worker);
        try core.submitPR(id, "pr", bytes32(uint256(0xabc)), "") {} catch {}
    }

    function attestCI(uint256 actorSeed, uint256 bountySeed, bool passed) external countCall("attestCI") {
        (uint256 id, bool ok) = _bounty(bountySeed);
        if (!ok) return;
        address worker = _actor(actorSeed);
        vm.prank(relayer);
        try core.attestCI(id, worker, passed) {} catch {}
    }

    function pickWinner(uint256 actorSeed, uint256 bountySeed) external countCall("pickWinner") {
        (uint256 id, bool ok) = _bounty(bountySeed);
        if (!ok) return;
        IClaudelanceCore.Bounty memory b = core.getBounty(id);
        address[] memory cs = core.getClaimers(id);
        if (cs.length == 0) return;
        address winner = cs[actorSeed % cs.length];
        vm.prank(b.poster);
        try core.pickWinner(id, winner) {} catch {}
    }

    function cancelExpired(uint256 actorSeed, uint256 bountySeed, uint256 warpBy)
        external
        countCall("cancelExpired")
    {
        (uint256 id, bool ok) = _bounty(bountySeed);
        if (!ok) return;
        IClaudelanceCore.Bounty memory b = core.getBounty(id);
        warpBy = bound(warpBy, 0, 20 days);
        vm.warp(b.deadline + warpBy);
        address caller = _actor(actorSeed);
        vm.prank(caller);
        try core.cancelExpired(id) {} catch {}
    }

    function settleStake(uint256 actorSeed, uint256 bountySeed, uint256 workerSeed)
        external
        countCall("settleStake")
    {
        (uint256 id, bool ok) = _bounty(bountySeed);
        if (!ok) return;
        address[] memory cs = core.getClaimers(id);
        if (cs.length == 0) return;
        address worker = cs[workerSeed % cs.length];
        address caller = _actor(actorSeed);
        vm.prank(caller);
        try core.settleStake(id, worker) {} catch {}
    }

    function withdrawEarnings(uint256 actorSeed) external countCall("withdrawEarnings") {
        address who = _actor(actorSeed);
        uint256 owed = core.earnings(who, address(cusd));
        vm.prank(who);
        try core.withdrawEarnings(IERC20(address(cusd))) {
            totalWithdrawnByActors += owed;
        } catch {}
    }

    function withdrawTreasury() external countCall("withdrawTreasury") {
        uint256 owed = core.earnings(treasury, address(cusd));
        if (owed == 0) return;
        vm.prank(treasury);
        try core.withdrawEarnings(IERC20(address(cusd))) {
            totalWithdrawnByActors += owed;
        } catch {}
    }

    function bountyIdsLength() external view returns (uint256) {
        return bountyIds.length;
    }
}
