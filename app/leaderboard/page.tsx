"use client";

import { useState } from "react";
import { Navbar } from "@/components/navigation/navbar";
import { 
  Trophy, 
  Flame, 
  TrendingUp, 
  Search, 
  Crown,
  Medal,
  Sparkles
} from "lucide-react";

// Structure maps identically to standard JSON API payloads for cross-platform efficiency
interface LeaderboardUser {
  rank: number;
  id: string;
  username: string;
  name: string;
  xp: number;
  tradingProfit: number;
  level: number;
  avatar: string;
  isCurrentUser?: boolean;
}

const mockLeaderboardData: LeaderboardUser[] = [
  { rank: 1, id: "u1", username: "rahul_trader", name: "Rahul Sharma", xp: 24500, tradingProfit: 84200, level: 14, avatar: "🔥" },
  { rank: 2, id: "u2", username: "priya_invest", name: "Priya Patel", xp: 21200, tradingProfit: 71500, level: 12, avatar: "⚡" },
  { rank: 3, id: "u3", username: "aman_stocks", name: "Aman Verma", xp: 19800, tradingProfit: 64000, level: 11, avatar: "💎" },
  { rank: 4, id: "u4", username: "neha_nifty", name: "Neha Joshi", xp: 17400, tradingProfit: 52100, level: 9, avatar: "🚀" },
  { rank: 5, id: "u5", username: "bull_market", name: "Vikram Singh", xp: 15100, tradingProfit: -4200, level: 8, avatar: "📈", isCurrentUser: true }, // Highlighted User
  { rank: 6, id: "u6", username: "option_king", name: "Rajesh Kumar", xp: 14200, tradingProfit: 48900, level: 8, avatar: "👑" },
  { rank: 7, id: "u7", username: "alpha_mind", name: "Arjun Mehta", xp: 12900, tradingProfit: 31200, level: 7, avatar: "🧠" },
  { rank: 8, id: "u8", username: "sensex_guru", name: "Sanjay Dutt", xp: 11200, tradingProfit: 19500, level: 6, avatar: "🧘" },
];

