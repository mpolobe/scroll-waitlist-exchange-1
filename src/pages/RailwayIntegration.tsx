import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Train } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import RailwayApiDocs from '@/components/railway/RailwayApiDocs';
import RailwayIntegrationGuide from '@/components/railway/RailwayIntegrationGuide';
import RailwaySandbox from '@/components/railway/RailwaySandbox';
import RailwayTransactions from '@/components/railway/RailwayTransactions';

export default function RailwayIntegration() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate('/')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
            <div className="flex items-center gap-2">
              <Train className="h-6 w-6 text-green-600" />
              <span className="text-xl font-bold">Africa Railways Integration</span>
            </div>
            <div className="w-32" />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-[400px] overflow-hidden">
        <img
          src="https://d64gsuwffb70l.cloudfront.net/6928d753085881c25b2cb3fb_1764290591451_01140006.webp"
          alt="Africa Railways"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40 flex items-center">
          <div className="container mx-auto px-4">
            <h1 className="text-5xl font-bold text-white mb-4">
              Africoin × Africa Railways
            </h1>
            <p className="text-xl text-white/90 max-w-2xl">
              Seamless cryptocurrency payments for railway tickets across Africa. 
              Fast, secure, and integrated with your existing booking system.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="api">API Docs</TabsTrigger>
            <TabsTrigger value="guide">Integration</TabsTrigger>
            <TabsTrigger value="sandbox">Sandbox</TabsTrigger>
            <TabsTrigger value="transactions">Live Transactions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-2xl font-bold text-green-600 mb-2">Instant Settlement</h3>
                <p className="text-muted-foreground">Receive payments in seconds, not days</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-2xl font-bold text-green-600 mb-2">Low Fees</h3>
                <p className="text-muted-foreground">Save up to 80% on transaction costs</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-2xl font-bold text-green-600 mb-2">Pan-African</h3>
                <p className="text-muted-foreground">One integration for all African markets</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="api">
            <RailwayApiDocs />
          </TabsContent>

          <TabsContent value="guide">
            <RailwayIntegrationGuide />
          </TabsContent>

          <TabsContent value="sandbox">
            <RailwaySandbox />
          </TabsContent>

          <TabsContent value="transactions">
            <RailwayTransactions />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
