// app/api/admin/quiz/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    const profile = await prisma.userProfile.findUnique({ where: { userId: session?.user.id } });
    if (!session || profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const quizzes = await prisma.quiz.findMany({
      include: { groups: { select: { id: true, name: true } } },
      orderBy: { id: "desc" }
    });

    return NextResponse.json(quizzes);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    const profile = await prisma.userProfile.findUnique({ where: { userId: session?.user.id } });
    if (!session || profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { question, options, correctAnswer, groupIds } = await req.json();

    if (!question || !options || options.length < 2 || !correctAnswer) {
      return NextResponse.json({ error: "Missing required form configurations" }, { status: 400 });
    }

    const newQuiz = await prisma.quiz.create({
      data: {
        question,
        options,
        correctAnswer,
        groups: groupIds && groupIds.length > 0 ? {
          connect: groupIds.map((id: string) => ({ id }))
        } : undefined
      },
      include: { groups: true }
    });

    return NextResponse.json(newQuiz);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}