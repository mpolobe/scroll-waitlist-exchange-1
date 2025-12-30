import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, FileCheck, Lock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const Compliance: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-orange-500 to-purple-600 bg-clip-text text-transparent">
            Compliance & Regulatory Framework
          </h1>
          <p className="text-gray-600 mb-8">Last updated: December 30, 2025</p>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="p-6">
              <Shield className="w-12 h-12 text-orange-600 mb-4" />
              <h3 className="text-xl font-bold mb-2">Security First</h3>
              <p className="text-gray-700">Bank-grade security and encryption standards</p>
            </Card>
            <Card className="p-6">
              <FileCheck className="w-12 h-12 text-purple-600 mb-4" />
              <h3 className="text-xl font-bold mb-2">Regulatory Compliance</h3>
              <p className="text-gray-700">Adherence to international financial regulations</p>
            </Card>
            <Card className="p-6">
              <Lock className="w-12 h-12 text-orange-600 mb-4" />
              <h3 className="text-xl font-bold mb-2">Data Protection</h3>
              <p className="text-gray-700">GDPR and data privacy compliance</p>
            </Card>
            <Card className="p-6">
              <AlertCircle className="w-12 h-12 text-purple-600 mb-4" />
              <h3 className="text-xl font-bold mb-2">Transparency</h3>
              <p className="text-gray-700">Clear policies and open communication</p>
            </Card>
          </div>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">1. Regulatory Compliance</h2>
              <p className="text-gray-700 mb-4">
                Africoin is committed to operating in full compliance with applicable laws and regulations across all jurisdictions where we operate.
              </p>
              
              <h3 className="text-xl font-semibold mb-3">1.1 Financial Regulations</h3>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Anti-Money Laundering (AML) compliance</li>
                <li>Counter-Terrorism Financing (CTF) measures</li>
                <li>Know Your Customer (KYC) procedures</li>
                <li>Financial Action Task Force (FATF) guidelines</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">1.2 Regional Compliance</h3>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>African Union financial regulations</li>
                <li>Individual country regulatory requirements</li>
                <li>Cross-border transaction compliance</li>
                <li>Local licensing and registration</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">2. Anti-Money Laundering (AML)</h2>
              <p className="text-gray-700 mb-4">
                We maintain strict AML policies to prevent financial crimes:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Transaction monitoring and analysis</li>
                <li>Suspicious activity reporting</li>
                <li>Enhanced due diligence for high-risk transactions</li>
                <li>Regular AML training for staff</li>
                <li>Cooperation with law enforcement agencies</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">3. Know Your Customer (KYC)</h2>
              <p className="text-gray-700 mb-4">
                Our KYC procedures ensure the identity of our users:
              </p>
              
              <h3 className="text-xl font-semibold mb-3">3.1 Identity Verification</h3>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Government-issued ID verification</li>
                <li>Proof of address documentation</li>
                <li>Biometric verification (where applicable)</li>
                <li>Phone number verification</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">3.2 Verification Levels</h3>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li><strong>Basic:</strong> Email and phone verification</li>
                <li><strong>Standard:</strong> ID document verification</li>
                <li><strong>Enhanced:</strong> Additional documentation for high-value transactions</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">4. Data Protection and Privacy</h2>
              <p className="text-gray-700 mb-4">
                We comply with international data protection standards:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>General Data Protection Regulation (GDPR)</li>
                <li>African Union Data Protection Convention</li>
                <li>Local data protection laws</li>
                <li>Secure data storage and encryption</li>
                <li>Regular security audits</li>
              </ul>
              <p className="text-gray-700 mb-4">
                See our <Link to="/privacy-policy" className="text-orange-600 hover:underline">Privacy Policy</Link> for detailed information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">5. Transaction Monitoring</h2>
              <p className="text-gray-700 mb-4">
                We employ advanced systems to monitor transactions:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Real-time transaction screening</li>
                <li>Pattern recognition and anomaly detection</li>
                <li>Sanctions list screening</li>
                <li>Risk-based transaction limits</li>
                <li>Automated alerts for suspicious activity</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">6. Security Standards</h2>
              <p className="text-gray-700 mb-4">
                Our security measures meet or exceed industry standards:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>ISO 27001 information security management</li>
                <li>PCI DSS compliance for payment processing</li>
                <li>SOC 2 Type II certification</li>
                <li>Regular penetration testing</li>
                <li>24/7 security monitoring</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">7. Consumer Protection</h2>
              <p className="text-gray-700 mb-4">
                We prioritize user protection through:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Clear terms and conditions</li>
                <li>Transparent fee structures</li>
                <li>Dispute resolution mechanisms</li>
                <li>Customer support and education</li>
                <li>Fraud prevention measures</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">8. Reporting and Transparency</h2>
              <p className="text-gray-700 mb-4">
                We maintain transparency through:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Regular compliance reports</li>
                <li>Audit trail maintenance</li>
                <li>Cooperation with regulatory authorities</li>
                <li>Public disclosure of policies</li>
                <li>Incident reporting procedures</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">9. Third-Party Compliance</h2>
              <p className="text-gray-700 mb-4">
                Our partners and service providers must meet our compliance standards:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Due diligence on all partners</li>
                <li>Contractual compliance obligations</li>
                <li>Regular partner audits</li>
                <li>Data processing agreements</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">10. Continuous Improvement</h2>
              <p className="text-gray-700 mb-4">
                We continuously enhance our compliance program:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Regular policy reviews and updates</li>
                <li>Staff training and awareness programs</li>
                <li>Technology upgrades and improvements</li>
                <li>Industry best practice adoption</li>
                <li>Regulatory change monitoring</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">11. Reporting Concerns</h2>
              <p className="text-gray-700 mb-4">
                If you have compliance concerns or wish to report suspicious activity:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 mb-2"><strong>Compliance Team:</strong> compliance@africoin.com</p>
                <p className="text-gray-700 mb-2"><strong>Security Issues:</strong> security@africoin.com</p>
                <p className="text-gray-700"><strong>General Inquiries:</strong> legal@africoin.com</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">12. Related Policies</h2>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li><Link to="/privacy-policy" className="text-orange-600 hover:underline">Privacy Policy</Link></li>
                <li><Link to="/terms-of-service" className="text-orange-600 hover:underline">Terms of Service</Link></li>
                <li><Link to="/cookie-policy" className="text-orange-600 hover:underline">Cookie Policy</Link></li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Compliance;
