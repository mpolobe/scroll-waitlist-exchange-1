import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Train, Code, Zap, Shield } from 'lucide-react';

const RailwayIntegrationSection: React.FC = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 to-orange-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Powering Africa Railways
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Seamless payment integration for railway ticket purchases across Africa
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center mb-12">
          <div>
            <img 
              src="https://d64gsuwffb70l.cloudfront.net/6928d753085881c25b2cb3fb_1764290831013_6f83eecc.webp"
              alt="Africa Railways Station"
              className="rounded-lg shadow-xl"
            />
          </div>
          <div className="space-y-6">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <Train className="w-10 h-10 text-blue-600 mb-3" />
              <h3 className="text-xl font-semibold mb-2">Instant Ticket Payments</h3>
              <p className="text-gray-600">Process railway ticket purchases in seconds with Africoin</p>
            </Card>
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <Code className="w-10 h-10 text-orange-600 mb-3" />
              <h3 className="text-xl font-semibold mb-2">Easy API Integration</h3>
              <p className="text-gray-600">Complete documentation and sandbox for testing</p>
            </Card>
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <Zap className="w-10 h-10 text-blue-600 mb-3" />
              <h3 className="text-xl font-semibold mb-2">Real-Time Processing</h3>
              <p className="text-gray-600">Monitor transactions and settlements instantly</p>
            </Card>
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <Shield className="w-10 h-10 text-orange-600 mb-3" />
              <h3 className="text-xl font-semibold mb-2">Secure & Compliant</h3>
              <p className="text-gray-600">Bank-grade security for all railway transactions</p>
            </Card>
          </div>
        </div>

        <div className="text-center">
          <Link to="/railway">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg">
              Explore Railway Integration
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default RailwayIntegrationSection;
