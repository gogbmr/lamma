// app/api/dashboard/profile/update/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function PUT(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { name, username } = await req.json();

    if (username && username !== session.user.username) {
      const existingUser = await prisma.user.findUnique({
        where: { username },
      });
      if (existingUser) {
        return NextResponse.json({ message: "Username is already occupied" }, { status: 400 });
      }
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name || undefined,
        username: username || undefined,
      },
    });

    return NextResponse.json({ success: true, message: "Identity fields updated cleanly" });
  } catch (error) {
    console.error("❌ Dashboard profile mutation error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}