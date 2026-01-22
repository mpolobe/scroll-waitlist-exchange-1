/**
 * Africa Railways SENT Admin Dashboard
 * Real-time view of airdrop distribution to workers
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

interface StatCardProps {
  title: string;
  value: string | number;
  color: string;
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

  const fetchStats = async () => {
    // 1. Get Count of users who passed quiz (Score >= 80)
    const { count: passed } = await supabase
      .from("airdrop_status")
      .select("*", { count: "exact", head: true })
      .gte("quiz_score", 80);

    // 2. Get Count of users who actually pulled tokens
    const { count: claimed, data: records } = await supabase
      .from("airdrop_status")
      .select("wallet_address, claimed_at")
      .eq("claimed", true)
      .order("claimed_at", { ascending: false })
      .limit(5);

    setStats({ totalPassed: passed || 0, totalClaimed: claimed || 0 });
    setRecentClaims(records || []);
  };

  useEffect(() => {
    fetchStats();

    // REAL-TIME: Listen for any update in the airdrop_status table
    const channel = supabase
      .channel("realtime-claims")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "airdrop_status" }, 
        (payload) => {
          console.log("New claim detected!", payload);
          fetchStats(); // Refresh numbers instantly
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <div className="p-8 bg-gray-900 text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-8">Africa Railways SENT Admin</h1>

      {/* Countdown Timer */}
      {!airdropStarted ? (
        <div className="mb-12 p-8 bg-gradient-to-r from-purple-900 to-blue-900 rounded-2xl border border-purple-500">
          <h2 className="text-xl text-center text-purple-300 mb-4">Airdrop Starts In</h2>
          <div className="grid grid-cols-4 gap-4 max-w-2xl mx-auto">
            <CountdownUnit value={timeLeft.days} label="Days" />
            <CountdownUnit value={timeLeft.hours} label="Hours" />
            <CountdownUnit value={timeLeft.minutes} label="Minutes" />
            <CountdownUnit value={timeLeft.seconds} label="Seconds" />
          </div>
          <p className="text-center text-gray-400 mt-6 text-sm">
            Friday, January 23rd, 2026 at 8:00 AM UTC
          </p>
        </div>
      ) : (
        <div className="mb-12 p-6 bg-gradient-to-r from-green-900 to-emerald-900 rounded-2xl border border-green-500">
          <div className="flex items-center justify-center gap-3">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
            <h2 className="text-2xl font-bold text-green-400">Airdrop is LIVE!</h2>
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
          </div>
          <p className="text-center text-green-300 mt-2">Workers can now claim their 100 $SENT tokens</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <StatCard title="Workers Passed Quiz" value={stats.totalPassed} color="text-blue-400" />
        <StatCard title="Successful Claims" value={stats.totalClaimed} color="text-green-400" />
        <StatCard title="$SENT Distributed" value={`${stats.totalClaimed * 100}`} color="text-yellow-400" />
      </div>

      <div className="bg-gray-800 p-6 rounded-xl">
        <h2 className="text-xl mb-4">Recent 5 Claims</h2>
        {recentClaims.length === 0 ? (
          <p className="text-gray-500">No claims yet</p>
        ) : (
          recentClaims.map((claim) => (
            <div key={claim.wallet_address} className="border-b border-gray-700 py-2 flex justify-between">
              <span className="font-mono text-sm">{claim.wallet_address.slice(0, 10)}...</span>
              <span className="text-gray-400 text-xs">
                {claim.claimed_at ? new Date(claim.claimed_at).toLocaleTimeString() : "N/A"}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Contract Links */}
      <div className="mt-8 p-4 bg-gray-800 rounded-xl">
        <h3 className="text-sm text-gray-400 mb-2">Contract Links</h3>
        <div className="flex flex-col gap-2 text-sm">
          <a 
            href="https://polygonscan.com/token/0xF379f21Af5967F26c358568Bb60408DB8B4F7fE5" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
          >
            SENT Token: 0xF379f21...7fE5
          </a>
          <a 
            href="https://polygonscan.com/address/0x7175F1b0A27ebD20Cb9CA00f915C6670b4596bcf" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
          >
            Airdrop Contract: 0x7175F1...6bcf
          </a>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, color }: StatCardProps) {
  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
      <p className="text-gray-400 text-sm">{title}</p>
      <p className={`text-4xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <div className="bg-gray-800 rounded-xl p-4 border border-purple-500/30">
        <span className="text-4xl md:text-5xl font-bold text-white font-mono">
          {value.toString().padStart(2, "0")}
        </span>
      </div>
      <p className="text-purple-300 text-sm mt-2">{label}</p>
    </div>
  );
}
