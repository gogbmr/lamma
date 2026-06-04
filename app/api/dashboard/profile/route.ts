// app/api/dashboard/profile/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    let profile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      profile = await prisma.userProfile.create({
        data: {
          userId: session.user.id,
          role: "user",
          virtualFiatBalance: 100000,
          llamacoinBalance: 0,
          xp: 0,
          streak: 0,
          level: 1,
        },
      });
    }

    // Flattened JSON payload optimization safe for cross-platform app requests
    return NextResponse.json({
      id: profile.id,
      userId: profile.userId,
      name: session.user.name,
      username: session.user.username,
      email: session.user.email,
      role: profile.role,
      virtualFiatBalance: profile.virtualFiatBalance,
      llamacoinBalance: profile.llamacoinBalance,
      xp: profile.xp,
      streak: profile.streak,
      level: profile.level,
      avatar: profile.avatar,
      totalTimeSpent: profile.totalTimeSpent,
    });
  } catch (error) {
    console.error("❌ Failed to resolve active dashboard profile:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}