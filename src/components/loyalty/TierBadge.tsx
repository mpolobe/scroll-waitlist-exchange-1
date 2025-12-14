import { Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TierBadgeProps {
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  size?: 'sm' | 'md' | 'lg';
}

export function TierBadge({ tier, size = 'md' }: TierBadgeProps) {
  const colors = {
    Bronze: 'bg-amber-700 text-white',
    Silver: 'bg-gray-400 text-gray-900',
    Gold: 'bg-yellow-500 text-yellow-950',
    Platinum: 'bg-purple-600 text-white'
  };

  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2'
  };

  return (
    <Badge className={`${colors[tier]} ${sizes[size]} font-semibold flex items-center gap-1`}>
      <Award className="w-3 h-3" />
      {tier}
    </Badge>
  );
}
