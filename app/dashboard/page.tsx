"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Navbar } from "@/components/navigation/navbar";
import { 
  Flame, 
  Coins, 
  Trophy, 
  BookOpen, 
  TrendingUp, 
  Award, 
  ChevronRight, 
  Play, 
  Loader2,
  Settings,
  ShieldAlert,
  CheckCircle2,
  Lock
} from "lucide-react";

// Matches your explicit lower-case Prisma UserRole enum schema tokens
interface LiveUserProfile {
  role: "user" | "admin";
  name: string;
  username: string;
  virtualFiatBalance: number;
  llamacoinBalance: number;
  xp: number;
  streak: number;
  level: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending: isAuthLoading } = authClient.useSession();
  const [profile, setProfile] = useState<LiveUserProfile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!session) { 
      router.push("/login"); 
      return; 
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/dashboard/profile");
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        }
      } catch (err) {
        console.error("Failed to map dashboard user stats from backend:", err);
      } finally {
        setIsProfileLoading(false);
      }
    };
    fetchProfile();
  }, [session, isAuthLoading, router]);

  if (isAuthLoading || isProfileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-7 w-7 text-primary animate-spin" />
          <p className="text-xs font-bold text-muted-foreground animate-pulse">Synchronizing your trading desk...</p>
        </div>
      </div>
    );
  }

  // SAFEGUARD: If backend returns null properties, default placeholders populate fields gracefully
  const stats = profile || {
    role: "user" as const,
    name: session?.user?.name || "Market Explorer",
    username: session?.user?.username || "anonymous_lamma",
    streak: 0,
    llamacoinBalance: 0,
    xp: 0,
    level: 1,
    virtualFiatBalance: 100000, 
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans pb-20 md:pb-0 transition-colors duration-300">
      <Navbar />
      
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
        
        {/* ============================================================================
            LEFT & CENTER SECTION: PROFILE TERMINAL & INTERACTIVE NODES
           ============================================================================ */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Identity Info Panel Card */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 border-2 border-primary text-xl flex items-center justify-center font-black">
                A
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight leading-none">{stats.name}</h1>
                <p className="text-xs text-muted-foreground font-medium mt-1.5">
                  @{stats.username} • Level {stats.level} Practitioner
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {stats.role === "admin" && (
                <button 
                  onClick={() => router.push("/admin")} 
                  className="flex-1 sm:flex-none h-9 bg-destructive/10 border border-destructive/20 text-destructive font-bold text-xs px-3 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer hover:bg-destructive/10 transition-colors"
                >
                  <ShieldAlert className="h-4 w-4" />
                  <span>Admin Terminal</span>
                </button>
              )}
              <button 
                onClick={() => router.push("/dashboard/edit")} 
                className="flex-1 sm:flex-none h-9 bg-secondary text-secondary-foreground border border-border font-bold text-xs px-3 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer hover:bg-muted transition-colors"
              >
                <Settings className="h-4 w-4" />
                <span>Edit Profile</span>
              </button>
            </div>
          </div>

          {/* Active Learning Unit Hero Banner Card */}
          <div className="bg-primary text-primary-foreground p-6 rounded-2xl shadow-md relative overflow-hidden flex flex-col justify-between min-h-[180px]">
            <div className="space-y-1 z-10">
              <span className="text-xs uppercase font-extrabold tracking-widest text-primary-foreground/70">World 1</span>
              <h2 className="text-2xl font-black tracking-tight">Money World</h2>
              <p className="text-sm text-primary-foreground/90 max-w-md mt-1 font-medium leading-relaxed">
                Master core characteristics of value, inflation indicators, basic income infrastructure metrics, and liquidity architectures.
              </p>
            </div>
            
            <button 
              onClick={() => router.push("/courses")} 
              className="mt-5 bg-card text-foreground font-bold text-sm px-5 py-3 rounded-xl shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-transform flex items-center gap-2 self-start group cursor-pointer"
            >
              <Play className="h-4 w-4 fill-current text-primary" />
              <span>Continue Node 1.1</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
            </button>

            <div className="absolute right-[-20px] bottom-[-20px] text-primary-foreground/10 pointer-events-none">
              <BookOpen className="h-48 w-48 rotate-12" />
            </div>
          </div>

          {/* RESTORED: Core Interactive Node Tree Map Placeholder Box */}
          <div className="bg-card border border-border rounded-2xl p-6 min-h-[380px] flex flex-col items-center justify-center relative bg-[radial-gradient(var(--border)_1px,transparent_1px)] [background-size:20px_20px]">
            
            {/* Visual Skill Node Path Roadmap Layout Simulation */}
            <div className="w-full max-w-sm space-y-4">
              <div className="text-center pb-2">
                <h3 className="font-black text-sm tracking-tight">Active Learning Pipeline</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">Clear sequential nodes to harvest reward tokens</p>
              </div>

              {[
                { label: "Node 1.1: What is Value?", status: "COMPLETED" },
                { label: "Node 1.2: Fiat Currency Architecture", status: "ACTIVE" },
                { label: "Node 1.3: Inflation Mechanics", status: "LOCKED" },
                { label: "Node 1.4: Ledgers & Transactions", status: "LOCKED" },
              ].map((node, index) => {
                const isActive = node.status === "ACTIVE";
                const isCompleted = node.status === "COMPLETED";
                
                return (
                  <div 
                    key={node.label}
                    className={`flex items-center justify-between p-3.5 border rounded-xl transition-all ${
                      isActive 
                        ? "bg-primary/5 border-primary shadow-sm" 
                        : isCompleted 
                        ? "bg-background border-border opacity-90" 
                        : "bg-muted/30 border-border/60 opacity-60"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black text-muted-foreground w-4">{index + 1}</span>
                      {isCompleted ? (
                        <CheckCircle2 className="h-4 w-4 text-success fill-success/10" />
                      ) : isActive ? (
                        <div className="h-4 w-4 rounded-full border-2 border-primary animate-pulse flex items-center justify-center"><div className="h-1.5 w-1.5 rounded-full bg-primary" /></div>
                      ) : (
                        <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                      <span className={`text-xs ${isActive ? "font-black text-primary" : "font-bold text-foreground"}`}>{node.label}</span>
                    </div>
                    
                    <span className={`text-[9px] uppercase font-black px-2 py-0.5 rounded ${
                      isCompleted ? "bg-success/10 text-success" : isActive ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}>
                      {node.status}
                    </span>
                  </div>
                );
              })}
            </div>

          </div>

        </div>

        {/* ============================================================================
            RIGHT SECTION: SPLIT WALLET INFRASTRUCTURE & badges
           ============================================================================ */}
        <div className="space-y-6">
          
          {/* Virtual Paper Trading Wallet Module */}
          <div className="bg-card border border-border p-5 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-success/10 text-success">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground">Simulation Assets</h4>
                  <p className="text-sm font-black tracking-tight">Paper Trading Wallet</p>
                </div>
              </div>
            </div>

            <div className="space-y-0.5">
              <span className="text-3xl font-black tracking-tight text-success block">
                ₹{stats.virtualFiatBalance.toLocaleString("en-IN")}.00
              </span>
              
              <div className="flex flex-col gap-2.5 pt-4 border-t border-border/60 mt-4 text-xs font-bold text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-warning">
                    <Flame className="h-4 w-4 fill-current" /> Daily Login Streak
                  </span>
                  <span className="text-foreground font-black">{stats.streak} Days</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-primary">
                    <Coins className="h-4 w-4 fill-current" /> Llamacoin Balance
                  </span>
                  <span className="text-foreground font-black">{stats.llamacoinBalance.toLocaleString()} Tokens</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-primary">
                    <Trophy className="h-4 w-4" /> Earned Experience
                  </span>
                  <span className="text-foreground font-black">{stats.xp.toLocaleString()} XP</span>
                </div>
              </div>
            </div>

            <button 
              onClick={() => router.push("/trading")}
              className="w-full h-11 mt-2 bg-primary text-primary-foreground font-black text-xs rounded-xl transition-opacity hover:opacity-95 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              Launch Trading Terminal
            </button>
          </div>

          {/* RESTORED: Achievement Milestones Card Component */}
          <div className="bg-card border border-border p-5 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground">Unlocked Achievements</h4>
                <p className="text-sm font-black tracking-tight">Badges Earned</p>
              </div>
            </div>

            {/* Complete Badge grid display arrays rows layout */}
            <div className="grid grid-cols-4 gap-3 pt-1">
              {[
                { icon: "🏆", name: "First Step" },
                { icon: "📈", name: "Alpha Profit" },
                { icon: "🔥", name: "Streak King" },
              ].map((badge) => (
                <div 
                  key={badge.name} 
                  title={badge.name}
                  className="aspect-square rounded-xl bg-background border border-border flex items-center justify-center text-lg hover:scale-105 transition-transform cursor-help shadow-inner"
                >
                  {badge.icon}
                </div>
              ))}
              <div className="aspect-square rounded-xl border border-dashed border-border/80 flex items-center justify-center text-xs text-muted-foreground font-black bg-background/30">
                +12
              </div>
            </div>
            
            <p className="text-[10px] font-bold text-muted-foreground text-center pt-1">
              Complete course modules to clear hidden milestone achievements.
            </p>
          </div>

        </div>

      </main>
    </div>
  );
}