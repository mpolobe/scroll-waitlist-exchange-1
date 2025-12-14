import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Smartphone, CreditCard, Plus } from 'lucide-react';

const mockPaymentMethods = [
  { id: '1', type: 'mobile', provider: 'M-Pesa', phone: '+254712345678', isDefault: true },
  { id: '2', type: 'mobile', provider: 'MTN Mobile Money', phone: '+233201234567', isDefault: false },
  { id: '3', type: 'mobile', provider: 'Airtel Money', phone: '+256701234567', isDefault: false }
];

export function PaymentMethods() {
  const [methods] = useState(mockPaymentMethods);

  const getIcon = (type: string) => {
    return type === 'mobile' ? <Smartphone className="h-6 w-6 text-orange-600" /> : <CreditCard className="h-6 w-6 text-blue-600" />;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Saved Payment Methods</CardTitle>
        <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Method
        </Button>
      </CardHeader>
      <CardContent>
        {methods.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No payment methods saved yet.</p>
            <p className="text-sm text-gray-500 mt-2">Add a payment method for faster checkout.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {methods.map((method) => (
              <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg hover:border-orange-300 transition-colors">
                <div className="flex items-center gap-4">
                  {getIcon(method.type)}
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{method.provider}</p>
                      {method.isDefault && <Badge className="bg-orange-100 text-orange-800">Default</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">{method.phone}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Edit</Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
