import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProjectFunding, StakingStats } from '@/services/stakingService';
import { Train, MapPin, TrendingUp, Building2, Users } from 'lucide-react';

interface RailwayProgressProps {
  projectFunding: ProjectFunding[];
  formatAmount: (amount: bigint) => string;
  globalStats: StakingStats | null;
}

// Regional data with capitals and progress
const REGIONAL_DATA: Record<string, {
  capitals: string[];
  countries: number;
  kmPlanned: number;
  kmCompleted: number;
  color: string;
}> = {
  'East Africa': {
    capitals: ['Nairobi', 'Dar es Salaam', 'Kampala', 'Kigali', 'Addis Ababa'],
    countries: 11,
    kmPlanned: 4500,
    kmCompleted: 1200,
    color: 'bg-green-500',
  },
  'West Africa': {
    capitals: ['Lagos', 'Accra', 'Abidjan', 'Dakar', 'Abuja'],
    countries: 16,
    kmPlanned: 5200,
    kmCompleted: 800,
    color: 'bg-yellow-500',
  },
  'Southern Africa': {
    capitals: ['Johannesburg', 'Cape Town', 'Lusaka', 'Harare', 'Maputo'],
    countries: 10,
    kmPlanned: 3800,
    kmCompleted: 1500,
    color: 'bg-blue-500',
  },
  'North Africa': {
    capitals: ['Cairo', 'Casablanca', 'Tunis', 'Algiers', 'Tripoli'],
    countries: 6,
    kmPlanned: 2800,
    kmCompleted: 900,
    color: 'bg-orange-500',
  },
  'Central Africa': {
    capitals: ['Kinshasa', 'Brazzaville', 'Yaoundé', 'Libreville', 'Bangui'],
    countries: 9,
    kmPlanned: 2200,
    kmCompleted: 300,
    color: 'bg-purple-500',
  },
};

export function RailwayProgress({
  projectFunding,
  formatAmount,
  globalStats,
}: RailwayProgressProps) {
  // Calculate total funding
  const totalFunding = projectFunding.reduce(
    (acc, p) => acc + parseFloat(formatAmount(p.amount)),
    0
  );

  // Calculate total stats
  const totalKmPlanned = Object.values(REGIONAL_DATA).reduce((acc, r) => acc + r.kmPlanned, 0);
  const totalKmCompleted = Object.values(REGIONAL_DATA).reduce((acc, r) => acc + r.kmCompleted, 0);
  const totalCountries = Object.values(REGIONAL_DATA).reduce((acc, r) => acc + r.countries, 0);

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 text-center">
            <Train className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{totalKmCompleted.toLocaleString()}</p>
            <p className="text-xs text-gray-400">km Completed</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 text-center">
            <MapPin className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{totalKmPlanned.toLocaleString()}</p>
            <p className="text-xs text-gray-400">km Planned</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 text-center">
            <Building2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{totalCountries}</p>
            <p className="text-xs text-gray-400">Countries</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{totalFunding.toLocaleString()}</p>
            <p className="text-xs text-gray-400">wAFC Funded</p>
          </CardContent>
        </Card>
      </div>

      {/* Regional Progress */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-white">
            <MapPin className="w-5 h-5 text-orange-500" />
            Regional Investment & Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {projectFunding.map((project) => {
            const regional = REGIONAL_DATA[project.region] || {
              capitals: [],
              countries: 0,
              kmPlanned: 1000,
              kmCompleted: 0,
              color: 'bg-gray-500',
            };
            const fundingAmount = parseFloat(formatAmount(project.amount));
            const progress = (regional.kmCompleted / regional.kmPlanned) * 100;
            const fundingPercentage = totalFunding > 0 
              ? (fundingAmount / totalFunding) * 100 
              : 0;

            return (
              <div key={project.region} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-white">{project.region}</h4>
                    <p className="text-sm text-gray-400">
                      {regional.countries} countries • {regional.capitals.slice(0, 3).join(', ')}
                      {regional.capitals.length > 3 && '...'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-white">
                      {fundingAmount.toLocaleString()} wAFC
                    </p>
                    <p className="text-sm text-gray-400">
                      {fundingPercentage.toFixed(1)}% of total
                    </p>
                  </div>
                </div>

                {/* Construction Progress */}
                <div>
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                    <span>Construction Progress</span>
                    <span>{regional.kmCompleted.toLocaleString()} / {regional.kmPlanned.toLocaleString()} km</span>
                  </div>
                  <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${regional.color} transition-all duration-500`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Funding Progress */}
                <div>
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                    <span>Funding Allocation</span>
                    <span>{fundingPercentage.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-orange-500 transition-all duration-500"
                      style={{ width: `${fundingPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Capital Cities Map Placeholder */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-white">
            <Train className="w-5 h-5 text-orange-500" />
            Connected Capital Cities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {Object.entries(REGIONAL_DATA).map(([region, data]) => (
              <div key={region} className="space-y-2">
                <h5 className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                  {region}
                </h5>
                {data.capitals.map((capital) => (
                  <div 
                    key={capital}
                    className="flex items-center gap-2 text-sm"
                  >
                    <div className={`w-2 h-2 rounded-full ${data.color}`} />
                    <span className="text-gray-300">{capital}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Impact Stats */}
      <Card className="bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border-orange-500/30">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-orange-500" />
            Projected Impact
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-orange-400">500M+</p>
              <p className="text-sm text-gray-400">People Connected</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-400">2M+</p>
              <p className="text-sm text-gray-400">Jobs Created</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-400">$50B+</p>
              <p className="text-sm text-gray-400">Trade Enabled</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-400">70%</p>
              <p className="text-sm text-gray-400">CO2 Reduction</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
