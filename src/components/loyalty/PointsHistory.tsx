import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Gift } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Transaction {
  id: string;
  transaction_type: string;
  points_amount: number;
  description: string;
  booking_reference: string;
  created_at: string;
}

export function PointsHistory({ userId }: { userId: string }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, [userId]);

  const loadTransactions = async () => {
    const { data } = await supabase
      .from('points_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (data) setTransactions(data);
    setLoading(false);
  };

  const getIcon = (type: string) => {
    if (type === 'earned' || type === 'bonus') return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (type === 'redeemed') return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Gift className="w-4 h-4 text-blue-600" />;
  };

  const getColor = (type: string) => {
    if (type === 'earned' || type === 'bonus') return 'text-green-600';
    if (type === 'redeemed') return 'text-red-600';
    return 'text-gray-600';
  };

  if (loading) return <div>Loading...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Points History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {transactions.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                {getIcon(tx.transaction_type)}
                <div>
                  <p className="font-medium text-sm">{tx.description}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(tx.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-bold ${getColor(tx.transaction_type)}`}>
                  {tx.transaction_type === 'redeemed' ? '-' : '+'}{tx.points_amount}
                </p>
                {tx.booking_reference && (
                  <p className="text-xs text-gray-500">{tx.booking_reference}</p>
                )}
              </div>
            </div>
          ))}
          {transactions.length === 0 && (
            <p className="text-center text-gray-500 py-8">No transactions yet</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
