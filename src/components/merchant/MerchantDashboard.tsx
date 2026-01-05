import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

const MerchantDashboard = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([
    { label: 'Total Transactions', value: '0', change: '+0%' },
    { label: 'Revenue (USD)', value: '$0.00', change: '+0%' },
    { label: 'Active Customers', value: '0', change: '+0%' },
    { label: 'API Calls', value: '23,456', change: '+0%' }
  ]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data) {
          setTransactions(data);
          
          // Calculate stats
          const totalTxns = data.length;
          const revenue = data.reduce((sum, t) => sum + Number(t.amount), 0);
          const uniqueCustomers = new Set(data.map(t => t.user_id)).size;
          
          setStats([
            { label: 'Total Transactions', value: totalTxns.toString(), change: '+12%' },
            { label: 'Revenue (USD)', value: `$${revenue.toFixed(2)}`, change: '+8%' },
            { label: 'Active Customers', value: uniqueCustomers.toString(), change: '+15%' },
            { label: 'API Calls', value: '23,456', change: '+5%' }
          ]);
        }
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Merchant Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <Card key={idx} className="p-6">
            <p className="text-gray-600 text-sm">{stat.label}</p>
            <p className="text-3xl font-bold mt-2">{stat.value}</p>
            <p className="text-green-600 text-sm mt-1">{stat.change} from last month</p>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Recent Transactions</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">ID</th>
                <th className="text-left py-2">Customer</th>
                <th className="text-left py-2">Amount</th>
                <th className="text-left py-2">Status</th>
                <th className="text-left py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn) => (
                <tr key={txn.id} className="border-b">
                  <td className="py-3 font-mono text-sm">{txn.id.slice(0, 8)}...</td>
                  <td className="py-3 font-mono text-sm">{txn.user_id ? txn.user_id.slice(0, 8) + '...' : 'Unknown'}</td>
                  <td className="py-3">${Number(txn.amount).toFixed(2)}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded text-xs ${txn.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {txn.status}
                    </span>
                  </td>
                  <td className="py-3">{new Date(txn.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default MerchantDashboard;
