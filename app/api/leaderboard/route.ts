// app/api/leaderboard/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Adjust path to your Prisma client

export async function GET() {
  try {
    // 1. Fetch all User Profiles, including their core User data and closed trades
    const profiles = await prisma.userProfile.findMany({
      where: {
        role: "user", // Optional: Exclude 'admin' from the global leaderboard
      },
      select: {
        userId: true,
        xp: true,
        level: true,
        avatar: true,
        user: {
          select: {
            name: true,
            username: true,
          },
        },
        trades: {
          where: { status: "CLOSED" },
          select: { profitLoss: true },
        },
      },
    });

    // 2. Format and calculate totals for the frontend
    const emojis = ["🔥", "⚡", "💎", "🚀", "📈", "👑", "🧠", "🧘", "🎯", "🥋"];
    
    const formattedData = profiles.map((p, index) => {
      // Calculate total profit dynamically from all closed trades
      const totalProfit = p.trades.reduce((sum, trade) => sum + trade.profitLoss, 0);

      return {
        id: p.userId, // Matching Better Auth's session user ID
        username: p.user.username || "anonymous",
        name: p.user.name,
        xp: p.xp,
        tradingProfit: totalProfit,
        level: p.level,
        // Since your UI uses emojis for avatars, we map a deterministic emoji here.
        // If you switch to image URLs later, replace this with `p.avatar` and update the UI <img> tag.
        avatar: emojis[index % emojis.length], 
      };
    });

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error("❌ GET /api/leaderboard failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard rankings" },
      { status: 500 }
    );
  }
}