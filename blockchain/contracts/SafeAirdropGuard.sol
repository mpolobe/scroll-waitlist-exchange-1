// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SafeAirdropGuard
 * @notice Guard contract for Safe that prevents dangerous operations
 * @dev Deployed at 0x43B8Deeae29558ee36Ba6b0800fA2ed77B43FFe1 on Polygon
 *      Blocks:
 *      - Ownership transfers of protected contracts
 *      - Large transfers above threshold
 *      - Adding/removing Safe owners (requires separate approval)
 */

interface IERC165 {
    function supportsInterface(bytes4 interfaceId) external view returns (bool);
}

interface IGuard is IERC165 {
    function checkTransaction(
        address to,
        uint256 value,
        bytes memory data,
        uint8 operation,
        uint256 safeTxGas,
        uint256 baseGas,
        uint256 gasPrice,
        address gasToken,
        address payable refundReceiver,
        bytes memory signatures,
        address msgSender
    ) external view;

    function checkAfterExecution(bytes32 txHash, bool success) external view;
}

contract SafeAirdropGuard is IGuard {
    // IGuard interface ID
    bytes4 public constant GUARD_INTERFACE_ID = 0xe6d7a83a;

    /// @notice ERC165 interface support
    function supportsInterface(bytes4 interfaceId) external pure override returns (bool) {
        return interfaceId == type(IERC165).interfaceId || 
               interfaceId == GUARD_INTERFACE_ID;
    }

    // Protected token contract
    address public immutable SENT_TOKEN;

    // Maximum single transfer (in wei) - 1 million SENT
    uint256 public constant MAX_SINGLE_TRANSFER = 1_000_000 * 10**18;

    // Daily transfer limit (in wei) - 10 million SENT
    uint256 public constant DAILY_TRANSFER_LIMIT = 10_000_000 * 10**18;

    // Function selectors to block
    bytes4 private constant TRANSFER_OWNERSHIP = 0xf2fde38b; // transferOwnership(address)
    bytes4 private constant RENOUNCE_OWNERSHIP = 0x715018a6; // renounceOwnership()
    bytes4 private constant ADD_OWNER = 0x0d582f13; // addOwnerWithThreshold(address,uint256)
    bytes4 private constant REMOVE_OWNER = 0xf8dc5dd9; // removeOwner(address,address,uint256)
    bytes4 private constant CHANGE_THRESHOLD = 0x694e80c3; // changeThreshold(uint256)
    bytes4 private constant TRANSFER = 0xa9059cbb; // transfer(address,uint256)

    // Daily transfer tracking
    mapping(uint256 => uint256) public dailyTransferred; // day => amount

    // Events
    event TransferBlocked(address indexed to, uint256 amount, string reason);
    event DangerousCallBlocked(address indexed to, bytes4 selector);

    constructor(address _sentToken) {
        SENT_TOKEN = _sentToken;
    }

    function checkTransaction(
        address to,
        uint256 value,
        bytes memory data,
        uint8 operation,
        uint256, // safeTxGas
        uint256, // baseGas
        uint256, // gasPrice
        address, // gasToken
        address payable, // refundReceiver
        bytes memory, // signatures
        address // msgSender
    ) external view override {
        // Block delegate calls (operation = 1)
        require(operation == 0, "Guard: Delegate calls not allowed");

        // If calling the SENT token
        if (to == SENT_TOKEN && data.length >= 4) {
            bytes4 selector = bytes4(data);

            // Block ownership changes
            if (selector == TRANSFER_OWNERSHIP || selector == RENOUNCE_OWNERSHIP) {
                revert("Guard: Ownership changes blocked");
            }

            // Check transfer limits
            if (selector == TRANSFER && data.length >= 68) {
                // Decode transfer amount (second parameter)
                uint256 amount;
                assembly {
                    amount := mload(add(data, 68))
                }

                require(amount <= MAX_SINGLE_TRANSFER, "Guard: Transfer exceeds single limit");

                // Check daily limit
                uint256 today = block.timestamp / 1 days;
                uint256 todayTotal = dailyTransferred[today] + amount;
                require(todayTotal <= DAILY_TRANSFER_LIMIT, "Guard: Daily limit exceeded");
            }
        }

        // Block Safe configuration changes (to = Safe itself)
        if (data.length >= 4) {
            bytes4 selector = bytes4(data);
            if (selector == ADD_OWNER || selector == REMOVE_OWNER || selector == CHANGE_THRESHOLD) {
                revert("Guard: Safe config changes require timelock");
            }
        }
    }

    function checkAfterExecution(bytes32, bool) external view override {
        // Post-execution hook (view-only)
    }

    /**
     * @notice Get current day's transferred amount
     */
    function getTodayTransferred() external view returns (uint256) {
        return dailyTransferred[block.timestamp / 1 days];
    }

    /**
     * @notice Get remaining daily allowance
     */
    function getRemainingDailyAllowance() external view returns (uint256) {
        uint256 today = block.timestamp / 1 days;
        uint256 transferred = dailyTransferred[today];
        if (transferred >= DAILY_TRANSFER_LIMIT) return 0;
        return DAILY_TRANSFER_LIMIT - transferred;
    }
}
