// app/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  Wallet, 
  Loader2, 
  ArrowUpRight 
} from "lucide-react";

interface AdminStats {
  users: number;
  courses: { total: number; pending: number; approved: number };
  activeTrades: number;
  totalLiquidity: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      /* FIXED: centered within the parent flex height context cleanly */
      <div className="h-full w-full flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-6 w-6 text-primary animate-spin" />
          <p className="text-xs font-bold text-muted-foreground animate-pulse">Loading Telemetry...</p>
        </div>
      </div>
    );
  }

  const cards = [
    { label: "Total Users", value: stats?.users, icon: Users, color: "text-blue-500" },
    { label: "Active Trades", value: stats?.activeTrades, icon: TrendingUp, color: "text-success" },
    { label: "Review Required", value: stats?.courses.pending, icon: BookOpen, color: "text-warning" },
    { label: "System Liquidity", value: `₹${stats?.totalLiquidity.toLocaleString("en-IN")}`, icon: Wallet, color: "text-primary" },
  ];

  return (
    <main className="p-4 md:p-6 space-y-6 w-full">
      
      {/* Header Info */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-foreground">System Overview</h1>
        <p className="text-xs text-muted-foreground font-medium mt-0.5">Real-time telemetry across Finlamma models.</p>
      </div>

      {/* Stats Deck Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="bg-card border border-border p-5 rounded-2xl shadow-sm space-y-3.5">
            <div className="flex items-center justify-between">
              <div className={`p-2 rounded-xl bg-background border border-border/40 ${card.color}`}>
                <card.icon className="h-4 w-4" />
              </div>
              <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">{card.label}</p>
              <h2 className="text-xl font-black tracking-tight text-foreground mt-0.5">{card.value}</h2>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 h-[360px] flex items-center justify-center bg-[radial-gradient(var(--border)_1px,transparent_1px)] [background-size:20px_20px]">
           <p className="text-xs font-bold text-muted-foreground">User Growth Analytics Chart Placeholder</p>
        </div>
        
        <div className="bg-card border border-border rounded-2xl p-5 h-[360px] flex flex-col justify-between">
           <div>
             <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-4">Pending Tasks</h3>
             <div className="space-y-3">
                <div className="p-3 bg-background border border-border rounded-xl text-[11px] font-bold text-foreground">
                   Resolve 4 pending course approvals
                </div>
                <div className="p-3 bg-background border border-border rounded-xl text-[11px] font-bold text-foreground">
                   Audit 2 large fiat deposit requests
                </div>
             </div>
           </div>
           
           <p className="text-[10px] font-medium text-muted-foreground border-t border-border pt-3">
             System checks synchronize with database updates automatically.
           </p>
        </div>
      </div>

    </main>
  );
}