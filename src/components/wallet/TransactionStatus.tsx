import { CheckCircle, Loader2, XCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getExplorerTxUrl } from '@/lib/tokenContracts';

interface TransactionStatusProps {
  status: 'idle' | 'sending' | 'confirming' | 'success' | 'error';
  txHash?: string;
  errorMessage?: string;
  onClose: () => void;
  onRetry?: () => void;
}

export function TransactionStatus({ status, txHash, errorMessage, onClose, onRetry }: TransactionStatusProps) {
  if (status === 'success') {
    return (
      <div className="py-6 text-center space-y-4">
        <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto" />
        <div>
          <h3 className="text-lg font-semibold text-emerald-600">Transaction Successful!</h3>
          <p className="text-sm text-gray-500 mt-1">Your transaction has been confirmed on the blockchain.</p>
        </div>
        {txHash && (
          <a
            href={getExplorerTxUrl(txHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700"
          >
            View on Etherscan <ExternalLink className="w-3 h-3" />
          </a>
        )}
        <Button onClick={onClose} className="w-full">Done</Button>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="py-6 text-center space-y-4">
        <XCircle className="w-16 h-16 text-red-500 mx-auto" />
        <div>
          <h3 className="text-lg font-semibold text-red-600">Transaction Failed</h3>
          <p className="text-sm text-gray-500 mt-1">{errorMessage || 'Something went wrong'}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          {onRetry && <Button onClick={onRetry} className="flex-1">Retry</Button>}
        </div>
      </div>
    );
  }

  if (status === 'sending' || status === 'confirming') {
    return (
      <div className="py-8 text-center space-y-4">
        <Loader2 className="w-16 h-16 text-orange-500 mx-auto animate-spin" />
        <div>
          <h3 className="text-lg font-semibold">{status === 'sending' ? 'Sending Transaction...' : 'Confirming...'}</h3>
          <p className="text-sm text-gray-500 mt-1">
            {status === 'sending' ? 'Signing and broadcasting your transaction' : 'Waiting for blockchain confirmation'}
          </p>
        </div>
        {txHash && (
          <a href={getExplorerTxUrl(txHash)} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700">
            Track on Etherscan <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    );
  }

  return null;
}
