// app/api/user/sync-guest-data/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function POST(req: Request) {
  try {
    // 1. Authenticate session via Better Auth headers
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { xp, llamacoinBalance, totalTimeSpent, currentCourseId, currentLessonId, completedLessons } = await req.json();

    // 2. Locate the existing enterprise UserProfile created by the signup lifecycle hook
    const currentProfile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!currentProfile) {
      return NextResponse.json({ error: "User profile not initialized" }, { status: 404 });
    }

    // 3. Batch commit metrics and lesson logs within a single database transaction
    await prisma.$transaction([
      // Update core profile progress pointers and accumulated wallet balances
      prisma.userProfile.update({
        where: { id: currentProfile.id },
        data: {
          xp: { increment: xp || 0 },
          llamacoinBalance: { increment: llamacoinBalance || 0 },
          totalTimeSpent: { increment: totalTimeSpent || 0 },
          currentCourseId: currentCourseId || undefined,
          currentLessonId: currentLessonId || undefined,
        },
      }),

      // Sync array of local guest lesson records into explicit UserProgress rows
      ...(completedLessons || []).map((lesson: any) =>
        prisma.userProgress.upsert({
          where: {
            profileId_lessonId: {
              profileId: currentProfile.id,
              lessonId: lesson.lessonId,
            },
          },
          update: {
            completed: true,
            timeSpent: { increment: lesson.timeSpent || 0 },
            score: lesson.score || undefined,
            completedAt: new Date(),
          },
          create: {
            profileId: currentProfile.id,
            lessonId: lesson.lessonId,
            completed: true,
            timeSpent: lesson.timeSpent || 0,
            score: lesson.score || undefined,
            completedAt: new Date(),
          },
        })
      ),
    ]);

    return NextResponse.json({ success: true, message: "Guest metrics merged successfully." });
  } catch (error) {
    console.error("❌ Failed to push frontend guest cache to database:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}