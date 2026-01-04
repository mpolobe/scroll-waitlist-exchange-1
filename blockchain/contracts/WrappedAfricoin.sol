// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title Wrapped Africoin (wAFC)
 * @dev ERC20 Token backed 1:1 by Africoin (AFC) on Sui Network.
 *      Minting is restricted to the Bridge Relayer.
 *      Burning is open to all (to bridge back to Sui).
 */
contract WrappedAfricoin is ERC20, ERC20Burnable, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    // Event emitted when tokens are burned to bridge back to Sui
    event BridgeToSui(address indexed from, string suiDestination, uint256 amount);

    constructor(address defaultAdmin, address relayer) ERC20("Wrapped Africoin", "wAFC") {
        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        _grantRole(MINTER_ROLE, relayer);
    }

    /**
     * @dev Mints new wAFC tokens. Only callable by the Relayer.
     * @param to The address to receive the tokens.
     * @param amount The amount of tokens to mint.
     */
    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }

    /**
     * @dev Burns wAFC tokens to bridge them back to Sui.
     * @param amount The amount of tokens to burn.
     * @param suiDestination The Sui address (e.g., "0x...") to receive the native AFC.
     */
    function bridgeBack(uint256 amount, string memory suiDestination) public {
        burn(amount);
        emit BridgeToSui(msg.sender, suiDestination, amount);
    }
}
