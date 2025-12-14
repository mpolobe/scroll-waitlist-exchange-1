import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function RailwayTransactions() {
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    // Simulate real-time transactions
    const initialTransactions = [
      { id: 'TXN-001', route: 'Nairobi-Mombasa', amount: 50, status: 'completed', time: '2 min ago' },
      { id: 'TXN-002', route: 'Lagos-Abuja', amount: 75, status: 'completed', time: '5 min ago' },
      { id: 'TXN-003', route: 'Johannesburg-Cape Town', amount: 100, status: 'pending', time: '8 min ago' },
      { id: 'TXN-004', route: 'Cairo-Alexandria', amount: 40, status: 'completed', time: '12 min ago' }
    ];
    setTransactions(initialTransactions);

    // Add new transaction every 10 seconds
    const interval = setInterval(() => {
      const routes = ['Nairobi-Mombasa', 'Lagos-Abuja', 'Johannesburg-Cape Town', 'Cairo-Alexandria'];
      const newTxn = {
        id: 'TXN-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        route: routes[Math.floor(Math.random() * routes.length)],
        amount: Math.floor(Math.random() * 100) + 25,
        status: 'completed',
        time: 'Just now'
      };
      setTransactions(prev => [newTxn, ...prev.slice(0, 9)]);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Real-Time Transactions</h2>
        <p className="text-muted-foreground">Live railway ticket purchases across Africa</p>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Route</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((txn) => (
              <TableRow key={txn.id}>
                <TableCell className="font-mono text-sm">{txn.id}</TableCell>
                <TableCell>{txn.route}</TableCell>
                <TableCell>{txn.amount} AFC</TableCell>
                <TableCell>
                  <Badge variant={txn.status === 'completed' ? 'default' : 'secondary'}>
                    {txn.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">{txn.time}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
