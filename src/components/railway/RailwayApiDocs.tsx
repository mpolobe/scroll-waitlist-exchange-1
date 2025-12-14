import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';

export default function RailwayApiDocs() {
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(id);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  const endpoints = [
    {
      id: 'purchase',
      method: 'POST',
      path: '/api/v1/railway/purchase',
      description: 'Purchase railway tickets with Africoin',
      code: `{
  "route_id": "NAI-MSA-001",
  "passenger_count": 2,
  "class": "first",
  "payment_method": "africoin"
}`
    },
    {
      id: 'validate',
      method: 'GET',
      path: '/api/v1/railway/validate/:ticket_id',
      description: 'Validate ticket before boarding',
      code: `GET /api/v1/railway/validate/TKT-123456`
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">API Documentation</h2>
        <p className="text-muted-foreground">Complete API reference for Africa Railways integration</p>
      </div>

      <Tabs defaultValue="purchase" className="w-full">
        <TabsList>
          {endpoints.map(ep => (
            <TabsTrigger key={ep.id} value={ep.id}>{ep.method}</TabsTrigger>
          ))}
        </TabsList>
        {endpoints.map(ep => (
          <TabsContent key={ep.id} value={ep.id}>
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">{ep.method}</span>
                  <code className="ml-3 text-sm">{ep.path}</code>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(ep.code, ep.id)}
                >
                  {copiedEndpoint === ep.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{ep.description}</p>
              <pre className="bg-slate-900 text-slate-50 p-4 rounded-lg overflow-x-auto">
                <code>{ep.code}</code>
              </pre>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
