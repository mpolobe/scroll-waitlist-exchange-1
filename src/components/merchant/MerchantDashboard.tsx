import React from 'react';
import { Card } from '@/components/ui/card';

const MerchantDashboard = () => {
  const stats = [
    { label: 'Total Transactions', value: '1,234', change: '+12%' },
    { label: 'Revenue (USD)', value: '$45,678', change: '+8%' },
    { label: 'Active Customers', value: '892', change: '+15%' },
    { label: 'API Calls', value: '23,456', change: '+5%' }
  ];

  const recentTransactions = [
    { id: 'TXN001', customer: 'John Doe', amount: '$125.00', status: 'Completed', date: '2025-11-27' },
    { id: 'TXN002', customer: 'Jane Smith', amount: '$89.50', status: 'Completed', date: '2025-11-27' },
    { id: 'TXN003', customer: 'Bob Johnson', amount: '$234.00', status: 'Pending', date: '2025-11-27' },
    { id: 'TXN004', customer: 'Alice Brown', amount: '$67.25', status: 'Completed', date: '2025-11-26' }
  ];

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
              {recentTransactions.map((txn) => (
                <tr key={txn.id} className="border-b">
                  <td className="py-3">{txn.id}</td>
                  <td className="py-3">{txn.customer}</td>
                  <td className="py-3">{txn.amount}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded text-xs ${txn.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {txn.status}
                    </span>
                  </td>
                  <td className="py-3">{txn.date}</td>
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
