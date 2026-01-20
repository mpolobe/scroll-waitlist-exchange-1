import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, DollarSign, Ticket, TrendingUp, Mail, Bot, Play, Square, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { AdminUsers } from '@/components/admin/AdminUsers';
import { AdminTransactions } from '@/components/admin/AdminTransactions';
import { AdminTickets } from '@/components/admin/AdminTickets';
import { AdminAnalytics } from '@/components/admin/AdminAnalytics';
import { AdminEmailCampaigns } from '@/components/admin/AdminEmailCampaigns';
import { AdminTelegram } from '@/components/admin/AdminTelegram';
import { TreasuryDashboard } from '@/components/admin/TreasuryDashboard';


export default function AdminDashboard() {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState({ users: 0, transactions: 0, volume: 0, tickets: 0 });
  const [botStatus, setBotStatus] = useState<'stopped' | 'running'>('stopped');

  const toggleBot = () => {
    const newStatus = botStatus === 'stopped' ? 'running' : 'stopped';
    setBotStatus(newStatus);
    toast({
      title: `Africoin Bot ${newStatus === 'running' ? 'Activated' : 'Stopped'}`,
      description: newStatus === 'running' 
        ? "Institutional Terminal is now polling Sui Mainnet." 
        : "Bot process terminated.",
      variant: newStatus === 'running' ? 'default' : 'destructive',
    });
  };

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, loading, navigate]);

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (!isAdmin) return null;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Institutional Treasury (Polygon)</h2>
        <TreasuryDashboard />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" /></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.users}</div></CardContent>
        </Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Transactions</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" /></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.transactions}</div></CardContent>
        </Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Volume</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" /></CardHeader>
          <CardContent><div className="text-2xl font-bold">${stats.volume.toFixed(2)}</div></CardContent>
        </Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
          <Ticket className="h-4 w-4 text-muted-foreground" /></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.tickets}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Africoin Bot Status</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <div className="text-2xl font-bold capitalize flex items-center gap-2">
                <span className={`h-3 w-3 rounded-full ${botStatus === 'running' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                {botStatus === 'running' ? 'Active' : 'Offline'}
              </div>
              <Button 
                onClick={toggleBot} 
                size="sm" 
                variant={botStatus === 'running' ? "destructive" : "default"}
                className="w-full"
              >
                {botStatus === 'running' ? (
                  <><Square className="mr-2 h-4 w-4"/> Stop Bot</>
                ) : (
                  <><Play className="mr-2 h-4 w-4"/> Start Bot</>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="tickets">Support</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="campaigns">Email</TabsTrigger>
          <TabsTrigger value="telegram" className="flex items-center gap-1">
            <Send className="h-3 w-3" /> Telegram
          </TabsTrigger>
        </TabsList>
        <TabsContent value="users"><AdminUsers onStatsUpdate={(u) => setStats(s => ({ ...s, users: u }))} /></TabsContent>
        <TabsContent value="transactions"><AdminTransactions onStatsUpdate={(t, v) => setStats(s => ({ ...s, transactions: t, volume: v }))} /></TabsContent>
        <TabsContent value="tickets"><AdminTickets onStatsUpdate={(t) => setStats(s => ({ ...s, tickets: t }))} /></TabsContent>
        <TabsContent value="analytics"><AdminAnalytics /></TabsContent>
        <TabsContent value="campaigns"><AdminEmailCampaigns /></TabsContent>
        <TabsContent value="telegram"><AdminTelegram /></TabsContent>
      </Tabs>

      <div className="mt-8 text-center text-xs text-gray-400 font-mono">
        <p>
          Need to verify if Vercel is running the latest build? <br/>
          Check this Commit Hash against your GitHub repo: 
          <span className="font-bold ml-1 text-gray-500">
            {(import.meta.env as any).VITE_GIT_COMMIT_HASH || 'DEV-BUILD'}
          </span>
        </p>
        <p className="mt-1 opacity-75">
          Built: {new Date((import.meta.env as any).VITE_BUILD_DATE).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
