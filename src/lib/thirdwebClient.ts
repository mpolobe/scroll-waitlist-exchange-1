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

// SENT Token Drop contract address (set after deployment)
export const SENT_CONTRACT_ADDRESS = import.meta.env.VITE_SENT_CONTRACT_ADDRESS || "";

export default client;
