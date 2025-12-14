import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Send } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export function AdminEmailCampaigns() {
  const [sending, setSending] = useState(false);
  const [campaign, setCampaign] = useState({
    title: '',
    description: '',
    discount: 20,
    promoCode: '',
    validUntil: '',
    routes: [
      { from: 'Cairo', to: 'Nairobi', distance: '3,200', duration: '40h', originalPrice: '2,400', discountedPrice: '1,920' }
    ]
  });

  const sendPromoEmail = async () => {
    if (!campaign.title || !campaign.promoCode || !campaign.validUntil) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSending(true);
    try {
      const { data: users } = await supabase.from('profiles').select('email, full_name');
      
      if (!users || users.length === 0) {
        toast.error('No users found');
        return;
      }

      let successCount = 0;
      for (const user of users) {
        if (!user.email) continue;
        
        const { error } = await supabase.functions.invoke('send-promotional-email', {
          body: {
            email: user.email,
            userName: user.full_name || 'Valued Customer',
            promotionTitle: campaign.title,
            promotionDescription: campaign.description,
            discountPercentage: campaign.discount,
            routes: campaign.routes,
            validUntil: campaign.validUntil,
            promoCode: campaign.promoCode
          }
        });

        if (!error) successCount++;
      }

      toast.success(`Campaign sent to ${successCount} users!`);
      setCampaign({ ...campaign, title: '', description: '', promoCode: '' });
    } catch (error) {
      toast.error('Failed to send campaign');
    } finally {
      setSending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Email Campaigns
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Campaign Title</Label>
          <Input value={campaign.title} onChange={(e) => setCampaign({ ...campaign, title: e.target.value })} placeholder="Summer Sale" />
        </div>
        <div>
          <Label>Description</Label>
          <Textarea value={campaign.description} onChange={(e) => setCampaign({ ...campaign, description: e.target.value })} placeholder="Limited time offer..." />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label>Discount %</Label>
            <Input type="number" value={campaign.discount} onChange={(e) => setCampaign({ ...campaign, discount: parseInt(e.target.value) })} />
          </div>
          <div>
            <Label>Promo Code</Label>
            <Input value={campaign.promoCode} onChange={(e) => setCampaign({ ...campaign, promoCode: e.target.value.toUpperCase() })} placeholder="SUMMER20" />
          </div>
          <div>
            <Label>Valid Until</Label>
            <Input type="date" value={campaign.validUntil} onChange={(e) => setCampaign({ ...campaign, validUntil: e.target.value })} />
          </div>
        </div>
        <Button onClick={sendPromoEmail} disabled={sending} className="w-full">
          <Send className="mr-2 h-4 w-4" />
          {sending ? 'Sending...' : 'Send Campaign to All Users'}
        </Button>
      </CardContent>
    </Card>
  );
}