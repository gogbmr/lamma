// app/api/admin/stats/route.ts
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
    const session = await auth.api.getSession({ headers: await headers() });

    // Strict Role Check: Only 'admin' enum allowed
    const profile = await prisma.userProfile.findUnique({
      where: { userId: session?.user.id },
    });

    if (!session || profile?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Parallel aggregation for high-speed dashboard loading
    const [userCount, courseStats, tradeStats, totalVirtualCash] = await Promise.all([
      prisma.user.count(),
      prisma.course.groupBy({ by: ['status'], _count: true }),
      prisma.trade.count({ where: { status: 'OPEN' } }),
      prisma.userProfile.aggregate({ _sum: { virtualFiatBalance: true } })
    ]);

    return NextResponse.json({
      users: userCount,
      courses: {
        total: courseStats.reduce((acc, curr) => acc + curr._count, 0),
        pending: courseStats.find(c => c.status === 'PENDING_REVIEW')?._count || 0,
        approved: courseStats.find(c => c.status === 'APPROVED')?._count || 0,
      },
      activeTrades: tradeStats,
      totalLiquidity: totalVirtualCash._sum.virtualFiatBalance || 0,
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}