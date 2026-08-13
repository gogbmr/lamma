import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth"; // Adjust this path to wherever your Better Auth instance is exported
import { headers } from "next/headers";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;

    // ==========================================
    // 1. STRICT AUTHENTICATION
    // ==========================================
    // Next 15 requires headers() to be awaited
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Verify the user actually has a profile in the database
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return NextResponse.json({ error: "User profile not found. Please complete registration." }, { status: 404 });
    }

    // ==========================================
    // 2. VERIFY COURSE
    // ==========================================
    const course = await prisma.course.findFirst({
      where: { id: courseId, status: "APPROVED" },
      include: {
        lessons: {
          orderBy: { order: "asc" },
          take: 1, // We only need the first lesson to set their starting point
        },
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not available for enrollment" }, { status: 404 });
    }

    const firstLessonId = course.lessons[0]?.id || null;

    // ==========================================
    // 3. UPDATE PROFILE
    // ==========================================
    await prisma.userProfile.update({
      where: { userId },
      data: {
        currentCourseId: courseId,
        currentLessonId: firstLessonId,
      },
    });

    return NextResponse.json({ success: true, message: "Enrolled successfully" });
  } catch (error) {
    console.error("❌ POST /api/courses/[id]/enroll failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}