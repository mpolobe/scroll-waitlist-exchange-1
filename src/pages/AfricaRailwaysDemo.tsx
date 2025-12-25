import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AfricaRailwaysBooking } from '@/components/railway/AfricaRailwaysBooking';
import { MarketingNav } from '@/components/MarketingNav';
import { MarketingFooter } from '@/components/MarketingFooter';
import { Train, Zap, Shield, Globe, CheckCircle, ArrowRight } from 'lucide-react';

export default function AfricaRailwaysDemo() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50">
      <MarketingNav />
      
      <div className="max-w-7xl mx-auto px-4 py-24">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Zap className="w-4 h-4" />
            New Integration
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-orange-600 to-purple-600 bg-clip-text text-transparent">
            Africa Railways Integration
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Connecting Africoin Wallet with Africa Railways' Sui blockchain infrastructure
            for seamless pan-African rail travel
          </p>
        </div>

        {/* Integration Benefits */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <Train className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="font-bold text-lg mb-2">Real Railway Data</h3>
            <p className="text-gray-600 text-sm">
              Access live train schedules, real-time tracking, and actual seat availability
              from Africa Railways' Go backend
            </p>
          </Card>

          <Card className="p-6">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-bold text-lg mb-2">Cross-Chain Payments</h3>
            <p className="text-gray-600 text-sm">
              Pay with AFC (Ethereum) and seamlessly bridge to AFRC (Sui) for railway bookings
            </p>
          </Card>

          <Card className="p-6">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Globe className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-bold text-lg mb-2">Pan-African Network</h3>
            <p className="text-gray-600 text-sm">
              Connect 54 nations via high-speed rail with blockchain-verified tickets
              and transparent logistics
            </p>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white shadow-sm">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="booking">Live Booking</TabsTrigger>
            <TabsTrigger value="technical">Technical Details</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-6">Integration Architecture</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    What's Integrated
                  </h3>
                  <ul className="space-y-2 ml-7">
                    <li className="text-gray-700">✓ Africa Railways API client with full endpoint coverage</li>
                    <li className="text-gray-700">✓ Real-time train tracking via WebSocket</li>
                    <li className="text-gray-700">✓ Route search and booking system</li>
                    <li className="text-gray-700">✓ Payment bridge architecture (Ethereum ↔ Sui)</li>
                    <li className="text-gray-700">✓ Sentinel network integration</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <ArrowRight className="w-5 h-5 text-orange-500" />
                    How It Works
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                        1
                      </div>
                      <div>
                        <p className="font-medium">User searches for routes</p>
                        <p className="text-sm text-gray-600">Africoin UI calls Africa Railways API for real train schedules</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                        2
                      </div>
                      <div>
                        <p className="font-medium">User selects route and books</p>
                        <p className="text-sm text-gray-600">Booking created on Africa Railways backend (Go + Sui)</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                        3
                      </div>
                      <div>
                        <p className="font-medium">Payment processing</p>
                        <p className="text-sm text-gray-600">AFC (Ethereum) bridged to AFRC (Sui) via payment gateway</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                        4
                      </div>
                      <div>
                        <p className="font-medium">Booking confirmed</p>
                        <p className="text-sm text-gray-600">Digital ticket issued on Sui blockchain, real-time tracking enabled</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
              <h3 className="font-bold text-lg mb-2">Implementation Status</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">API Client</span>
                  <span className="text-sm font-medium text-green-600">✓ Complete</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Booking Component</span>
                  <span className="text-sm font-medium text-green-600">✓ Complete</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Payment Bridge</span>
                  <span className="text-sm font-medium text-yellow-600">⚠ Pending Configuration</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Backend Deployment</span>
                  <span className="text-sm font-medium text-yellow-600">⚠ Pending Setup</span>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Live Booking Tab */}
          <TabsContent value="booking">
            <AfricaRailwaysBooking />
          </TabsContent>

          {/* Technical Details Tab */}
          <TabsContent value="technical" className="space-y-6">
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-6">Technical Specifications</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3">API Endpoints</h3>
                  <div className="bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-sm space-y-1">
                    <div><span className="text-green-400">GET</span>  /api/v1/routes/search</div>
                    <div><span className="text-yellow-400">POST</span> /api/v1/bookings</div>
                    <div><span className="text-green-400">GET</span>  /api/v1/bookings/:id</div>
                    <div><span className="text-green-400">GET</span>  /api/v1/trains/:id/telemetry</div>
                    <div><span className="text-yellow-400">POST</span> /api/v1/payments/process</div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Environment Configuration</h3>
                  <div className="bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-sm space-y-1">
                    <div><span className="text-blue-400">VITE_AFRICA_RAILWAYS_API_URL</span>=https://api.africa-railways.com</div>
                    <div><span className="text-blue-400">AFRICA_RAILWAYS_API_KEY</span>=your-api-key</div>
                    <div><span className="text-blue-400">VITE_SUI_NETWORK</span>=testnet</div>
                    <div><span className="text-blue-400">VITE_BRIDGE_SERVICE_URL</span>=https://bridge.africoin.com</div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Blockchain Networks</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="font-medium text-blue-900">Africoin Wallet</p>
                      <p className="text-sm text-blue-700 mt-1">Ethereum Sepolia Testnet</p>
                      <p className="text-xs text-blue-600 mt-2">AFC Token (ERC-20)</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <p className="font-medium text-purple-900">Africa Railways</p>
                      <p className="text-sm text-purple-700 mt-1">Sui Blockchain</p>
                      <p className="text-xs text-purple-600 mt-2">AFRC Token (Sui Move)</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-bold text-lg mb-4">Next Steps</h3>
              <ol className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    1
                  </span>
                  <div>
                    <p className="font-medium">Configure API Credentials</p>
                    <p className="text-sm text-gray-600">Add Africa Railways API key to .env.local</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    2
                  </span>
                  <div>
                    <p className="font-medium">Deploy Bridge Service</p>
                    <p className="text-sm text-gray-600">Set up payment gateway for cross-chain transactions</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    3
                  </span>
                  <div>
                    <p className="font-medium">Test End-to-End Flow</p>
                    <p className="text-sm text-gray-600">Complete booking from search to payment confirmation</p>
                  </div>
                </li>
              </ol>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Documentation Link */}
        <Card className="p-6 mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg mb-1">Full Integration Documentation</h3>
              <p className="text-sm text-gray-600">
                Complete technical specifications, architecture diagrams, and implementation guide
              </p>
            </div>
            <Button
              onClick={() => window.open('/AFRICA_RAILWAYS_INTEGRATION.md', '_blank')}
              className="bg-gradient-to-r from-orange-500 to-amber-500"
            >
              View Docs
            </Button>
          </div>
        </Card>
      </div>

      <MarketingFooter />
    </div>
  );
}
