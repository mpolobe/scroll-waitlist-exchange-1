import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CookiePolicy: React.FC = () => {
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
            Cookie Policy
          </h1>
          <p className="text-gray-600 mb-8">Last updated: December 30, 2025</p>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">1. What Are Cookies?</h2>
              <p className="text-gray-700 mb-4">
                Cookies are small text files stored on your device when you visit our website. They help us provide a better user experience by remembering your preferences and analyzing how you use our platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">2. Types of Cookies We Use</h2>
              
              <h3 className="text-xl font-semibold mb-3">2.1 Essential Cookies</h3>
              <p className="text-gray-700 mb-4">
                These cookies are necessary for the website to function properly. They enable core functionality such as security, authentication, and accessibility.
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Session management</li>
                <li>Authentication tokens</li>
                <li>Security features</li>
                <li>Load balancing</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">2.2 Performance Cookies</h3>
              <p className="text-gray-700 mb-4">
                These cookies collect information about how visitors use our website, helping us improve performance and user experience.
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Page load times</li>
                <li>Error tracking</li>
                <li>Usage analytics</li>
                <li>Traffic sources</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">2.3 Functional Cookies</h3>
              <p className="text-gray-700 mb-4">
                These cookies enable enhanced functionality and personalization.
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Language preferences</li>
                <li>Theme settings</li>
                <li>Region selection</li>
                <li>User preferences</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">2.4 Targeting/Advertising Cookies</h3>
              <p className="text-gray-700 mb-4">
                These cookies are used to deliver relevant advertisements and track campaign effectiveness.
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Ad personalization</li>
                <li>Campaign tracking</li>
                <li>Retargeting</li>
                <li>Conversion tracking</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">3. Third-Party Cookies</h2>
              <p className="text-gray-700 mb-4">
                We use third-party services that may set cookies on your device:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li><strong>Google Analytics:</strong> Website analytics and performance tracking</li>
                <li><strong>Supabase:</strong> Authentication and database services</li>
                <li><strong>Alchemy:</strong> Blockchain infrastructure</li>
                <li><strong>Social Media Platforms:</strong> Social sharing and login features</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">4. How We Use Cookies</h2>
              <p className="text-gray-700 mb-4">
                We use cookies to:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Keep you signed in to your account</li>
                <li>Remember your preferences and settings</li>
                <li>Understand how you use our platform</li>
                <li>Improve our services and user experience</li>
                <li>Provide personalized content and features</li>
                <li>Detect and prevent fraud</li>
                <li>Comply with legal requirements</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">5. Cookie Duration</h2>
              <p className="text-gray-700 mb-4">
                Cookies may be either:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li><strong>Session Cookies:</strong> Temporary cookies that expire when you close your browser</li>
                <li><strong>Persistent Cookies:</strong> Remain on your device for a set period or until manually deleted</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">6. Managing Cookies</h2>
              <h3 className="text-xl font-semibold mb-3">6.1 Browser Settings</h3>
              <p className="text-gray-700 mb-4">
                You can control and manage cookies through your browser settings. Most browsers allow you to:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>View and delete cookies</li>
                <li>Block third-party cookies</li>
                <li>Block all cookies</li>
                <li>Clear cookies when closing the browser</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">6.2 Browser-Specific Instructions</h3>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies</li>
                <li><strong>Firefox:</strong> Settings → Privacy & Security → Cookies</li>
                <li><strong>Safari:</strong> Preferences → Privacy → Cookies</li>
                <li><strong>Edge:</strong> Settings → Privacy → Cookies</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">6.3 Impact of Disabling Cookies</h3>
              <p className="text-gray-700 mb-4">
                Disabling cookies may affect your ability to use certain features of our platform. Essential cookies cannot be disabled as they are necessary for the website to function.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">7. Do Not Track Signals</h2>
              <p className="text-gray-700 mb-4">
                Some browsers include a "Do Not Track" (DNT) feature. Our website currently does not respond to DNT signals, but we respect your privacy choices through browser cookie settings.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">8. Mobile Devices</h2>
              <p className="text-gray-700 mb-4">
                Mobile devices may use identifiers similar to cookies. You can manage these through your device settings:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li><strong>iOS:</strong> Settings → Privacy → Tracking</li>
                <li><strong>Android:</strong> Settings → Google → Ads</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">9. Updates to This Policy</h2>
              <p className="text-gray-700 mb-4">
                We may update this Cookie Policy to reflect changes in our practices or legal requirements. We will notify you of significant changes.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">10. More Information</h2>
              <p className="text-gray-700 mb-4">
                For more information about how we handle your data, please see our <Link to="/privacy-policy" className="text-orange-600 hover:underline">Privacy Policy</Link>.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">11. Contact Us</h2>
              <p className="text-gray-700 mb-4">
                If you have questions about our use of cookies, contact us at:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">Email: privacy@africoin.com</p>
                <p className="text-gray-700">Subject: Cookie Policy Inquiry</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;
