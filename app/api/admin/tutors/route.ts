import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
try {
const session =
await auth.api.getSession({
headers: await headers(),
});

 
if (!session?.user?.id) {
  return NextResponse.json(
    {
      error: "Unauthorized",
    },
    {
      status: 401,
    }
  );
}


const profile =
  await prisma.userProfile.findUnique({
    where: {
      userId:
        session.user.id,
    },
  });

if (
  !profile ||
  profile.role !== "admin"
) {
  return NextResponse.json(
    {
      error:
        "Forbidden access matrix",
    },
    {
      status: 403,
    }
  );
}

const tutors =
  await prisma.tutor.findMany({
    include: {
      createdBy: {
        include: {
          user: true,
        },
      },

      _count: {
        select: {
          courses: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });

return NextResponse.json(
  tutors
);
 

} catch (error) {
console.error(
"❌ GET tutors failed:",
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

export async function POST(
req: NextRequest
) {
try {
const session =
await auth.api.getSession({
headers: await headers(),
});

 
if (!session?.user?.id) {
  return NextResponse.json(
    {
      error: "Unauthorized",
    },
    {
      status: 401,
    }
  );
}

const profile =
  await prisma.userProfile.findUnique({
    where: {
      userId:
        session.user.id,
    },
  });

if (
  !profile ||
  profile.role !== "admin"
) {
  return NextResponse.json(
    {
      error:
        "Forbidden access matrix",
    },
    {
      status: 403,
    }
  );
}

const body =
  await req.json();

const {
  name,
  bio,
  avatar,
} = body;

if (!name?.trim()) {
  return NextResponse.json(
    {
      error:
        "Tutor name is required",
    },
    {
      status: 400,
    }
  );
}

const tutor =
  await prisma.tutor.create({
    data: {
      name:
        name.trim(),

      bio:
        bio?.trim() ||
        null,

      avatar:
        avatar || null,

      createdById:
        profile.id,
    },
  });

return NextResponse.json(
  tutor,
  {
    status: 201,
  }
);
 

} catch (error) {
console.error(
"❌ CREATE tutor failed:",
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
