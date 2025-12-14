import { encodeFunctionData, parseUnits, type Address } from 'viem';

// ERC-20 Token Contract Addresses on Sepolia Testnet
export const TOKEN_CONTRACTS: Record<string, { address: Address; decimals: number; name: string }> = {
  AFC: {
    address: '0x1234567890123456789012345678901234567890' as Address, // Replace with actual AFC contract
    decimals: 18,
    name: 'Africoin',
  },
  USDC: {
    address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238' as Address, // Sepolia USDC
    decimals: 6,
    name: 'USD Coin',
  },
  USDT: {
    address: '0x7169D38820dfd117C3FA1f22a697dBA58d90BA06' as Address, // Sepolia USDT
    decimals: 6,
    name: 'Tether USD',
  },
};

// ERC-20 Transfer ABI
const ERC20_TRANSFER_ABI = [
  {
    name: 'transfer',
    type: 'function',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const;

// Encode ERC-20 transfer call
export function encodeERC20Transfer(to: Address, amount: string, decimals: number): `0x${string}` {
  const parsedAmount = parseUnits(amount, decimals);
  return encodeFunctionData({
    abi: ERC20_TRANSFER_ABI,
    functionName: 'transfer',
    args: [to, parsedAmount],
  });
}

// Get token info
export function getTokenInfo(symbol: string) {
  return TOKEN_CONTRACTS[symbol] || null;
}

// Check if token is native ETH
export function isNativeToken(symbol: string): boolean {
  return symbol === 'ETH';
}

// Sepolia block explorer URL
export const SEPOLIA_EXPLORER = 'https://sepolia.etherscan.io';

export function getExplorerTxUrl(txHash: string): string {
  return `${SEPOLIA_EXPLORER}/tx/${txHash}`;
}

export function getExplorerAddressUrl(address: string): string {
  return `${SEPOLIA_EXPLORER}/address/${address}`;
}
