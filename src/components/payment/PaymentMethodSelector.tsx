import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { CreditCard, Smartphone } from 'lucide-react';

interface PaymentMethodSelectorProps {
  selectedMethod: string;
  onMethodChange: (method: string) => void;
  phoneNumber: string;
  onPhoneNumberChange: (phone: string) => void;
}

export function PaymentMethodSelector({
  selectedMethod,
  onMethodChange,
  phoneNumber,
  onPhoneNumberChange
}: PaymentMethodSelectorProps) {
  const isMobileMethod = ['mpesa', 'mtn', 'airtel'].includes(selectedMethod);

  return (
    <div className="space-y-4">
      <Label className="text-lg font-semibold">Select Payment Method</Label>
      <RadioGroup value={selectedMethod} onValueChange={onMethodChange}>
        {/* Card Payment - Stripe */}
        <Card className={`p-4 cursor-pointer transition-colors ${selectedMethod === 'stripe' ? 'border-orange-500 bg-orange-50' : 'hover:border-orange-500'}`}>
          <div className="flex items-center space-x-3">
            <RadioGroupItem value="stripe" id="stripe" />
            <Label htmlFor="stripe" className="flex-1 cursor-pointer">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                <div className="font-semibold">Credit/Debit Card</div>
              </div>
              <div className="text-sm text-gray-500">Visa, Mastercard, American Express</div>
            </Label>
          </div>
        </Card>

        {/* Mobile Money Section */}
        <div className="pt-2">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Smartphone className="w-4 h-4" />
            <span>Mobile Money</span>
          </div>
        </div>

        <Card className={`p-4 cursor-pointer transition-colors ${selectedMethod === 'mpesa' ? 'border-orange-500 bg-orange-50' : 'hover:border-orange-500'}`}>
          <div className="flex items-center space-x-3">
            <RadioGroupItem value="mpesa" id="mpesa" />
            <Label htmlFor="mpesa" className="flex-1 cursor-pointer">
              <div className="font-semibold">M-Pesa</div>
              <div className="text-sm text-gray-500">Kenya, Tanzania, South Africa</div>
            </Label>
          </div>
        </Card>

        <Card className={`p-4 cursor-pointer transition-colors ${selectedMethod === 'mtn' ? 'border-orange-500 bg-orange-50' : 'hover:border-orange-500'}`}>
          <div className="flex items-center space-x-3">
            <RadioGroupItem value="mtn" id="mtn" />
            <Label htmlFor="mtn" className="flex-1 cursor-pointer">
              <div className="font-semibold">MTN Mobile Money</div>
              <div className="text-sm text-gray-500">Ghana, Uganda, Nigeria, Cameroon</div>
            </Label>
          </div>
        </Card>

        <Card className={`p-4 cursor-pointer transition-colors ${selectedMethod === 'airtel' ? 'border-orange-500 bg-orange-50' : 'hover:border-orange-500'}`}>
          <div className="flex items-center space-x-3">
            <RadioGroupItem value="airtel" id="airtel" />
            <Label htmlFor="airtel" className="flex-1 cursor-pointer">
              <div className="font-semibold">Airtel Money</div>
              <div className="text-sm text-gray-500">Kenya, Uganda, Tanzania, Zambia</div>
            </Label>
          </div>
        </Card>
      </RadioGroup>

      {isMobileMethod && (
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+254 712 345 678"
            value={phoneNumber}
            onChange={(e) => onPhoneNumberChange(e.target.value)}
          />
        </div>
      )}
    </div>
  );
}