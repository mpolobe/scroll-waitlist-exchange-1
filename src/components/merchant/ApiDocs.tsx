import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const ApiDocs = () => {
  const [copiedEndpoint, setCopiedEndpoint] = useState('');

  const copyToClipboard = (text: string, endpoint: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(endpoint);
    setTimeout(() => setCopiedEndpoint(''), 2000);
  };

  const endpoints = [
    {
      method: 'POST',
      path: '/api/v1/payments/create',
      description: 'Create a new payment request',
      code: `curl -X POST https://api.africoin.io/v1/payments/create \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": 100.00,
    "currency": "USD",
    "customer_email": "customer@example.com",
    "description": "Payment for order #123"
  }'`
    },
    {
      method: 'GET',
      path: '/api/v1/payments/:id',
      description: 'Retrieve payment details',
      code: `curl -X GET https://api.africoin.io/v1/payments/txn_123456 \\
  -H "Authorization: Bearer YOUR_API_KEY"`
    },
    {
      method: 'POST',
      path: '/api/v1/refunds/create',
      description: 'Process a refund',
      code: `curl -X POST https://api.africoin.io/v1/refunds/create \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "payment_id": "txn_123456",
    "amount": 50.00,
    "reason": "Customer request"
  }'`
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">API Documentation</h1>
        <p className="text-gray-600">Complete reference for integrating Africoin payments into your application</p>
      </div>

      <Card className="p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Authentication</h2>
        <p className="text-gray-600 mb-4">All API requests require authentication using your API key in the Authorization header:</p>
        <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
          Authorization: Bearer YOUR_API_KEY
        </div>
      </Card>

      <div className="space-y-6">
        {endpoints.map((endpoint, idx) => (
          <Card key={idx} className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <span className={`px-3 py-1 rounded font-semibold text-sm ${endpoint.method === 'POST' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                {endpoint.method}
              </span>
              <code className="text-lg font-mono">{endpoint.path}</code>
            </div>
            <p className="text-gray-600 mb-4">{endpoint.description}</p>
            <div className="relative">
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                {endpoint.code}
              </pre>
              <Button
                onClick={() => copyToClipboard(endpoint.code, endpoint.path)}
                size="sm"
                className="absolute top-2 right-2"
              >
                {copiedEndpoint === endpoint.path ? 'Copied!' : 'Copy'}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ApiDocs;
