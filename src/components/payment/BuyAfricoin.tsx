import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PaymentMethodSelector } from './PaymentMethodSelector';
import { StripePayment } from './StripePayment';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const currencies = [
  { code: 'USD', name: 'US Dollar', rate: 1.0 },
  { code: 'KES', name: 'Kenyan Shilling', rate: 0.0077 },
  { code: 'NGN', name: 'Nigerian Naira', rate: 0.00063 },
  { code: 'ZAR', name: 'South African Rand', rate: 0.054 },
  { code: 'GHS', name: 'Ghanaian Cedi', rate: 0.064 },
  { code: 'UGX', name: 'Ugandan Shilling', rate: 0.00027 },
  { code: 'TZS', name: 'Tanzanian Shilling', rate: 0.00038 }
];

export function BuyAfricoin({ onSuccess }: { onSuccess?: () => void }) {
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const selectedCurrency = currencies.find(c => c.code === currency);
  const usdAmount = amount ? (parseFloat(amount) * (selectedCurrency?.rate || 1)) : 0;
  const africoinAmount = usdAmount.toFixed(2); // 1 AFC = 1 USD

  const handleMobilePayment = async () => {
    if (!amount || !paymentMethod || !phoneNumber) {
      setStatus({ type: 'error', message: 'Please fill all fields' });
      return;
    }

    if (!user) {
      setStatus({ type: 'error', message: 'You must be logged in to purchase.' });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const { data, error } = await supabase.functions.invoke('process-payment', {
        body: {
          userId: user.id,
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

  const handleStripeSuccess = async (paymentIntent: any) => {
    setStatus({ type: 'success', message: `Payment successful! You will receive ${africoinAmount} AFC.` });
    setAmount('');
    
    // Record the purchase in database
    if (user) {
      try {
        await supabase.from('transactions').insert({
          user_id: user.id,
          type: 'purchase',
          amount: parseFloat(africoinAmount),
          currency: 'AFC',
          payment_method: 'stripe',
          payment_id: paymentIntent.id,
          status: 'completed'
        });
      } catch (err) {
        console.error('Failed to record transaction:', err);
      }
    }
    
    onSuccess?.();
  };

  const handleStripeError = (error: string) => {
    setStatus({ type: 'error', message: error });
  };

  const isMobileMethod = ['mpesa', 'mtn', 'airtel'].includes(paymentMethod);
  const isStripeMethod = paymentMethod === 'stripe';

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
          <div className="text-3xl font-bold text-orange-600">{africoinAmount} AFC</div>
          <div className="text-xs text-gray-500 mt-1">1 AFC = 1 USD</div>
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

        {/* Stripe Payment Form */}
        {isStripeMethod && amount && parseFloat(amount) > 0 && (
          <StripePayment
            amount={usdAmount}
            currency="USD"
            onSuccess={handleStripeSuccess}
            onError={handleStripeError}
          />
        )}

        {/* Mobile Money Payment Button */}
        {isMobileMethod && (
          <Button onClick={handleMobilePayment} disabled={loading} className="w-full" size="lg">
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</> : 'Complete Purchase'}
          </Button>
        )}
      </div>
    </Card>
  );
}