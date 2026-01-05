import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';

// Use Testnet for now as per package.json dependencies (rev="framework/testnet")
// But user mentioned "Live on Sui Mainnet", so we should probably use Mainnet.
// Let's support both via env or default to Mainnet.

const NETWORK = 'mainnet'; // or 'testnet'

export const SUI_CLIENT = new SuiClient({
  url: getFullnodeUrl(NETWORK),
});
