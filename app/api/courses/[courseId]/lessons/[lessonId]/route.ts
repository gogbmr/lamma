// app/api/courses/[courseId]/lessons/[lessonId]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(
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

    // 1. Fetch the specific lesson
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
    // 🔥 ADD THIS TO FETCH THE QUIZZES
    quizGroup: {
      include: {
        quizzes: true
      }
    }
  }
    });

    if (!lesson || lesson.courseId !== courseId) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    // 2. Fetch all lessons to determine Next and Previous IDs
    const allLessons = await prisma.lesson.findMany({
      where: { courseId },
      orderBy: { order: "asc" },
      select: { id: true }
    });

    const currentIndex = allLessons.findIndex((l) => l.id === lessonId);
    const prevLessonId = currentIndex > 0 ? allLessons[currentIndex - 1].id : null;
    const nextLessonId = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1].id : null;

    // 3. Check if user has already completed this lesson
    const profile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true }
    });

    let isCompleted = false;
    if (profile) {
      const progress = await prisma.userProgress.findUnique({
        where: {
          profileId_lessonId: { profileId: profile.id, lessonId: lesson.id }
        }
      });
      isCompleted = progress?.completed || false;
    }

    return NextResponse.json({
      lesson,
      prevLessonId,
      nextLessonId,
      isCompleted
    }, { status: 200 });

  } catch (error) {
    console.error("❌ GET /api/.../lessons/[lessonId] failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}