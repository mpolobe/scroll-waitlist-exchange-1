import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2 } from 'lucide-react';

export default function RailwaySandbox() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [formData, setFormData] = useState({
    route: '',
    passengers: '1',
    class: 'economy'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    // Simulate API call
    setTimeout(() => {
      setResult({
        success: true,
        transaction_id: 'TXN-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        ticket_id: 'TKT-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        amount: parseFloat(formData.passengers) * (formData.class === 'first' ? 50 : 25),
        status: 'confirmed'
      });
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Sandbox Environment</h2>
        <p className="text-muted-foreground">Test railway ticket purchases in a safe environment</p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="route">Route</Label>
            <Select value={formData.route} onValueChange={(v) => setFormData({...formData, route: v})}>
              <SelectTrigger>
                <SelectValue placeholder="Select route" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NAI-MSA">Nairobi to Mombasa</SelectItem>
                <SelectItem value="LAG-ABJ">Lagos to Abuja</SelectItem>
                <SelectItem value="JNB-CPT">Johannesburg to Cape Town</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="passengers">Passengers</Label>
            <Input
              id="passengers"
              type="number"
              min="1"
              max="10"
              value={formData.passengers}
              onChange={(e) => setFormData({...formData, passengers: e.target.value})}
            />
          </div>

          <div>
            <Label htmlFor="class">Class</Label>
            <Select value={formData.class} onValueChange={(v) => setFormData({...formData, class: v})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="economy">Economy - 25 AFC</SelectItem>
                <SelectItem value="first">First Class - 50 AFC</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full" disabled={loading || !formData.route}>
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</> : 'Test Purchase'}
          </Button>
        </form>

        {result && (
          <Alert className="mt-4 border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription>
              <div className="space-y-1 text-sm">
                <p><strong>Transaction ID:</strong> {result.transaction_id}</p>
                <p><strong>Ticket ID:</strong> {result.ticket_id}</p>
                <p><strong>Amount:</strong> {result.amount} AFC</p>
                <p><strong>Status:</strong> {result.status}</p>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </Card>
    </div>
  );
}
