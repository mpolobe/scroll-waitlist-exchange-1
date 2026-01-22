/**
 * Thirdweb Client Configuration
 * Bridge between the website and SENT smart contract on Polygon
 */

import { createThirdwebClient, getContract } from "thirdweb";
import { polygon } from "thirdweb/chains";

// Create the client with your clientId
export const client = createThirdwebClient({
  clientId: import.meta.env.VITE_THIRDWEB_CLIENT_ID || "851b38f210a7efd81ae6ca7cc76b26fd",
});

// Re-export polygon chain
export { polygon };

// Contract Addresses on Polygon Mainnet
export const SENT_CONTRACT_ADDRESS = "0xF379f21Af5967F26c358568Bb60408DB8B4F7fE5";
export const AIRDROP_CONTRACT_ADDRESS = "0x7175F1b0A27ebD20Cb9CA00f915C6670b4596bcf";

// SENT Token (PinkSale deployed)
export const sentContract = getContract({
  client,
  chain: polygon,
  address: "0xF379f21Af5967F26c358568Bb60408DB8B4F7fE5",
});

// Airdrop Contract (for signature-based claims)
export const airdropContract = getContract({
  client,
  chain: polygon,
  address: "0x7175F1b0A27ebD20Cb9CA00f915C6670b4596bcf",
});

export default client;
