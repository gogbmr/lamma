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

    const sortBy = searchParams.get("sortBy") || "createdAt";

    const sortOrder =
      searchParams.get("sortOrder") === "asc"
        ? "asc"
        : "desc";

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
            description: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
        ],
      }),

      ...(status &&
        status !== "ALL" && {
          status: status as any,
        }),
    };

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,

        skip: (page - 1) * pageSize,

        take: pageSize,

        orderBy: {
          [sortBy]: sortOrder,
        },

        include: {
          _count: {
            select: {
              lessons: true,
            },
          },

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

      prisma.course.count({
        where,
      }),
    ]);

    return NextResponse.json({
      data: courses,

      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error(
      "❌ GET /api/admin/courses failed:",
      error
    );

    return NextResponse.json(
      {
        error: "Internal Server Error",
      },
      {
        status: 500,
      }
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
    {
      error: "Forbidden access matrix",
    },
    {
      status: 403,
    }
  );
}

const body = await req.json();

const {
  title,
  description,
  image,
  order,
  xpReward,
  icon,
  status,
  isLocked,
  lessons = [],
} = body;

if (!title?.trim()) {
  return NextResponse.json(
    {
      error: "Course title is required",
    },
    {
      status: 400,
    }
  );
}

if (!description?.trim()) {
  return NextResponse.json(
    {
      error: "Course description is required",
    },
    {
      status: 400,
    }
  );
}

const existingCourse =
  await prisma.course.findFirst({
    where: {
      order: Number(order),
    },
  });

if (existingCourse) {
  return NextResponse.json(
    {
      error:
        "A course already exists with this display order",
    },
    {
      status: 400,
    }
  );
}

const course =
  await prisma.course.create({
    data: {
      title: title.trim(),

      description:
        description.trim(),

      image: image || null,

      order: Number(order),

      xpReward: Number(
        xpReward || 100
      ),

      icon: icon || null,

      status:
        status || "DRAFT",

      isLocked:
        Boolean(isLocked),

      authorId: profile.id,

      lessons: {
        create: lessons.map(
          (lesson: any) => ({
            title:
              lesson.title || "",

            module:
              lesson.module || "",

            topic:
              lesson.topic || "",

            lessonNumber:
              Number(
                lesson.lessonNumber || 0
              ),

            description:
              lesson.description || "",

            icon:
              lesson.icon || null,

            videoUrl:
              lesson.videoUrl || null,

            videoContext:
              lesson.videoContext || null,

            content:
              lesson.content || "",

            order:
              Number(
                lesson.order || 0
              ),

            xpReward:
              Number(
                lesson.xpReward || 10
              ),

            quizXpReward:
              Number(
                lesson.quizXpReward || 20
              ),

            quizGroupId:
              lesson.quizGroupId || null,

            quizCountToShow:
              Number(
                lesson.quizCountToShow || 5
              ),

            isLocked:
              Boolean(
                lesson.isLocked
              ),
          })
        ),
      },
    },

    include: {
      lessons: {
        orderBy: {
          order: "asc",
        },
      },

      _count: {
        select: {
          lessons: true,
        },
      },
    },
  });

return NextResponse.json(
  course,
  {
    status: 201,
  }
);


} catch (error) {
console.error(
"❌ POST /api/admin/courses failed:",
error
);


return NextResponse.json(
  {
    error:
      "Internal Server Error",
  },
  {
    status: 500,
  }
);


}
}
