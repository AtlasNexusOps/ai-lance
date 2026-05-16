// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Script, console2 } from "forge-std/Script.sol";
import { ClaudelanceCore } from "../src/ClaudelanceCore.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @notice Seeds the deployed core with a tier-mixed bounty batch.
/// @dev    Counts must match `tier` length. Run with --broadcast against the target RPC.
contract SeedBounties is Script {
    struct Seed {
        uint96 amount;
        uint8 maxSlots;
        uint64 deadline;
        string repo;
        string issueUrl;
    }

    function run() external {
        address coreAddr = vm.envAddress("CORE_ADDRESS");
        address cusdAddr = vm.envAddress("CUSD_ADDRESS");
        ClaudelanceCore core = ClaudelanceCore(coreAddr);
        IERC20 cusd = IERC20(cusdAddr);

        Seed[15] memory seeds = _seeds();

        vm.startBroadcast();
        uint256 totalNeeded;
        for (uint256 i = 0; i < seeds.length; i++) {
            totalNeeded += seeds[i].amount;
        }
        cusd.approve(coreAddr, totalNeeded);

        for (uint256 i = 0; i < seeds.length; i++) {
            Seed memory s = seeds[i];
            uint96 stake = uint96((uint256(s.amount) * 500) / 10_000);
            uint256 id = core.postBounty(
                0,
                s.repo,
                s.issueUrl,
                keccak256(abi.encodePacked(s.repo, s.issueUrl, i)),
                s.amount,
                s.maxSlots,
                stake,
                s.deadline,
                true
            );
            console2.log("posted bounty", id, s.amount);
        }
        vm.stopBroadcast();
    }

    function _seeds() internal pure returns (Seed[15] memory s) {
        s[0] = Seed(0.75e18, 3, 2 days, "github.com/yeheskieltame/claudelance-sandbox", "github.com/yeheskieltame/claudelance-sandbox/issues/1");
        s[1] = Seed(0.75e18, 3, 2 days, "github.com/yeheskieltame/claudelance-sandbox", "github.com/yeheskieltame/claudelance-sandbox/issues/2");
        s[2] = Seed(1e18, 3, 2 days, "github.com/yeheskieltame/claudelance-sandbox", "github.com/yeheskieltame/claudelance-sandbox/issues/3");
        s[3] = Seed(1e18, 3, 2 days, "github.com/yeheskieltame/claudelance-sandbox", "github.com/yeheskieltame/claudelance-sandbox/issues/4");
        s[4] = Seed(1e18, 3, 2 days, "github.com/yeheskieltame/claudelance-sandbox", "github.com/yeheskieltame/claudelance-sandbox/issues/5");

        s[5] = Seed(2e18, 4, 3 days, "github.com/yeheskieltame/claudelance-sandbox", "github.com/yeheskieltame/claudelance-sandbox/issues/6");
        s[6] = Seed(2e18, 4, 3 days, "github.com/yeheskieltame/claudelance-sandbox", "github.com/yeheskieltame/claudelance-sandbox/issues/7");
        s[7] = Seed(2.5e18, 5, 3 days, "github.com/yeheskieltame/claudelance-sandbox", "github.com/yeheskieltame/claudelance-sandbox/issues/8");
        s[8] = Seed(2.5e18, 5, 3 days, "github.com/yeheskieltame/claudelance-sandbox", "github.com/yeheskieltame/claudelance-sandbox/issues/9");
        s[9] = Seed(3e18, 5, 3 days, "github.com/yeheskieltame/claudelance-sandbox", "github.com/yeheskieltame/claudelance-sandbox/issues/10");

        s[10] = Seed(4e18, 5, 5 days, "github.com/yeheskieltame/claudelance-sandbox", "github.com/yeheskieltame/claudelance-sandbox/issues/11");
        s[11] = Seed(5e18, 5, 5 days, "github.com/yeheskieltame/claudelance-sandbox", "github.com/yeheskieltame/claudelance-sandbox/issues/12");
        s[12] = Seed(6e18, 5, 5 days, "github.com/yeheskieltame/claudelance-sandbox", "github.com/yeheskieltame/claudelance-sandbox/issues/13");
        s[13] = Seed(8e18, 5, 5 days, "github.com/yeheskieltame/claudelance-sandbox", "github.com/yeheskieltame/claudelance-sandbox/issues/14");

        s[14] = Seed(12e18, 5, 7 days, "github.com/yeheskieltame/claudelance-sandbox", "github.com/yeheskieltame/claudelance-sandbox/issues/15");
    }
}
