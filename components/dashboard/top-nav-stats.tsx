// components/dashboard/top-nav-stats.tsx
"use client";

import { Flame, Coins, Trophy, User } from "lucide-react";
import { Card } from "@/components/ui/card";

interface UserStatsProps {
  streak: number;
  llamacoints: number;
  xp: number;
  level: number;
}

export function TopNavStats({ streak, llamacoints, xp, level }: UserStatsProps) {
  return (
    <div className="w-full bg-card border-b border-border px-6 py-4 flex items-center justify-between transition-colors duration-300">
      {/* Brand Side */}
      <div className="flex items-center gap-2">
        <span className="text-xl font-bold tracking-wider text-primary">FINLAMMA</span>
        <div className="bg-primary/10 text-primary text-xs font-semibold px-2 py-0.5 rounded-full">
          Lvl {level}
        </div>
      </div>

      {/* Gamification Indicator Group */}
      <div className="flex items-center gap-6">
        {/* Daily Streak Badge */}
        <div className="flex items-center gap-1.5 font-medium text-sm text-amber-500">
          <Flame className="h-5 w-5 fill-current text-warning animate-bounce" />
          <span>{streak} Days</span>
        </div>

        {/* Currency Bank */}
        <div className="flex items-center gap-1.5 font-medium text-sm text-yellow-500">
          <Coins className="h-5 w-5 fill-current text-yellow-500" />
          <span>{llamacoints.toLocaleString()}</span>
        </div>

        {/* Experience Tracker */}
        <div className="flex items-center gap-1.5 font-medium text-sm text-primary">
          <Trophy className="h-5 w-5 text-primary" />
          <span>{xp} XP</span>
        </div>

        {/* User Mini Profile Avatar Trigger */}
        <div className="h-8 w-8 rounded-full border border-border bg-muted flex items-center justify-center cursor-pointer overflow-hidden hover:scale-105 transition-transform">
          <User className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    </div>
  );
}