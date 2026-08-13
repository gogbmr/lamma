// app/api/dashboard/profile/route.ts
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
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // 1. Fetch profile with deep relations for the dashboard
    let profile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        currentCourse: {
          include: {
            lessons: {
              orderBy: { order: "asc" }
            }
          }
        },
        progresses: true, // Used to map against lessons
        badges: {
          include: { badge: true }
        }
      }
    });

    // 2. Initialize profile if it doesn't exist
    if (!profile) {
      profile = await prisma.userProfile.create({
        data: {
          userId: session.user.id,
          role: "user",
          virtualFiatBalance: 100000,
          llamacoinBalance: 0,
          xp: 0,
          streak: 0,
          level: 1,
        },
        include: {
          currentCourse: { include: { lessons: true } },
          progresses: true,
          badges: { include: { badge: true } }
        }
      });
    }

    // 3. Process the Learning Pipeline Nodes
    let learningNodes: any[] = [];
    if (profile.currentCourse && profile.currentCourse.lessons) {
      let activeFound = false;
      
      learningNodes = profile.currentCourse.lessons.map((lesson, index) => {
        const isCompleted = profile.progresses.some(
          (p) => p.lessonId === lesson.id && p.completed
        );

        let status = "LOCKED";
        if (isCompleted) {
          status = "COMPLETED";
        } else if (!activeFound || profile.currentLessonId === lesson.id) {
          status = "ACTIVE";
          activeFound = true; // Ensures only one is active, rest remain locked
        }

        return {
          id: lesson.id,
          label: `Node ${profile.currentCourse?.order || 1}.${index + 1}: ${lesson.title}`,
          status,
          xpReward: lesson.xpReward
        };
      });
    }

    // 4. Map Badges
    const mappedBadges = profile.badges.map((ub) => ({
      id: ub.badge.id,
      name: ub.badge.name,
      icon: ub.badge.icon,
      description: ub.badge.description,
    }));

    // 5. Construct the comprehensive JSON payload
    return NextResponse.json({
      profile: {
        id: profile.id,
        userId: profile.userId,
        name: session.user.name,
        username: session.user.username || "anonymous_lamma",
        email: session.user.email,
        role: profile.role,
        virtualFiatBalance: profile.virtualFiatBalance,
        llamacoinBalance: profile.llamacoinBalance,
        xp: profile.xp,
        streak: profile.streak,
        level: profile.level,
        avatar: profile.avatar,
      },
      learning: {
        course: profile.currentCourse ? {
          id: profile.currentCourse.id,
          title: profile.currentCourse.title,
          description: profile.currentCourse.description,
          order: profile.currentCourse.order
        } : null,
        nodes: learningNodes,
      },
      badges: mappedBadges,
    }, { status: 200 });

  } catch (error) {
    console.error("❌ Failed to resolve active dashboard profile:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}