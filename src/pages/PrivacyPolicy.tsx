import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PrivacyPolicy: React.FC = () => {
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
            Privacy Policy
          </h1>
          <p className="text-gray-600 mb-8">Last updated: December 30, 2025</p>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
              <p className="text-gray-700 mb-4">
                Africoin ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our digital currency platform and services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">2. Information We Collect</h2>
              <h3 className="text-xl font-semibold mb-3">2.1 Personal Information</h3>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Full name and contact information</li>
                <li>Email address and phone number</li>
                <li>Country of residence</li>
                <li>Wallet address and transaction history</li>
                <li>Identity verification documents (as required by law)</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">2.2 Technical Information</h3>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>IP address and device information</li>
                <li>Browser type and version</li>
                <li>Usage data and analytics</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">3. How We Use Your Information</h2>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>To provide and maintain our services</li>
                <li>To process transactions and send notifications</li>
                <li>To verify your identity and prevent fraud</li>
                <li>To comply with legal and regulatory requirements</li>
                <li>To improve our platform and user experience</li>
                <li>To communicate updates and promotional offers</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">4. Data Sharing and Disclosure</h2>
              <p className="text-gray-700 mb-4">
                We do not sell your personal information. We may share your data with:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Service providers who assist in operating our platform</li>
                <li>Payment processors and financial institutions</li>
                <li>Law enforcement when required by law</li>
                <li>Business partners with your consent</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">5. Data Security</h2>
              <p className="text-gray-700 mb-4">
                We implement industry-standard security measures to protect your information, including:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Encryption of data in transit and at rest</li>
                <li>Multi-factor authentication</li>
                <li>Regular security audits and monitoring</li>
                <li>Secure data storage and access controls</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">6. Your Rights</h2>
              <p className="text-gray-700 mb-4">You have the right to:</p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Access your personal information</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Opt-out of marketing communications</li>
                <li>Data portability</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">7. Cookies and Tracking</h2>
              <p className="text-gray-700 mb-4">
                We use cookies and similar technologies to enhance your experience. You can control cookie preferences through your browser settings. See our <Link to="/cookie-policy" className="text-orange-600 hover:underline">Cookie Policy</Link> for more details.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">8. International Data Transfers</h2>
              <p className="text-gray-700 mb-4">
                Your information may be transferred to and processed in countries outside your residence. We ensure appropriate safeguards are in place to protect your data.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">9. Children's Privacy</h2>
              <p className="text-gray-700 mb-4">
                Our services are not intended for individuals under 18 years of age. We do not knowingly collect information from children.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">10. Changes to This Policy</h2>
              <p className="text-gray-700 mb-4">
                We may update this Privacy Policy periodically. We will notify you of significant changes via email or platform notification.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">11. Contact Us</h2>
              <p className="text-gray-700 mb-4">
                For questions about this Privacy Policy or to exercise your rights, contact us at:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">Email: privacy@africoin.com</p>
                <p className="text-gray-700">Address: Africoin Privacy Office</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
