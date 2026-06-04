import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
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

    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get("page") || 1);
    const pageSize = Number(searchParams.get("pageSize") || 10);

    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const category = searchParams.get("category") || "";

    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder =
      searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

    const where = {
      ...(search && {
        OR: [
          {
            title: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
          {
            summary: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
          {
            source: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
        ],
      }),

      ...(status && status !== "ALL" && {
        status: status as any,
      }),

      ...(category && category !== "ALL" && {
        category: category as any,
      }),
    };

    const [newsFeeds, total] = await Promise.all([
      prisma.newsFeed.findMany({
        where,

        skip: (page - 1) * pageSize,

        take: pageSize,

        orderBy: {
          [sortBy]: sortOrder,
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
      }),

      prisma.newsFeed.count({ where }),
    ]);

    return NextResponse.json({
      data: newsFeeds,

      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("❌ GET /api/admin/news failed:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
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

    if (!title?.trim()) {
      return NextResponse.json(
        { error: "News title is required" },
        { status: 400 }
      );
    }

    if (!summary?.trim()) {
      return NextResponse.json(
        { error: "News summary is required" },
        { status: 400 }
      );
    }

    if (!content?.trim()) {
      return NextResponse.json(
        { error: "News content is required" },
        { status: 400 }
      );
    }

    const newsFeed = await prisma.newsFeed.create({
      data: {
        title: title.trim(),
        summary: summary.trim(),
        content: content.trim(),
        image: image || null,
        source: source?.trim() || null,
        sourceUrl: sourceUrl?.trim() || null,
        category: category || "GENERAL",
        status: status || "DRAFT",
        tags: tags || [],
        isPinned: Boolean(isPinned),
        publishedAt: publishedAt ? new Date(publishedAt) : null,
        authorId: profile.id,
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

    return NextResponse.json(newsFeed, { status: 201 });
  } catch (error) {
    console.error("❌ POST /api/admin/news failed:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}