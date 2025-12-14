import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, DollarSign, Ticket, TrendingUp, Mail } from 'lucide-react';
import { AdminUsers } from '@/components/admin/AdminUsers';
import { AdminTransactions } from '@/components/admin/AdminTransactions';
import { AdminTickets } from '@/components/admin/AdminTickets';
import { AdminAnalytics } from '@/components/admin/AdminAnalytics';
import { AdminEmailCampaigns } from '@/components/admin/AdminEmailCampaigns';


export default function AdminDashboard() {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ users: 0, transactions: 0, volume: 0, tickets: 0 });

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
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="tickets">Support</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="campaigns">Email Campaigns</TabsTrigger>
        </TabsList>
        <TabsContent value="users"><AdminUsers onStatsUpdate={(u) => setStats(s => ({ ...s, users: u }))} /></TabsContent>
        <TabsContent value="transactions"><AdminTransactions onStatsUpdate={(t, v) => setStats(s => ({ ...s, transactions: t, volume: v }))} /></TabsContent>
        <TabsContent value="tickets"><AdminTickets onStatsUpdate={(t) => setStats(s => ({ ...s, tickets: t }))} /></TabsContent>
        <TabsContent value="analytics"><AdminAnalytics /></TabsContent>
        <TabsContent value="campaigns"><AdminEmailCampaigns /></TabsContent>
      </Tabs>
    </div>
  );
}
