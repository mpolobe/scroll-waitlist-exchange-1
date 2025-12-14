import { Card } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

export default function RailwayIntegrationGuide() {
  const steps = [
    {
      title: 'Register Your Railway Service',
      description: 'Create a merchant account and get your API credentials',
      details: ['Sign up at merchant.africoin.com', 'Complete KYC verification', 'Receive API key and secret']
    },
    {
      title: 'Install SDK',
      description: 'Add Africoin SDK to your railway booking system',
      details: ['npm install @africoin/railway-sdk', 'Import and initialize with credentials', 'Configure webhook endpoints']
    },
    {
      title: 'Implement Payment Flow',
      description: 'Integrate Africoin payment into ticket purchase',
      details: ['Create payment request', 'Handle user authentication', 'Process payment confirmation']
    },
    {
      title: 'Test & Deploy',
      description: 'Test in sandbox environment before going live',
      details: ['Use test credentials', 'Simulate transactions', 'Deploy to production']
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Integration Guide</h2>
        <p className="text-muted-foreground">Step-by-step guide to integrate Africoin payments</p>
      </div>

      <div className="grid gap-6">
        {steps.map((step, index) => (
          <Card key={index} className="p-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                  {index + 1}
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground mb-4">{step.description}</p>
                <ul className="space-y-2">
                  {step.details.map((detail, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
