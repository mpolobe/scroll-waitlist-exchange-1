import { Card } from '@/components/ui/card';
import { useSmartWallet } from '@/contexts/SmartWalletContext';
import { ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { getExplorerTxUrl, getExplorerAddressUrl } from '@/lib/tokenContracts';

export function TransactionHistoryWallet() {
  const { transactions, isConnected, address } = useSmartWallet();

  if (!isConnected) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-amber-500 animate-pulse" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return null;
    }
  };

  const shortenAddress = (addr?: string) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';

  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-4">Recent Transactions</h3>

      {transactions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No transactions yet</p>
          <p className="text-sm">Your transaction history will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.slice(0, 10).map((tx) => (
            <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'receive' ? 'bg-emerald-100' : 'bg-orange-100'}`}>
                  {tx.type === 'receive' ? <ArrowDownLeft className="w-5 h-5 text-emerald-600" /> : <ArrowUpRight className="w-5 h-5 text-orange-600" />}
                </div>
                <div>
                  <p className="font-medium">{tx.type === 'receive' ? 'Received' : 'Sent'} {tx.token}</p>
                  <p className="text-xs text-gray-500">{tx.type === 'receive' ? `From ${shortenAddress(tx.from)}` : `To ${shortenAddress(tx.to)}`}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${tx.type === 'receive' ? 'text-emerald-600' : 'text-gray-900'}`}>
                  {tx.type === 'receive' ? '+' : '-'}{tx.amount} {tx.token}
                </p>
                <div className="flex items-center gap-1 justify-end">
                  {getStatusIcon(tx.status)}
                  {tx.txHash && (
                    <a href={getExplorerTxUrl(tx.txHash)} target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:text-orange-600">
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  <span className="text-xs text-gray-500">{formatDistanceToNow(tx.timestamp, { addSuffix: true })}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 pt-4 border-t text-center">
        <a href={address ? getExplorerAddressUrl(address) : '#'} target="_blank" rel="noopener noreferrer"
          className="text-sm text-orange-500 hover:text-orange-600 inline-flex items-center gap-1">
          View all on Etherscan <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </Card>
  );
}
