/**
 * Manual thirdweb SDK client — Ona's method
 *
 * This file creates a Thirdweb SDK instance that talks to any contract
 * as long as the correct address is provided. It does not require importing
 * the contract into a thirdweb dashboard project.
 */
/**
 * Thirdweb client configuration and helpers
 *
 * Exports:
 * - `client`: created with `createThirdwebClient` and used by `ThirdwebProvider`
 * - `getContractByAddress(address, chain)`: helper to retrieve a contract by address
 */
import { createThirdwebClient, getContract as twGetContract } from "thirdweb";
import { polygon } from "thirdweb/chains";

// Create the client with your clientId (fall back to a sensible default if missing)
export const client = createThirdwebClient({
  clientId:
    import.meta?.env?.VITE_THIRDWEB_CLIENT_ID ||
    process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID ||
    "851b38f210a7efd81ae6ca7cc76b26fd",
});

// Re-export polygon chain for convenience
export { polygon };

// Contract Addresses on Polygon Mainnet
export const SENT_CONTRACT_ADDRESS = "0xF379f21Af5967F26c358568Bb60408DB8B4F7fE5";
export const AIRDROP_CONTRACT_ADDRESS = "0x7175F1b0A27ebD20Cb9CA00f915C6670b4596bcf";

// Pre-instantiated contract objects for direct import
export const sentContract = twGetContract({
  client,
  chain: polygon,
  address: SENT_CONTRACT_ADDRESS,
});

export const airdropContract = twGetContract({
  client,
  chain: polygon,
  address: AIRDROP_CONTRACT_ADDRESS,
});

/**
 * Get a contract instance by address. This does not require the contract
 * to be imported in the thirdweb dashboard — just provide the address.
 */
export function getContractByAddress(address: string, chain = polygon) {
  return twGetContract({ client, chain, address });
}

export default client;
