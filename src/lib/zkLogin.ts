import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { generateNonce, generateRandomness } from '@mysten/zklogin';
import { getExtendedEphemeralPublicKey, computeZkLoginAddress } from '@mysten/sui/zklogin';
import { jwtDecode } from "jwt-decode";

const SUI_PROVER_URL = 'https://prover-dev.mystenlabs.com/v1';
const REDIRECT_URI = window.location.origin + '/auth/callback';
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID';

export interface ZkLoginSession {
  ephemeralPrivateKey: string;
  maxEpoch: number;
  randomness: string;
  nonce: string;
}

export const setupZkLogin = async () => {
  // 1. Generate ephemeral key pair
  const ephemeralKeyPair = new Ed25519Keypair();
  const ephemeralPublicKey = ephemeralKeyPair.getPublicKey();
  const ephemeralPrivateKey = ephemeralKeyPair.export().privateKey;

  // 2. Generate randomness and nonce
  const maxEpoch = 1000; // Adjust based on network epoch
  const randomness = generateRandomness();
  const nonce = generateNonce(ephemeralPublicKey, maxEpoch, randomness);

  // 3. Store session data
  const session: ZkLoginSession = {
    ephemeralPrivateKey,
    maxEpoch,
    randomness,
    nonce
  };
  // Use localStorage to persist across redirects more reliably
  localStorage.setItem('zk_login_session', JSON.stringify(session));

  return { nonce, ephemeralKeyPair };
};

export const getGoogleLoginUrl = (nonce: string) => {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'id_token',
    redirect_uri: REDIRECT_URI,
    scope: 'openid email profile',
    nonce: nonce,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
};

export const completeZkLogin = async (idToken: string) => {
  const sessionStr = localStorage.getItem('zk_login_session');
  if (!sessionStr) throw new Error('No zkLogin session found');
  
  const session: ZkLoginSession = JSON.parse(sessionStr);
  const { ephemeralPrivateKey, maxEpoch, randomness } = session;

  // 1. Reconstruct Keypair
  const ephemeralKeyPair = Ed25519Keypair.fromSecretKey(ephemeralPrivateKey);
  const extendedEphemeralPublicKey = getExtendedEphemeralPublicKey(ephemeralKeyPair.getPublicKey());

  // 2. Decode token to get salt (in production, fetch salt from a service)
  const decoded = jwtDecode(idToken);
  const salt = '0'; // In production, this should be a user-specific salt

  // 3. Derive Address
  const zkLoginAddress = computeZkLoginAddress({
    claimName: 'sub',
    claimValue: decoded.sub as string,
    iss: decoded.iss as string,
    aud: decoded.aud as string,
    userSalt: BigInt(salt),
  });

  // 4. Generate Zero Knowledge Proof
  // Note: This usually requires a call to a proving service
  // We return the address immediately so the UI can show it
  // The proof generation might fail in this demo environment
  
  try {
    const proofResponse = await fetch(SUI_PROVER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jwt: idToken,
        extendedEphemeralPublicKey,
        maxEpoch,
        jwtRandomness: randomness,
        salt,
        keyClaimName: "sub"
      })
    });

    if (!proofResponse.ok) {
      console.warn('Prover service failed, but we derived the address.');
      return { zkProof: null, salt, ephemeralPrivateKey, zkLoginAddress };
    }

    const zkProof = await proofResponse.json();
    return { zkProof, salt, ephemeralPrivateKey, zkLoginAddress };
  } catch (e) {
    console.warn('Prover error:', e);
    return { zkProof: null, salt, ephemeralPrivateKey, zkLoginAddress };
  }
};
