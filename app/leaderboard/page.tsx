"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/navigation/navbar";
import { authClient } from "@/lib/auth-client"; // Adjust path if needed
import {
  Trophy,
  Flame,
  TrendingUp,
  Search,
  Crown,
  Medal,
  Sparkles,
  Zap,
  Award,
  Target,
  Loader2,
  AlertCircle
} from "lucide-react";

// ============================================================
// TYPES
// ============================================================
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

// ============================================================
// PODIUM COMPONENT
// ============================================================
function PodiumSpot({
  user,
  rank,
  filterType,
  position,
}: {
  user: LeaderboardUser;
  rank: number;
  filterType: "xp" | "profit";
  position: "first" | "second" | "third";
}) {
  const heights = {
    first: "h-[200px] md:h-[240px]",
    second: "h-[160px] md:h-[200px]",
    third: "h-[140px] md:h-[180px]",
  };

  const borders = {
    first: "border-2 border-yellow-400 shadow-xl shadow-yellow-400/20",
    second: "border-2 border-gray-400 shadow-lg shadow-gray-400/10",
    third: "border-2 border-orange-600 shadow-lg shadow-orange-600/10",
  };

  const badges = {
    first: (
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
        <div className="w-16 h-16 rounded-full bg-yellow-400 flex items-center justify-center shadow-lg animate-bounce">
          <Crown className="h-8 w-8 text-yellow-900" />
        </div>
        <div className="bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full text-[10px] font-black shadow-md">
          CHAMPION
        </div>
      </div>
    ),
    second: (
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
        <div className="w-12 h-12 rounded-full bg-gray-400 flex items-center justify-center shadow-lg">
          <Medal className="h-6 w-6 text-gray-700" />
        </div>
        <div className="bg-gray-400 text-gray-700 px-2 py-0.5 rounded-full text-[9px] font-black shadow-md">
          2ND PLACE
        </div>
      </div>
    ),
    third: (
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
        <div className="w-12 h-12 rounded-full bg-orange-600 flex items-center justify-center shadow-lg">
          <Award className="h-6 w-6 text-orange-100" />
        </div>
        <div className="bg-orange-600 text-orange-100 px-2 py-0.5 rounded-full text-[9px] font-black shadow-md">
          3RD PLACE
        </div>
      </div>
    ),
  };

  const glows = {
    first: "bg-gradient-to-b from-yellow-400/10 to-transparent",
    second: "bg-gradient-to-b from-gray-400/10 to-transparent",
    third: "bg-gradient-to-b from-orange-600/10 to-transparent",
  };

  return (
    <div className={`relative ${heights[position]}`}>
      {badges[position]}
      <div
        className={`h-full bg-card rounded-2xl ${borders[position]} ${glows[position]} flex flex-col items-center justify-center p-4 relative overflow-hidden transition-transform hover:scale-105 duration-300`}
      >
        {position === "first" && (
          <>
            <Sparkles className="absolute top-2 left-2 h-4 w-4 text-yellow-400 fill-yellow-400 animate-pulse" />
            <Sparkles className="absolute bottom-2 right-2 h-4 w-4 text-yellow-400 fill-yellow-400 animate-pulse [animation-delay:500ms]" />
          </>
        )}

        <div className="text-4xl md:text-5xl mb-3">{user.avatar}</div>
        <h3 className="font-black text-sm md:text-base text-center truncate w-full px-2">
          {user.name}
        </h3>
        <p className="text-[10px] text-muted-foreground font-bold mb-2">
          @{user.username}
        </p>

        <div className="bg-background/60 backdrop-blur-sm border border-border rounded-xl px-3 py-2 w-full">
          <div className="text-center">
            <div className={`text-lg md:text-xl font-black ${
              filterType === "profit"
                ? user.tradingProfit >= 0
                  ? "text-success"
                  : "text-destructive"
                : "text-primary"
            }`}>
              {filterType === "profit"
                ? `${user.tradingProfit >= 0 ? "+" : ""}₹${user.tradingProfit.toLocaleString("en-IN")}`
                : `${user.xp.toLocaleString()} XP`}
            </div>
            <div className="text-[10px] text-muted-foreground font-bold mt-0.5">
              Level {user.level}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MAIN PAGE
// ============================================================
export default function LeaderboardPage() {
  const [filterType, setFilterType] = useState<"xp" | "profit">("xp");
  const [searchQuery, setSearchQuery] = useState("");
  const [rawUsers, setRawUsers] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get Current Logged-in User from Better Auth
  const { data: session } = authClient.useSession();

  // Fetch Database Rankings
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/leaderboard");
        if (!res.ok) throw new Error("Failed to fetch");
        
        const data = await res.json();
        setRawUsers(data);
      } catch (error) {
        console.error("Error fetching leaderboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  // Process, Sort, and Filter Data Dynamically
  const sortedData = [...rawUsers]
    .sort((a, b) =>
      filterType === "profit"
        ? b.tradingProfit - a.tradingProfit
        : b.xp - a.xp
    )
    .map((item, index) => ({ 
      ...item, 
      rank: index + 1,
      // Flag if this row belongs to the active logged-in session user
      isCurrentUser: session?.user?.id === item.id 
    }))
    .filter(
      (user) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const podiumSpots = sortedData.slice(0, 3);
  const remainingRows = sortedData.slice(3);
  const currentUserStats = sortedData.find((u) => u.isCurrentUser);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col pb-20 md:pb-0">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 space-y-8">
        
        {/* HEADER SECTION */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-2 rounded-full">
            <Trophy className="h-5 w-5 text-primary fill-primary/60" />
            <span className="text-sm font-black text-primary uppercase tracking-wider">
              Global Arena
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-black tracking-tight">
            Top Performers 🏆
          </h1>
          <p className="text-sm text-muted-foreground font-medium max-w-md mx-auto">
            Compete with thousands of learners across India. Climb the ranks by earning XP and mastering trading!
          </p>
        </div>

        {/* CONTROLS */}
        <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search learners..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-card border-2 border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all font-medium"
            />
          </div>

          <div className="flex items-center gap-2 bg-card border-2 border-border p-1 rounded-xl shadow-sm">
            <button
              onClick={() => setFilterType("xp")}
              className={`px-4 py-2 rounded-lg text-xs font-black tracking-tight transition-all duration-200 flex items-center gap-1.5 ${
                filterType === "xp"
                  ? "bg-primary text-primary-foreground shadow-[0_3px_0_0_hsl(var(--primary)/0.5)]"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Zap className="h-3.5 w-3.5" />
              XP Rank
            </button>
            <button
              onClick={() => setFilterType("profit")}
              className={`px-4 py-2 rounded-lg text-xs font-black tracking-tight transition-all duration-200 flex items-center gap-1.5 ${
                filterType === "profit"
                  ? "bg-primary text-primary-foreground shadow-[0_3px_0_0_hsl(var(--primary)/0.5)]"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <TrendingUp className="h-3.5 w-3.5" />
              Profit Rank
            </button>
          </div>
        </div>

        {/* LOADING STATE */}
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-4 text-primary">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-sm font-bold animate-pulse text-muted-foreground">Calculating global ranks...</p>
          </div>
        ) : (
          <>
            {/* PODIUM (Top 3) */}
            {searchQuery === "" && podiumSpots.length >= 3 && (
              <div className="relative pt-16 pb-8">
                <div className="grid grid-cols-3 gap-3 md:gap-6 items-end max-w-3xl mx-auto">
                  <div className="order-1">
                    <PodiumSpot user={podiumSpots[1]} rank={2} filterType={filterType} position="second" />
                  </div>
                  <div className="order-2">
                    <PodiumSpot user={podiumSpots[0]} rank={1} filterType={filterType} position="first" />
                  </div>
                  <div className="order-3">
                    <PodiumSpot user={podiumSpots[2]} rank={3} filterType={filterType} position="third" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-2 bg-gradient-to-r from-transparent via-border to-transparent rounded-full" />
              </div>
            )}

            {/* RANKINGS LIST */}
            <div className="bg-card border-2 border-border rounded-2xl overflow-hidden shadow-lg">
              <div className="bg-muted/50 border-b-2 border-border px-4 py-3 flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  {searchQuery ? "Search Results" : "All Rankings"}
                </h3>
                <span className="text-xs font-bold text-muted-foreground">
                  {sortedData.length} learners
                </span>
              </div>

              <div className="divide-y divide-border">
                {(searchQuery !== "" ? sortedData : remainingRows).map((user) => (
                  <div
                    key={user.id}
                    className={`flex items-center justify-between p-4 transition-all duration-200 ${
                      user.isCurrentUser
                        ? "bg-primary/10 border-l-4 border-primary"
                        : "hover:bg-muted/30"
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                          user.rank <= 3
                            ? "bg-primary/20 text-primary border-2 border-primary/30"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        #{user.rank}
                      </div>

                      <div className="h-11 w-11 rounded-xl bg-background border-2 border-border flex items-center justify-center text-xl shadow-sm shrink-0">
                        {user.avatar}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold tracking-tight truncate">
                            {user.name}
                          </span>
                          {user.isCurrentUser && (
                            <span className="text-[9px] uppercase font-black bg-primary text-primary-foreground px-1.5 py-0.5 rounded tracking-wider shadow-sm">
                              You
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground font-medium block truncate">
                          @{user.username}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0 pl-3">
                      <div
                        className={`text-base font-black tracking-tight ${
                          filterType === "profit"
                            ? user.tradingProfit >= 0
                              ? "text-success"
                              : "text-destructive"
                            : "text-foreground"
                        }`}
                      >
                        {filterType === "profit"
                          ? `${user.tradingProfit >= 0 ? "+" : ""}₹${user.tradingProfit.toLocaleString("en-IN")}`
                          : `${user.xp.toLocaleString()} XP`}
                      </div>
                      <span className="text-[10px] font-bold text-muted-foreground flex items-center justify-end gap-1 mt-0.5">
                        <Crown className="h-3 w-3" />
                        Lvl {user.level}
                      </span>
                    </div>
                  </div>
                ))}

                {sortedData.length === 0 && (
                  <div className="p-12 text-center">
                    <Search className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground font-bold">
                      No learners found matching "{searchQuery}"
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* YOUR RANK CARD (Fixed at bottom on mobile) */}
            {currentUserStats && searchQuery === "" && (
              <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-5 rounded-2xl flex items-center justify-between shadow-xl border-2 border-primary/30 mt-8">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary-foreground text-primary flex items-center justify-center font-black text-lg shadow-lg">
                    #{currentUserStats.rank}
                  </div>
                  <div>
                    <h4 className="text-sm font-black tracking-tight leading-none flex items-center gap-1.5">
                      Your Current Rank
                      <Sparkles className="h-4 w-4 fill-current animate-pulse" />
                    </h4>
                    <p className="text-xs text-primary-foreground/80 mt-1 font-medium">
                      {currentUserStats.rank <= 10
                        ? "You're in the top 10! 🔥"
                        : "Keep learning to climb higher!"}
                    </p>
                  </div>
                </div>
                <div className="text-right font-black bg-primary-foreground/20 px-4 py-2 rounded-xl border border-primary-foreground/20 backdrop-blur-sm">
                  <div className="text-lg">
                    {filterType === "profit"
                      ? `${currentUserStats.tradingProfit >= 0 ? "+" : ""}₹${currentUserStats.tradingProfit.toLocaleString("en-IN")}`
                      : `${currentUserStats.xp.toLocaleString()} XP`}
                  </div>
                  <div className="text-[10px] text-primary-foreground/70 mt-0.5">
                    Level {currentUserStats.level}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}