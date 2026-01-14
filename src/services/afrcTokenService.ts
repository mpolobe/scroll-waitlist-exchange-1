/**
 * AFRC Token Service for Polygon Mainnet
 * 
 * Contract: 0xfcfa02a852551618f544fbce52908a0f941abef9
 * Network: Polygon (POL)
 */

import { encodeFunctionData, parseUnits, formatUnits } from 'viem';
import { AFRC_TOKEN, networkInfo } from '@/lib/alchemyConfig';

// ERC20 ABI (minimal for token operations)
const ERC20_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'totalSupply',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'decimals',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
  },
  {
    name: 'symbol',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'string' }],
  },
  {
    name: 'name',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'string' }],
  },
] as const;

class AFRCTokenService {
  readonly contractAddress = AFRC_TOKEN.address as `0x${string}`;
  readonly decimals = AFRC_TOKEN.decimals;
  readonly symbol = AFRC_TOKEN.symbol;
  readonly name = AFRC_TOKEN.name;

  /**
   * Get AFRC balance for an address
   */
  async getBalance(address: string, alchemyClient: unknown): Promise<string> {
    if (!alchemyClient) {
      console.warn('Alchemy client not available');
      return '0';
    }

    try {
      // Use Alchemy client to read contract
      const client = alchemyClient as { readContract: (args: unknown) => Promise<bigint> };
      const balance = await client.readContract({
        address: this.contractAddress,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [address as `0x${string}`],
      });

      return formatUnits(balance, this.decimals);
    } catch (error) {
      console.error('Failed to get AFRC balance:', error);
      return '0';
    }
  }

  /**
   * Encode transfer transaction data
   */
  encodeTransfer(to: string, amount: string): `0x${string}` {
    const amountWei = parseUnits(amount, this.decimals);
    return encodeFunctionData({
      abi: ERC20_ABI,
      functionName: 'transfer',
      args: [to as `0x${string}`, amountWei],
    });
  }

  /**
   * Encode approve transaction data
   */
  encodeApprove(spender: string, amount: string): `0x${string}` {
    const amountWei = parseUnits(amount, this.decimals);
    return encodeFunctionData({
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [spender as `0x${string}`, amountWei],
    });
  }

  /**
   * Build transfer user operation for Alchemy smart account
   */
  buildTransferUserOp(to: string, amount: string) {
    return {
      target: this.contractAddress,
      data: this.encodeTransfer(to, amount),
      value: BigInt(0),
    };
  }

  /**
   * Format amount for display
   */
  formatAmount(amount: string | bigint): string {
    if (typeof amount === 'bigint') {
      return formatUnits(amount, this.decimals);
    }
    return amount;
  }

  /**
   * Parse amount from user input
   */
  parseAmount(amount: string): bigint {
    return parseUnits(amount, this.decimals);
  }

  /**
   * Get explorer URL for token
   */
  getExplorerUrl(): string {
    return `${networkInfo.explorer}/token/${this.contractAddress}`;
  }

  /**
   * Get explorer URL for address
   */
  getAddressExplorerUrl(address: string): string {
    return `${networkInfo.explorer}/address/${address}`;
  }

  /**
   * Get explorer URL for transaction
   */
  getTxExplorerUrl(txHash: string): string {
    return `${networkInfo.explorer}/tx/${txHash}`;
  }
}

// Export singleton instance
export const afrcTokenService = new AFRCTokenService();
export default afrcTokenService;
