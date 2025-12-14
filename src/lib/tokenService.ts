import { createPublicClient, http, formatEther, type Address } from 'viem';
import { sepolia } from 'viem/chains';

const ALCHEMY_API_KEY = import.meta.env.VITE_ALCHEMY_API_KEY || 'demo-api-key';
const ALCHEMY_RPC_URL = `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;

export const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(ALCHEMY_RPC_URL),
});

export interface TokenBalanceResult {
  symbol: string;
  name: string;
  balance: string;
  usdValue: string;
  icon: string;
  contractAddress?: string;
  decimals?: number;
}

interface AlchemyTokenBalance {
  contractAddress: string;
  tokenBalance: string;
}

interface AlchemyTokenMetadata {
  name: string;
  symbol: string;
  decimals: number;
  logo?: string;
}

export async function getEthBalance(address: Address): Promise<string> {
  try {
    const balance = await publicClient.getBalance({ address });
    return formatEther(balance);
  } catch (error) {
    console.error('Error fetching ETH balance:', error);
    return '0';
  }
}

export async function getTokenBalances(address: string): Promise<AlchemyTokenBalance[]> {
  try {
    const response = await fetch(ALCHEMY_RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'alchemy_getTokenBalances',
        params: [address, 'erc20'],
        id: 1,
      }),
    });
    const data = await response.json();
    return data.result?.tokenBalances || [];
  } catch (error) {
    console.error('Error fetching token balances:', error);
    return [];
  }
}

export async function getTokenMetadata(contractAddress: string): Promise<AlchemyTokenMetadata | null> {
  try {
    const response = await fetch(ALCHEMY_RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'alchemy_getTokenMetadata',
        params: [contractAddress],
        id: 1,
      }),
    });
    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error('Error fetching token metadata:', error);
    return null;
  }
}

export function formatTokenBalance(rawBalance: string, decimals: number): string {
  if (!rawBalance || rawBalance === '0x0') return '0';
  const balance = BigInt(rawBalance);
  const divisor = BigInt(10 ** decimals);
  const intPart = balance / divisor;
  const fracPart = balance % divisor;
  const fracStr = fracPart.toString().padStart(decimals, '0').slice(0, 4);
  return `${intPart}.${fracStr}`;
}
