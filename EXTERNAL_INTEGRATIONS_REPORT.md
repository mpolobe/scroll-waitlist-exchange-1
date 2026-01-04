# 🕵️ External Integration Scan Report: mpolobe/africa-railways

Based on a deep scan of the `mpolobe/africa-railways` repository, the following integrations and architectural patterns have been identified. The project employs a "Dual-Chain" architecture where Polygon serves as the legal source of truth for assets (NFTs), while Sui handles high-speed event processing.

## 1. 🟣 Polygon (Amoy Testnet) Integration
**Status:** Primary "Source of Truth" for Ticketing & Assets.

### A. Infrastructure
- **Validator Node:**
  - Hosted on Google Cloud Platform (GCP).
  - **External IP:** `34.10.5.8`
  - **Internal IP:** `10.128.0.2` (Used for low-latency internal communication).
  - **Port:** `8545`
- **RPC Connection:**
  - Primary: Internal Validator Node.
  - Fallback: Alchemy RPC (`https://polygon-amoy.g.alchemy.com/v2/...`).

### B. Relayer Bridge (Go)
- **Codebase:** `backend/cmd/relayer/main.go`, `relayer.go`.
- **Function:** Listens for events on Sui and mints corresponding NFT tickets on Polygon.
- **Gas Policy:** Uses Alchemy's Gas Manager for sponsored (gasless) transactions.
- **Key Config:**
  - `GAS_POLICY_ID`: `2e114558-d9e8-4a3c-8290-ff9e6023f486`
  - `RELAYER_ADDRESS`: Managed via env vars.

### C. Smart Contracts
- **Standard:** ERC-721 (NFTs).
- **Deployment:** Hardhat (`hardhat.config.js` configured for Polygon & Mumbai).
- **Verification:** Contracts are verified on PolygonScan.

---

## 2. 💧 Sui Blockchain Integration
**Status:** High-Speed Event Layer & USSD Interface.

### A. Python Integration
- **Library:** `pysui` (Python SDK).
- **File:** `backend/sui_integration.py`.
- **Function:** Handles investment logic (`$SENT`), AFC minting, and triggers events that the Relayer Bridge picks up.

### B. Move Contracts
- **Files:** `investment.move`.
- **Logic:** Handles the immediate "purchase" action which is faster than EVM finality, suitable for USSD sessions.

---

## 3. 🛠️ Third-Party Services

### A. Alchemy
- **Roles:**
  - **RPC Provider:** Reliable connection to Polygon Amoy.
  - **NFT API:** Used by the frontend/staff app to fetch ticket metadata (`alchemy_getNFTMetadata`) and verify ownership.
  - **Gas Manager:** Sponsors gas fees for user transactions.

### B. IPFS / Pinata
- **Role:** Decentralized storage for NFT metadata (Ticket details, routes, class).
- **Auth:** JWT Tokens & API Keys configured in `config.json`.

### C. Google Cloud Platform (GCP)
- **Resources:**
  - Compute Engine (VMs) for Validator Node and Relayer.
  - VPC Network for internal communication (`10.128.0.x`).

### D. Vercel & Expo
- **Vercel:** Hosting for the React web dashboards (`africa-railways.vercel.app`).
- **Expo:** Framework for the mobile app (`app.config.js` handles switching between "Railways" and "Africoin" modes).

---

## 4. 📱 Telecommunications & Payments

### A. USSD
- **Gateway:** Likely Africa's Talking (standard for this region), interfacing with `app.py`.
- **Flow:** User dials code -> Python Backend -> Sui Transaction -> Polygon Mint.

### B. Mobile Money
- **Planned Integrations:** M-Pesa, Airtel Money, Tigo Pesa.
- **Logic:** `TOKEN_ARCHITECTURE.md` describes a flow of `Deduct Mobile Money -> Mint AFC`.

---

## 5. 🔄 Harmonization Opportunities

To align your current workspace with this architecture:
1.  **Bridge the Gap:** Your `bridge_logic.py` is a good start. It should eventually interface with the Go Relayer or replicate its logic using Python `web3.py` to talk to the Polygon Validator.
2.  **Data Source:** Ensure your "Master Visionary" dashboard pulls "Legal" ticket data from Polygon (via Alchemy) while showing "Real-time" events from Sui.
