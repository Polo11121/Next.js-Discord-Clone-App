import { NextResponse } from "next/server";
import { currentProfile } from "@/lib/currentProfile";
import { db } from "@/lib/db";

export const PATCH = async (
  req: Request,
  { params: { memberId } }: { params: { memberId: string } }
) => {
  try {
    const profile = await currentProfile();

    if (!profile) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const serverId = searchParams.get("serverId");
    const { role } = await req.json();

    if (!serverId) {
      return new Response("Server Id is missing", { status: 401 });
    }

    if (!role) {
      return new Response("Role is missing", { status: 401 });
    }

    if (!memberId) {
      return new Response("Member Id is missing", { status: 401 });
    }

    const updatedServer = await db.server.update({
      where: {
        id: serverId,
        profileId: profile.id,
      },
      data: {
        members: {
          update: {
            where: {
              id: memberId,
              profileId: {
                not: profile.id,
              },
            },
            data: {
              role,
            },
          },
        },
      },
      include: {
        members: {
          include: {
            profile: true,
          },
          orderBy: {
            role: "asc",
          },
        },
      },
    });

    return NextResponse.json(updatedServer);
  } catch (error) {
    console.log(`[MEMBER_PATCH_${memberId}]`, error);

    return new NextResponse("Internal Error", {
      status: 500,
    });
  }
};

export const DELETE = async (
  req: Request,
  { params: { memberId } }: { params: { memberId: string } }
) => {
  try {
    const profile = await currentProfile();

    if (!profile) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const serverId = searchParams.get("serverId");

    if (!serverId) {
      return new Response("Server Id is missing", { status: 401 });
    }

    if (!memberId) {
      return new Response("Member Id is missing", { status: 401 });
    }

    const updatedServer = await db.server.update({
      where: {
        id: serverId,
        profileId: profile.id,
      },
      data: {
        members: {
          deleteMany: {
            id: memberId,
            profileId: {
              not: profile.id,
            },
          },
        },
      },
      include: {
        members: {
          include: {
            profile: true,
          },
          orderBy: {
            role: "asc",
          },
        },
      },
    });

    return NextResponse.json(updatedServer);
  } catch (error) {
    console.log(`[MEMBER_DELETE_${memberId}]`, error);

    return new NextResponse("Internal Error", {
      status: 500,
    });
  }
};
