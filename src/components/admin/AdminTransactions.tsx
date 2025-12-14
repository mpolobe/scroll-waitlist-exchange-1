import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download } from 'lucide-react';

interface AdminTransactionsProps {
  onStatsUpdate: (count: number, volume: number) => void;
}

export function AdminTransactions({ onStatsUpdate }: AdminTransactionsProps) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      const { data } = await supabase.functions.invoke('admin-get-transactions', {
        headers: { Authorization: `Bearer ${session.session?.access_token}` }
      });
      if (data?.success) {
        setTransactions(data.transactions);
        const volume = data.transactions.reduce((sum: number, tx: any) => sum + parseFloat(tx.amount), 0);
        onStatsUpdate(data.transactions.length, volume);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredTransactions = () => {
    if (!startDate && !endDate) return transactions;
    
    return transactions.filter(tx => {
      const txDate = new Date(tx.created_at);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      
      if (start && txDate < start) return false;
      if (end && txDate > end) return false;
      return true;
    });
  };

  const exportToCSV = () => {
    const filtered = getFilteredTransactions();
    
    // CSV headers
    const headers = ['Date', 'User', 'Type', 'Amount', 'Status', 'Transaction Hash'];
    
    // CSV rows
    const rows = filtered.map(tx => [
      new Date(tx.created_at).toLocaleString(),
      tx.profiles?.full_name || tx.profiles?.email || 'Unknown',
      tx.type,
      parseFloat(tx.amount).toFixed(2),
      tx.status,
      tx.transaction_hash || 'N/A'
    ]);
    
    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredTransactions = getFilteredTransactions();

  if (loading) return <div className="p-4">Loading transactions...</div>;

  return (
    <div className="mt-4">
      <div className="flex gap-4 mb-4 items-end">
        <div className="flex-1">
          <label className="text-sm font-medium mb-1 block">Start Date</label>
          <Input 
            type="date" 
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="flex-1">
          <label className="text-sm font-medium mb-1 block">End Date</label>
          <Input 
            type="date" 
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <Button onClick={exportToCSV} className="gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredTransactions.map((tx) => (
            <TableRow key={tx.id}>
              <TableCell>{new Date(tx.created_at).toLocaleDateString()}</TableCell>
              <TableCell>{tx.profiles?.full_name || tx.profiles?.email || 'Unknown'}</TableCell>
              <TableCell className="capitalize">{tx.type}</TableCell>
              <TableCell>${parseFloat(tx.amount).toFixed(2)}</TableCell>
              <TableCell>
                <Badge variant={tx.status === 'completed' ? 'default' : 'secondary'}>
                  {tx.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {filteredTransactions.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No transactions found for the selected date range.
        </div>
      )}
    </div>
  );
}
