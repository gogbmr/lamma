import {
NextRequest,
NextResponse,
} from "next/server";

import { headers } from "next/headers";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

interface RouteContext {
params: Promise<{
id: string;
}>;
}

export async function GET(
req: NextRequest,
{ params }: RouteContext
) {
try {
const { id } =
await params;

 
const tutor =
  await prisma.tutor.findUnique({
    where: {
      id,
    },

    include: {
      _count: {
        select: {
          courses: true,
        },
      },
    },
  });

if (!tutor) {
  return NextResponse.json(
    {
      error:
        "Tutor not found",
    },
    {
      status: 404,
    }
  );
}

return NextResponse.json(
  tutor
);
 

} catch (error) {
console.error(error);

 
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

export async function PUT(
req: NextRequest,
{ params }: RouteContext
) {
try {
const session =
await auth.api.getSession({
headers: await headers(),
});

 
if (!session?.user?.id) {
  return NextResponse.json(
    {
      error:
        "Unauthorized",
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

const { id } =
  await params;

const body =
  await req.json();

const {
  name,
  bio,
  avatar,
} = body;

const tutor =
  await prisma.tutor.update({
    where: {
      id,
    },

    data: {
      name,

      bio,

      avatar,
    },
  });

return NextResponse.json(
  tutor
);
 

} catch (error) {
console.error(error);

 
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

export async function DELETE(
req: NextRequest,
{ params }: RouteContext
) {
try {
const session =
await auth.api.getSession({
headers: await headers(),
});

 
if (!session?.user?.id) {
  return NextResponse.json(
    {
      error:
        "Unauthorized",
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

const { id } =
  await params;

await prisma.tutor.delete({
  where: {
    id,
  },
});

return NextResponse.json({
  success: true,
});
 

} catch (error) {
console.error(error);

 
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
