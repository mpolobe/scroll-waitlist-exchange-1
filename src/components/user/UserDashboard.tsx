import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { TransactionHistory } from './TransactionHistory';
import { PaymentMethods } from './PaymentMethods';
import { UserProfile } from './UserProfile';
import { FavoritePosts } from './FavoritePosts';
import { WalletBalance } from '@/components/wallet/WalletBalance';
import { BuyAfricoin } from '@/components/payment/BuyAfricoin';
import { LoyaltyDashboard } from '@/components/loyalty/LoyaltyDashboard';
import { PointsHistory } from '@/components/loyalty/PointsHistory';
import { RedeemPoints } from '@/components/loyalty/RedeemPoints';
import { Wallet, CreditCard, User, Heart, Plus, Award } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';


export function UserDashboard() {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState({ balance: 0, transactions: 0, favorites: 0 });
  const [buyDialogOpen, setBuyDialogOpen] = useState(false);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);

  useEffect(() => {
    loadUserData();
  }, [user]);

  const loadUserData = async () => {
    setStats({ balance: 1250.50, transactions: 24, favorites: 8 });
    
    if (user) {
      const { data } = await supabase
        .from('loyalty_points')
        .select('points_balance')
        .eq('user_id', user.id)
        .single();
      
      if (data) setLoyaltyPoints(data.points_balance);
    }
  };

  const handlePurchaseSuccess = () => {
    setBuyDialogOpen(false);
    setStats(prev => ({ ...prev, balance: prev.balance + 100 }));
  };

  const handleRedeemPoints = async (points: number) => {
    if (!user) return;

    const afcDiscount = points * 10;
    
    const { error } = await supabase
      .from('points_transactions')
      .insert({
        user_id: user.id,
        transaction_type: 'redeemed',
        points_amount: points,
        description: `Redeemed ${points} points for ${afcDiscount} AFC discount`
      });

    if (!error) {
      await supabase
        .from('loyalty_points')
        .update({ points_balance: loyaltyPoints - points })
        .eq('user_id', user.id);

      setLoyaltyPoints(loyaltyPoints - points);
      toast.success(`Redeemed ${points} points for ${afcDiscount} AFC!`);
    } else {
      toast.error('Failed to redeem points');
    }
  };


  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Welcome back, {profile?.full_name || 'User'}!</h1>
        <Dialog open={buyDialogOpen} onOpenChange={setBuyDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="bg-orange-600 hover:bg-orange-700">
              <Plus className="mr-2 h-5 w-5" /> Buy Africoin
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <BuyAfricoin onSuccess={handlePurchaseSuccess} />
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2">
          <WalletBalance />
        </div>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.transactions}</div>
          </CardContent>
        </Card>
      </div>


      <Tabs defaultValue="transactions" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="loyalty">
            <Award className="w-4 h-4 mr-2" />
            Loyalty
          </TabsTrigger>
          <TabsTrigger value="redeem">Redeem</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>
        <TabsContent value="transactions"><TransactionHistory /></TabsContent>
        <TabsContent value="loyalty">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {user && <LoyaltyDashboard userId={user.id} />}
            {user && <PointsHistory userId={user.id} />}
          </div>
        </TabsContent>
        <TabsContent value="redeem">
          <div className="max-w-md mx-auto">
            <RedeemPoints availablePoints={loyaltyPoints} onRedeem={handleRedeemPoints} />
          </div>
        </TabsContent>
        <TabsContent value="payment"><PaymentMethods /></TabsContent>
        <TabsContent value="favorites"><FavoritePosts /></TabsContent>
        <TabsContent value="profile"><UserProfile /></TabsContent>
      </Tabs>

    </div>
  );
}
