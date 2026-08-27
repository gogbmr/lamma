import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

interface RouteContext {
  params: Promise<{
    courseId: string;
  }>;
}

/* ======================================================
   GET SINGLE COURSE
====================================================== */

export async function GET(
  req: NextRequest,
  { params }: RouteContext
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const profile = await prisma.userProfile.findUnique({
      where: {
        userId: session?.user?.id,
      },
    });

    if (!session || profile?.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden access matrix" },
        { status: 403 }
      );
    }

    const { id } = await params;

    const course = await prisma.course.findUnique({
      where: {
        id,
      },
      include: {
        // 🔥 FIXED: We now tell Prisma exactly which lesson fields to fetch!
        lessons: {
          orderBy: {
            order: "asc",
          },
          select: {
            id: true,
            title: true,
            module: true,
            topic: true,
            lessonNumber: true,
            description: true,
            icon: true,
            videoUrl: true,
            videoContext: true,
            content: true,
            order: true,
            xpReward: true,
            isLocked: true,
            // These are the missing fields!
            quizXpReward: true,
            quizCountToShow: true,
            quizGroupId: true,
          }
        },
        _count: {
          select: {
            lessons: true,
            reviews: true,
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(course);
  } catch (error) {
    console.error("❌ GET course failed:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/* ======================================================
   UPDATE COURSE
====================================================== */

export async function PUT(
  req: NextRequest,
  { params }: RouteContext
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const profile = await prisma.userProfile.findUnique({
      where: {
        userId: session?.user?.id,
      },
    });

    if (!session || profile?.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden access matrix" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await req.json();

    const {
      title,
      description,
      image,
      order,
      xpReward,
      icon,
      status,
      isLocked,
      lessons = [],
    } = body;

    const existingCourse = await prisma.course.findUnique({
      where: { id },
    });

    if (!existingCourse) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    const duplicateOrder = await prisma.course.findFirst({
      where: {
        order: Number(order),
        NOT: { id },
      },
    });

    if (duplicateOrder) {
      return NextResponse.json(
        { error: "Another course already uses this display order" },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.lesson.deleteMany({
        where: { courseId: id },
      });

      await tx.course.update({
        where: { id },
        data: {
          title: title.trim(),
          description: description.trim(),
          image: image || null,
          order: Number(order),
          xpReward: Number(xpReward || 100),
          icon: icon || null,
          status,
          isLocked: Boolean(isLocked),
          lessons: {
            create: lessons.map((lesson: any) => ({
              title: lesson.title || "",
              module: lesson.module || "",
              topic: lesson.topic || "",
              lessonNumber: Number(lesson.lessonNumber || 0),
              description: lesson.description || "",
              icon: lesson.icon || null,
              videoUrl: lesson.videoUrl || null,
              videoContext: lesson.videoContext || null,
              content: lesson.content || "",
              order: Number(lesson.order || 0),
              xpReward: Number(lesson.xpReward || 10),
              quizXpReward: Number(lesson.quizXpReward || 20),
              quizGroupId: lesson.quizGroupId || null,
              quizCountToShow: Number(lesson.quizCountToShow || 5),
              isLocked: Boolean(lesson.isLocked),
            })),
          },
        },
      });
    });

    const updatedCourse = await prisma.course.findUnique({
      where: { id },
      include: {
        lessons: {
          orderBy: { order: "asc" },
        },
        _count: {
          select: { lessons: true },
        },
      },
    });

    return NextResponse.json(updatedCourse);
  } catch (error) {
    console.error("❌ PUT course failed:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/* ======================================================
   DELETE COURSE
====================================================== */

export async function DELETE(
  req: NextRequest,
  { params }: RouteContext
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const profile = await prisma.userProfile.findUnique({
      where: {
        userId: session?.user?.id,
      },
    });

    if (!session || profile?.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden access matrix" },
        { status: 403 }
      );
    }

    const { id } = await params;

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        _count: {
          select: { lessons: true },
        },
      },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    await prisma.course.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Course removed successfully",
    });
  } catch (error) {
    console.error("❌ DELETE /api/admin/courses/[id] failed:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}