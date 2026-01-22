/**
 * Africa Railways SENTINEL Admin Dashboard
 * Real-time monitoring of $SENT airdrop distribution
 * 
 * Tracks:
 * - Verified Workers (quiz_score >= 80)
 * - SENT Distributed (claimed * 100)
 * - Claim Rate (conversion %)
 */

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

// Airdrop start time: Friday, January 23rd, 2026 at 8:00 AM UTC
const AIRDROP_START_TIME = new Date("2026-01-23T08:00:00Z");

interface ClaimRecord {
  wallet_address: string;
  claimed_at: string;
}

interface Stats {
  totalPassed: number;
  totalClaimed: number;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ totalPassed: 0, totalClaimed: 0 });
  const [recentClaims, setRecentClaims] = useState<ClaimRecord[]>([]);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [airdropStarted, setAirdropStarted] = useState(false);

  // Countdown timer
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = AIRDROP_START_TIME.getTime() - now.getTime();

      if (difference <= 0) {
        setAirdropStarted(true);
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / (1000 * 60)) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const refreshData = async () => {
    // 1. Total Workers who passed the Sentinel Quiz (Score >= 80)
    const { count: passed } = await supabase
      .from("airdrop_status")
      .select("*", { count: "exact", head: true })
      .gte("quiz_score", 80);

    // 2. Total successful $SENT pulls
    const { count: claimed, data: list } = await supabase
      .from("airdrop_status")
      .select("wallet_address, claimed_at")
      .eq("claimed", true)
      .order("claimed_at", { ascending: false })
      .limit(8);

    setStats({ totalPassed: passed || 0, totalClaimed: claimed || 0 });
    setRecentClaims(list || []);
  };

  useEffect(() => {
    refreshData();

    // Enable Realtime: Listen for successful claims
    const channel = supabase
      .channel("claims-feed")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "airdrop_status" }, 
        () => refreshData()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <div className="p-10 bg-black text-white min-h-screen font-sans">
      <header className="mb-10 flex justify-between items-center border-b border-gray-800 pb-5">
        <h1 className="text-2xl font-bold tracking-tight">
          AFRICA RAILWAYS <span className="text-blue-500">SENTINEL</span>
        </h1>
        <div className="bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-xs animate-pulse">
          ● LIVE MONITORING
        </div>
      </header>

      {/* Countdown Timer */}
      {!airdropStarted ? (
        <div className="mb-10 p-8 bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-2xl border border-purple-500/30">
          <h2 className="text-lg text-center text-purple-300 mb-4 font-semibold">
            Airdrop Claims Start In
          </h2>
          <div className="grid grid-cols-4 gap-4 max-w-xl mx-auto">
            <CountdownUnit value={timeLeft.days} label="Days" />
            <CountdownUnit value={timeLeft.hours} label="Hours" />
            <CountdownUnit value={timeLeft.minutes} label="Minutes" />
            <CountdownUnit value={timeLeft.seconds} label="Seconds" />
          </div>
          <p className="text-center text-gray-500 mt-4 text-sm">
            Friday, January 23rd, 2026 at 8:00 AM UTC
          </p>
        </div>
      ) : (
        <div className="mb-10 p-6 bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-2xl border border-green-500/30">
          <div className="flex items-center justify-center gap-3">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
            <h2 className="text-xl font-bold text-green-400">Airdrop is LIVE!</h2>
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
          </div>
        </div>
      )}
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <MetricCard 
          title="Verified Workers" 
          value={stats.totalPassed} 
          subtitle="Ready to claim" 
        />
        <MetricCard 
          title="SENT Distributed" 
          value={(stats.totalClaimed * 100).toLocaleString()} 
          subtitle="Units sent to Polygon" 
        />
        <MetricCard 
          title="Claim Rate" 
          value={`${((stats.totalClaimed / (stats.totalPassed || 1)) * 100).toFixed(1)}%`} 
          subtitle="Worker conversion" 
        />
      </div>

      {/* Live Activity Feed */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-4">Live Activity Feed</h2>
        {recentClaims.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No claims yet - waiting for workers...</p>
        ) : (
          <div className="space-y-3">
            {recentClaims.map((c) => (
              <div key={c.wallet_address} className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  <span className="font-mono text-blue-400">
                    {c.wallet_address.slice(0, 6)}...{c.wallet_address.slice(-4)}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-green-400 text-sm font-semibold">+100 SENT</span>
                  <span className="text-gray-500 text-xs">
                    {c.claimed_at ? new Date(c.claimed_at).toLocaleTimeString() : ""}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Contract Links */}
      <div className="mt-8 p-4 bg-gray-900/50 border border-gray-800 rounded-xl">
        <div className="flex flex-wrap gap-6 text-sm">
          <a 
            href="https://polygonscan.com/token/0xF379f21Af5967F26c358568Bb60408DB8B4F7fE5" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-blue-400 transition-colors"
          >
            SENT Token ↗
          </a>
          <a 
            href="https://polygonscan.com/address/0x7175F1b0A27ebD20Cb9CA00f915C6670b4596bcf" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-blue-400 transition-colors"
          >
            Airdrop Contract ↗
          </a>
          <a 
            href="https://polygonscan.com/address/0xfcfa02A852551618f544fbcE52908A0F941abEf9" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-blue-400 transition-colors"
          >
            Admin Wallet ↗
          </a>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, subtitle }: { title: string; value: string | number; subtitle: string }) {
  return (
    <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-xl">
      <p className="text-gray-500 text-xs uppercase tracking-widest mb-2">{title}</p>
      <p className="text-5xl font-black mb-1">{value}</p>
      <p className="text-gray-400 text-xs">{subtitle}</p>
    </div>
  );
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <div className="bg-gray-900 rounded-xl p-4 border border-purple-500/20">
        <span className="text-3xl md:text-4xl font-bold text-white font-mono">
          {value.toString().padStart(2, "0")}
        </span>
      </div>
      <p className="text-purple-300 text-xs mt-2">{label}</p>
    </div>
  );
}
