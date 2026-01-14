import { createConfig } from "@account-kit/react";
import { polygon, alchemy } from "@account-kit/infra";

// Get API key and App ID - REQUIRED for production
const ALCHEMY_API_KEY = import.meta.env.VITE_ALCHEMY_API_KEY || "";
const ALCHEMY_APP_ID = import.meta.env.VITE_ALCHEMY_APP_ID || "6q0y1xpzxlz05jc0";

// Check if Alchemy is configured
export const isAlchemyConfigured = !!ALCHEMY_API_KEY;

if (!ALCHEMY_API_KEY) {
  console.warn(
    "⚠️ VITE_ALCHEMY_API_KEY not set. Alchemy Account Kit features disabled. " +
    "Get your API key from https://dashboard.alchemy.com"
  );
}

// AFRC Token on Polygon Mainnet
export const AFRC_TOKEN = {
  address: import.meta.env.VITE_AFRC_CONTRACT_ADDRESS || "0xfcfa02a852551618f544fbce52908a0f941abef9",
  symbol: "AFRC",
  name: "Africoin",
  decimals: 18,
  // Verified owner address on PolygonScan
  verifiedOwner: "0xC9c7A437D2F2992d88E3137A473c2e0bAd696477",
};

// Create the Alchemy Account Kit config for Polygon Mainnet
// Only create if API key is available
export const alchemyConfig = ALCHEMY_API_KEY ? createConfig(
  {
    transport: alchemy({ 
      apiKey: ALCHEMY_API_KEY
    }),
    chain: polygon, // Polygon Mainnet
    enablePopupOauth: true,
    // Gas Manager Policy ID for sponsored transactions (staff operations)
    policyId: import.meta.env.VITE_ALCHEMY_GAS_POLICY_ID || undefined,
    ssr: false,
  },
  {
    illustrationStyle: "linear",
    auth: {
      sections: [
        [
          // Email as primary authentication method
          {
            type: "email",
          }
        ],
        [
          // Social login options
          {
            type: "social",
            authProviderId: "google",
            mode: "popup"
          },
          {
            type: "social", 
            authProviderId: "facebook",
            mode: "popup"
          }
        ],
      ],
      addPasskeyOnSignup: true,
      hideSignInText: false,
      header: "Connect Your Africoin Wallet",
    },
  }
) : null;

export const activeChain = polygon;

// Network info for display
export const networkInfo = {
  name: "Polygon",
  chainId: 137,
  currency: "POL",
  explorer: "https://polygonscan.com",
  rpcUrl: `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
};
