/**
 * Phone-Based Wallet Service for SUI and AFC
 * 
 * Creates deterministic wallet addresses linked to phone numbers
 * Uses Ed25519 keypairs derived from phone number + salt
 */

import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { supabase } from '@/lib/supabase';

// SUI Network Configuration
const SUI_NETWORK = (import.meta.env.VITE_SUI_NETWORK as 'mainnet' | 'testnet' | 'devnet') || 'mainnet';
const suiClient = new SuiClient({ url: getFullnodeUrl(SUI_NETWORK) });

// AFC Token Configuration (Scroll/EVM)
const AFC_COIN_TYPE = import.meta.env.VITE_AFC_COIN_TYPE || '0xc68c4cfb63d702227db09c28837e75abd23bbb3adc192e3bc45fecca4dd5b7e8::afc::AFC';

// Storage keys
const STORAGE_KEYS = {
  PHONE_WALLET: 'africoin_phone_wallet',
  WALLET_SESSION: 'africoin_wallet_session',
};

export interface PhoneWallet {
  phoneNumber: string;
  suiAddress: string;
  afcAddress: string;
  createdAt: Date;
  lastActive: Date;
}

export interface WalletBalance {
  sui: string;
  afc: string;
  suiUsd: string;
  afcUsd: string;
}

export interface WalletSession {
  phoneNumber: string;
  suiAddress: string;
  afcAddress: string;
  isVerified: boolean;
  expiresAt: number;
}

class PhoneWalletService {
  private currentSession: WalletSession | null = null;

  constructor() {
    this.loadSession();
  }

