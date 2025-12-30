import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TermsOfService: React.FC = () => {
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
            Terms of Service
          </h1>
          <p className="text-gray-600 mb-8">Last updated: December 30, 2025</p>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 mb-4">
                By accessing or using Africoin's platform and services, you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not use our services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">2. Eligibility</h2>
              <p className="text-gray-700 mb-4">
                To use Africoin, you must:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Be at least 18 years of age</li>
                <li>Have the legal capacity to enter into binding contracts</li>
                <li>Not be prohibited from using our services under applicable laws</li>
                <li>Provide accurate and complete registration information</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">3. Account Registration and Security</h2>
              <h3 className="text-xl font-semibold mb-3">3.1 Account Creation</h3>
              <p className="text-gray-700 mb-4">
                You must create an account to use certain features. You are responsible for maintaining the confidentiality of your account credentials.
              </p>
              
              <h3 className="text-xl font-semibold mb-3">3.2 Account Security</h3>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Use strong, unique passwords</li>
                <li>Enable multi-factor authentication</li>
                <li>Never share your credentials with others</li>
                <li>Notify us immediately of any unauthorized access</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">4. Use of Services</h2>
              <h3 className="text-xl font-semibold mb-3">4.1 Permitted Use</h3>
              <p className="text-gray-700 mb-4">
                You may use Africoin for lawful purposes including:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Sending and receiving digital currency</li>
                <li>Making purchases from merchants</li>
                <li>Exchanging currencies</li>
                <li>Accessing integrated services (e.g., railway bookings)</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">4.2 Prohibited Activities</h3>
              <p className="text-gray-700 mb-4">You may not:</p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Use our services for illegal activities</li>
                <li>Engage in money laundering or fraud</li>
                <li>Violate any applicable laws or regulations</li>
                <li>Attempt to hack or disrupt our systems</li>
                <li>Create multiple accounts to abuse promotions</li>
                <li>Impersonate others or provide false information</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">5. Transactions and Fees</h2>
              <h3 className="text-xl font-semibold mb-3">5.1 Transaction Processing</h3>
              <p className="text-gray-700 mb-4">
                Transactions are processed on blockchain networks and may be subject to network fees. Once confirmed, transactions are generally irreversible.
              </p>

              <h3 className="text-xl font-semibold mb-3">5.2 Fees</h3>
              <p className="text-gray-700 mb-4">
                While Africoin aims to provide zero-fee transfers, certain services may incur fees. All applicable fees will be clearly disclosed before you complete a transaction.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">6. Wallet and Private Keys</h2>
              <p className="text-gray-700 mb-4">
                You are solely responsible for securing your wallet and private keys. Africoin cannot recover lost or stolen funds resulting from compromised credentials.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">7. Compliance and KYC</h2>
              <p className="text-gray-700 mb-4">
                We comply with applicable anti-money laundering (AML) and know-your-customer (KYC) regulations. You may be required to provide identification documents to verify your identity.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">8. Intellectual Property</h2>
              <p className="text-gray-700 mb-4">
                All content, trademarks, and intellectual property on our platform are owned by Africoin or our licensors. You may not use our intellectual property without permission.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">9. Limitation of Liability</h2>
              <p className="text-gray-700 mb-4">
                To the maximum extent permitted by law, Africoin shall not be liable for:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Loss of funds due to user error or negligence</li>
                <li>Network delays or failures</li>
                <li>Unauthorized access to your account</li>
                <li>Changes in cryptocurrency values</li>
                <li>Third-party service failures</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">10. Indemnification</h2>
              <p className="text-gray-700 mb-4">
                You agree to indemnify and hold Africoin harmless from any claims, damages, or expenses arising from your use of our services or violation of these terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">11. Termination</h2>
              <p className="text-gray-700 mb-4">
                We reserve the right to suspend or terminate your account if you violate these terms or engage in prohibited activities. You may close your account at any time.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">12. Dispute Resolution</h2>
              <p className="text-gray-700 mb-4">
                Any disputes arising from these terms shall be resolved through binding arbitration in accordance with applicable laws.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">13. Changes to Terms</h2>
              <p className="text-gray-700 mb-4">
                We may modify these terms at any time. Continued use of our services after changes constitutes acceptance of the updated terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">14. Contact Information</h2>
              <p className="text-gray-700 mb-4">
                For questions about these Terms of Service, contact us at:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">Email: legal@africoin.com</p>
                <p className="text-gray-700">Address: Africoin Legal Department</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
