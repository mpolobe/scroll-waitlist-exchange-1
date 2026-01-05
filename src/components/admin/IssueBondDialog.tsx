import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';

export function IssueBondDialog({ onBondIssued }: { onBondIssued: () => void }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    total_value: '',
    apy: '',
    maturity_date: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase.from('bonds').insert({
        name: formData.name,
        symbol: formData.symbol.toUpperCase(),
        total_value: parseFloat(formData.total_value),
        apy: parseFloat(formData.apy),
        maturity_date: formData.maturity_date,
        created_by: user.id,
        status: 'active'
      });

      if (error) throw error;

      toast.success('Bond issued successfully');
      setOpen(false);
      setFormData({ name: '', symbol: '', total_value: '', apy: '', maturity_date: '' });
      onBondIssued();
    } catch (error: any) {
      toast.error(error.message || 'Failed to issue bond');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" /> Issue New Bond
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Issue Tokenized Railway Bond</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Bond Name</Label>
            <Input
              id="name"
              placeholder="e.g. Lobito Corridor Expansion Phase 2"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="symbol">Ticker Symbol</Label>
              <Input
                id="symbol"
                placeholder="LOB-26"
                value={formData.symbol}
                onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apy">Target APY (%)</Label>
              <Input
                id="apy"
                type="number"
                step="0.1"
                placeholder="8.5"
                value={formData.apy}
                onChange={(e) => setFormData({ ...formData, apy: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="value">Total Issuance Value (USD)</Label>
            <Input
              id="value"
              type="number"
              placeholder="5000000"
              value={formData.total_value}
              onChange={(e) => setFormData({ ...formData, total_value: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Maturity Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.maturity_date}
              onChange={(e) => setFormData({ ...formData, maturity_date: e.target.value })}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Issue Bond on Polygon
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
