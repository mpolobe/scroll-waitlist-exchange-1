# 🌉 Africoin Bridge Architecture: Sui ↔ Ethereum

## 1. The Core Concept: "Lock and Mint"
To move Africoin (AFC) from its native home on **Sui** to the liquidity markets of **Ethereum/Polygon**, we will use a standard **Lock-and-Mint** bridge mechanism. This ensures the total supply remains constant across both chains.

### The Flow
1.  **Lock (Sui):** You send AFC to a secure "Vault" contract on Sui. These tokens are locked and taken out of circulation.
2.  **Observe (Relayer):** Our off-chain Relayer (the same one managing Tickets) detects this "Lock" event.
3.  **Mint (Ethereum):** The Relayer signs a transaction to mint an equivalent amount of **Wrapped AFC (wAFC)** on Ethereum/Polygon.

---

## 2. Technical Components

### A. Sui Side (The Vault)
*   **Contract:** `africoin::bridge`
*   **Function:** `lock_afc(coin: Coin<AFC>, eth_address: vector<u8>)`
*   **Action:** Transfers the AFC coin into a shared object (The Vault) that no one can withdraw from without a corresponding "Burn" proof from Ethereum.
*   **Event:** Emits `AFCLockedEvent` containing:
    *   `amount`: How much AFC was locked.
    *   `eth_dest`: The Ethereum address to receive the tokens.

### B. The Relayer (The Messenger)
*   **Current Status:** We already have a Go Relayer (`backend/cmd/relayer`) for NFT Tickets.
*   **Upgrade Required:** We will add a new listener for `AFCLockedEvent`.
*   **Logic:**
    ```go
    on(AFCLockedEvent) {
        verify_transaction_finality();
        call_ethereum_mint(event.eth_dest, event.amount);
    }
    ```

### C. Ethereum Side (The Wrapper)
*   **Contract:** `WrappedAfricoin.sol` (ERC-20)
*   **Features:** Standard ERC-20 token compatible with Uniswap, Aave, etc.
*   **Permissions:** Only the **Relayer Address** has the `MINTER_ROLE`.

---

## 3. Why This Approach?
1.  **Speed:** Sui handles the user interaction instantly (USSD speed).
2.  **Liquidity:** Ethereum/Polygon provides the DeFi ecosystem (Uniswap pools).
3.  **Control:** By running our own Relayer initially (before moving to Wormhole/LayerZero), we maintain full control over the "Master Visionary" experience.

## 4. Implementation Roadmap
- [x] **Phase 1:** Simulation (`bridge_logic.py`) - **DONE**
- [x] **Phase 2:** Deploy `WrappedAfricoin` ERC-20 on Polygon Amoy.
    - Contract: `blockchain/contracts/WrappedAfricoin.sol`
    - Script: `blockchain/scripts/deploy_wafc.js`
- [x] **Phase 3:** Write `africoin::bridge` Move contract.
    - Source: `africoin/sources/bridge.move`
    - Event: `AFCLockedEvent`
- [x] **Phase 4:** Upgrade Go Relayer to handle AFC bridging.
    - Code: `relayer/main.go`
    - Logic: Listens for Sui events and triggers Polygon minting.
