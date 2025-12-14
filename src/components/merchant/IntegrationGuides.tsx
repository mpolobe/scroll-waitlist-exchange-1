import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const IntegrationGuides = () => {
  const [activeLanguage, setActiveLanguage] = useState('javascript');

  const guides = {
    javascript: `// Install the Africoin SDK
npm install @africoin/sdk

// Initialize the SDK
import Africoin from '@africoin/sdk';

const africoin = new Africoin({
  apiKey: 'YOUR_API_KEY',
  environment: 'production' // or 'sandbox'
});

// Create a payment
const payment = await africoin.payments.create({
  amount: 100.00,
  currency: 'USD',
  customerEmail: 'customer@example.com',
  description: 'Order #123'
});

// Handle the response
console.log('Payment ID:', payment.id);
console.log('Payment URL:', payment.checkoutUrl);`,
    
    python: `# Install the Africoin SDK
pip install africoin

# Initialize the SDK
import africoin

africoin.api_key = 'YOUR_API_KEY'
africoin.environment = 'production'  # or 'sandbox'

# Create a payment
payment = africoin.Payment.create(
    amount=100.00,
    currency='USD',
    customer_email='customer@example.com',
    description='Order #123'
)

# Handle the response
print(f'Payment ID: {payment.id}')
print(f'Payment URL: {payment.checkout_url}')`,
    
    php: `<?php
// Install the Africoin SDK
// composer require africoin/africoin-php

require_once('vendor/autoload.php');

// Initialize the SDK
\\Africoin\\Africoin::setApiKey('YOUR_API_KEY');
\\Africoin\\Africoin::setEnvironment('production'); // or 'sandbox'

// Create a payment
$payment = \\Africoin\\Payment::create([
    'amount' => 100.00,
    'currency' => 'USD',
    'customer_email' => 'customer@example.com',
    'description' => 'Order #123'
]);

// Handle the response
echo 'Payment ID: ' . $payment->id;
echo 'Payment URL: ' . $payment->checkout_url;
?>`
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Integration Guides</h1>

      <Card className="p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Quick Start</h2>
        <ol className="list-decimal list-inside space-y-3 text-gray-700">
          <li>Sign up for a merchant account and get your API keys</li>
          <li>Install the Africoin SDK for your preferred language</li>
          <li>Initialize the SDK with your API key</li>
          <li>Create payment requests and handle responses</li>
          <li>Test in sandbox mode before going live</li>
        </ol>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Code Examples</h2>
        <Tabs value={activeLanguage} onValueChange={setActiveLanguage}>
          <TabsList className="mb-4">
            <TabsTrigger value="javascript">JavaScript</TabsTrigger>
            <TabsTrigger value="python">Python</TabsTrigger>
            <TabsTrigger value="php">PHP</TabsTrigger>
          </TabsList>
          
          {Object.entries(guides).map(([lang, code]) => (
            <TabsContent key={lang} value={lang}>
              <pre className="bg-gray-900 text-green-400 p-6 rounded-lg overflow-x-auto text-sm">
                {code}
              </pre>
            </TabsContent>
          ))}
        </Tabs>
      </Card>
    </div>
  );
};

export default IntegrationGuides;
