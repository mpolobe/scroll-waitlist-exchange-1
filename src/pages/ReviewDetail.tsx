import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Star, Shield, ExternalLink, Twitter, Send, Globe, Copy, CheckCircle, AlertTriangle, TrendingUp, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import MarketingNav from '@/components/MarketingNav';
import { cryptoProjects } from '@/data/cryptoReviews';
import { useState } from 'react';

export default function ReviewDetail() {
  const { id } = useParams();
  const [copied, setCopied] = useState(false);
  
  const project = cryptoProjects.find(p => p.id === id);

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Review Not Found</h1>
          <Link to="/reviews" className="text-orange-600 hover:text-orange-700">Back to Reviews</Link>
        </div>
      </div>
    );
  }

  const copyContract = () => {
    if (project.links.contract) {
      navigator.clipboard.writeText(project.links.contract);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 8) return 'text-green-500';
    if (rating >= 6) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-green-500';
      case 'upcoming': return 'bg-blue-500';
      case 'ended': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MarketingNav />
      
      <div className="container mx-auto px-4 py-12 pt-24">
        <Link to="/reviews" className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to Reviews
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header Card */}
            <Card>
              <CardContent className="p-8">
                <div className="flex items-start gap-6">
                  <img 
                    src={project.logo} 
                    alt={project.name} 
                    className="w-24 h-24 rounded-2xl object-cover border-2 border-gray-200"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-bold">{project.name}</h1>
                      {project.verified && <CheckCircle className="w-6 h-6 text-blue-500" />}
                    </div>
                    <p className="text-xl text-gray-500 font-mono mb-3">${project.symbol}</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">{project.network}</Badge>
                      <Badge variant="outline">{project.category}</Badge>
                      <Badge className={`${getStatusColor(project.status)} text-white`}>
                        {project.status.toUpperCase()}
                      </Badge>
                      {project.launchpad && (
                        <Badge variant="secondary">{project.launchpad}</Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t">
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${getRatingColor(project.rating)}`}>
                      {project.rating}/10
                    </div>
                    <p className="text-sm text-gray-500 flex items-center justify-center gap-1">
                      <Star className="w-4 h-4" /> Rating
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{project.auditScore}%</div>
                    <p className="text-sm text-gray-500 flex items-center justify-center gap-1">
                      <Shield className="w-4 h-4" /> Audit Score
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">
                      {project.tokenomics?.marketCap || 'TBA'}
                    </div>
                    <p className="text-sm text-gray-500 flex items-center justify-center gap-1">
                      <TrendingUp className="w-4 h-4" /> Market Cap
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">
                      {project.tokenomics?.price || 'TBA'}
                    </div>
                    <p className="text-sm text-gray-500">Price</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Full Review */}
            <Card>
              <CardHeader>
                <CardTitle>Full Review</CardTitle>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" /> {project.author}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" /> {project.reviewDate}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose prose-lg max-w-none">
                  {project.fullReview.split('\n').map((paragraph, index) => {
                    if (paragraph.startsWith('## ')) {
                      return <h2 key={index} className="text-xl font-bold mt-6 mb-3">{paragraph.replace('## ', '')}</h2>;
                    }
                    if (paragraph.startsWith('- ')) {
                      return <li key={index} className="ml-4">{paragraph.replace('- ', '')}</li>;
                    }
                    if (paragraph.trim()) {
                      return <p key={index} className="text-gray-700 mb-4">{paragraph}</p>;
                    }
                    return null;
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Pros and Cons */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle className="text-green-600 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" /> Pros
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {project.pros.map((pro, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                        <span>{pro}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="text-red-600 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" /> Cons
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {project.cons.map((con, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-500 mt-1 flex-shrink-0" />
                        <span>{con}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Verdict */}
            <Card className="bg-gradient-to-r from-orange-50 to-purple-50 border-orange-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-orange-500" /> Our Verdict
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg text-gray-700">{project.verdict}</p>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {project.links.launchpad && (
                  <a href={project.links.launchpad} target="_blank" rel="noopener noreferrer" className="block">
                    <Button className="w-full bg-gradient-to-r from-orange-500 to-purple-600 hover:opacity-90">
                      Buy on {project.launchpad} <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  </a>
                )}
                {project.links.website && (
                  <a href={project.links.website} target="_blank" rel="noopener noreferrer" className="block">
                    <Button variant="outline" className="w-full">
                      <Globe className="w-4 h-4 mr-2" /> Visit Website
                    </Button>
                  </a>
                )}
              </CardContent>
            </Card>

            {/* Tokenomics */}
            {project.tokenomics && (
              <Card>
                <CardHeader>
                  <CardTitle>Tokenomics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total Supply</span>
                    <span className="font-semibold">{project.tokenomics.totalSupply}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-gray-500">Circulating</span>
                    <span className="font-semibold">{project.tokenomics.circulatingSupply}</span>
                  </div>
                  {project.tokenomics.marketCap && (
                    <>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-gray-500">Market Cap</span>
                        <span className="font-semibold">{project.tokenomics.marketCap}</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Contract */}
            {project.links.contract && (
              <Card>
                <CardHeader>
                  <CardTitle>Contract Address</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-100 rounded-lg p-3 flex items-center gap-2">
                    <code className="text-xs flex-1 break-all">{project.links.contract}</code>
                    <Button variant="ghost" size="sm" onClick={copyContract}>
                      {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Social Links */}
            <Card>
              <CardHeader>
                <CardTitle>Community</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {project.links.twitter && (
                  <a href={project.links.twitter} target="_blank" rel="noopener noreferrer" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <Twitter className="w-4 h-4 mr-2" /> Twitter
                    </Button>
                  </a>
                )}
                {project.links.telegram && (
                  <a href={project.links.telegram} target="_blank" rel="noopener noreferrer" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <Send className="w-4 h-4 mr-2" /> Telegram
                    </Button>
                  </a>
                )}
              </CardContent>
            </Card>

            {/* Audit Score */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" /> Security Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold text-blue-600">{project.auditScore}%</div>
                </div>
                <Progress value={project.auditScore} className="h-3 mb-4" />
                <ul className="text-sm space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Contract Verified
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Liquidity Locked
                  </li>
                  <li className="flex items-center gap-2">
                    {project.verified ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    )}
                    Team Verified
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
