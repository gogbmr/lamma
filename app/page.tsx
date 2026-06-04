// app/page.tsx
import { Navbar } from "@/components/navigation/navbar";
import { 
  Play, 
  Sparkles, 
  TrendingUp, 
  Flame, 
  Award, 
  CheckCircle2, 
  ArrowUpRight 
} from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col pb-16 md:pb-0 transition-colors duration-300">
      
      {/* Dynamic responsive shell layout */}
      <Navbar />

      {/* ==========================================
          1. HERO MARKETING PANEL BANNER
         ========================================== */}
      <section className="w-full max-w-5xl mx-auto px-6 pt-8 md:pt-16 pb-8 text-center space-y-4">
        <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary border border-primary/20 text-xs font-bold px-3 py-1 rounded-full animate-pulse">
          <Sparkles className="h-3.5 w-3.5 fill-current" />
          <span>The Gamified Stock Market Revolution</span>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-black tracking-tight max-w-3xl mx-auto leading-none">
          Master Finance Like a <span className="text-primary">Game</span>.
        </h1>
        
        <p className="text-sm md:text-base text-muted-foreground max-w-lg mx-auto font-medium">
          Say goodbye to dry textbooks. Clear progressive skill worlds, claim achievement badges, and deploy virtual cash simulations.
        </p>

        <div className="flex items-center justify-center gap-4 pt-2">
          <Link 
            href="/signup" 
            className="bg-primary text-primary-foreground font-black text-sm px-6 py-3.5 rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] transition-transform flex items-center gap-2"
          >
            <Play className="h-4 w-4 fill-current" />
            Start Free Journey
          </Link>
        </div>
      </section>

      {/* ==========================================
          2. MARKET INTEGRATION LIVE-LOOK TICKS
         ========================================== */}
      <section className="w-full border-y border-border bg-card py-3 overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between gap-4 text-xs font-bold whitespace-nowrap overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground uppercase">NIFTY 50</span>
            <span className="text-success flex items-center gap-0.5">23,450.15 (+0.84% <ArrowUpRight className="h-3 w-3" />)</span>
          </div>
          <div className="flex items-center gap-4 border-l border-border pl-4">
            <span className="text-muted-foreground uppercase">SENSEX</span>
            <span className="text-success flex items-center gap-0.5">77,120.40 (+0.71% <ArrowUpRight className="h-3 w-3" />)</span>
          </div>
          <div className="flex items-center gap-4 border-l border-border pl-4">
            <span className="text-muted-foreground uppercase">LAMMA COIN VALUE</span>
            <span className="text-warning font-black">1.00 XP Token</span>
          </div>
        </div>
      </section>

      {/* ==========================================
          3. SKILL LEVEL CONTENT DISPLAY MATRIX
         ========================================== */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left column section mirroring interactive dashboard paths */}
        <div className="md:col-span-2 space-y-4">
          <h3 className="text-sm font-black tracking-wider uppercase text-muted-foreground">Active Knowledge Map</h3>
          
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="text-[10px] uppercase font-black tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/10 inline-block">Module 1</div>
                <h4 className="text-lg font-black tracking-tight">Characteristics of Value</h4>
              </div>
              <span className="text-xs font-bold text-muted-foreground">3 / 5 Complete</span>
            </div>

            {/* Sequence line linking learning checkpoints */}
            <div className="space-y-3">
              {[
                { name: "What is Money?", locked: false, completed: true },
                { name: "The Gold Standard Trap", locked: false, completed: true },
                { name: "Fiat Currencies Explained", locked: false, completed: true },
                { name: "Understanding Inflation Nodes", locked: false, completed: false },
                { name: "Cryptographic Ledgers Intro", locked: true, completed: false },
              ].map((node, index) => (
                <div 
                  key={node.name} 
                  className={`flex items-center justify-between p-3.5 rounded-xl border transition-colors ${
                    node.locked 
                      ? "bg-muted/40 opacity-60 border-border" 
                      : "bg-background hover:bg-muted/40 border-border cursor-pointer"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-muted-foreground/80 w-4">{index + 1}</span>
                    {node.completed ? (
                      <CheckCircle2 className="h-4 w-4 text-success fill-success/10" />
                    ) : (
                      <div className={`h-4 w-4 rounded-full border-2 ${node.locked ? "border-muted-foreground/30" : "border-primary"}`} />
                    )}
                    <span className="text-xs font-bold tracking-tight">{node.name}</span>
                  </div>
                  {node.locked && <span className="text-[10px] uppercase tracking-wider font-extrabold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">Locked</span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right utility sidebar displaying gamification streaks */}
        <div className="space-y-6">
          <h3 className="text-sm font-black tracking-wider uppercase text-muted-foreground">Platform Feed</h3>
          
          {/* Daily streak showcase element panel */}
          <div className="bg-card border border-border p-5 rounded-2xl shadow-sm space-y-3.5">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-warning/10 text-warning rounded-xl">
                <Flame className="h-5 w-5 fill-current" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">Daily Login Streak</h4>
                <p className="text-sm font-black tracking-tight">Maintain Engagement</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Log in continuously daily to multiply your interactive course quiz coin outputs by up to 2.5x.
            </p>
          </div>

          {/* Leaderboard sample visual target container block */}
          <div className="bg-card border border-border p-5 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 text-primary rounded-xl">
                <Award className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-black tracking-tight">Global Top Performers</h4>
            </div>

            <div className="space-y-2.5">
              {[
                { name: "Rahul_Trader", score: "14,520 XP", rank: 1, color: "text-warning" },
                { name: "Priya_Invest", score: "12,980 XP", rank: 2, color: "text-muted-foreground" },
                { name: "Aman_Stocks", score: "11,400 XP", rank: 3, color: "text-amber-700" },
              ].map((player) => (
                <div key={player.name} className="flex items-center justify-between p-2 rounded-xl bg-muted/40 border border-border/50 text-xs font-semibold">
                  <div className="flex items-center gap-2.5">
                    <span className={`font-black w-3 ${player.color}`}>#{player.rank}</span>
                    <span className="tracking-tight">{player.name}</span>
                  </div>
                  <span className="text-muted-foreground">{player.score}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}