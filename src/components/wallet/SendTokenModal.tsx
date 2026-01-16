import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Send, Loader2 } from 'lucide-react';

interface SendTokenModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tokenSymbol?: string;
  balance?: string;
}

export function SendTokenModal({ open, onOpenChange, tokenSymbol = 'AFC', balance = '0' }: SendTokenModalProps) {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async () => {
    if (!recipient || !amount) {
      setError('Please fill in all fields');
      return;
    }
    setIsLoading(true);
    setError('');
    
    // Placeholder for actual send logic
    setTimeout(() => {
      setIsLoading(false);
      onOpenChange(false);
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            Send {tokenSymbol}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label>Recipient Address</Label>
            <Input
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="0x..."
              className="mt-1"
            />
          </div>
          <div>
            <Label>Amount</Label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">Balance: {balance} {tokenSymbol}</p>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button onClick={handleSend} disabled={isLoading} className="w-full">
            {isLoading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending...</>
            ) : (
              <><Send className="w-4 h-4 mr-2" />Send {tokenSymbol}</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default SendTokenModal;
