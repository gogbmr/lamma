// app/api/courses/[courseId]/lessons/[lessonId]/complete/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(
  request: Request,
  props: { params: Promise<{ courseId: string; lessonId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Forbidden access matrix" }, { status: 403 });
    }

    // Await the params object before destructuring
    const { courseId, lessonId } = await props.params;

    const profile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id }
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile missing" }, { status: 400 });
    }

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId }
    });

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    // Check if progress already exists
    const existingProgress = await prisma.userProgress.findUnique({
      where: {
        profileId_lessonId: { profileId: profile.id, lessonId: lesson.id }
      }
    });

    // If already completed, just return success (don't award double XP)
    if (existingProgress?.completed) {
      return NextResponse.json({ success: true, message: "Already completed", xpAwarded: 0 });
    }

    // Determine the next lesson ID to move their pointer forward
    const allLessons = await prisma.lesson.findMany({
      where: { courseId },
      orderBy: { order: "asc" },
      select: { id: true }
    });
    
    const currentIndex = allLessons.findIndex((l) => l.id === lessonId);
    const nextLessonId = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1].id : null;

    // Run a transaction to ensure atomic updates
    const result = await prisma.$transaction(async (tx) => {
      // 1. Mark lesson as completed
      await tx.userProgress.upsert({
        where: {
          profileId_lessonId: { profileId: profile.id, lessonId: lesson.id }
        },
        update: {
          completed: true,
          lessonCompleted: true,
          completedAt: new Date(),
        },
        create: {
          profileId: profile.id,
          lessonId: lesson.id,
          completed: true,
          lessonCompleted: true,
          completedAt: new Date(),
        }
      });

      // 2. Update Profile XP and move pointer forward
      const updatedProfile = await tx.userProfile.update({
        where: { id: profile.id },
        data: {
          xp: { increment: lesson.xpReward },
          // Only update the pointer if there is a next lesson
          ...(nextLessonId && { currentLessonId: nextLessonId })
        }
      });

      // 3. Log Activity
      await tx.userActivity.create({
        data: {
          profileId: profile.id,
          activityType: "LESSON_COMPLETED",
          metadata: { lessonId, xpEarned: lesson.xpReward }
        }
      });

      return updatedProfile;
    });

    return NextResponse.json({ 
      success: true, 
      xpAwarded: lesson.xpReward,
      totalXp: result.xp
    });

  } catch (error) {
    console.error("❌ POST /api/.../complete failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}