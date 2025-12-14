import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const SandboxEnvironment = () => {
  const [amount, setAmount] = useState('100.00');
  const [currency, setCurrency] = useState('USD');
  const [testResult, setTestResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTestPayment = async () => {
    setIsLoading(true);
    setTimeout(() => {
      setTestResult({
        success: true,
        transactionId: `TEST_${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        amount: parseFloat(amount),
        currency,
        status: 'completed',
        timestamp: new Date().toISOString()
      });
      setIsLoading(false);
    }, 1500);
  };

  const testCards = [
    { number: '4242 4242 4242 4242', type: 'Success', description: 'Payment succeeds' },
    { number: '4000 0000 0000 0002', type: 'Decline', description: 'Card declined' },
    { number: '4000 0000 0000 9995', type: 'Insufficient', description: 'Insufficient funds' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Sandbox Environment</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Test Payment</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Amount</label>
              <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="100.00" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Currency</label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="NGN">NGN</SelectItem>
                  <SelectItem value="KES">KES</SelectItem>
                  <SelectItem value="GHS">GHS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleTestPayment} disabled={isLoading} className="w-full bg-gradient-to-r from-orange-500 to-purple-600">
              {isLoading ? 'Processing...' : 'Test Payment'}
            </Button>
          </div>

          {testResult && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-bold text-green-800 mb-2">Test Result</h3>
              <pre className="text-sm text-green-700 overflow-x-auto">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Test Cards</h2>
          <p className="text-gray-600 mb-4">Use these test card numbers to simulate different payment scenarios:</p>
          <div className="space-y-3">
            {testCards.map((card, idx) => (
              <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <code className="font-mono text-sm">{card.number}</code>
                  <span className={`px-2 py-1 rounded text-xs ${card.type === 'Success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {card.type}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{card.description}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SandboxEnvironment;
