/**
 * SENT Airdrop Help Page
 * Instructions for workers to claim and add $SENT token to MetaMask
 */

import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Copy, 
  Check, 
  Wallet, 
  ExternalLink, 
  HelpCircle,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2
} from "lucide-react";

const SENT_CONTRACT = "0x65f6cEdBB6e023e7A91df61c26364FAc0fA2dd64";
const POLYGON_SCAN_URL = `https://polygonscan.com/token/${SENT_CONTRACT}`;

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "Why can't I see my $SENT tokens?",
    answer: "Tokens don't appear automatically in MetaMask. You need to import the token using the contract address. Follow the steps above to add $SENT to your wallet."
  },
  {
    question: "What network should I be on?",
    answer: "You must be on Polygon Mainnet (Chain ID: 137). If you're on Ethereum or another network, your tokens won't be visible."
  },
  {
    question: "How much gas do I need to claim?",
    answer: "You need a small amount of POL (formerly MATIC) for gas - approximately 0.01-0.05 POL is sufficient. You can get POL from any exchange that supports Polygon."
  },
  {
    question: "I passed the quiz but can't claim. Why?",
    answer: "You need a score of 80% or higher (4/5 correct answers). If you scored below this, you may need to retake the quiz. Also ensure your wallet is connected."
  },
  {
    question: "Can I claim multiple times?",
    answer: "No. Each wallet address can only claim once. The system tracks claims to prevent double-claiming."
  },
  {
    question: "My transaction failed. What do I do?",
    answer: "Check that you have enough POL for gas. If the transaction reverted, you may have already claimed or don't meet the eligibility requirements."
  },
  {
    question: "How do I get POL for gas fees?",
    answer: "You can purchase POL on exchanges like Binance, Coinbase, or KuCoin and withdraw to your Polygon wallet address. Alternatively, use a bridge from Ethereum."
  },
  {
    question: "Is this airdrop legitimate?",
    answer: "Yes. This is the official Africa Railways $SENT token airdrop for verified workers. The contract is deployed on Polygon Mainnet and can be verified on PolygonScan."
  }
];

export default function AirdropHelp() {
  const [copied, setCopied] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const copyAddress = async () => {
    await navigator.clipboard.writeText(SENT_CONTRACT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">$SENT Airdrop Help</h1>
          <p className="text-gray-600">
            Instructions for claiming and viewing your $SENT tokens
          </p>
        </div>

        {/* Quick Copy Section */}
        <Card className="mb-6 border-2 border-purple-200 bg-purple-50">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-purple-900">$SENT Token Contract Address</p>
                <code className="text-sm text-purple-700 break-all">{SENT_CONTRACT}</code>
              </div>
              <Button 
                onClick={copyAddress}
                variant={copied ? "default" : "outline"}
                className={copied ? "bg-green-600 hover:bg-green-600" : ""}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Address
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Step by Step Guide */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              How to Add $SENT to MetaMask
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold mb-1">Open MetaMask</h3>
                <p className="text-gray-600 text-sm">
                  Click the MetaMask extension icon in your browser. Make sure you're logged in.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold mb-1">Switch to Polygon Network</h3>
                <p className="text-gray-600 text-sm mb-2">
                  Click the network dropdown at the top and select <strong>Polygon Mainnet</strong>.
                </p>
                <div className="bg-gray-100 p-3 rounded-lg text-sm">
                  <p className="font-medium mb-1">If Polygon isn't listed, add it manually:</p>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Network Name: <code>Polygon Mainnet</code></li>
                    <li>• RPC URL: <code>https://polygon-rpc.com</code></li>
                    <li>• Chain ID: <code>137</code></li>
                    <li>• Symbol: <code>POL</code></li>
                    <li>• Explorer: <code>https://polygonscan.com</code></li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold mb-1">Import the $SENT Token</h3>
                <ol className="text-gray-600 text-sm space-y-2">
                  <li>1. Scroll down and click <strong>"Import tokens"</strong></li>
                  <li>2. Select the <strong>"Custom token"</strong> tab</li>
                  <li>3. Paste the contract address:</li>
                </ol>
                <div className="flex items-center gap-2 mt-2 p-2 bg-gray-100 rounded">
                  <code className="text-xs flex-1 break-all">{SENT_CONTRACT}</code>
                  <Button size="sm" variant="ghost" onClick={copyAddress}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-gray-600 text-sm mt-2">
                  4. Token symbol ($SENT) and decimals (18) will auto-fill
                </p>
                <p className="text-gray-600 text-sm">
                  5. Click <strong>"Next"</strong> then <strong>"Import"</strong>
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Done! Verify Your Balance</h3>
                <p className="text-gray-600 text-sm">
                  Your 100 $SENT should now be visible in your MetaMask token list.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Add Alternative */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5" />
              Quick Add (One-Click Method)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Visit PolygonScan and add the token with one click:
            </p>
            <ol className="text-sm space-y-2 mb-4">
              <li>1. Click the button below to open PolygonScan</li>
              <li>2. Click the MetaMask icon next to the token name</li>
              <li>3. Confirm the import in MetaMask</li>
            </ol>
            <Button asChild>
              <a href={POLYGON_SCAN_URL} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                View $SENT on PolygonScan
              </a>
            </Button>
          </CardContent>
        </Card>

        {/* Troubleshooting */}
        <Card className="mb-6 border-amber-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-700">
              <AlertTriangle className="h-5 w-5" />
              Troubleshooting
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-2">
                <span className="text-amber-600 font-bold">•</span>
                <span><strong>Token not showing?</strong> Ensure you're on Polygon Mainnet, not Ethereum</span>
              </li>
              <li className="flex gap-2">
                <span className="text-amber-600 font-bold">•</span>
                <span><strong>Zero balance?</strong> Check that your claim transaction was confirmed on{" "}
                  <a href="https://polygonscan.com" target="_blank" rel="noopener noreferrer" className="text-purple-600 underline">
                    PolygonScan
                  </a>
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-amber-600 font-bold">•</span>
                <span><strong>Transaction pending?</strong> Wait a few minutes - Polygon transactions usually confirm within 2-5 seconds</span>
              </li>
              <li className="flex gap-2">
                <span className="text-amber-600 font-bold">•</span>
                <span><strong>Need gas?</strong> Get POL from an exchange or use a faucet for small amounts</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {faqs.map((faq, index) => (
                <div key={index} className="border rounded-lg">
                  <button
                    className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50"
                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  >
                    <span className="font-medium text-sm">{faq.question}</span>
                    {expandedFaq === index ? (
                      <ChevronUp className="h-4 w-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    )}
                  </button>
                  {expandedFaq === index && (
                    <div className="px-4 pb-3 text-sm text-gray-600">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Back to Airdrop */}
        <div className="mt-8 text-center">
          <Button asChild variant="outline">
            <a href="/airdrop">← Back to Airdrop Page</a>
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
