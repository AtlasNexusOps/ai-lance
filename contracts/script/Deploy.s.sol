// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Script, console2 } from "forge-std/Script.sol";
import { ClaudelanceCore } from "../src/ClaudelanceCore.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { IERC721 } from "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/// @notice Deploys ClaudelanceCore v2 and wires the initial token whitelist
///         (cUSD + CELO + USDC). Reads addresses from env so the same script
///         works for Sepolia and mainnet.
contract Deploy is Script {
    function run() external returns (ClaudelanceCore core) {
        address treasury = vm.envAddress("TREASURY_ADDRESS");
        address relayer = vm.envAddress("CI_RELAYER_ADDRESS");
        address owner = vm.envOr("OWNER_ADDRESS", msg.sender);
        address identityRegistry = vm.envAddress("IDENTITY_REGISTRY_ADDRESS");
        address reputationRegistry = vm.envAddress("REPUTATION_REGISTRY_ADDRESS");

        address cusd = vm.envAddress("CUSD_ADDRESS");
        address celo = vm.envAddress("CELO_ADDRESS");
        address usdc = vm.envOr("USDC_ADDRESS", address(0));

        uint256 minCusd = vm.envOr("MIN_BOUNTY_CUSD", uint256(0.5e18));
        uint256 minCelo = vm.envOr("MIN_BOUNTY_CELO", uint256(1e18));
        uint256 minUsdc = vm.envOr("MIN_BOUNTY_USDC", uint256(0.5e6));

        bool allowShared = vm.envOr("ALLOW_SHARED_ADMIN_WALLETS", false);

        require(treasury != address(0), "TREASURY_ADDRESS missing");
        require(relayer != address(0), "CI_RELAYER_ADDRESS missing");
        require(identityRegistry != address(0), "IDENTITY_REGISTRY_ADDRESS missing");
        require(reputationRegistry != address(0), "REPUTATION_REGISTRY_ADDRESS missing");
        require(cusd != address(0), "CUSD_ADDRESS missing");
        require(celo != address(0), "CELO_ADDRESS missing");

        bool isMainnet = block.chainid == 42_220;
        if (isMainnet || !allowShared) {
            address deployer = msg.sender;
            require(owner != treasury, "owner == treasury");
            require(owner != relayer, "owner == relayer");
            require(treasury != relayer, "treasury == relayer");
            require(deployer != owner, "deployer == owner");
            require(deployer != treasury, "deployer == treasury");
            require(deployer != relayer, "deployer == relayer");
        }

        vm.startBroadcast();
        core = new ClaudelanceCore(treasury, relayer, owner, IERC721(identityRegistry), reputationRegistry);
        vm.stopBroadcast();

        // The owner (Safe on mainnet) must whitelist tokens AFTER deploy in a separate tx.
        // For Sepolia where deployer == owner is allowed (ALLOW_SHARED_ADMIN_WALLETS=true),
        // we wire the whitelist here so the chain is immediately usable.
        if (allowShared && !isMainnet && msg.sender == owner) {
            vm.startBroadcast();
            core.allowToken(IERC20(cusd), minCusd);
            core.allowToken(IERC20(celo), minCelo);
            if (usdc != address(0)) core.allowToken(IERC20(usdc), minUsdc);
            vm.stopBroadcast();
        }

        console2.log("ClaudelanceCore v2 deployed:", address(core));
        console2.log("  identity:  ", identityRegistry);
        console2.log("  reputation:", reputationRegistry);
        console2.log("  treasury:  ", treasury);
        console2.log("  relayer:   ", relayer);
        console2.log("  owner:     ", owner);
        if (isMainnet) {
            console2.log("MAINNET DEPLOY -- owner must call allowToken via Safe");
        }

        _writeDeployment(address(core), cusd, celo, usdc, treasury, relayer, owner, identityRegistry, reputationRegistry);
    }

    function _writeDeployment(
        address core,
        address cusd,
        address celo,
        address usdc,
        address treasury,
        address relayer,
        address owner,
        address identity,
        address reputation
    ) internal {
        string memory chain = _chainName();
        string memory path = string.concat("./deployments/", chain, ".json");
        string memory json = string.concat(
            "{\n",
            '  "chainId": ',
            vm.toString(block.chainid),
            ",\n",
            '  "core": "',
            vm.toString(core),
            '",\n',
            '  "tokens": {\n',
            '    "cUSD": "',
            vm.toString(cusd),
            '",\n',
            '    "CELO": "',
            vm.toString(celo),
            '",\n',
            '    "USDC": "',
            vm.toString(usdc),
            '"\n  },\n',
            '  "identityRegistry": "',
            vm.toString(identity),
            '",\n',
            '  "reputationRegistry": "',
            vm.toString(reputation),
            '",\n',
            '  "treasury": "',
            vm.toString(treasury),
            '",\n',
            '  "ciRelayer": "',
            vm.toString(relayer),
            '",\n',
            '  "owner": "',
            vm.toString(owner),
            '",\n',
            '  "deployedAt": ',
            vm.toString(block.timestamp),
            "\n}\n"
        );
        vm.writeFile(path, json);
        console2.log("wrote", path);
    }

    function _chainName() internal view returns (string memory) {
        if (block.chainid == 42_220) return "celo-mainnet";
        if (block.chainid == 11_142_220) return "celo-sepolia";
        return string.concat("chain-", vm.toString(block.chainid));
    }
}
