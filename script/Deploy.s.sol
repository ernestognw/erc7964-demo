// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Script, console} from "forge-std/Script.sol";
import {CrossChainAppMock} from "../contracts/CrossChainAppMock.sol";

/**
 * @dev Deploys `CrossChainAppMock` on the current chain. Run once per
 * target testnet:
 *
 *   forge script script/Deploy.s.sol \
 *     --rpc-url $RPC_URL \
 *     --private-key $PRIVATE_KEY \
 *     --broadcast
 *
 * The script prints the deployed address — paste each one into the
 * matching `VITE_APP_*` entry in `.env`.
 */
contract DeployScript is Script {
    function run() public {
        vm.startBroadcast();
        CrossChainAppMock app = new CrossChainAppMock("CrossChainAppMock", "1.0.0");
        vm.stopBroadcast();

        console.log("CrossChainAppMock deployed to:", address(app));
        console.log("chainId:", block.chainid);
    }
}
