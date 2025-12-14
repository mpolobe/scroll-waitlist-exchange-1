import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Gift, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface RedeemPointsProps {
  availablePoints: number;
  onRedeem: (points: number) => void;
}

export function RedeemPoints({ availablePoints, onRedeem }: RedeemPointsProps) {
  const [pointsToRedeem, setPointsToRedeem] = useState('');
  const [error, setError] = useState('');

  const afcValue = pointsToRedeem ? parseInt(pointsToRedeem) * 10 : 0;

  const handleRedeem = () => {
    const points = parseInt(pointsToRedeem);
    
    if (!points || points <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    if (points > availablePoints) {
      setError('Insufficient points balance');
      return;
    }

    if (points < 10) {
      setError('Minimum redemption is 10 points');
      return;
    }

    setError('');
    onRedeem(points);
    setPointsToRedeem('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="w-5 h-5 text-purple-600" />
          Redeem Points
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="points">Points to Redeem</Label>
          <Input
            id="points"
            type="number"
            min="10"
            max={availablePoints}
            value={pointsToRedeem}
            onChange={(e) => setPointsToRedeem(e.target.value)}
            placeholder="Enter points amount"
          />
          <p className="text-sm text-gray-500 mt-1">
            Available: {availablePoints} points
          </p>
        </div>

        {afcValue > 0 && (
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">Discount Value</p>
            <p className="text-2xl font-bold text-green-600">{afcValue} AFC</p>
            <p className="text-xs text-gray-500">10 AFC = 1 point</p>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button 
          onClick={handleRedeem} 
          className="w-full"
          disabled={!pointsToRedeem || parseInt(pointsToRedeem) > availablePoints}
        >
          Redeem Points
        </Button>

        <div className="text-xs text-gray-500 space-y-1">
          <p>• Minimum redemption: 10 points (100 AFC)</p>
          <p>• Points convert to AFC at 1:10 ratio</p>
          <p>• Redeemed points are non-refundable</p>
        </div>
      </CardContent>
    </Card>
  );
}
