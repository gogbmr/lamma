// app/api/user/home/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    
    // If no active session, return null profile (triggers Marketing UI on frontend)
    if (!session?.user?.id) {
      return NextResponse.json({ profile: null }, { status: 200 });
    }

    const profile = await prisma.userProfile.findUnique({
      where: { 
        userId: session.user.id 
      },
      include: {
        currentCourse: true,
      }
    });

    if (!profile) {
      return NextResponse.json({ profile: null }, { status: 200 });
    }

    let lessons: any[] = [];
    let progress: any[] = [];

    // If the user has an active course, grab the curriculum and their progress
    console.log("User profile found:", { profileId: profile.id, currentCourseId: profile.currentCourseId });
    if (profile.currentCourseId) {
      lessons = await prisma.lesson.findMany({
        where: { courseId: profile.currentCourseId },
        orderBy: { order: 'asc' }
      });

      progress = await prisma.userProgress.findMany({
        where: { 
          profileId: profile.id,
          lesson: { courseId: profile.currentCourseId }
        }
      });
    }
    console.log("frontend data  to be sent to client:", 
        { profile, 
            currentCourse: profile.currentCourse || null, 
            lessons,
            progress
        });
    return NextResponse.json({
      profile,
      currentCourse: profile.currentCourse || null,
      lessons,
      progress
    }, { status: 200 });

  } catch (error) {
    console.error("❌ GET /api/user/home failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}