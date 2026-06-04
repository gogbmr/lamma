import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
type RouteParams = { params: Promise<{ groupId: string }> };


export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    const profile = await prisma.userProfile.findUnique({ where: { userId: session?.user?.id } });

    if (!session || profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden access matrix" }, { status: 403 });
    }

    const { groupId } = await params;

    if (!groupId || typeof groupId !== "string") {
      return NextResponse.json({ error: "Invalid input: 'groupId' is required and must be a string" }, { status: 400 });
    }

    const group = await prisma.quizGroup.findUnique({
        where: { id: groupId },
      include: {
        quizzes: true,
        lessons: true
      },
    });

    return NextResponse.json(group);
  } catch (error) {
    console.error("❌ GET /api/admin/quiz-groups failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
