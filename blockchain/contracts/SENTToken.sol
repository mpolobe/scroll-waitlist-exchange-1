// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SENT Token - Sentinel Network Governance Token
 * @notice ERC20 token for Africa Railways Sentinel Network on Polygon
 * @dev Total supply: 10,000,000,000 (10 billion) SENT
 */
contract SENTToken is ERC20, ERC20Burnable, Ownable {
    uint256 public constant MAX_SUPPLY = 10_000_000_000 * 10**18; // 10 billion tokens
    
    // Track minted amount to enforce max supply
    uint256 public totalMinted;
    
    // Events
    event TokensMinted(address indexed to, uint256 amount);
    
    constructor(address initialOwner) ERC20("Sentinel Network", "SENT") Ownable(initialOwner) {
        // Mint initial supply to owner for distribution
        // 310M for airdrop + liquidity + team allocation
        uint256 initialMint = 1_000_000_000 * 10**18; // 1 billion initial
        _mint(initialOwner, initialMint);
        totalMinted = initialMint;
        emit TokensMinted(initialOwner, initialMint);
    }
    
    /**
     * @notice Mint additional tokens (only owner, respects max supply)
     * @param to Address to receive tokens
     * @param amount Amount to mint
     */
    function mint(address to, uint256 amount) external onlyOwner {
        require(totalMinted + amount <= MAX_SUPPLY, "Exceeds max supply");
        totalMinted += amount;
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }
    
    /**
     * @notice Get remaining mintable supply
     */
    function remainingMintableSupply() external view returns (uint256) {
        return MAX_SUPPLY - totalMinted;
    }
}