export default function LeaderboardPage() {
  // Toggle filters mimic typical backend query parameters (?type=xp or ?type=profit)
  const [filterType, setFilterType] = useState<"xp" | "profit">("xp");
  const [searchQuery, setSearchQuery] = useState("");

  // Sort and filter computation mirror database querying rules
  const sortedData = [...mockLeaderboardData]
    .sort((a, b) => filterType === "profit" ? b.tradingProfit - a.tradingProfit : b.xp - a.xp)
    .map((item, index) => ({ ...item, rank: index + 1 }))
    .filter(user => 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      user.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

  // Extract Podium top 3 spots cleanly
  const podiumSpots = sortedData.slice(0, 3);
  const remainingRows = sortedData.slice(3);

  // Find user context info block
  const currentUserStats = mockLeaderboardData.find(u => u.isCurrentUser);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col pb-20 md:pb-0 transition-colors duration-300">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-6 space-y-6">
        
        {/* ==========================================
            1. HEADER METRICS CONTROL STRIP
           ========================================== */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
              <Trophy className="h-6 w-6 text-warning" />
              Global Arena
            </h1>
            <p className="text-xs text-muted-foreground font-medium">Compete daily with elite retail learners across India.</p>
          </div>

          {/* Toggle Controllers */}
          <div className="flex items-center gap-2 bg-card border border-border p-1 rounded-xl self-start md:self-auto shadow-sm">
            <button
              onClick={() => setFilterType("xp")}
              className={`px-4 py-2 rounded-lg text-xs font-bold tracking-tight transition-all cursor-pointer ${
                filterType === "xp" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              XP Standings
            </button>
            <button
              onClick={() => setFilterType("profit")}
              className={`px-4 py-2 rounded-lg text-xs font-bold tracking-tight transition-all cursor-pointer ${
                filterType === "profit" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Paper Returns
            </button>
          </div>
        </div>

        {/* Search Engine Layer Input */}
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search username or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-card border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
          />
        </div>

        {/* ==========================================
            2. THE PODIUM CONTAINER STAGE (Top 3)
           ========================================== */}
        {searchQuery === "" && podiumSpots.length >= 3 && (
          <div className="grid grid-cols-3 gap-2 md:gap-4 items-end pt-6 max-w-2xl mx-auto text-center">
            
            {/* Rank #2: Silver Medalist */}
            <div className="bg-card border border-border rounded-2xl p-3 md:p-5 flex flex-col items-center justify-center space-y-2 order-1 h-[160px] md:h-[190px] shadow-sm relative">
              <div className="absolute top-[-16px] bg-muted border border-border h-7 w-7 rounded-full flex items-center justify-center text-xs font-black text-muted-foreground shadow-sm">2</div>
              <span className="text-2xl">{podiumSpots[1]?.avatar}</span>
              <div className="truncate w-full font-bold text-xs md:text-sm tracking-tight">{podiumSpots[1]?.name}</div>
              <div className="text-[10px] md:text-xs font-extrabold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                {filterType === "profit" ? `₹${podiumSpots[1]?.tradingProfit.toLocaleString("en-IN")}` : `${podiumSpots[1]?.xp.toLocaleString()} XP`}
              </div>
            </div>

            {/* Rank #1: Gold Crown Champion */}
            <div className="bg-card border-2 border-warning rounded-2xl p-4 md:p-6 flex flex-col items-center justify-center space-y-2 order-2 h-[190px] md:h-[230px] shadow-md relative scale-105">
              <div className="absolute top-[-24px] animate-bounce">
                <Crown className="h-7 w-7 text-warning fill-warning" />
              </div>
              <div className="absolute top-[-16px] bg-warning text-warning-foreground h-8 w-8 rounded-full flex items-center justify-center text-sm font-black shadow-md">1</div>
              <span className="text-3xl">{podiumSpots[0]?.avatar}</span>
              <div className="truncate w-full font-black text-sm tracking-tight">{podiumSpots[0]?.name}</div>
              <div className="text-xs font-black text-warning bg-warning/10 px-3 py-1 rounded-full border border-warning/20">
                {filterType === "profit" ? `₹${podiumSpots[0]?.tradingProfit.toLocaleString("en-IN")}` : `${podiumSpots[0]?.xp.toLocaleString()} XP`}
              </div>
            </div>

            {/* Rank #3: Bronze Medalist */}
            <div className="bg-card border border-border rounded-2xl p-3 md:p-5 flex flex-col items-center justify-center space-y-2 order-3 h-[140px] md:h-[170px] shadow-sm relative">
              <div className="absolute top-[-16px] bg-amber-700/10 border border-amber-700/20 h-7 w-7 rounded-full flex items-center justify-center text-xs font-black text-amber-700 shadow-sm">3</div>
              <span className="text-2xl">{podiumSpots[2]?.avatar}</span>
              <div className="truncate w-full font-bold text-xs md:text-sm tracking-tight">{podiumSpots[2]?.name}</div>
              <div className="text-[10px] md:text-xs font-extrabold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                {filterType === "profit" ? `₹${podiumSpots[2]?.tradingProfit.toLocaleString("en-IN")}` : `${podiumSpots[2]?.xp.toLocaleString()} XP`}
              </div>
            </div>

          </div>
        )}

        {/* ==========================================
            3. LOWER RUNNER SCROLL SHEET (Ranks 4+)
           ========================================== */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="divide-y divide-border/60">
            
            {/* Map standard ranking spreadsheet entries */}
            {(searchQuery !== "" ? sortedData : remainingRows).map((user) => (
              <div 
                key={user.id} 
                className={`flex items-center justify-between p-4 transition-colors duration-150 ${
                  user.isCurrentUser ? "bg-primary/5 dark:bg-primary/10" : "hover:bg-muted/30"
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Position Stamp */}
                  <span className="text-xs font-black text-muted-foreground w-6 text-center">
                    #{user.rank}
                  </span>
                  
                  {/* Emoji Avatar Graphic */}
                  <div className="h-9 w-9 rounded-xl bg-background border border-border flex items-center justify-center text-base shadow-sm shrink-0">
                    {user.avatar}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold tracking-tight truncate">{user.name}</span>
                      {user.isCurrentUser && (
                        <span className="text-[9px] uppercase font-black bg-primary text-primary-foreground px-1.5 py-0.5 rounded tracking-wider shadow-sm">You</span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground font-medium block truncate">@{user.username || "explorer"}</span>
                  </div>
                </div>

                {/* Performance Matrix Payload Indicator */}
                <div className="text-right shrink-0 pl-2">
                  <div className={`text-sm font-extrabold tracking-tight ${
                    filterType === "profit" 
                      ? user.tradingProfit >= 0 ? "text-success" : "text-destructive"
                      : "text-foreground"
                  }`}>
                    {filterType === "profit" 
                      ? `${user.tradingProfit >= 0 ? "+" : ""}₹${user.tradingProfit.toLocaleString("en-IN")}`
                      : `${user.xp.toLocaleString()} XP`
                    }
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground block">Lvl {user.level}</span>
                </div>
              </div>
            ))}

            {sortedData.length === 0 && (
              <div className="p-8 text-center text-sm text-muted-foreground font-medium">
                No market players found matching that search string.
              </div>
            )}
          </div>
        </div>

        {/* ==========================================
            4. FIXED USER CONTEXT SHIELD FOOTHOLD
           ========================================== */}
        {currentUserStats && searchQuery === "" && (
          <div className="bg-primary text-primary-foreground p-4 rounded-xl flex items-center justify-between shadow-md border border-primary/20">
            <div className="flex items-center gap-3">
              <div className="h-7 w-7 rounded-full bg-primary-foreground text-primary flex items-center justify-center font-black text-xs shadow-sm">
                #{currentUserStats.rank}
              </div>
              <div>
                <h4 className="text-xs font-black tracking-tight leading-none flex items-center gap-1">
                  Your Current Standing
                  <Sparkles className="h-3 w-3 fill-current text-warning animate-pulse" />
                </h4>
                <p className="text-[11px] text-primary-foreground/80 mt-0.5 font-medium">Keep completing lessons to unlock the podium!</p>
              </div>
            </div>
            <div className="text-right font-black text-xs tracking-tight bg-primary-foreground/10 px-3 py-1.5 rounded-lg border border-primary-foreground/10">
              {filterType === "profit" 
                ? `₹${currentUserStats.tradingProfit.toLocaleString("en-IN")}`
                : `${currentUserStats.xp.toLocaleString()} XP`
              }
            </div>
          </div>
        )}

      </main>
    </div>
  );
}