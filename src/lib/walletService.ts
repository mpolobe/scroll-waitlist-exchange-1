/**
 * Wallet Service - Creates deterministic SUI wallet from phone number
 * 
 * Flow:
 * 1. User signs up with phone number
 * 2. OTP verified
 * 3. Deterministic SUI wallet created from phone number
 * 4. Wallet address stored in user profile
 */

import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';

const SUI_NETWORK = import.meta.env.VITE_SUI_NETWORK || 'mainnet';
const WALLET_SALT = import.meta.env.VITE_WALLET_SALT || 'africoin-wallet-v1';
const AFC_COIN_TYPE = import.meta.env.VITE_AFC_COIN_TYPE || '0xc68c4cfb63d702227db09c28837e75abd23bbb3adc192e3bc45fecca4dd5b7e8::afc::AFC';

// SUI Client
const suiClient = new SuiClient({ url: getFullnodeUrl(SUI_NETWORK) });

interface WalletInfo {
  address: string;
  publicKey: string;
  network: string;
  explorerUrl: string;
}

interface WalletBalance {
  sui: string;
  afc: string;
}

interface CreateWalletResult {
  success: boolean;
  wallet?: WalletInfo;
  balance?: WalletBalance;
  error?: string;
}

/**
 * Generate deterministic keypair from phone number
 * Uses SHA-256 hash of phone + salt as seed
 */
async function generateDeterministicKeypair(phoneNumber: string): Promise<Ed25519Keypair> {
  // Normalize phone number (last 10 digits)
  const normalizedPhone = phoneNumber.replace(/\D/g, '').slice(-10);
  
  // Create deterministic seed using Web Crypto API
  const encoder = new TextEncoder();
  const data = encoder.encode(normalizedPhone + WALLET_SALT);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const seed = new Uint8Array(hashBuffer);
  
  // Create keypair from seed
  return Ed25519Keypair.fromSecretKey(seed);
}

/**
 * Create or retrieve wallet for phone number
 */
export async function createWalletForPhone(phoneNumber: string): Promise<CreateWalletResult> {
  try {
    // Generate deterministic keypair
    const keypair = await generateDeterministicKeypair(phoneNumber);
    const address = keypair.getPublicKey().toSuiAddress();
    
    // Get wallet balance
    let suiBalance = '0';
    let afcBalance = '0';
    
    try {
      // Get SUI balance
      const balanceResult = await suiClient.getBalance({ owner: address });
      suiBalance = balanceResult.totalBalance;
      
      // Get AFC token balance
      const afcBalanceResult = await suiClient.getBalance({ 
        owner: address,
        coinType: AFC_COIN_TYPE
      });
      afcBalance = afcBalanceResult.totalBalance;
    } catch (e) {
      console.warn('Could not fetch balance:', e);
    }
    
    return {
      success: true,
      wallet: {
        address,
        publicKey: keypair.getPublicKey().toBase64(),
        network: SUI_NETWORK,
        explorerUrl: `https://suiscan.xyz/${SUI_NETWORK}/account/${address}`
      },
      balance: {
        sui: suiBalance,
        afc: afcBalance
      }
    };
  } catch (error: any) {
    console.error('Wallet creation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get wallet balance for address
 */
export async function getWalletBalance(address: string): Promise<WalletBalance> {
  try {
    // Get SUI balance
    const suiResult = await suiClient.getBalance({ owner: address });
    
    // Get AFC token balance
    let afcBalance = '0';
    try {
      const afcResult = await suiClient.getBalance({ 
        owner: address,
        coinType: AFC_COIN_TYPE
      });
      afcBalance = afcResult.totalBalance;
    } catch (e) {
      // AFC token might not exist for this address
    }
    
    return {
      sui: suiResult.totalBalance,
      afc: afcBalance
    };
  } catch (error) {
    console.error('Get balance error:', error);
    return { sui: '0', afc: '0' };
  }
}

/**
 * Get keypair for signing transactions
 * Only call this when user needs to sign a transaction
 */
export async function getKeypairForPhone(phoneNumber: string): Promise<Ed25519Keypair> {
  return generateDeterministicKeypair(phoneNumber);
}

/**
 * Format SUI balance for display (9 decimals)
 */
export function formatSuiBalance(balance: string): string {
  const num = BigInt(balance);
  const divisor = BigInt(1_000_000_000); // 9 decimals
  const intPart = num / divisor;
  const fracPart = num % divisor;
  const fracStr = fracPart.toString().padStart(9, '0').slice(0, 4);
  return `${intPart}.${fracStr}`;
}

/**
 * Format AFC balance for display (9 decimals)
 */
export function formatAfcBalance(balance: string): string {
  return formatSuiBalance(balance); // Same decimals as SUI
}

export { suiClient, SUI_NETWORK, AFC_COIN_TYPE };