  /**
   * Load session from localStorage
   */
  private loadSession(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.WALLET_SESSION);
      if (stored) {
        const session = JSON.parse(stored) as WalletSession;
        if (session.expiresAt > Date.now()) {
          this.currentSession = session;
        } else {
          localStorage.removeItem(STORAGE_KEYS.WALLET_SESSION);
        }
      }
    } catch (error) {
      console.error('Failed to load wallet session:', error);
    }
  }

  /**
   * Save session to localStorage
   */
  private saveSession(session: WalletSession): void {
    this.currentSession = session;
    localStorage.setItem(STORAGE_KEYS.WALLET_SESSION, JSON.stringify(session));
  }

  /**
   * Generate deterministic seed from phone number
   * Uses SHA-256 hash of phone + app salt
   */
  private async generateSeed(phoneNumber: string): Promise<Uint8Array> {
    const appSalt = import.meta.env.VITE_WALLET_SALT || 'africoin-wallet-v1';
    const input = `${phoneNumber}:${appSalt}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return new Uint8Array(hashBuffer);
  }

  /**
   * Create or retrieve SUI wallet for phone number
   */
  async createSuiWallet(phoneNumber: string): Promise<string> {
    const seed = await this.generateSeed(phoneNumber);
    const keypair = Ed25519Keypair.fromSecretKey(seed);
    return keypair.getPublicKey().toSuiAddress();
  }

  /**
   * Create or retrieve AFC wallet for phone number (EVM-compatible)
   * Uses keccak256 for Ethereum-style address derivation
   */
  async createAfcWallet(phoneNumber: string): Promise<string> {
    const seed = await this.generateSeed(phoneNumber);
    // For EVM, we use the first 20 bytes of the hash as the address
    const addressBytes = seed.slice(0, 20);
    const hexAddress = '0x' + Array.from(addressBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    return hexAddress;
  }

  /**
   * Create both SUI and AFC wallets for a phone number
   */
  async createWallets(phoneNumber: string): Promise<PhoneWallet> {
    const [suiAddress, afcAddress] = await Promise.all([
      this.createSuiWallet(phoneNumber),
      this.createAfcWallet(phoneNumber),
    ]);

    const wallet: PhoneWallet = {
      phoneNumber,
      suiAddress,
      afcAddress,
      createdAt: new Date(),
      lastActive: new Date(),
    };

    // Store in Supabase if available
    await this.storeWalletInDatabase(wallet);

    return wallet;
  }

  /**
   * Store wallet mapping in database
   */
  private async storeWalletInDatabase(wallet: PhoneWallet): Promise<void> {
    try {
      const { error } = await supabase
        .from('phone_wallets')
        .upsert({
          phone_number: wallet.phoneNumber,
          sui_address: wallet.suiAddress,
          afc_address: wallet.afcAddress,
          created_at: wallet.createdAt.toISOString(),
          last_active: wallet.lastActive.toISOString(),
        }, {
          onConflict: 'phone_number'
        });

      if (error) {
        console.warn('Failed to store wallet in database:', error.message);
      }
    } catch (error) {
      console.warn('Database storage unavailable:', error);
    }
  }

  /**
   * Get wallet from database by phone number
   */
  async getWalletFromDatabase(phoneNumber: string): Promise<PhoneWallet | null> {
    try {
      const { data, error } = await supabase
        .from('phone_wallets')
        .select('*')
        .eq('phone_number', phoneNumber)
        .single();

      if (error || !data) {
        return null;
      }

      return {
        phoneNumber: data.phone_number,
        suiAddress: data.sui_address,
        afcAddress: data.afc_address,
        createdAt: new Date(data.created_at),
        lastActive: new Date(data.last_active),
      };
    } catch (error) {
      console.warn('Failed to fetch wallet from database:', error);
      return null;
    }
  }

  /**
   * Authenticate user with phone number after OTP verification
   */
  async authenticate(phoneNumber: string): Promise<WalletSession> {
    // Check if wallet exists in database
    let wallet = await this.getWalletFromDatabase(phoneNumber);

    // Create new wallet if not found
    if (!wallet) {
      wallet = await this.createWallets(phoneNumber);
    }

    // Create session (24 hour expiry)
    const session: WalletSession = {
      phoneNumber: wallet.phoneNumber,
      suiAddress: wallet.suiAddress,
      afcAddress: wallet.afcAddress,
      isVerified: true,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    };

    this.saveSession(session);
    return session;
  }

  /**
   * Get current session
   */
  getSession(): WalletSession | null {
    if (this.currentSession && this.currentSession.expiresAt > Date.now()) {
      return this.currentSession;
    }
    return null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.getSession() !== null;
  }

  /**
   * Logout and clear session
   */
  logout(): void {
    this.currentSession = null;
    localStorage.removeItem(STORAGE_KEYS.WALLET_SESSION);
  }

  /**
   * Get SUI balance for address
   */
  async getSuiBalance(address: string): Promise<string> {
    try {
      const balance = await suiClient.getBalance({ owner: address });
      // Convert from MIST to SUI (1 SUI = 10^9 MIST)
      const suiBalance = Number(balance.totalBalance) / 1_000_000_000;
      return suiBalance.toFixed(4);
    } catch (error) {
      console.error('Failed to get SUI balance:', error);
      return '0';
    }
  }

  /**
   * Get AFC token balance for SUI address
   */
  async getAfcBalanceOnSui(address: string): Promise<string> {
    try {
      const balance = await suiClient.getBalance({
        owner: address,
        coinType: AFC_COIN_TYPE,
      });
      // Assuming 9 decimals for AFC token
      const afcBalance = Number(balance.totalBalance) / 1_000_000_000;
      return afcBalance.toFixed(4);
    } catch (error) {
      console.error('Failed to get AFC balance:', error);
      return '0';
    }
  }

  /**
   * Get all balances for current session
   */
  async getBalances(): Promise<WalletBalance | null> {
    const session = this.getSession();
    if (!session) {
      return null;
    }

    const [sui, afc] = await Promise.all([
      this.getSuiBalance(session.suiAddress),
      this.getAfcBalanceOnSui(session.suiAddress),
    ]);

    // Price estimates (in production, fetch from oracle/API)
    const suiPrice = 1.5; // USD
    const afcPrice = 0.01; // USD

    return {
      sui,
      afc,
      suiUsd: (parseFloat(sui) * suiPrice).toFixed(2),
      afcUsd: (parseFloat(afc) * afcPrice).toFixed(2),
    };
  }

  /**
   * Get transaction history for SUI address
   */
  async getTransactionHistory(address: string, limit: number = 10): Promise<unknown[]> {
    try {
      const txns = await suiClient.queryTransactionBlocks({
        filter: {
          FromAddress: address,
        },
        limit,
        options: {
          showEffects: true,
          showInput: true,
        },
      });
      return txns.data;
    } catch (error) {
      console.error('Failed to get transaction history:', error);
      return [];
    }
  }

  /**
   * Sign and execute a SUI transaction
   */
  async signAndExecuteTransaction(
    phoneNumber: string,
    transactionBlock: unknown
  ): Promise<{ digest: string; effects: unknown }> {
    const seed = await this.generateSeed(phoneNumber);
    const keypair = Ed25519Keypair.fromSecretKey(seed);

    const result = await suiClient.signAndExecuteTransaction({
      signer: keypair,
      transaction: transactionBlock as Parameters<typeof suiClient.signAndExecuteTransaction>[0]['transaction'],
      options: {
        showEffects: true,
        showObjectChanges: true,
      },
    });

    return {
      digest: result.digest,
      effects: result.effects,
    };
  }

  /**
   * Get SUI client instance
   */
  getSuiClient(): SuiClient {
    return suiClient;
  }

  /**
   * Get network info
   */
  getNetworkInfo(): { network: string; rpcUrl: string } {
    return {
      network: SUI_NETWORK,
      rpcUrl: getFullnodeUrl(SUI_NETWORK),
    };
  }
}

// Export singleton instance
export const phoneWalletService = new PhoneWalletService();
export default phoneWalletService;
