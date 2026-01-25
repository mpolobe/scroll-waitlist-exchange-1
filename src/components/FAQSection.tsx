import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: 'What is the SENT Token?',
      answer: 'SENT (Sentinel) is the governance and investment token for Africa Railways on the Polygon network. It powers the Sentinel Network - a system of 2,000+ track maintenance workers who earn rewards for filing Proof-of-Safety reports. SENT holders get voting rights on network decisions and share in transaction fee revenue.'
    },
    {
      question: 'How is SENT different from AFC?',
      answer: 'SENT is for investors and governance (Polygon), while AFC (Africoin) is for train ticket payments (Sui blockchain). Think of SENT as owning shares in the railway company, and AFC as the currency you use to buy tickets. There\'s also AFRC for cargo/freight rewards.'
    },
    {
      question: 'Why is liquidity locked for 720 days?',
      answer: 'The 720-day liquidity lock on PinkSale prevents early investors or the team from dumping tokens. This protects retail investors and demonstrates long-term commitment to the project. It\'s a standard security measure for legitimate token launches.'
    },
    {
      question: 'Is the smart contract audited?',
      answer: 'Yes, the SENT token contract has been audited and verified on PinkSale. The contract address is 0x75CaEb2c62D8E29DAE0cdFde6775B898Dee43f46 on Polygon. You can verify this on PolygonScan.'
    },
    {
      question: 'How do I participate in the IDO?',
      answer: 'Visit the PinkSale launchpad page, connect your wallet (MetaMask recommended), ensure you have POL (Polygon) tokens for gas and purchase, then contribute to the fairlaunch. The presale contract is 0xf366e3aaCC54C99E50c90B7C57625776f88D8d08.'
    },
    {
      question: 'What is the Sentinel Network?',
      answer: 'The Sentinel Network is Africa Railways\' safety infrastructure. Over 2,000 track maintenance workers ("Sentinels") use a mobile app to file Proof-of-Safety reports about track conditions. They earn SENT tokens as rewards, creating a decentralized safety monitoring system.'
    },
    {
      question: 'When will SENT be tradeable on exchanges?',
      answer: 'After the IDO concludes, SENT will be listed on QuickSwap (Polygon DEX) with locked liquidity. Tier 2 CEX listings are planned for Q4 2026 as the project reaches key milestones.'
    },
    {
      question: 'How can I contact the team?',
      answer: 'Email: admin@africarailways.com | Phone: +260 975 190 740 | Telegram: @Africoin_Official and @afrcsentinel | Twitter: @africoin_afc'
    }
  ];

  return (
    <section id="faq" className="py-20 bg-slate-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm font-medium mb-4">
            FAQ
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-400">
            Everything you need to know about Africa Railways and the SENT token
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className={`bg-slate-900/50 border rounded-xl overflow-hidden transition-all ${
                openIndex === index ? 'border-purple-500/50' : 'border-slate-700'
              }`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <div className="flex items-center gap-3">
                  <HelpCircle className={`w-5 h-5 flex-shrink-0 ${
                    openIndex === index ? 'text-purple-400' : 'text-gray-500'
                  }`} />
                  <span className="font-medium text-white">{faq.question}</span>
                </div>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${
                  openIndex === index ? 'rotate-180' : ''
                }`} />
              </button>
              
              {openIndex === index && (
                <div className="px-5 pb-5 pt-0">
                  <div className="pl-8 text-gray-400 leading-relaxed">
                    {faq.answer}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-12 text-center">
          <p className="text-gray-400 mb-4">Still have questions?</p>
          <div className="flex flex-wrap justify-center gap-4">
            <a 
              href="https://t.me/afrcsentinel"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-full font-medium hover:bg-blue-600 transition-all"
            >
              Join Telegram
            </a>
            <a 
              href="mailto:admin@africarailways.com"
              className="inline-flex items-center gap-2 bg-slate-700 text-white px-6 py-3 rounded-full font-medium hover:bg-slate-600 transition-all"
            >
              Email Us
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
