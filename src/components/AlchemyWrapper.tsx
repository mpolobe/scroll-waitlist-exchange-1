import React from "react";
import { alchemyConfig, isAlchemyConfigured } from "@/lib/alchemyConfig";
import { QueryClient } from "@tanstack/react-query";

// Dynamically require AlchemyAccountProvider ONLY if enabled
let AlchemyAccountProvider: React.ComponentType<any> | null = null;
if (isAlchemyConfigured) {
  try {
    AlchemyAccountProvider = require("@account-kit/react").AlchemyAccountProvider;
  } catch (e) {
    console.warn("Alchemy Account Kit not available");
  }
}

// Supply your actual queryClient here or import it
const queryClient = new QueryClient();

export const AlchemyWrapper = ({ children }: { children: React.ReactNode }) => {
  if (AlchemyAccountProvider && isAlchemyConfigured && alchemyConfig) {
    return (
      <AlchemyAccountProvider config={alchemyConfig} queryClient={queryClient}>
        {children}
      </AlchemyAccountProvider>
    );
  }
  // If provider is not available, just render children
  return <>{children}</>;
};
