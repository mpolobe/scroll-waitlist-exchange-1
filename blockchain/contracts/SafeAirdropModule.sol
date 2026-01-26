// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

/**
 * @title SafeAirdropModule
 * @notice Safe module that allows an authorized signer to distribute tokens from the Safe
 *         without requiring multisig approval for each claim.
 * 
 * @dev This module is enabled on the Safe and can execute token transfers.
 *      Claims require a valid signature from the authorized signer.
 *      Includes daily limits and per-claim limits for security.
 */
interface ISafe {
    function execTransactionFromModule(
        address to,
        uint256 value,
        bytes memory data,
        uint8 operation
    ) external returns (bool success);
}

contract SafeAirdropModule {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    // Safe address this module is attached to
    address public immutable safe;
    
    // Token to distribute
    address public immutable token;
    
    // Authorized signer (server wallet)
    address public authorizedSigner;
    
    // Owner who can update signer
    address public owner;
    
    // Claim tracking
    mapping(address => bool) public hasClaimed;
    mapping(bytes32 => bool) public usedSignatures;
    
    // Limits
    uint256 public maxClaimAmount = 1000 * 10**18;  // 1000 SENT max per claim
    uint256 public dailyLimit = 10_000_000 * 10**18; // 10M SENT daily
    
    // Daily tracking
    uint256 public currentDay;
    uint256 public dailyDistributed;
    
    // Stats
    uint256 public totalClaimed;
    uint256 public totalClaimants;
    
    // Events
    event Claimed(address indexed recipient, uint256 amount, uint256 timestamp);
    event SignerUpdated(address indexed oldSigner, address indexed newSigner);
    event LimitsUpdated(uint256 maxClaim, uint256 dailyLimit);
    
    // Errors
    error InvalidSignature();
    error AlreadyClaimed();
    error SignatureUsed();
    error ExceedsClaimLimit();
    error ExceedsDailyLimit();
    error Unauthorized();
    error TransferFailed();

    constructor(
        address _safe,
        address _token,
        address _authorizedSigner
    ) {
        safe = _safe;
        token = _token;
        authorizedSigner = _authorizedSigner;
        owner = msg.sender;
        currentDay = block.timestamp / 1 days;
    }

    /**
     * @notice Claim tokens with a valid signature from the authorized signer
     * @param amount Amount of tokens to claim (in wei)
     * @param nonce Unique nonce to prevent replay
     * @param signature Signature from authorized signer
     */
    function claim(
        uint256 amount,
        uint256 nonce,
        bytes calldata signature
    ) external {
        // Check not already claimed
        if (hasClaimed[msg.sender]) revert AlreadyClaimed();
        
        // Check amount limits
        if (amount > maxClaimAmount) revert ExceedsClaimLimit();
        
        // Update daily tracking
        uint256 today = block.timestamp / 1 days;
        if (today > currentDay) {
            currentDay = today;
            dailyDistributed = 0;
        }
        
        if (dailyDistributed + amount > dailyLimit) revert ExceedsDailyLimit();
        
        // Verify signature
        bytes32 messageHash = keccak256(abi.encodePacked(
            msg.sender,
            amount,
            nonce,
            address(this),
            block.chainid
        ));
        
        bytes32 ethSignedHash = messageHash.toEthSignedMessageHash();
        
        // Check signature not reused
        if (usedSignatures[ethSignedHash]) revert SignatureUsed();
        
        // Recover signer
        address signer = ethSignedHash.recover(signature);
        if (signer != authorizedSigner) revert InvalidSignature();
        
        // Mark as claimed and signature as used
        hasClaimed[msg.sender] = true;
        usedSignatures[ethSignedHash] = true;
        dailyDistributed += amount;
        totalClaimed += amount;
        totalClaimants++;
        
        // Execute transfer from Safe
        bytes memory transferData = abi.encodeWithSelector(
            IERC20.transfer.selector,
            msg.sender,
            amount
        );
        
        bool success = ISafe(safe).execTransactionFromModule(
            token,
            0,
            transferData,
            0 // Call operation
        );
        
        if (!success) revert TransferFailed();
        
        emit Claimed(msg.sender, amount, block.timestamp);
    }

    /**
     * @notice Check if an address can claim
     */
    function canClaim(address account) external view returns (bool) {
        return !hasClaimed[account];
    }

    /**
     * @notice Get remaining daily allowance
     */
    function remainingDailyAllowance() external view returns (uint256) {
        uint256 today = block.timestamp / 1 days;
        if (today > currentDay) {
            return dailyLimit;
        }
        if (dailyDistributed >= dailyLimit) return 0;
        return dailyLimit - dailyDistributed;
    }

    /**
     * @notice Update authorized signer (owner only)
     */
    function setAuthorizedSigner(address newSigner) external {
        if (msg.sender != owner) revert Unauthorized();
        emit SignerUpdated(authorizedSigner, newSigner);
        authorizedSigner = newSigner;
    }

    /**
     * @notice Update limits (owner only)
     */
    function setLimits(uint256 _maxClaimAmount, uint256 _dailyLimit) external {
        if (msg.sender != owner) revert Unauthorized();
        maxClaimAmount = _maxClaimAmount;
        dailyLimit = _dailyLimit;
        emit LimitsUpdated(_maxClaimAmount, _dailyLimit);
    }

    /**
     * @notice Transfer ownership
     */
    function transferOwnership(address newOwner) external {
        if (msg.sender != owner) revert Unauthorized();
        owner = newOwner;
    }

    /**
     * @notice Reset claim status for an address (owner only, for testing/errors)
     */
    function resetClaim(address account) external {
        if (msg.sender != owner) revert Unauthorized();
        hasClaimed[account] = false;
    }
}
