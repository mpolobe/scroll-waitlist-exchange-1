/**
 * SENT IDO Service
 * 
 * Configuration and utilities for SENTINEL token fairlaunch on PinkSale.
 * The actual participation happens on PinkSale - this service provides
 * configuration data and helper functions.
 */

import { SENT_IDO_CONFIG, SENT_TOKEN, NETWORK_CONFIG } from '@/data/tokenConfig';

// Re-export SENT_IDO_CONFIG for consumers
export { SENT_IDO_CONFIG } from '@/data/tokenConfig';

// Polygon Mainnet chain ID
const POLYGON_CHAIN_ID = '0x89';

/**
 * Check if MetaMask or compatible wallet is installed
 */
export const isWalletInstalled = (): boolean => {
  return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
};

/**
 * Get current chain ID from wallet
 */
export const getCurrentChainId = async (): Promise<string | null> => {
  if (!isWalletInstalled()) return null;
  try {
    return await window.ethereum.request({ method: 'eth_chainId' });
  } catch {
    return null;
  }
};

/**
 * Check if wallet is on Polygon network
 */
export const isOnPolygon = async (): Promise<boolean> => {
  const chainId = await getCurrentChainId();
  return chainId === POLYGON_CHAIN_ID;
};

/**
 * Switch wallet to Polygon network
 */
export const switchToPolygon = async (): Promise<{ success: boolean; error?: string }> => {
  if (!isWalletInstalled()) {
    return { success: false, error: 'Please install MetaMask or a compatible EVM wallet' };
  }

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: POLYGON_CHAIN_ID }],
    });
    return { success: true };
  } catch (error: any) {
    // Chain not added - add it
    if (error.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: POLYGON_CHAIN_ID,
            chainName: NETWORK_CONFIG.polygon.name,
            nativeCurrency: NETWORK_CONFIG.polygon.nativeCurrency,
            rpcUrls: [NETWORK_CONFIG.polygon.rpcUrl],
            blockExplorerUrls: [NETWORK_CONFIG.polygon.explorerUrl],
          }],
        });
        return { success: true };
      } catch {
        return { success: false, error: 'Failed to add Polygon network' };
      }
    }
    
    if (error.code === 4001) {
      return { success: false, error: 'Please switch to Polygon network to participate' };
    }
    
    return { success: false, error: error.message || 'Failed to switch network' };
  }
};

/**
 * Connect Polygon wallet
 */
export const connectPolygonWallet = async (): Promise<{
  success: boolean;
  address?: string;
  error?: string;
}> => {
  if (!isWalletInstalled()) {
    return {
      success: false,
      error: 'Please install MetaMask or a compatible EVM wallet to participate in the IDO',
    };
  }

  try {
    // Request account access
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });

    if (!accounts || accounts.length === 0) {
      return { success: false, error: 'No accounts found' };
    }

    // Switch to Polygon
    const switchResult = await switchToPolygon();
    if (!switchResult.success) {
      return { success: false, error: switchResult.error };
    }

    return { success: true, address: accounts[0] };
  } catch (error: any) {
    if (error.code === 4001) {
      return { success: false, error: 'Connection rejected by user' };
    }
    return { success: false, error: error.message || 'Failed to connect wallet' };
  }
};

/**
 * Get PinkSale launchpad URL
 */
export const getPinkSaleUrl = (): string => {
  return SENT_IDO_CONFIG.launchpadUrl;
};

/**
 * Get token contract address
 */
export const getTokenAddress = (): string => {
  return SENT_IDO_CONFIG.tokenAddress;
};

/**
 * Get pool contract address
 */
export const getPoolAddress = (): string => {
  return SENT_IDO_CONFIG.poolAddress;
};

// Type declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
    };
  }
}

export default {
  isWalletInstalled,
  isOnPolygon,
  switchToPolygon,
  connectPolygonWallet,
  getPinkSaleUrl,
  getTokenAddress,
  getPoolAddress,
  SENT_IDO_CONFIG,
};
