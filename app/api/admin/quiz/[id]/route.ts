// app/api/admin/quiz/[id]/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    const profile = await prisma.userProfile.findUnique({ where: { userId: session?.user.id } });
    
    // Strict admin authentication boundary guard
    if (!session || profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden access profile" }, { status: 403 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing evaluation node identity token" }, { status: 400 });
    }

    // Atomic execution deletes core row and cleans implicit join lines instantly
    await prisma.quiz.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Evaluation node cleanly purged" });
  } catch (error) {
    console.error("❌ Quiz cancellation tracking error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    const profile = await prisma.userProfile.findUnique({ where: { userId: session?.user.id } });
    if (!session || profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const { question, options, correctAnswer, groupIds } = await req.json();

    if (!question || !options || options.length < 2 || !correctAnswer) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    const updatedQuiz = await prisma.quiz.update({
      where: { id },
      data: {
        question: question.trim(),
        options: options.map((o: string) => o.trim()),
        correctAnswer: correctAnswer.trim(),
        groups: {
          // 'set' entirely overrides previous connections with the fresh selection mapping
          set: groupIds?.map((gId: string) => ({ id: gId })) || []
        }
      }
    });

    return NextResponse.json(updatedQuiz);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}