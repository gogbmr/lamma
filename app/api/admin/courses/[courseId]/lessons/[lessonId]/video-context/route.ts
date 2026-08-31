import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type RouteParams = { params: Promise<{ courseId: string; lessonId: string }> };

/**
 * POST /api/admin/courses/:courseId/lessons/:lessonId/video-context
 *
 * Accepts a JSON body with the video context array and saves it to the lesson.
 * The admin uploads a .json file on the frontend, which is parsed client-side,
 * and the parsed JSON array is sent here.
 *
 * Expected JSON body:
 * {
 *   "videoContext": [
 *     { "startTime": 0, "endTime": 30, "topic": "Introduction", "text": "Welcome to..." },
 *     { "startTime": 30, "endTime": 90, "topic": "What are Options?", "text": "Options are..." }
 *   ]
 * }
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    const profile = await prisma.userProfile.findUnique({ where: { userId: session?.user?.id } });

    if (!session || !profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized endpoint request" }, { status: 403 });
    }

    const { courseId, lessonId } = await params;
    const body = await req.json();
    const { videoContext } = body;

    if (!videoContext || !Array.isArray(videoContext)) {
      return NextResponse.json(
        { error: "videoContext must be an array of timestamp segments." },
        { status: 400 }
      );
    }

    // Validate structure
    for (let i = 0; i < videoContext.length; i++) {
      const seg = videoContext[i];
      if (typeof seg.startTime !== "number" || !seg.topic || !seg.text) {
        return NextResponse.json(
          {
            error: `Invalid segment at index ${i}. Each segment must have: startTime (number), topic (string), text (string). Optional: endTime (number).`,
          },
          { status: 400 }
        );
      }
    }

    // Verify lesson belongs to course
    const existing = await prisma.lesson.findFirst({
      where: { id: lessonId, courseId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Lesson not found in this course" }, { status: 404 });
    }

    const lesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: { videoContext },
      select: {
        id: true,
        title: true,
        videoContext: true,
      },
    });

    return NextResponse.json({
      success: true,
      segmentCount: videoContext.length,
      lesson,
    });
  } catch (error) {
    console.error("❌ POST video-context failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    const profile = await prisma.userProfile.findUnique({ where: { userId: session?.user?.id } });

    if (!session || !profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized endpoint request" }, { status: 403 });
    }

    const { courseId, lessonId } = await params;

    const existing = await prisma.lesson.findFirst({
      where: { id: lessonId, courseId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    await prisma.lesson.update({
      where: { id: lessonId },
      // 🔥 FIX: Cast null as any to bypass strict JSON type checks without importing Prisma
      data: { videoContext: null as any },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ DELETE video-context failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}