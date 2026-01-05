import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSmartWallet } from '@/contexts/SmartWalletContext';
import { Building2, TrendingUp, Wallet, ArrowUpRight, Lock, Play } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { IssueBondDialog } from './IssueBondDialog';
import { getDigitsFinancials, DigitsFinancialReport } from '@/services/digitsAi';
import { BrainCircuit } from 'lucide-react';

interface Bond {
  id: string;
  name: string;
  symbol: string;
  total_value: number;
  apy: number;
  status: string;
}

export function TreasuryDashboard() {
  const { balance, address, tokens, isConnected } = useSmartWallet();
  const [bridgedRevenue, setBridgedRevenue] = useState({ total: 0, freight: 0, passenger: 0 });
  const [bonds, setBonds] = useState<Bond[]>([]);
  const [digitsReport, setDigitsReport] = useState<DigitsFinancialReport | null>(null);

  useEffect(() => {
    if (isConnected) {
      fetchBridgedRevenue();
      fetchBonds();
      fetchDigitsData();
      
      // Subscribe to real-time updates
      const channel = supabase
        .channel('public:transactions')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'transactions' }, (payload) => {
          const newTx = payload.new;
          if (newTx.network === 'sui_mainnet') {
            setBridgedRevenue(prev => ({
              total: prev.total + newTx.amount,
              freight: newTx.type === 'freight_payment' ? prev.freight + newTx.amount : prev.freight,
              passenger: newTx.type === 'ticket_purchase' ? prev.passenger + newTx.amount : prev.passenger
            }));
          }
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isConnected]);

  const fetchBridgedRevenue = async () => {
    const { data } = await supabase
      .from('transactions')
      .select('amount, type')
      .eq('network', 'sui_mainnet');
      
    if (data) {
      const stats = data.reduce((acc, tx) => ({
        total: acc.total + tx.amount,
        freight: tx.type === 'freight_payment' ? acc.freight + tx.amount : acc.freight,
        passenger: tx.type === 'ticket_purchase' ? acc.passenger + tx.amount : acc.passenger
      }), { total: 0, freight: 0, passenger: 0 });
      setBridgedRevenue(stats);
    }
  };

  const fetchBonds = async () => {
    const { data } = await supabase
      .from('bonds')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });
      
    if (data) setBonds(data);
  };

  const fetchDigitsData = async () => {
    const data = await getDigitsFinancials();
    setDigitsReport(data);
  };

  const totalBondValue = bonds.reduce((sum, bond) => sum + bond.total_value, 0);

  const handleSimulateRevenue = async () => {
    const isFreight = Math.random() > 0.8;
    const amount = isFreight ? 500 : 10;
    const type = isFreight ? 'freight_payment' : 'ticket_purchase';
    const description = isFreight ? 'Freight: 10 Tons Copper -> Lobito' : 'Ticket Sale: Lusaka -> Ndola';
    
    await supabase.from('transactions').insert({
      user_id: 'simulated-user',
      amount: amount,
      type: type,
      status: 'completed',
      description: description,
      network: 'sui_mainnet',
      metadata: {
        sui_address: `0x${Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`,
        phone: `+26097${Math.floor(Math.random() * 10000000)}`,
        bridged_to_polygon: true
      }
    });
  };

  if (!isConnected) {
    return (
      <Card className="bg-slate-900 text-white border-slate-800">
        <CardContent className="pt-6 text-center">
          <Lock className="h-12 w-12 mx-auto text-slate-600 mb-4" />
          <h3 className="text-lg font-semibold">Treasury Access Restricted</h3>
          <p className="text-slate-400">Connect Admin Wallet to view Treasury status.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Digits AI Financial Brain */}
        <Card className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white border-indigo-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-indigo-200">Digits AI Financial Brain</CardTitle>
            <BrainCircuit className="h-4 w-4 text-indigo-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {digitsReport ? `$${digitsReport.totalRevenue.toLocaleString()}` : 'Loading...'}
            </div>
            <p className="text-xs text-indigo-300 mt-1">Verified Revenue (Real-time)</p>
            <div className="mt-4 space-y-1">
              {digitsReport?.aiInsights.slice(0, 2).map((insight, i) => (
                <div key={i} className="text-[10px] text-indigo-200/80 flex items-start gap-1">
                  <span className="mt-0.5">•</span>
                  <span>{insight}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Liquid Treasury (Polygon) */}
        <Card className="bg-gradient-to-br from-purple-900 to-slate-900 text-white border-purple-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-purple-200">Liquid Treasury (Polygon)</CardTitle>
            <Wallet className="h-4 w-4 text-purple-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${balance}</div>
            <p className="text-xs text-purple-300 mt-1">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </p>
            <div className="mt-4 space-y-2">
              {tokens.slice(0, 3).map((token, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span>{token.symbol}</span>
                  <span>{token.balance}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tokenized Infrastructure (RWA) */}
        <Card className="bg-gradient-to-br from-blue-900 to-slate-900 text-white border-blue-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-200">Tokenized Infrastructure</CardTitle>
            <Building2 className="h-4 w-4 text-blue-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalBondValue.toLocaleString()}</div>
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-blue-300">Active Railway Bonds</p>
              <IssueBondDialog onBondIssued={fetchBonds} />
            </div>
            <div className="mt-4 space-y-2 max-h-[150px] overflow-y-auto">
              {bonds.length === 0 ? (
                <p className="text-sm text-blue-400/50 italic">No active bonds issued.</p>
              ) : (
                bonds.map((bond) => (
                  <div key={bond.id} className="flex justify-between text-sm border-b border-blue-800/50 pb-1">
                    <div className="flex flex-col">
                      <span className="truncate max-w-[120px] font-medium">{bond.symbol}</span>
                      <span className="text-[10px] text-blue-400 truncate max-w-[120px]">{bond.name}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span>${bond.total_value.toLocaleString()}</span>
                      <span className="text-green-400 text-xs">{bond.apy}% APY</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Revenue Bridge (Sui -> Polygon) */}
        <Card className="bg-gradient-to-br from-emerald-900 to-slate-900 text-white border-emerald-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-emerald-200">Revenue Bridge (Live)</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bridgedRevenue.total.toLocaleString()} AFRC</div>
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-emerald-300">Bridged from Sui Utility Layer</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-6 text-xs bg-emerald-900/50 border-emerald-700 hover:bg-emerald-800 text-emerald-100"
                onClick={handleSimulateRevenue}
              >
                <Play className="h-3 w-3 mr-1" /> Simulate
              </Button>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm mb-1">
                <span>Freight Yield</span>
                <span>{bridgedRevenue.freight.toLocaleString()} AFRC</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Passenger Yield</span>
                <span>{bridgedRevenue.passenger.toLocaleString()} AFRC</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
