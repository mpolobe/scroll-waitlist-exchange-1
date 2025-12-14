import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSmartWallet } from '@/contexts/SmartWalletContext';
import { useSendCalls, useWaitForCallsStatus, useSmartAccountClient } from '@account-kit/react';
import { parseEther, toHex, isAddress, formatEther } from 'viem';
import { Send, Zap, Fuel } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { TransactionStatus } from './TransactionStatus';
import { encodeERC20Transfer, isNativeToken, getTokenInfo } from '@/lib/tokenContracts';
import { publicClient } from '@/lib/tokenService';

interface SendTokenModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SendTokenModal({ open, onOpenChange }: SendTokenModalProps) {
  const { tokens, address, refreshBalances, addTransaction, updateTransaction } = useSmartWallet();
  const { client } = useSmartAccountClient({ type: "ModularAccountV2" });
  const { toast } = useToast();
  
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedToken, setSelectedToken] = useState('ETH');
  const [error, setError] = useState('');
  const [txStatus, setTxStatus] = useState<'idle' | 'sending' | 'confirming' | 'success' | 'error'>('idle');
  const [txHash, setTxHash] = useState<string>();
  const [gasEstimate, setGasEstimate] = useState<string>('');
  const [currentTxId, setCurrentTxId] = useState<string>();

  const { sendCalls, isSendingCalls, sendCallsResult } = useSendCalls({ client });
  const { data: statusResult } = useWaitForCallsStatus({ client, id: sendCallsResult?.ids?.[0] });

  useEffect(() => {
    if (isSendingCalls && txStatus === 'idle') setTxStatus('sending');
    if (statusResult?.status === 'success') {
      const hash = statusResult.receipts?.[0]?.transactionHash;
      setTxStatus('success');
      setTxHash(hash);
      if (currentTxId) updateTransaction(currentTxId, { status: 'completed', txHash: hash || '' });
      refreshBalances();
      toast({ title: 'Transaction Successful!', description: `Sent ${amount} ${selectedToken}` });
    }
  }, [isSendingCalls, statusResult, txStatus]);

  useEffect(() => {
    const estimateGas = async () => {
      if (!recipient || !isAddress(recipient) || !amount || parseFloat(amount) <= 0) { setGasEstimate(''); return; }
      try {
        const gasPrice = await publicClient.getGasPrice();
        const estimatedGas = isNativeToken(selectedToken) ? 21000n : 65000n;
        setGasEstimate(parseFloat(formatEther(gasPrice * estimatedGas)).toFixed(6));
      } catch { setGasEstimate(''); }
    };
    estimateGas();
  }, [recipient, amount, selectedToken]);

  const handleSend = async () => {
    setError('');
    if (!recipient || !isAddress(recipient)) { setError('Invalid address'); return; }
    if (!amount || parseFloat(amount) <= 0) { setError('Invalid amount'); return; }
    if (!client) { setError('Wallet not connected'); return; }

    // Add pending transaction
    const txId = `tx_${Date.now()}`;
    setCurrentTxId(txId);
    addTransaction({ type: 'send', amount, token: selectedToken, to: recipient, status: 'pending', txHash: '' });

    try {
      setTxStatus('sending');
      if (isNativeToken(selectedToken)) {
        sendCalls({ calls: [{ to: recipient as `0x${string}`, value: toHex(parseEther(amount)), data: '0x' }] });
      } else {
        const tokenInfo = getTokenInfo(selectedToken);
        if (!tokenInfo) { setError('Token not supported'); setTxStatus('idle'); return; }
        const data = encodeERC20Transfer(recipient as `0x${string}`, amount, tokenInfo.decimals);
        sendCalls({ calls: [{ to: tokenInfo.address, value: '0x0', data }] });
      }
    } catch (err: any) {
      setError(err.message || 'Transaction failed');
      setTxStatus('error');
      if (currentTxId) updateTransaction(currentTxId, { status: 'failed' });
      toast({ title: 'Transaction Failed', description: err.message, variant: 'destructive' });
    }
  };

  const resetForm = () => { setRecipient(''); setAmount(''); setError(''); setTxStatus('idle'); setTxHash(undefined); setCurrentTxId(undefined); };
  const handleClose = () => { onOpenChange(false); resetForm(); };
  const currentBalance = tokens.find(t => t.symbol === selectedToken)?.balance || '0';

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); else onOpenChange(o); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle className="flex items-center gap-2"><Send className="w-5 h-5 text-orange-500" />Send Tokens</DialogTitle></DialogHeader>
        {txStatus !== 'idle' ? (
          <TransactionStatus status={txStatus} txHash={txHash} errorMessage={error} onClose={handleClose} onRetry={() => setTxStatus('idle')} />
        ) : (
          <div className="space-y-4 py-4">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-orange-500" /><span className="text-sm text-orange-700">Gas-sponsored by Alchemy</span>
            </div>
            <div className="space-y-2">
              <Label>Token</Label>
              <Select value={selectedToken} onValueChange={setSelectedToken}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ETH">ETH - Ethereum</SelectItem>
                  <SelectItem value="AFC">AFC - Africoin</SelectItem>
                  <SelectItem value="USDC">USDC - USD Coin</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">Balance: {currentBalance} {selectedToken}</p>
            </div>
            <div className="space-y-2"><Label>Recipient Address</Label><Input placeholder="0x..." value={recipient} onChange={(e) => setRecipient(e.target.value)} /></div>
            <div className="space-y-2">
              <div className="flex justify-between"><Label>Amount</Label><button onClick={() => setAmount(currentBalance)} className="text-xs text-orange-600 hover:underline">Max</button></div>
              <Input type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} step="0.0001" min="0" />
            </div>
            {gasEstimate && <div className="flex items-center gap-2 text-sm text-gray-500"><Fuel className="w-4 h-4" />Est. gas: ~{gasEstimate} ETH (sponsored)</div>}
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button onClick={handleSend} disabled={!recipient || !amount} className="w-full bg-gradient-to-r from-orange-500 to-amber-500"><Send className="w-4 h-4 mr-2" />Send {selectedToken}</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
