import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/courses — Public: list all APPROVED courses
export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      where: { status: "APPROVED" },
      orderBy: { order: "asc" },
      select: {
        id: true,
        title: true,
        description: true,
        image: true,
        order: true,
        xpReward: true,
        icon: true,
        _count: { select: { lessons: true } },
      },
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.error("❌ GET /api/courses failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

