import { ExternalLink, Rocket, Shield, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MarketingBannerProps {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  badge?: string;
  variant?: 'primary' | 'secondary' | 'gradient';
}

export function MarketingBanner({ 
  title, 
  subtitle, 
  ctaText, 
  ctaLink, 
  badge,
  variant = 'gradient' 
}: MarketingBannerProps) {
  const bgClass = variant === 'gradient' 
    ? 'bg-gradient-to-r from-orange-600 via-purple-600 to-blue-600'
    : variant === 'primary'
    ? 'bg-orange-600'
    : 'bg-gray-900';

  return (
    <div className={`${bgClass} rounded-2xl p-8 text-white relative overflow-hidden`}>
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative z-10">
        {badge && (
          <span className="inline-block bg-white/20 text-white text-sm font-semibold px-3 py-1 rounded-full mb-4">
            {badge}
          </span>
        )}
        <h3 className="text-2xl md:text-3xl font-bold mb-2">{title}</h3>
        <p className="text-white/80 mb-6 max-w-xl">{subtitle}</p>
        <a href={ctaLink} target="_blank" rel="noopener noreferrer">
          <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100">
            {ctaText} <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </a>
      </div>
    </div>
  );
}

export function PartnerLogoBanner() {
  const partners = [
    { name: 'PinkSale', logo: 'https://www.pinksale.finance/static/media/pinkswap.a95de4f3.png' },
    { name: 'DEXView', logo: 'https://dexview.com/images/logo.svg' },
    { name: 'CoinGecko', logo: 'https://static.coingecko.com/s/coingecko-logo-8903d34ce19ca4be1c81f0db30e924154750d208683fad7ae6f2ce06c76d0a56.png' },
    { name: 'DexTools', logo: 'https://www.dextools.io/resources/tokens/tools/dext.svg' },
  ];

  return (
    <div className="bg-gray-100 rounded-xl p-6">
      <p className="text-center text-gray-500 text-sm mb-4 font-semibold uppercase tracking-wider">
        Trusted by Leading Platforms
      </p>
      <div className="flex flex-wrap justify-center items-center gap-8">
        {partners.map((partner) => (
          <div key={partner.name} className="grayscale hover:grayscale-0 transition-all opacity-60 hover:opacity-100">
            <img src={partner.logo} alt={partner.name} className="h-8 object-contain" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function StatsBar() {
  const stats = [
    { icon: Rocket, label: 'Projects Reviewed', value: '150+' },
    { icon: Users, label: 'Community Members', value: '25K+' },
    { icon: Shield, label: 'Verified Projects', value: '45' },
  ];

  return (
    <div className="grid grid-cols-3 gap-4 bg-white rounded-xl shadow-lg p-6">
      {stats.map((stat, index) => (
        <div key={index} className="text-center">
          <stat.icon className="w-8 h-8 text-orange-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          <p className="text-sm text-gray-500">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
