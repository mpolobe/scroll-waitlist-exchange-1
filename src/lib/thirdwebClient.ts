/**
 * Thirdweb Client Configuration
 * Bridge between the website and SENT smart contract on Polygon
 */

import { createThirdwebClient } from "thirdweb";

// Initialize the client with your key
// Vite uses import.meta.env.VITE_* (equivalent to Next.js process.env.NEXT_PUBLIC_*)
export const client = createThirdwebClient({
  clientId: import.meta.env.VITE_THIRDWEB_CLIENT_ID || "851b38f210a7efd81ae6ca7cc76b26fd",
});

// SENT Token Drop contract on Polygon Mainnet
export const SENT_CONTRACT_ADDRESS = "0x7175F1b0A27ebD20Cb9CA00f915C6670b4596bcf";

// Polygon Mainnet Chain ID
export const POLYGON_CHAIN_ID = 137;

export default client;
