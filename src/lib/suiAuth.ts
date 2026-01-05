import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { generateNonce, generateRandomness, getExtendedEphemeralPublicKey } from '@mysten/zklogin';
import { jwtDecode } from 'jwt-decode';
import { genAddressSeed, getZkLoginSignature } from '@mysten/zklogin';
import { SUI_CLIENT } from './suiClient'; // We'll need to create this or use a default

const EPHEMERAL_KEY_STORAGE = 'sui_ephemeral_key';
const MAX_EPOCH_STORAGE = 'sui_max_epoch';
const RANDOMNESS_STORAGE = 'sui_randomness';

export interface SuiZkLoginState {
  ephemeralKeyPair: Ed25519Keypair;
  maxEpoch: number;
  randomness: string;
  nonce: string;
}

export const prepareZkLogin = async (): Promise<string> => {
  // 1. Generate Ephemeral Key
  const ephemeralKeyPair = new Ed25519Keypair();
  
  // 2. Set Expiration (Epochs)
  // We need to fetch the current epoch from the network to set a valid max_epoch
  // For now, we'll assume a safe buffer or fetch it if we have a client
  // Defaulting to current time + offset if we can't fetch, but zkLogin needs chain epoch
  // Let's assume we can fetch it or use a static offset for now (not ideal for prod)
  // Ideally: const { epoch } = await suiClient.getLatestSuiSystemState();
  const currentEpoch = 0; // Placeholder: Needs actual network fetch
  const maxEpoch = currentEpoch + 10; // Valid for ~10 days

  // 3. Generate Randomness
  const randomness = generateRandomness();

  // 4. Derive Nonce
  const nonce = generateNonce(
    ephemeralKeyPair.getPublicKey(), 
    maxEpoch, 
    randomness
  );

  // 5. Store in LocalStorage (to retrieve after redirect)
  localStorage.setItem(EPHEMERAL_KEY_STORAGE, ephemeralKeyPair.export().privateKey);
  localStorage.setItem(MAX_EPOCH_STORAGE, String(maxEpoch));
  localStorage.setItem(RANDOMNESS_STORAGE, randomness);

  return nonce;
};

export const getStoredZkLoginState = (): SuiZkLoginState | null => {
  const privateKey = localStorage.getItem(EPHEMERAL_KEY_STORAGE);
  const maxEpoch = localStorage.getItem(MAX_EPOCH_STORAGE);
  const randomness = localStorage.getItem(RANDOMNESS_STORAGE);

  if (!privateKey || !maxEpoch || !randomness) {
    return null;
  }

  const ephemeralKeyPair = Ed25519Keypair.fromSecretKey(privateKey);
  const nonce = generateNonce(
    ephemeralKeyPair.getPublicKey(), 
    Number(maxEpoch), 
    randomness
  );

  return {
    ephemeralKeyPair,
    maxEpoch: Number(maxEpoch),
    randomness,
    nonce
  };
};

export const clearZkLoginState = () => {
  localStorage.removeItem(EPHEMERAL_KEY_STORAGE);
  localStorage.removeItem(MAX_EPOCH_STORAGE);
  localStorage.removeItem(RANDOMNESS_STORAGE);
};

// Helper to derive the user's Sui address from the JWT
export const deriveSuiAddress = (jwt: string, userSalt: string) => {
  const decoded = jwtDecode(jwt);
  if (!decoded.sub || !decoded.iss || !decoded.aud) {
    throw new Error('Invalid JWT');
  }

  // Note: In production, the salt should be retrieved from a service based on the user's ID
  // For this demo, we might need to generate/store a salt if we don't have a master salt service
  
  const addressSeed = genAddressSeed(
    BigInt(userSalt), 
    'sub', 
    decoded.sub as string, 
    decoded.aud as string | string[]
  );
  
  // This is a simplified derivation. 
  // In reality, we need the zkLogin address utility from @mysten/zklogin
  // which computes the address based on the seed.
  // For now, we will return a placeholder or use the utility if available.
  
  return "0x..."; // TODO: Use computeZkLoginAddress from SDK
};
