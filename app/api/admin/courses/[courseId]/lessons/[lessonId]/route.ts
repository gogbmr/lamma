import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type RouteParams = { params: Promise<{ courseId: string; lessonId: string }> };

// GET /api/courses/:courseId/lessons/:lessonId — Full lesson data for user viewing
export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { courseId, lessonId } = await params;

    // Verify course is approved
    const course = await prisma.course.findFirst({
      where: { id: courseId, status: "APPROVED" },
      select: { id: true, title: true },
    });
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const lesson = await prisma.lesson.findFirst({
      where: { id: lessonId, courseId },
      select: {
        id: true,
        title: true,
        description: true,
        icon: true,
        videoUrl: true,
        videoContext: true,
        content: true,
        order: true,
        isLocked: true,
        xpReward: true,
        quizXpReward: true,
        quizCountToShow: true,
        lessonNumber: true,
        topic: true,
        module: true,
        courseId: true,
        quizGroup: {
          select: {
            id: true,
            name: true,
            quizzes: {
              select: {
                id: true,
                question: true,
                options: true,
                correctAnswer: true,
              },
            },
          },
        },
      },
    });

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    // Randomly select quizCountToShow quizzes from the quiz group
    let selectedQuizzes: Array<{ id: string; question: string; options: string[]; correctAnswer: string }> = [];
    if (lesson.quizGroup?.quizzes) {
      const allQuizzes = [...lesson.quizGroup.quizzes];
      const count = Math.min(lesson.quizCountToShow, allQuizzes.length);
      // Fisher-Yates shuffle
      for (let i = allQuizzes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allQuizzes[i], allQuizzes[j]] = [allQuizzes[j], allQuizzes[i]];
      }
      selectedQuizzes = allQuizzes.slice(0, count);
    }

    const hasAiAssistant = !!(
      lesson.videoContext &&
      Array.isArray(lesson.videoContext) &&
      (lesson.videoContext as unknown[]).length > 0
    );

    return NextResponse.json({
      ...lesson,
      courseTitle: course.title,
      quizzes: selectedQuizzes,
      hasAiAssistant,
    });
  } catch (error) {
    console.error("❌ GET /api/courses/:id/lessons/:id failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
