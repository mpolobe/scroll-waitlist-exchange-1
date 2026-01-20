import React, { useState, useEffect } from 'react';
import { ExternalLink, Shield, Lock, Clock, Copy, Check, FileText } from 'lucide-react';

const IDOProgressBanner = () => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [copied, setCopied] = useState<string | null>(null);

  // IDO end date: January 26, 2026 10:00 UTC
  const idoEndDate = new Date('2026-01-26T10:00:00Z').getTime();

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = idoEndDate - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const contracts = {
    token: '0xF379f21Af5967F26c358568Bb60408DB8B4F7fE5',
    presale: '0xf366e3aaCC54C99E50c90B7C57625776f88D8d08'
  };

  // Simulated progress (in production, fetch from PinkSale API)
  const raised = 180000; // POL raised
  const hardCap = 255000; // POL hard cap
  const progress = (raised / hardCap) * 100;

  return (
    <section className="bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* IDO Status */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span className="text-white font-bold text-lg">$SENT IDO LIVE</span>
            </div>
            <a 
              href="https://www.pinksale.finance/launchpad/polygon/0xf366e3aaCC54C99E50c90B7C57625776f88D8d08"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-white/80 hover:text-white text-sm"
            >
              PinkSale <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Countdown */}
          <div className="flex items-center gap-2 text-white">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Ends in:</span>
            <div className="flex gap-1">
              <span className="bg-white/20 px-2 py-1 rounded font-mono font-bold">{timeLeft.days}d</span>
              <span className="bg-white/20 px-2 py-1 rounded font-mono font-bold">{timeLeft.hours}h</span>
              <span className="bg-white/20 px-2 py-1 rounded font-mono font-bold">{timeLeft.minutes}m</span>
              <span className="bg-white/20 px-2 py-1 rounded font-mono font-bold">{timeLeft.seconds}s</span>
            </div>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-3 min-w-[200px]">
            <div className="flex-1">
              <div className="flex justify-between text-xs text-white/80 mb-1">
                <span>{raised.toLocaleString()} POL</span>
                <span>{hardCap.toLocaleString()} POL</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-400 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
            <span className="text-white font-bold">{progress.toFixed(1)}%</span>
          </div>

          {/* CTA */}
          <a 
            href="https://www.pinksale.finance/launchpad/polygon/0xf366e3aaCC54C99E50c90B7C57625776f88D8d08"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white text-purple-600 px-6 py-2.5 rounded-full font-bold hover:bg-gray-100 transition-all flex items-center gap-2 min-h-[44px]"
          >
            Join Now <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
};

export const TrustBadges = () => {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const contracts = {
    token: '0xF379f21Af5967F26c358568Bb60408DB8B4F7fE5',
    presale: '0xf366e3aaCC54C99E50c90B7C57625776f88D8d08'
  };

  return (
    <section className="py-12 bg-slate-900 border-y border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Security Badge */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h4 className="text-white font-semibold">Audited Contract</h4>
                <p className="text-gray-400 text-sm">Verified on PinkSale</p>
              </div>
            </div>
            <a 
              href="https://polygonscan.com/token/0xF379f21Af5967F26c358568Bb60408DB8B4F7fE5"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-400 text-sm hover:underline flex items-center gap-1"
            >
              View on PolygonScan <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Liquidity Lock */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Lock className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h4 className="text-white font-semibold">720-Day Lock</h4>
                <p className="text-gray-400 text-sm">Liquidity secured</p>
              </div>
            </div>
            <p className="text-purple-400 text-sm">51% of raised funds locked on PinkSale</p>
          </div>

          {/* Token Contract */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
            <h4 className="text-white font-semibold mb-2">Token Contract</h4>
            <div className="flex items-center gap-2">
              <code className="text-xs text-gray-400 bg-slate-900 px-2 py-1 rounded truncate flex-1">
                {contracts.token.slice(0, 10)}...{contracts.token.slice(-8)}
              </code>
              <button 
                onClick={() => copyToClipboard(contracts.token, 'token')}
                className="p-1.5 bg-slate-700 rounded hover:bg-slate-600 transition-all min-w-[32px] min-h-[32px] flex items-center justify-center"
              >
                {copied === 'token' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
              </button>
            </div>
          </div>

          {/* Whitepaper */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h4 className="text-white font-semibold">Documentation</h4>
                <p className="text-gray-400 text-sm">Full project details</p>
              </div>
            </div>
            <div className="flex gap-2">
              <a 
                href="https://africarailways.com/sent-litepaper.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 text-sm hover:underline"
              >
                Litepaper
              </a>
              <span className="text-gray-600">•</span>
              <a 
                href="https://github.com/mpolobe/africa-railways"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 text-sm hover:underline"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default IDOProgressBanner;
