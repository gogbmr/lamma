import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth"; // Make sure to import your auth
import { headers } from "next/headers";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;

    // 1. Check if the logged-in user is already enrolled
    let isEnrolled = false;
    try {
      const session = await auth.api.getSession({
        headers: await headers(),
      });

      if (session?.user) {
        const profile = await prisma.userProfile.findUnique({
          where: { userId: session.user.id },
          select: { currentCourseId: true },
        });
        
        if (profile?.currentCourseId === courseId) {
          isEnrolled = true;
        }
      }
    } catch (e) {
      // If auth fails or user isn't logged in, they aren't enrolled. We proceed silently.
    }

    // 2. Fetch the course
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        status: "APPROVED",
      },
      include: {
        tutor: {
          select: { name: true, avatar: true, bio: true },
        },
        lessons: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            title: true,
            topic: true,
            module: true,
            lessonNumber: true,
            xpReward: true,
            isLocked: true,
          },
        },
        _count: {
          select: { lessons: true },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // 3. Return the course WITH the new isEnrolled flag
    return NextResponse.json({ ...course, isEnrolled });
  } catch (error) {
    console.error("❌ GET /api/courses/[id] failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}