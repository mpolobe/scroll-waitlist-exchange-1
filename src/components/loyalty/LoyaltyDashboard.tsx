import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { TierBadge } from './TierBadge';
import { Award, Gift, TrendingUp, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';


const tierThresholds = {
  Bronze: 0,
  Silver: 500,
  Gold: 1500,
  Platinum: 5000
};

const tierBenefits = {
  Bronze: ['Earn 1 point per 10 AFC', 'Birthday bonus', 'Email support'],
  Silver: ['5% discount', 'Priority boarding', 'Free seat selection', '24/7 support'],
  Gold: ['10% discount', 'Free upgrades', 'Lounge access', 'Priority refunds'],
  Platinum: ['15% discount', 'Guaranteed upgrades', 'VIP lounge', 'Free cancellations', 'Travel concierge']
};

export function LoyaltyDashboard({ userId }: { userId: string }) {
  const [points, setPoints] = useState(0);
  const [lifetime, setLifetime] = useState(0);
  const [tier, setTier] = useState<'Bronze' | 'Silver' | 'Gold' | 'Platinum'>('Bronze');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLoyaltyData();
  }, [userId]);

  const loadLoyaltyData = async () => {
    const { data } = await supabase
      .from('loyalty_points')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (data) {
      setPoints(data.points_balance);
      setLifetime(data.lifetime_points);
      setTier(data.tier_level);
    }
    setLoading(false);
  };

  const nextTier = tier === 'Bronze' ? 'Silver' : tier === 'Silver' ? 'Gold' : tier === 'Gold' ? 'Platinum' : null;
  const nextThreshold = nextTier ? tierThresholds[nextTier] : 0;
  const progress = nextTier ? ((lifetime / nextThreshold) * 100) : 100;

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-purple-600 to-blue-600 text-white">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Award className="w-6 h-6" />
              Your Loyalty Status
            </span>
            <TierBadge tier={tier} size="lg" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm opacity-90">Available Points</p>
              <p className="text-3xl font-bold">{points}</p>
            </div>
            <div>
              <p className="text-sm opacity-90">Lifetime Points</p>
              <p className="text-3xl font-bold">{lifetime}</p>
            </div>
          </div>
          {nextTier && (
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Progress to {nextTier}</span>
                <span>{lifetime} / {nextThreshold}</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            Your Benefits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {tierBenefits[tier].map((benefit, i) => (
              <li key={i} className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-green-600" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
