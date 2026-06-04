import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

// ─── GET Single News ───────────────────────────────────────────
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const profile = await prisma.userProfile.findUnique({
      where: { userId: session?.user?.id },
    });

    if (!session || profile?.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden access matrix" },
        { status: 403 }
      );
    }

    const { id } = await params;

    const newsFeed = await prisma.newsFeed.findUnique({
      where: { id },

      include: {
        author: {
          select: {
            id: true,
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!newsFeed) {
      return NextResponse.json(
        { error: "News article not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(newsFeed);
  } catch (error) {
    console.error("❌ GET /api/admin/news/[id] failed:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// ─── PATCH Update News ─────────────────────────────────────────
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const profile = await prisma.userProfile.findUnique({
      where: { userId: session?.user?.id },
    });

    if (!session || profile?.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden access matrix" },
        { status: 403 }
      );
    }

    const { id } = await params;

    const existing = await prisma.newsFeed.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "News article not found" },
        { status: 404 }
      );
    }

    const body = await req.json();

    const {
      title,
      summary,
      content,
      image,
      source,
      sourceUrl,
      category,
      status,
      tags,
      isPinned,
      publishedAt,
    } = body;

    if (title !== undefined && !title?.trim()) {
      return NextResponse.json(
        { error: "News title cannot be empty" },
        { status: 400 }
      );
    }

    const updated = await prisma.newsFeed.update({
      where: { id },

      data: {
        ...(title !== undefined && {
          title: title.trim(),
        }),

        ...(summary !== undefined && {
          summary: summary.trim(),
        }),

        ...(content !== undefined && {
          content: content.trim(),
        }),

        ...(image !== undefined && {
          image: image || null,
        }),

        ...(source !== undefined && {
          source: source?.trim() || null,
        }),

        ...(sourceUrl !== undefined && {
          sourceUrl: sourceUrl?.trim() || null,
        }),

        ...(category !== undefined && { category }),

        ...(status !== undefined && { status }),

        ...(tags !== undefined && { tags }),

        ...(isPinned !== undefined && {
          isPinned: Boolean(isPinned),
        }),

        ...(publishedAt !== undefined && {
          publishedAt: publishedAt
            ? new Date(publishedAt)
            : null,
        }),
      },

      include: {
        author: {
          select: {
            id: true,
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("❌ PATCH /api/admin/news/[id] failed:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// ─── DELETE News ───────────────────────────────────────────────
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const profile = await prisma.userProfile.findUnique({
      where: { userId: session?.user?.id },
    });

    if (!session || profile?.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden access matrix" },
        { status: 403 }
      );
    }

    const { id } = await params;

    const existing = await prisma.newsFeed.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "News article not found" },
        { status: 404 }
      );
    }

    await prisma.newsFeed.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "News article deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ DELETE /api/admin/news/[id] failed:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}