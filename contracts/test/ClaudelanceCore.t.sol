// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Test } from "forge-std/Test.sol";
import { ClaudelanceCore } from "../src/ClaudelanceCore.sol";
import { IClaudelanceCore } from "../src/interfaces/IClaudelanceCore.sol";
import { MockCUSD } from "../src/mocks/MockCUSD.sol";
import { MockIdentityRegistry } from "../src/mocks/MockIdentityRegistry.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { IERC721 } from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";

contract ClaudelanceCoreTest is Test {
    ClaudelanceCore internal core;
    MockCUSD internal cusd;
    MockCUSD internal usdc;
    MockIdentityRegistry internal identity;

    address internal owner = makeAddr("owner");
    address internal treasury = makeAddr("treasury");
    address internal relayer = makeAddr("relayer");
    address internal reputationRegistry = makeAddr("reputationRegistry");
    address internal poster = makeAddr("poster");
    address internal w1 = makeAddr("w1");
    address internal w2 = makeAddr("w2");
    address internal w3 = makeAddr("w3");
    address internal stranger = makeAddr("stranger");

    uint96 internal constant AMOUNT = 5e18;
    uint96 internal constant STAKE = 0.25e18;
    uint96 internal constant MIN_BOUNTY = 0.5e18;
    uint8 internal constant MAX_SLOTS = 5;
    uint64 internal constant DEADLINE = 2 days;

    function setUp() public {
        cusd = new MockCUSD();
        usdc = new MockCUSD();
        identity = new MockIdentityRegistry();

        core = new ClaudelanceCore(treasury, relayer, owner, IERC721(address(identity)), reputationRegistry);

        vm.startPrank(owner);
        core.allowToken(IERC20(address(cusd)), MIN_BOUNTY);
        core.allowToken(IERC20(address(usdc)), MIN_BOUNTY);
        vm.stopPrank();

        // Register agent identities for the canonical workers.
        identity.register(w1);
        identity.register(w2);
        identity.register(w3);

        cusd.mint(poster, 100e18);
        cusd.mint(w1, 10e18);
        cusd.mint(w2, 10e18);
        cusd.mint(w3, 10e18);

        vm.prank(poster);
        cusd.approve(address(core), type(uint256).max);
        vm.prank(w1);
        cusd.approve(address(core), type(uint256).max);
        vm.prank(w2);
        cusd.approve(address(core), type(uint256).max);
        vm.prank(w3);
        cusd.approve(address(core), type(uint256).max);
    }

    function _cusd() internal view returns (IERC20) {
        return IERC20(address(cusd));
    }

    function _post() internal returns (uint256) {
        vm.prank(poster);
        return core.postBounty(
            _cusd(),
            0,
            "github.com/employer/repo",
            "github.com/employer/repo/issues/1",
            keccak256("hash"),
            AMOUNT,
            MAX_SLOTS,
            STAKE,
            DEADLINE,
            true
        );
    }

    function _claim(uint256 id, address w) internal {
        vm.prank(w);
        core.claimSlot(id);
    }

    function _submit(uint256 id, address w) internal {
        vm.prank(w);
        core.submitPR(id, "github.com/employer/repo/pull/2", bytes32(uint256(0xabc)), "{}");
    }

    function _attest(uint256 id, address w, bool ok) internal {
        vm.prank(relayer);
        core.attestCI(id, w, ok);
    }

    function _withdraw(address who) internal returns (uint256 paid) {
        paid = core.earnings(who, address(cusd));
        vm.prank(who);
        core.withdrawEarnings(_cusd());
    }

    function _settleAll(uint256 id) internal {
        address[] memory claimers = core.getClaimers(id);
        for (uint256 i = 0; i < claimers.length; i++) {
            core.settleStake(id, claimers[i]);
        }
    }

    function _earnings(address who) internal view returns (uint256) {
        return core.earnings(who, address(cusd));
    }

    function test_PostBounty_TransfersDepositAndEmits() public {
        uint256 posterBalanceBefore = cusd.balanceOf(poster);
        uint256 id = _post();
        assertEq(id, 1);
        assertEq(cusd.balanceOf(poster), posterBalanceBefore - AMOUNT);
        assertEq(cusd.balanceOf(address(core)), AMOUNT);
        IClaudelanceCore.Bounty memory b = core.getBounty(id);
        assertEq(b.poster, poster);
        assertEq(b.amount, AMOUNT);
        assertEq(b.token, address(cusd));
        assertEq(uint8(b.status), uint8(IClaudelanceCore.BountyStatus.Open));
        assertEq(core.bountyCountByType(0), 1);
        assertEq(core.totalBountyVolume(address(cusd)), AMOUNT);
        assertEq(core.uniquePosterCount(), 1);
    }

    function test_PostBounty_RevertsOnInsufficientAllowance() public {
        vm.prank(poster);
        cusd.approve(address(core), 0);
        vm.expectRevert();
        vm.prank(poster);
        core.postBounty(
            _cusd(), 0, "github.com/x/y", "github.com/x/y/issues/1", bytes32(0), AMOUNT, MAX_SLOTS, STAKE, DEADLINE, true
        );
    }

    function test_PostBounty_RevertsOnInvalidParams() public {
        vm.startPrank(poster);
        vm.expectRevert(ClaudelanceCore.InvalidAmount.selector);
        core.postBounty(_cusd(), 0, "x", "x", bytes32(0), 0.1e18, MAX_SLOTS, STAKE, DEADLINE, true);

        vm.expectRevert(ClaudelanceCore.InvalidStake.selector);
        core.postBounty(_cusd(), 0, "x", "x", bytes32(0), AMOUNT, MAX_SLOTS, 0, DEADLINE, true);

        vm.expectRevert(ClaudelanceCore.InvalidSlots.selector);
        core.postBounty(_cusd(), 0, "x", "x", bytes32(0), AMOUNT, 0, STAKE, DEADLINE, true);

        vm.expectRevert(ClaudelanceCore.InvalidSlots.selector);
        core.postBounty(_cusd(), 0, "x", "x", bytes32(0), AMOUNT, 21, STAKE, DEADLINE, true);

        vm.expectRevert(ClaudelanceCore.InvalidDeadline.selector);
        core.postBounty(_cusd(), 0, "x", "x", bytes32(0), AMOUNT, MAX_SLOTS, STAKE, 1 hours, true);

        vm.expectRevert(ClaudelanceCore.InvalidDeadline.selector);
        core.postBounty(_cusd(), 0, "x", "x", bytes32(0), AMOUNT, MAX_SLOTS, STAKE, 30 days, true);

        vm.expectRevert(ClaudelanceCore.InvalidUrl.selector);
        core.postBounty(_cusd(), 0, "", "x", bytes32(0), AMOUNT, MAX_SLOTS, STAKE, DEADLINE, true);

        vm.expectRevert(ClaudelanceCore.InvalidUrl.selector);
        core.postBounty(_cusd(), 0, "x", "", bytes32(0), AMOUNT, MAX_SLOTS, STAKE, DEADLINE, true);
        vm.stopPrank();
    }

    function test_PostBounty_RevertsOnNotAllowedToken() public {
        MockCUSD random = new MockCUSD();
        random.mint(poster, AMOUNT);
        vm.prank(poster);
        random.approve(address(core), type(uint256).max);

        vm.expectRevert(ClaudelanceCore.TokenNotAllowed.selector);
        vm.prank(poster);
        core.postBounty(
            IERC20(address(random)),
            0,
            "x",
            "x",
            bytes32(0),
            AMOUNT,
            MAX_SLOTS,
            STAKE,
            DEADLINE,
            true
        );
    }

    function test_ClaimSlot_LocksStakeAndIncrements() public {
        uint256 id = _post();
        uint256 before = cusd.balanceOf(w1);
        _claim(id, w1);
        assertEq(cusd.balanceOf(w1), before - STAKE);
        assertTrue(core.hasClaimed(id, w1));
        IClaudelanceCore.Bounty memory b = core.getBounty(id);
        assertEq(b.claimedSlots, 1);
        assertEq(core.uniqueWorkerCount(), 1);
    }

    function test_ClaimSlot_RevertsWithoutAgentIdentity() public {
        uint256 id = _post();
        address noId = makeAddr("noIdentity");
        cusd.mint(noId, STAKE);
        vm.prank(noId);
        cusd.approve(address(core), STAKE);

        vm.expectRevert(ClaudelanceCore.NoAgentIdentity.selector);
        vm.prank(noId);
        core.claimSlot(id);
    }

    function test_ClaimSlot_RevertsWhenSlotsFull() public {
        uint256 id = _post();
        address[5] memory workers = [w1, w2, w3, makeAddr("w4"), makeAddr("w5")];
        for (uint256 i = 0; i < workers.length; i++) {
            identity.register(workers[i]);
            cusd.mint(workers[i], STAKE);
            vm.prank(workers[i]);
            cusd.approve(address(core), STAKE);
            _claim(id, workers[i]);
        }
        address w6 = makeAddr("w6");
        identity.register(w6);
        cusd.mint(w6, STAKE);
        vm.prank(w6);
        cusd.approve(address(core), STAKE);
        vm.expectRevert(ClaudelanceCore.SlotsFull.selector);
        vm.prank(w6);
        core.claimSlot(id);
    }

    function test_ClaimSlot_RevertsOnDoubleClaim() public {
        uint256 id = _post();
        _claim(id, w1);
        vm.expectRevert(ClaudelanceCore.AlreadyClaimed.selector);
        vm.prank(w1);
        core.claimSlot(id);
    }

    function test_ClaimSlot_RevertsAfterDeadline() public {
        uint256 id = _post();
        vm.warp(block.timestamp + DEADLINE + 1);
        vm.expectRevert(ClaudelanceCore.DeadlinePassed.selector);
        vm.prank(w1);
        core.claimSlot(id);
    }

    function test_SubmitPR_StoresSubmission() public {
        uint256 id = _post();
        _claim(id, w1);
        _submit(id, w1);
        IClaudelanceCore.Submission memory s = core.getSubmission(id, w1);
        assertEq(s.prUrl, "github.com/employer/repo/pull/2");
        assertEq(s.commitHash, bytes32(uint256(0xabc)));
        assertGt(s.submittedAt, 0);
    }

    function test_SubmitPR_RevertsForNonClaimer() public {
        uint256 id = _post();
        vm.expectRevert(ClaudelanceCore.NotClaimer.selector);
        vm.prank(w1);
        core.submitPR(id, "github.com/x/y/pull/1", bytes32(0), "{}");
    }

    function test_SubmitPR_RevertsOnEmptyUrl() public {
        uint256 id = _post();
        _claim(id, w1);
        vm.expectRevert(ClaudelanceCore.NoSubmission.selector);
        vm.prank(w1);
        core.submitPR(id, "", bytes32(0), "{}");
    }

    function test_AttestCI_OnlyRelayer() public {
        uint256 id = _post();
        _claim(id, w1);
        _submit(id, w1);
        vm.expectRevert(ClaudelanceCore.NotRelayer.selector);
        vm.prank(stranger);
        core.attestCI(id, w1, true);

        _attest(id, w1, true);
        IClaudelanceCore.Submission memory s = core.getSubmission(id, w1);
        assertTrue(s.ciPassed);
    }

    function test_AttestCI_FailsBeforeSubmission() public {
        uint256 id = _post();
        _claim(id, w1);
        vm.expectRevert(ClaudelanceCore.NoSubmission.selector);
        _attest(id, w1, true);
    }

    function test_AttestCI_BlockedWhilePaused() public {
        uint256 id = _post();
        _claim(id, w1);
        _submit(id, w1);

        vm.prank(owner);
        core.pause();

        vm.expectRevert(Pausable.EnforcedPause.selector);
        vm.prank(relayer);
        core.attestCI(id, w1, true);
    }

    function test_AttestCI_FailsForNonClaimer() public {
        uint256 id = _post();
        _claim(id, w1);
        _submit(id, w1);
        vm.expectRevert(ClaudelanceCore.NotClaimer.selector);
        vm.prank(relayer);
        core.attestCI(id, w2, true);
    }

    function test_AttestCI_FailsAfterResolution() public {
        uint256 id = _post();
        _claim(id, w1);
        _submit(id, w1);
        _attest(id, w1, true);
        vm.prank(poster);
        core.pickWinner(id, w1);

        vm.expectRevert(ClaudelanceCore.BountyNotOpen.selector);
        vm.prank(relayer);
        core.attestCI(id, w1, true);
    }

    function test_PickWinner_FeeMathAndPayouts() public {
        uint256 id = _post();
        _claim(id, w1);
        _claim(id, w2);
        _submit(id, w1);
        _submit(id, w2);
        _attest(id, w1, true);
        _attest(id, w2, true);

        vm.prank(poster);
        core.pickWinner(id, w1);

        uint96 expectedFee = uint96((uint256(AMOUNT) * 200) / 10_000);
        uint96 expectedPayout = AMOUNT - expectedFee;

        assertEq(_earnings(treasury), expectedFee, "treasury fee credited via earnings");
        assertEq(_earnings(w1), uint256(expectedPayout), "winner payout only; stake pending settleStake");
        assertEq(_earnings(w2), 0, "loser stake pending settleStake");

        _settleAll(id);
        assertEq(_earnings(w1), uint256(expectedPayout) + STAKE, "winner stake refunded");
        assertEq(_earnings(w2), STAKE, "good-faith loser stake refunded");

        assertEq(core.totalProtocolRevenue(address(cusd)), expectedFee);
        assertEq(core.totalBountiesResolved(), 1);

        IClaudelanceCore.Bounty memory b = core.getBounty(id);
        assertEq(uint8(b.status), uint8(IClaudelanceCore.BountyStatus.Resolved));
        assertEq(b.winner, w1);

        uint256 treasuryBalanceBefore = cusd.balanceOf(treasury);
        _withdraw(treasury);
        assertEq(cusd.balanceOf(treasury), treasuryBalanceBefore + expectedFee);
    }

    function test_PickWinner_OnlyPoster() public {
        uint256 id = _post();
        _claim(id, w1);
        _submit(id, w1);
        _attest(id, w1, true);
        vm.expectRevert(ClaudelanceCore.NotPoster.selector);
        vm.prank(stranger);
        core.pickWinner(id, w1);
    }

    function test_PickWinner_WinnerMustBeEligible() public {
        uint256 id = _post();
        _claim(id, w1);
        vm.expectRevert(ClaudelanceCore.WinnerInvalid.selector);
        vm.prank(poster);
        core.pickWinner(id, w1);

        _submit(id, w1);
        vm.expectRevert(ClaudelanceCore.WinnerInvalid.selector);
        vm.prank(poster);
        core.pickWinner(id, w1);

        _attest(id, w1, false);
        vm.expectRevert(ClaudelanceCore.WinnerInvalid.selector);
        vm.prank(poster);
        core.pickWinner(id, w1);

        vm.expectRevert(ClaudelanceCore.WinnerInvalid.selector);
        vm.prank(poster);
        core.pickWinner(id, w2);
    }

    function test_PickWinner_GoodFaithRefundsAndForfeits() public {
        uint256 id = _post();
        _claim(id, w1);
        _claim(id, w2);
        _claim(id, w3);
        _submit(id, w1);
        _submit(id, w2);
        _submit(id, w3);
        _attest(id, w1, true);
        _attest(id, w2, true);
        _attest(id, w3, false);

        vm.prank(poster);
        core.pickWinner(id, w1);
        _settleAll(id);

        uint96 fee = uint96((uint256(AMOUNT) * 200) / 10_000);
        assertEq(_earnings(w1), uint256(AMOUNT - fee) + STAKE);
        assertEq(_earnings(w2), STAKE);
        assertEq(_earnings(w3), 0);
        assertEq(_earnings(treasury), fee + STAKE);
    }

    function test_PickWinner_SingleSubmitterNoCI() public {
        vm.prank(poster);
        uint256 id = core.postBounty(
            _cusd(),
            0,
            "github.com/x/y",
            "github.com/x/y/issues/1",
            bytes32(0),
            AMOUNT,
            MAX_SLOTS,
            STAKE,
            DEADLINE,
            false
        );
        _claim(id, w1);
        vm.prank(w1);
        core.submitPR(id, "github.com/x/y/pull/3", bytes32(0), "");

        vm.prank(poster);
        core.pickWinner(id, w1);

        IClaudelanceCore.Bounty memory b = core.getBounty(id);
        assertEq(uint8(b.status), uint8(IClaudelanceCore.BountyStatus.Resolved));
    }

    function test_PickWinner_NoCI_RefundsLosersWithSubmission() public {
        vm.prank(poster);
        uint256 id = core.postBounty(
            _cusd(),
            0,
            "github.com/x/y",
            "github.com/x/y/issues/1",
            bytes32(0),
            AMOUNT,
            MAX_SLOTS,
            STAKE,
            DEADLINE,
            false
        );
        _claim(id, w1);
        _claim(id, w2);
        _claim(id, w3);
        vm.prank(w1);
        core.submitPR(id, "github.com/x/y/pull/1", bytes32(uint256(0x1)), "");
        vm.prank(w2);
        core.submitPR(id, "github.com/x/y/pull/2", bytes32(uint256(0x2)), "");

        vm.prank(poster);
        core.pickWinner(id, w1);
        _settleAll(id);

        uint96 fee = uint96((uint256(AMOUNT) * 200) / 10_000);
        assertEq(_earnings(w1), uint256(AMOUNT - fee) + STAKE);
        assertEq(_earnings(w2), STAKE);
        assertEq(_earnings(w3), 0);
        assertEq(_earnings(treasury), fee + STAKE);
    }

    function test_WithdrawEarnings_PaysAndClears() public {
        uint256 id = _post();
        _claim(id, w1);
        _submit(id, w1);
        _attest(id, w1, true);
        vm.prank(poster);
        core.pickWinner(id, w1);

        uint256 expected = _earnings(w1);
        uint256 before = cusd.balanceOf(w1);
        vm.prank(w1);
        core.withdrawEarnings(_cusd());
        assertEq(cusd.balanceOf(w1), before + expected);
        assertEq(_earnings(w1), 0);

        vm.expectRevert(ClaudelanceCore.NothingToWithdraw.selector);
        vm.prank(w1);
        core.withdrawEarnings(_cusd());
    }

    function test_WithdrawEarnings_AllowedWhilePaused() public {
        uint256 id = _post();
        _claim(id, w1);
        _submit(id, w1);
        _attest(id, w1, true);
        vm.prank(poster);
        core.pickWinner(id, w1);

        vm.prank(owner);
        core.pause();

        uint256 owed = _earnings(w1);
        uint256 before = cusd.balanceOf(w1);
        vm.prank(w1);
        core.withdrawEarnings(_cusd());
        assertEq(cusd.balanceOf(w1), before + owed, "earnings must still be withdrawable when paused");
    }

    function test_CancelExpired_RefundsAndForfeits() public {
        uint256 id = _post();
        _claim(id, w1);
        _claim(id, w2);
        _submit(id, w1);
        _attest(id, w1, true);

        vm.expectRevert(ClaudelanceCore.BountyNotExpired.selector);
        core.cancelExpired(id);

        vm.warp(block.timestamp + DEADLINE + core.RESOLUTION_GRACE_PERIOD() + 1);

        core.cancelExpired(id);
        _settleAll(id);

        assertEq(_earnings(poster), AMOUNT, "poster refund credited");
        assertEq(_earnings(w1), STAKE);
        assertEq(_earnings(w2), 0);
        assertEq(_earnings(treasury), STAKE, "w2 stake forfeited (never submitted)");

        IClaudelanceCore.Bounty memory b = core.getBounty(id);
        assertEq(uint8(b.status), uint8(IClaudelanceCore.BountyStatus.Cancelled));

        uint256 posterBefore = cusd.balanceOf(poster);
        vm.prank(poster);
        core.withdrawEarnings(_cusd());
        assertEq(cusd.balanceOf(poster), posterBefore + AMOUNT);
    }

    function test_Pause_BlocksNewBountiesButAllowsResolution() public {
        uint256 id = _post();
        _claim(id, w1);
        _submit(id, w1);
        _attest(id, w1, true);

        vm.prank(owner);
        core.pause();

        vm.expectRevert(Pausable.EnforcedPause.selector);
        vm.prank(poster);
        core.postBounty(
            _cusd(),
            0,
            "github.com/x/y",
            "github.com/x/y/issues/1",
            bytes32(0),
            AMOUNT,
            MAX_SLOTS,
            STAKE,
            DEADLINE,
            true
        );

        vm.expectRevert(Pausable.EnforcedPause.selector);
        vm.prank(w2);
        core.claimSlot(id);

        vm.prank(poster);
        core.pickWinner(id, w1);
        IClaudelanceCore.Bounty memory b = core.getBounty(id);
        assertEq(uint8(b.status), uint8(IClaudelanceCore.BountyStatus.Resolved));
    }

    function test_OnlyOwnerCanPauseAndAdmin() public {
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, stranger));
        vm.prank(stranger);
        core.pause();

        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, stranger));
        vm.prank(stranger);
        core.proposeTreasury(stranger);

        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, stranger));
        vm.prank(stranger);
        core.proposeCIRelayer(stranger);

        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, stranger));
        vm.prank(stranger);
        core.cancelPendingTreasury();

        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, stranger));
        vm.prank(stranger);
        core.cancelPendingCIRelayer();

        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, stranger));
        vm.prank(stranger);
        core.allowToken(_cusd(), 1);

        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, stranger));
        vm.prank(stranger);
        core.setMinBounty(_cusd(), 1);
    }

    function test_Stats_IncrementsCorrectly() public {
        uint256 id = _post();
        _claim(id, w1);
        _submit(id, w1);
        _attest(id, w1, true);
        vm.prank(poster);
        core.pickWinner(id, w1);

        (uint256 vol, uint256 rev, uint256 res, uint256 posters, uint256 workers) = core.getStats(_cusd());
        assertEq(vol, AMOUNT);
        uint96 fee = uint96((uint256(AMOUNT) * 200) / 10_000);
        assertEq(rev, fee);
        assertEq(res, 1);
        assertEq(posters, 1);
        assertEq(workers, 1);
    }

    function test_GetEligibleSubmissions_FiltersCorrectly() public {
        uint256 id = _post();
        _claim(id, w1);
        _claim(id, w2);
        _claim(id, w3);
        _submit(id, w1);
        _submit(id, w2);
        _attest(id, w1, true);
        _attest(id, w2, false);

        address[] memory eligible = core.getEligibleSubmissions(id);
        assertEq(eligible.length, 1);
        assertEq(eligible[0], w1);
    }

    function test_DoubleResolveReverts() public {
        uint256 id = _post();
        _claim(id, w1);
        _submit(id, w1);
        _attest(id, w1, true);
        vm.prank(poster);
        core.pickWinner(id, w1);
        vm.expectRevert(ClaudelanceCore.BountyNotOpen.selector);
        vm.prank(poster);
        core.pickWinner(id, w1);
    }

    function test_BountyTypeAcceptsAnyUint8() public {
        vm.prank(poster);
        uint256 id = core.postBounty(
            _cusd(), 7, "github.com/x/y", "github.com/x/y/issues/1", bytes32(0), AMOUNT, 1, STAKE, DEADLINE, false
        );
        assertEq(core.bountyCountByType(7), 1);
        IClaudelanceCore.Bounty memory b = core.getBounty(id);
        assertEq(b.bountyType, 7);
    }

    function test_SubmitPR_IsOneShot() public {
        uint256 id = _post();
        _claim(id, w1);
        _submit(id, w1);

        vm.expectRevert(ClaudelanceCore.AlreadySubmitted.selector);
        vm.prank(w1);
        core.submitPR(id, "github.com/employer/repo/pull/99", bytes32(uint256(0xdef)), "{}");

        IClaudelanceCore.Submission memory s = core.getSubmission(id, w1);
        assertEq(s.prUrl, "github.com/employer/repo/pull/2");
        assertEq(s.commitHash, bytes32(uint256(0xabc)));
    }

    function test_SubmitPR_OneShot_PreventsCIBypass() public {
        uint256 id = _post();
        _claim(id, w1);
        _submit(id, w1);
        _attest(id, w1, true);

        vm.expectRevert(ClaudelanceCore.AlreadySubmitted.selector);
        vm.prank(w1);
        core.submitPR(id, "github.com/employer/repo/pull/666", bytes32(uint256(0xbad)), "malicious");

        IClaudelanceCore.Submission memory s = core.getSubmission(id, w1);
        assertTrue(s.ciPassed);
        assertEq(s.prUrl, "github.com/employer/repo/pull/2");
    }

    function test_CancelExpired_GracePeriod_RejectsThirdParty() public {
        uint256 id = _post();
        _claim(id, w1);
        _submit(id, w1);
        _attest(id, w1, true);

        vm.warp(block.timestamp + DEADLINE + 1);

        vm.expectRevert(ClaudelanceCore.GracePeriodActive.selector);
        vm.prank(stranger);
        core.cancelExpired(id);

        vm.expectRevert(ClaudelanceCore.GracePeriodActive.selector);
        vm.prank(w2);
        core.cancelExpired(id);

        IClaudelanceCore.Bounty memory b = core.getBounty(id);
        assertEq(uint8(b.status), uint8(IClaudelanceCore.BountyStatus.Open));
    }

    function test_CancelExpired_GracePeriod_PosterCanCancelImmediately() public {
        uint256 id = _post();
        _claim(id, w1);
        _submit(id, w1);
        _attest(id, w1, true);

        vm.warp(block.timestamp + DEADLINE + 1);

        vm.prank(poster);
        core.cancelExpired(id);

        assertEq(_earnings(poster), AMOUNT);
        IClaudelanceCore.Bounty memory b = core.getBounty(id);
        assertEq(uint8(b.status), uint8(IClaudelanceCore.BountyStatus.Cancelled));
    }

    function test_CancelExpired_AfterGrace_AnyoneCanCancel() public {
        uint256 id = _post();
        _claim(id, w1);
        _submit(id, w1);
        _attest(id, w1, true);

        vm.warp(block.timestamp + DEADLINE + core.RESOLUTION_GRACE_PERIOD() + 1);

        vm.prank(stranger);
        core.cancelExpired(id);
        core.settleStake(id, w1);

        assertEq(_earnings(poster), AMOUNT);
        assertEq(_earnings(w1), STAKE);
    }

    function test_CancelExpired_GraceProtectsWinnerFromGriefRace() public {
        uint256 id = _post();
        _claim(id, w1);
        _submit(id, w1);
        _attest(id, w1, true);

        vm.warp(block.timestamp + DEADLINE + 1);

        vm.expectRevert(ClaudelanceCore.GracePeriodActive.selector);
        vm.prank(stranger);
        core.cancelExpired(id);

        vm.prank(poster);
        core.pickWinner(id, w1);
        core.settleStake(id, w1);

        uint96 fee = uint96((uint256(AMOUNT) * 200) / 10_000);
        assertEq(_earnings(w1), uint256(AMOUNT - fee) + STAKE);
        IClaudelanceCore.Bounty memory b = core.getBounty(id);
        assertEq(uint8(b.status), uint8(IClaudelanceCore.BountyStatus.Resolved));
    }

    function test_Constructor_EmitsGenesisEvents() public {
        vm.expectEmit(true, true, false, false);
        emit IClaudelanceCore.TreasuryUpdated(address(0), treasury);
        vm.expectEmit(true, true, false, false);
        emit IClaudelanceCore.CIRelayerUpdated(address(0), relayer);
        new ClaudelanceCore(treasury, relayer, owner, IERC721(address(identity)), reputationRegistry);
    }

    function test_Constructor_RevertsOnZeroAddresses() public {
        vm.expectRevert(ClaudelanceCore.InvalidAddress.selector);
        new ClaudelanceCore(address(0), relayer, owner, IERC721(address(identity)), reputationRegistry);
        vm.expectRevert(ClaudelanceCore.InvalidAddress.selector);
        new ClaudelanceCore(treasury, address(0), owner, IERC721(address(identity)), reputationRegistry);
        vm.expectRevert(ClaudelanceCore.InvalidAddress.selector);
        new ClaudelanceCore(treasury, relayer, owner, IERC721(address(0)), reputationRegistry);
        vm.expectRevert(ClaudelanceCore.InvalidAddress.selector);
        new ClaudelanceCore(treasury, relayer, owner, IERC721(address(identity)), address(0));
    }

    function test_ProposeTreasury_StoresPending() public {
        address newT = makeAddr("newT");
        vm.expectEmit(true, false, false, true);
        emit IClaudelanceCore.TreasuryProposed(newT, uint64(block.timestamp + core.ADMIN_TIMELOCK()));
        vm.prank(owner);
        core.proposeTreasury(newT);

        (address proposed, uint64 effectiveAt) = core.pendingTreasury();
        assertEq(proposed, newT);
        assertEq(effectiveAt, uint64(block.timestamp + core.ADMIN_TIMELOCK()));
        assertEq(core.treasury(), treasury, "treasury not yet rotated");
    }

    function test_ApplyTreasury_RevertsBeforeTimelock() public {
        address newT = makeAddr("newT");
        vm.prank(owner);
        core.proposeTreasury(newT);
        vm.expectRevert(ClaudelanceCore.TimelockNotElapsed.selector);
        core.applyTreasury();
    }

    function test_ApplyTreasury_RevertsAfterValidityWindow() public {
        address newT = makeAddr("newT");
        vm.prank(owner);
        core.proposeTreasury(newT);

        vm.warp(block.timestamp + core.ADMIN_TIMELOCK() + core.PROPOSAL_VALIDITY_WINDOW() + 1);
        vm.expectRevert(ClaudelanceCore.ProposalExpired.selector);
        core.applyTreasury();
    }

    function test_ApplyCIRelayer_RevertsAfterValidityWindow() public {
        address newR = makeAddr("newR");
        vm.prank(owner);
        core.proposeCIRelayer(newR);

        vm.warp(block.timestamp + core.ADMIN_TIMELOCK() + core.PROPOSAL_VALIDITY_WINDOW() + 1);
        vm.expectRevert(ClaudelanceCore.ProposalExpired.selector);
        core.applyCIRelayer();
    }

    function test_ApplyTreasury_AfterTimelockRotates() public {
        address newT = makeAddr("newT");
        vm.prank(owner);
        core.proposeTreasury(newT);

        vm.warp(block.timestamp + core.ADMIN_TIMELOCK());
        vm.expectEmit(true, true, false, false);
        emit IClaudelanceCore.TreasuryUpdated(treasury, newT);
        core.applyTreasury();
        assertEq(core.treasury(), newT);

        (address proposed,) = core.pendingTreasury();
        assertEq(proposed, address(0), "pending cleared after apply");
    }

    function test_ApplyTreasury_RevertsIfNoPending() public {
        vm.expectRevert(ClaudelanceCore.NoPendingChange.selector);
        core.applyTreasury();
    }

    function test_CancelPendingTreasury_Clears() public {
        address newT = makeAddr("newT");
        vm.prank(owner);
        core.proposeTreasury(newT);

        vm.expectEmit(true, false, false, false);
        emit IClaudelanceCore.TreasuryProposalCancelled(newT);
        vm.prank(owner);
        core.cancelPendingTreasury();

        (address proposed,) = core.pendingTreasury();
        assertEq(proposed, address(0));
    }

    function test_CancelPendingTreasury_RevertsIfNoPending() public {
        vm.prank(owner);
        vm.expectRevert(ClaudelanceCore.NoPendingChange.selector);
        core.cancelPendingTreasury();
    }

    function test_ProposeTreasury_RejectsZeroOrSelf() public {
        vm.startPrank(owner);
        vm.expectRevert(ClaudelanceCore.InvalidAddress.selector);
        core.proposeTreasury(address(0));
        vm.expectRevert(ClaudelanceCore.InvalidAddress.selector);
        core.proposeTreasury(address(core));
        vm.stopPrank();
    }

    function test_ProposeCIRelayer_FullCycle() public {
        address newR = makeAddr("newR");

        vm.expectEmit(true, false, false, true);
        emit IClaudelanceCore.CIRelayerProposed(newR, uint64(block.timestamp + core.ADMIN_TIMELOCK()));
        vm.prank(owner);
        core.proposeCIRelayer(newR);

        vm.expectRevert(ClaudelanceCore.TimelockNotElapsed.selector);
        core.applyCIRelayer();

        vm.warp(block.timestamp + core.ADMIN_TIMELOCK());

        vm.expectEmit(true, true, false, false);
        emit IClaudelanceCore.CIRelayerUpdated(relayer, newR);
        core.applyCIRelayer();
        assertEq(core.ciRelayer(), newR);

        uint256 id = _post();
        _claim(id, w1);
        _submit(id, w1);
        vm.expectRevert(ClaudelanceCore.NotRelayer.selector);
        vm.prank(relayer);
        core.attestCI(id, w1, true);

        vm.prank(newR);
        core.attestCI(id, w1, true);
    }

    function test_ApplyCIRelayer_RevertsIfNoPending() public {
        vm.expectRevert(ClaudelanceCore.NoPendingChange.selector);
        core.applyCIRelayer();
    }

    function test_ProposeCIRelayer_RejectsZero() public {
        vm.prank(owner);
        vm.expectRevert(ClaudelanceCore.InvalidAddress.selector);
        core.proposeCIRelayer(address(0));
    }

    function test_CancelPendingCIRelayer() public {
        address newR = makeAddr("newR");
        vm.prank(owner);
        core.proposeCIRelayer(newR);

        vm.expectEmit(true, false, false, false);
        emit IClaudelanceCore.CIRelayerProposalCancelled(newR);
        vm.prank(owner);
        core.cancelPendingCIRelayer();

        vm.expectRevert(ClaudelanceCore.NoPendingChange.selector);
        vm.prank(owner);
        core.cancelPendingCIRelayer();
    }

    function test_Ownable2Step_RequiresAccept() public {
        address newOwner = makeAddr("newOwner");
        vm.prank(owner);
        core.transferOwnership(newOwner);
        assertEq(core.owner(), owner, "owner stays until acceptOwnership");
        assertEq(core.pendingOwner(), newOwner);

        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, stranger));
        vm.prank(stranger);
        core.acceptOwnership();

        vm.prank(newOwner);
        core.acceptOwnership();
        assertEq(core.owner(), newOwner);
        assertEq(core.pendingOwner(), address(0));
    }

    function test_RescueERC20_TransfersStrayTokenAndEmits() public {
        MockCUSD other = new MockCUSD();
        other.mint(address(core), 7e18);
        address rescueTo = makeAddr("rescueTo");

        vm.expectEmit(true, true, false, true);
        emit IClaudelanceCore.ERC20Rescued(address(other), rescueTo, 7e18);

        vm.prank(owner);
        core.rescueERC20(IERC20(address(other)), rescueTo, 7e18);

        assertEq(other.balanceOf(rescueTo), 7e18);
        assertEq(other.balanceOf(address(core)), 0);
    }

    function test_RescueERC20_RejectsAllowedToken() public {
        vm.prank(owner);
        vm.expectRevert(ClaudelanceCore.CannotRescueEscrowToken.selector);
        core.rescueERC20(_cusd(), owner, 1);
    }

    function test_RescueERC20_RejectsZeroRecipient() public {
        MockCUSD other = new MockCUSD();
        other.mint(address(core), 1);
        vm.prank(owner);
        vm.expectRevert(ClaudelanceCore.InvalidAddress.selector);
        core.rescueERC20(IERC20(address(other)), address(0), 1);
    }

    function test_RescueERC20_OnlyOwner() public {
        MockCUSD other = new MockCUSD();
        other.mint(address(core), 1);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, stranger));
        vm.prank(stranger);
        core.rescueERC20(IERC20(address(other)), stranger, 1);
    }

    function test_Events_PostBountyEmitsExpectedFields() public {
        bytes32 reqHash = keccak256("hash");
        vm.expectEmit(true, true, true, true);
        emit IClaudelanceCore.BountyPosted(
            1,
            poster,
            address(cusd),
            address(0),
            0,
            AMOUNT,
            STAKE,
            MAX_SLOTS,
            "github.com/employer/repo",
            reqHash
        );

        vm.prank(poster);
        core.postBounty(
            _cusd(),
            0,
            "github.com/employer/repo",
            "github.com/employer/repo/issues/1",
            reqHash,
            AMOUNT,
            MAX_SLOTS,
            STAKE,
            DEADLINE,
            true
        );
    }

    function test_Events_SlotClaimedEmitted() public {
        uint256 id = _post();
        vm.expectEmit(true, true, false, false);
        emit IClaudelanceCore.SlotClaimed(id, w1);
        vm.prank(w1);
        core.claimSlot(id);
    }

    function test_Events_PRSubmittedAndCIAttestedEmit() public {
        uint256 id = _post();
        _claim(id, w1);

        vm.expectEmit(true, true, false, true);
        emit IClaudelanceCore.PRSubmitted(id, w1, "github.com/employer/repo/pull/2", bytes32(uint256(0xabc)));
        vm.prank(w1);
        core.submitPR(id, "github.com/employer/repo/pull/2", bytes32(uint256(0xabc)), "{}");

        vm.expectEmit(true, true, false, true);
        emit IClaudelanceCore.CIAttested(id, w1, true);
        vm.prank(relayer);
        core.attestCI(id, w1, true);
    }

    function test_Events_PickWinnerEmitsResolutionAndRevenue() public {
        uint256 id = _post();
        _claim(id, w1);
        _submit(id, w1);
        _attest(id, w1, true);

        uint96 fee = uint96((uint256(AMOUNT) * 200) / 10_000);
        uint96 payout = AMOUNT - fee;

        vm.expectEmit(true, false, false, true);
        emit IClaudelanceCore.ProtocolRevenueAccrued(address(cusd), fee, fee);
        vm.expectEmit(true, true, false, true);
        emit IClaudelanceCore.BountyResolved(id, w1, payout, fee);

        vm.prank(poster);
        core.pickWinner(id, w1);

        vm.expectEmit(true, true, false, true);
        emit IClaudelanceCore.StakeRefunded(id, w1, STAKE);
        core.settleStake(id, w1);
    }

    function test_SettleStake_RevertsWhileOpen() public {
        uint256 id = _post();
        _claim(id, w1);
        vm.expectRevert(ClaudelanceCore.BountyNotResolved.selector);
        core.settleStake(id, w1);
    }

    function test_SettleStake_RevertsForNonClaimer() public {
        uint256 id = _post();
        _claim(id, w1);
        _submit(id, w1);
        _attest(id, w1, true);
        vm.prank(poster);
        core.pickWinner(id, w1);

        vm.expectRevert(ClaudelanceCore.NotClaimer.selector);
        core.settleStake(id, stranger);
    }

    function test_SettleStake_DoubleSettleReverts() public {
        uint256 id = _post();
        _claim(id, w1);
        _submit(id, w1);
        _attest(id, w1, true);
        vm.prank(poster);
        core.pickWinner(id, w1);

        core.settleStake(id, w1);
        vm.expectRevert(ClaudelanceCore.StakeAlreadySettled.selector);
        core.settleStake(id, w1);
    }

    function test_SettleStake_PermissionlessCallerForForfeit() public {
        uint256 id = _post();
        _claim(id, w1);
        _claim(id, w2);
        _submit(id, w1);
        _attest(id, w1, true);
        vm.prank(poster);
        core.pickWinner(id, w1);

        vm.prank(stranger);
        core.settleStake(id, w2);
        assertEq(_earnings(treasury), uint256(uint96((uint256(AMOUNT) * 200) / 10_000)) + STAKE);
    }

    function testFuzz_PickWinner_FeeMathIsConsistent(uint96 amount) public {
        amount = uint96(bound(uint256(amount), uint256(core.minBounty(address(cusd))), type(uint96).max - STAKE));

        cusd.mint(poster, amount);
        cusd.mint(w1, STAKE);
        vm.prank(poster);
        cusd.approve(address(core), type(uint256).max);
        vm.prank(w1);
        cusd.approve(address(core), type(uint256).max);

        vm.prank(poster);
        uint256 id = core.postBounty(
            _cusd(), 0, "github.com/x/y", "github.com/x/y/issues/1", bytes32(0), amount, 1, STAKE, DEADLINE, false
        );
        _claim(id, w1);
        vm.prank(w1);
        core.submitPR(id, "github.com/x/y/pull/1", bytes32(uint256(0xabc)), "");

        vm.prank(poster);
        core.pickWinner(id, w1);
        core.settleStake(id, w1);

        uint256 fee = (uint256(amount) * core.PROTOCOL_FEE_BPS()) / core.BPS_DENOMINATOR();
        uint256 payout = uint256(amount) - fee;

        assertEq(payout + fee, uint256(amount), "payout + fee must equal amount");
        assertEq(_earnings(treasury), fee, "treasury fee credited via earnings");
        assertEq(_earnings(w1), payout + STAKE, "winner earnings = payout + stake refund");
    }

    function test_Events_WithdrawalAndCancelEmit() public {
        uint256 id = _post();
        _claim(id, w1);
        _submit(id, w1);
        _attest(id, w1, true);
        vm.prank(poster);
        core.pickWinner(id, w1);

        uint256 owed = _earnings(w1);
        vm.expectEmit(true, true, false, true);
        emit IClaudelanceCore.EarningsWithdrawn(w1, address(cusd), owed);
        vm.prank(w1);
        core.withdrawEarnings(_cusd());

        uint256 id2 = _post();
        vm.warp(block.timestamp + DEADLINE + 1);
        vm.expectEmit(true, true, false, true);
        emit IClaudelanceCore.BountyCancelled(id2, poster, AMOUNT);
        vm.prank(poster);
        core.cancelExpired(id2);
    }

    // ---------------------------------------------------------------- //
    //                          Multi-token                             //
    // ---------------------------------------------------------------- //

    function test_AllowToken_OnlyOwnerAndOneWay() public {
        MockCUSD newToken = new MockCUSD();
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, stranger));
        vm.prank(stranger);
        core.allowToken(IERC20(address(newToken)), 1);

        vm.expectEmit(true, false, false, true);
        emit IClaudelanceCore.TokenAllowed(address(newToken), 1e18);
        vm.prank(owner);
        core.allowToken(IERC20(address(newToken)), 1e18);

        assertTrue(core.allowedToken(address(newToken)));
        assertEq(core.minBounty(address(newToken)), 1e18);

        vm.expectRevert(ClaudelanceCore.TokenAlreadyAllowed.selector);
        vm.prank(owner);
        core.allowToken(IERC20(address(newToken)), 2e18);
    }

    function test_AllowToken_RejectsZero() public {
        vm.expectRevert(ClaudelanceCore.InvalidAddress.selector);
        vm.prank(owner);
        core.allowToken(IERC20(address(0)), 1e18);
    }

    function test_SetMinBounty_AdjustsFloor() public {
        vm.expectEmit(true, false, false, true);
        emit IClaudelanceCore.MinBountyUpdated(address(cusd), 2e18);
        vm.prank(owner);
        core.setMinBounty(_cusd(), 2e18);
        assertEq(core.minBounty(address(cusd)), 2e18);
    }

    function test_SetMinBounty_RejectsUnallowed() public {
        MockCUSD newToken = new MockCUSD();
        vm.expectRevert(ClaudelanceCore.TokenNotAllowed.selector);
        vm.prank(owner);
        core.setMinBounty(IERC20(address(newToken)), 1e18);
    }

    // ---------------------------------------------------------------- //
    //                         Direct hire                              //
    // ---------------------------------------------------------------- //

    function test_PostDirectHire_OnlyTargetCanClaim() public {
        vm.prank(poster);
        uint256 id = core.postDirectHire(
            _cusd(),
            w1,
            0,
            "github.com/x/y",
            "github.com/x/y/issues/1",
            bytes32(0),
            AMOUNT,
            STAKE,
            DEADLINE
        );

        IClaudelanceCore.Bounty memory b = core.getBounty(id);
        assertEq(b.targetWorker, w1);
        assertEq(b.maxSlots, 1, "direct hire forces maxSlots=1");
        assertFalse(b.ciRequired, "direct hire forces ciRequired=false");

        vm.expectRevert(ClaudelanceCore.NotTargetedWorker.selector);
        vm.prank(w2);
        core.claimSlot(id);

        _claim(id, w1);
        assertTrue(core.hasClaimed(id, w1));
    }

    function test_PostDirectHire_RevertsOnZeroTarget() public {
        vm.expectRevert(ClaudelanceCore.InvalidAddress.selector);
        vm.prank(poster);
        core.postDirectHire(
            _cusd(), address(0), 0, "x", "x", bytes32(0), AMOUNT, STAKE, DEADLINE
        );
    }

    function test_PostDirectHire_RevertsOnZeroStake() public {
        vm.expectRevert(ClaudelanceCore.InvalidStake.selector);
        vm.prank(poster);
        core.postDirectHire(_cusd(), w1, 0, "x", "x", bytes32(0), AMOUNT, 0, DEADLINE);
    }

    function test_PostDirectHire_EmitsTargetInEvent() public {
        bytes32 reqHash = keccak256("dh");
        vm.expectEmit(true, true, true, true);
        emit IClaudelanceCore.BountyPosted(
            1, poster, address(cusd), w1, 0, AMOUNT, STAKE, 1, "github.com/x/y", reqHash
        );

        vm.prank(poster);
        core.postDirectHire(_cusd(), w1, 0, "github.com/x/y", "github.com/x/y/issues/1", reqHash, AMOUNT, STAKE, DEADLINE);
    }

    function test_PostDirectHire_E2EFlow() public {
        vm.prank(poster);
        uint256 id = core.postDirectHire(
            _cusd(),
            w1,
            0,
            "github.com/x/y",
            "github.com/x/y/issues/1",
            bytes32(0),
            AMOUNT,
            STAKE,
            DEADLINE
        );
        _claim(id, w1);
        vm.prank(w1);
        core.submitPR(id, "github.com/x/y/pull/1", bytes32(uint256(0x1)), "{}");

        vm.prank(poster);
        core.pickWinner(id, w1);
        core.settleStake(id, w1);

        uint96 fee = uint96((uint256(AMOUNT) * 200) / 10_000);
        assertEq(_earnings(w1), uint256(AMOUNT - fee) + STAKE);
        assertEq(_earnings(treasury), fee);
    }

    function test_PostBounty_RevertsOnZeroStake() public {
        vm.expectRevert(ClaudelanceCore.InvalidStake.selector);
        vm.prank(poster);
        core.postBounty(
            _cusd(), 0, "github.com/x/y", "github.com/x/y/issues/1", bytes32(0), AMOUNT, 1, 0, DEADLINE, false
        );
    }

    function test_MultiToken_IsolatedAccounting() public {
        usdc.mint(poster, 100e18);
        usdc.mint(w1, 10e18);
        vm.prank(poster);
        usdc.approve(address(core), type(uint256).max);
        vm.prank(w1);
        usdc.approve(address(core), type(uint256).max);

        uint256 cusdId = _post();
        vm.prank(poster);
        uint256 usdcId = core.postBounty(
            IERC20(address(usdc)),
            0,
            "github.com/x/y",
            "github.com/x/y/issues/2",
            bytes32(0),
            3e18,
            1,
            STAKE,
            DEADLINE,
            false
        );

        _claim(cusdId, w1);
        _submit(cusdId, w1);
        _attest(cusdId, w1, true);
        vm.prank(poster);
        core.pickWinner(cusdId, w1);

        _claim(usdcId, w1);
        vm.prank(w1);
        core.submitPR(usdcId, "github.com/x/y/pull/2", bytes32(0), "");
        vm.prank(poster);
        core.pickWinner(usdcId, w1);

        assertEq(core.totalBountyVolume(address(cusd)), AMOUNT);
        assertEq(core.totalBountyVolume(address(usdc)), 3e18);
        assertGt(core.totalProtocolRevenue(address(cusd)), 0);
        assertGt(core.totalProtocolRevenue(address(usdc)), 0);
        assertGt(core.earnings(w1, address(cusd)), 0);
        assertGt(core.earnings(w1, address(usdc)), 0);

        uint256 cusdBefore = cusd.balanceOf(w1);
        uint256 usdcBefore = usdc.balanceOf(w1);
        vm.prank(w1);
        core.withdrawEarnings(_cusd());
        vm.prank(w1);
        core.withdrawEarnings(IERC20(address(usdc)));
        assertGt(cusd.balanceOf(w1), cusdBefore);
        assertGt(usdc.balanceOf(w1), usdcBefore);
    }
}
