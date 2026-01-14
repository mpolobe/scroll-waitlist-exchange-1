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
 *      Uses 9 decimals to match native AFC on Sui.
 */
contract WrappedAfricoin is ERC20, ERC20Burnable, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant REWARDS_MINTER_ROLE = keccak256("REWARDS_MINTER_ROLE");

    event BridgeToSui(address indexed from, string suiDestination, uint256 amount);

    constructor(address defaultAdmin, address relayer) ERC20("Wrapped Africoin", "wAFC") {
        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        _grantRole(MINTER_ROLE, relayer);
    }

    function decimals() public pure override returns (uint8) {
        return 9;
    }

    /**
     * @dev Mints new wAFC tokens. Only callable by the Relayer.
     */
    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }

    /**
     * @dev Mints reward tokens. Only callable by the staking contract.
     */
    function mintRewards(address to, uint256 amount) public onlyRole(REWARDS_MINTER_ROLE) {
        _mint(to, amount);
    }

    /**
     * @dev Burns wAFC tokens to bridge them back to Sui.
     */
    function bridgeBack(uint256 amount, string memory suiDestination) public {
        burn(amount);
        emit BridgeToSui(msg.sender, suiDestination, amount);
    }
}
