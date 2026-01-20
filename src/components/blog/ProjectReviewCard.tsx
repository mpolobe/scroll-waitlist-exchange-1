import { Link } from 'react-router-dom';
import { Star, Shield, TrendingUp, ExternalLink, CheckCircle, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface ProjectReviewCardProps {
  id: string;
  name: string;
  symbol: string;
  logo: string;
  network: string;
  category: string;
  rating: number;
  auditScore: number;
  launchpad?: string;
  status: 'live' | 'upcoming' | 'ended';
  featured?: boolean;
  verified?: boolean;
  excerpt: string;
}

export function ProjectReviewCard({
  id,
  name,
  symbol,
  logo,
  network,
  category,
  rating,
  auditScore,
  launchpad,
  status,
  featured,
  verified,
  excerpt
}: ProjectReviewCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-green-500';
      case 'upcoming': return 'bg-blue-500';
      case 'ended': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 8) return 'text-green-500';
    if (rating >= 6) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <Card className={`overflow-hidden hover:shadow-xl transition-all duration-300 ${featured ? 'ring-2 ring-orange-500' : ''}`}>
      {featured && (
        <div className="bg-gradient-to-r from-orange-500 to-purple-600 text-white text-center py-1 text-sm font-semibold">
          Featured Project
        </div>
      )}
      <CardContent className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <img src={logo} alt={name} className="w-16 h-16 rounded-full object-cover border-2 border-gray-200" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold">{name}</h3>
              {verified && <CheckCircle className="w-5 h-5 text-blue-500" />}
            </div>
            <p className="text-gray-500 font-mono">${symbol}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">{network}</Badge>
              <Badge className={`${getStatusColor(status)} text-white text-xs`}>
                {status.toUpperCase()}
              </Badge>
            </div>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{excerpt}</p>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 flex items-center gap-1">
              <Star className="w-4 h-4" /> Rating
            </span>
            <span className={`font-bold ${getRatingColor(rating)}`}>{rating}/10</span>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-500 flex items-center gap-1">
                <Shield className="w-4 h-4" /> Audit Score
              </span>
              <span className="text-sm font-semibold">{auditScore}%</span>
            </div>
            <Progress value={auditScore} className="h-2" />
          </div>

          {launchpad && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" /> Launchpad
              </span>
              <Badge variant="secondary">{launchpad}</Badge>
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t">
          <Badge variant="outline" className="mr-2">{category}</Badge>
        </div>
      </CardContent>
      <CardFooter className="px-6 pb-6 pt-0">
        <Link 
          to={`/reviews/${id}`} 
          className="w-full bg-gradient-to-r from-orange-500 to-purple-600 text-white py-2 px-4 rounded-lg text-center font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
        >
          Read Full Review <ExternalLink className="w-4 h-4" />
        </Link>
      </CardFooter>
    </Card>
  );
}
