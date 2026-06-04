import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // ✅ Await params

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

    const user = await prisma.userProfile.findUnique({
      where: {
        id,
      },

      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            emailVerified: true,
            image: true,
            createdAt: true,
          },
        },

        _count: {
          select: {
            authoredCourses: true,
            trades: true,
            notifications: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("❌ GET /api/admin/users/[id] failed:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // ✅ Await params

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

    const body = await req.json();

    const { displayUsername, role, permissions, avatar } = body;

    // Check if user exists
    const existingUser = await prisma.userProfile.findUnique({
      where: {
        id,
      },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Validate displayUsername is unique if being changed
    if (displayUsername && displayUsername !== existingUser.displayUsername) {
      const duplicate = await prisma.userProfile.findFirst({
        where: {
          displayUsername,
          id: {
            not: id,
          },
        },
      });

      if (duplicate) {
        return NextResponse.json(
          { error: "Display username already exists" },
          { status: 400 }
        );
      }
    }

    const updatedUser = await prisma.userProfile.update({
      where: {
        id,
      },

      data: {
        ...(displayUsername && {
          displayUsername: displayUsername.trim(),
        }),
        ...(role && { role }),
        ...(permissions && { permissions }),
        ...(avatar && { avatar }),
      },

      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            emailVerified: true,
            image: true,
            createdAt: true,
          },
        },

        _count: {
          select: {
            authoredCourses: true,
            trades: true,
            notifications: true,
          },
        },
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("❌ PUT /api/admin/users/[id] failed:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // ✅ Await params

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

    // Check if user exists
    const existingUser = await prisma.userProfile.findUnique({
      where: {
        id,
      },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Prevent deleting the only admin
    if (existingUser.role === "admin") {
      const adminCount = await prisma.userProfile.count({
        where: {
          role: "admin",
        },
      });

      if (adminCount <= 1) {
        return NextResponse.json(
          {
            error:
              "Cannot delete the last admin user. Promote another user to admin first.",
          },
          { status: 400 }
        );
      }
    }

    await prisma.userProfile.delete({
      where: {
        id,
      },
    });

    return NextResponse.json(
      { message: "User deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ DELETE /api/admin/users/[id] failed:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}