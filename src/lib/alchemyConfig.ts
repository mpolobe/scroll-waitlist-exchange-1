import { createConfig } from "@account-kit/react";
import { sepolia, alchemy } from "@account-kit/infra";

// Create the Alchemy Account Kit config with multiple auth options
// Passkey is primary but email is available as fallback for devices that don't support passkeys
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
          // Passkey as primary - seamless biometric/device authentication
          { 
            type: "passkey",
          }
        ],
        [
          // Email as fallback for devices without passkey support
          {
            type: "email",
          }
        ],
      ],
      addPasskeyOnSignup: false,
      hideSignInText: false,
      header: "Connect Your Africoin Wallet",
    },
  }
);

export const activeChain = sepolia;
