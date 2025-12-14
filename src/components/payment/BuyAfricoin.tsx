import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PaymentMethodSelector } from './PaymentMethodSelector';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

const currencies = [
  { code: 'KES', name: 'Kenyan Shilling', rate: 1.0 },
  { code: 'NGN', name: 'Nigerian Naira', rate: 0.8 },
  { code: 'ZAR', name: 'South African Rand', rate: 1.2 },
  { code: 'GHS', name: 'Ghanaian Cedi', rate: 1.1 },
  { code: 'UGX', name: 'Ugandan Shilling', rate: 0.9 },
  { code: 'TZS', name: 'Tanzanian Shilling', rate: 0.95 }
];

export function BuyAfricoin({ onSuccess }: { onSuccess?: () => void }) {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('KES');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const selectedCurrency = currencies.find(c => c.code === currency);
  const africoinAmount = amount ? (parseFloat(amount) * (selectedCurrency?.rate || 1)).toFixed(2) : '0';

  const handlePurchase = async () => {
    if (!amount || !paymentMethod || !phoneNumber) {
      setStatus({ type: 'error', message: 'Please fill all fields' });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const { data, error } = await supabase.functions.invoke('process-payment', {
        body: {
          userId: 'user-123',
          amount: parseFloat(amount),
          currency,
          paymentMethod,
          phoneNumber,
          africoinAmount: parseFloat(africoinAmount)
        }
      });

      if (error) throw error;

      if (data.success) {
        setStatus({ type: 'success', message: data.message });
        setAmount('');
        setPhoneNumber('');
        onSuccess?.();
      } else {
        setStatus({ type: 'error', message: data.message });
      }
    } catch (error: any) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Buy Africoin</h2>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Amount</Label>
            <Input
              type="number"
              placeholder="100"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Currency</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map(c => (
                  <SelectItem key={c.code} value={c.code}>{c.code}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">You will receive</div>
          <div className="text-3xl font-bold text-orange-600">{africoinAmount} AFRC</div>
        </div>

        <PaymentMethodSelector
          selectedMethod={paymentMethod}
          onMethodChange={setPaymentMethod}
          phoneNumber={phoneNumber}
          onPhoneNumberChange={setPhoneNumber}
        />

        {status && (
          <div className={`p-4 rounded-lg ${status.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            {status.message}
          </div>
        )}

        <Button onClick={handlePurchase} disabled={loading} className="w-full" size="lg">
          {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</> : 'Complete Purchase'}
        </Button>
      </div>
    </Card>
  );
}