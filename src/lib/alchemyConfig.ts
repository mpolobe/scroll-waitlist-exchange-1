import { createConfig } from "@account-kit/react";
import { sepolia, alchemy } from "@account-kit/infra";

// Create the Alchemy Account Kit config with email authentication
// Email is the primary authentication method, passkeys can be added later
export const alchemyConfig = createConfig(
  {
    transport: alchemy({ 
      apiKey: import.meta.env.VITE_ALCHEMY_API_KEY || "demo-api-key" 
    }),
    chain: sepolia,
    enablePopupOauth: true,
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
);

export const activeChain = sepolia;
