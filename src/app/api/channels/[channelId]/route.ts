import { NextResponse } from "next/server";
import { currentProfile } from "@/lib/currentProfile";
import { db } from "@/lib/db";
import { MemberRole } from "@prisma/client";
import { ChannelSchema } from "@/lib/validators/channel";
import { z } from "zod";

export const DELETE = async (
  req: Request,
  { params: { channelId } }: { params: { channelId: string } }
) => {
  try {
    const profile = await currentProfile();

    if (!profile) {
      return new Response("Unauthorized", { status: 401 });
    }
    if (!channelId) {
      return new Response("Channel Id is missing", { status: 401 });
    }

    const { searchParams } = new URL(req.url);

    const serverId = searchParams.get("serverId");

    if (!serverId) {
      return new Response("Server Id is missing", { status: 401 });
    }

    const server = await db.server.update({
      where: {
        id: serverId,
        members: {
          some: {
            profileId: profile.id,
            role: {
              in: [MemberRole.ADMIN, MemberRole.MODERATOR],
            },
          },
        },
      },
      data: {
        channels: {
          delete: {
            id: channelId,
            name: {
              not: "general",
            },
          },
        },
      },
    });

    return NextResponse.json(server);
  } catch (error) {
    console.log(`[CHANNEL_DELETE_${channelId}]`, error);

    return new NextResponse("Internal Error", {
      status: 500,
    });
  }
};

export const PATCH = async (
  req: Request,
  { params: { channelId } }: { params: { channelId: string } }
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

    const body = await req.json();

    const { name, type } = ChannelSchema.parse(body);

    if (name === "general") {
      return new Response("Name cannot be general", { status: 400 });
    }

    console.log(channelId, serverId, name, type);
    const server = await db.server.update({
      where: {
        id: serverId,
        members: {
          some: {
            profileId: profile.id,
            role: {
              in: [MemberRole.ADMIN, MemberRole.MODERATOR],
            },
          },
        },
      },
      data: {
        channels: {
          update: {
            where: {
              id: channelId,
              NOT: {
                name: "general",
              },
            },
            data: {
              name,
              type,
            },
          },
        },
      },
    });

    return NextResponse.json(server);
  } catch (error) {
    console.log("[CHANNEL_UPDATE]", error);

    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 422 });
    }

    return new NextResponse("Internal Error", {
      status: 500,
    });
  }
};
