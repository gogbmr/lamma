import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type RouteParams = { params: Promise<{ courseId: string }> };

// GET /api/courses/:courseId — Public: single course with lesson list
export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { courseId } = await params;

    const course = await prisma.course.findFirst({
      where: { id: courseId, status: "APPROVED" },
      select: {
        id: true,
        title: true,
        description: true,
        image: true,
        order: true,
        xpReward: true,
        icon: true,
        lessons: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            title: true,
            description: true,
            icon: true,
            order: true,
            isLocked: true,
            xpReward: true,
            quizXpReward: true,
            lessonNumber: true,
            videoUrl: true,
          },
        },
        _count: { select: { lessons: true } },
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    return NextResponse.json(course);
  } catch (error) {
    console.error("❌ GET /api/courses/:id failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
