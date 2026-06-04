import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    const profile = await prisma.userProfile.findUnique({ where: { userId: session?.user?.id } });

    if (!session || profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden access matrix" }, { status: 403 });
    }

    const groups = await prisma.quizGroup.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: { select: { quizzes: true, lessons: true } },
      },
    });

    return NextResponse.json(groups);
  } catch (error) {
    console.error("❌ GET /api/admin/quiz-groups failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    const profile = await prisma.userProfile.findUnique({ where: { userId: session?.user?.id } });
    if (!session || profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden access matrix" }, { status: 403 });
    }

    const { name, description } = await request.json();
    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Invalid input: 'name' is required and must be a string" }, { status: 400 });
    }


    const existingGroup = await prisma.quizGroup.findUnique({ where: { name } });
    if (existingGroup) {
      return NextResponse.json({ error: "A quiz group with this name already exists" }, { status: 409 });
    }

    const newGroup = await prisma.quizGroup.create({ data: { name, description } });
    return NextResponse.json(newGroup, { status: 201 });
  } catch (error) {
    console.error("❌ POST /api/admin/quiz-groups failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

    
export async function DELETE(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    const profile = await prisma.userProfile.findUnique({ where: { userId: session?.user?.id } });
    if (!session || profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden access matrix" }, { status: 403 });
    }

    const { id } = await request.json();
    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Invalid input: 'id' is required and must be a string" }, { status: 400 });
    }

    const deletedGroup = await prisma.quizGroup.delete({ where: { id } });
    return NextResponse.json(deletedGroup);
  } 
  catch (error) {
    console.error("❌ DELETE /api/admin/quiz-groups failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    const profile = await prisma.userProfile.findUnique({ where: { userId: session?.user?.id } });
    if (!session || profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden access matrix" }, { status: 403 });
    }

    const { id, name, description } = await request.json();
    if (!id || typeof id !== "string" || !name || typeof name !== "string") {
      return NextResponse.json({ error: "Invalid input: 'id' and 'name' are required and must be strings" }, { status: 400 });
    }

    const existingGroup = await prisma.quizGroup.findUnique({ where: { name } });
    if (existingGroup && existingGroup.id !== id) {
      return NextResponse.json({ error: "A quiz group with this name already exists" }, { status: 409 });
    }

    const updatedGroup = await prisma.quizGroup.update({ where: { id }, data: { name, description } });
    return NextResponse.json(updatedGroup);
  }
  catch (error) {
    console.error("❌ PUT /api/admin/quiz-groups failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
