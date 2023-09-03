import { v4 as uuid } from "uuid";
import { currentProfile } from "@/lib/currentProfile";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export const PATCH = async (
  _req: Request,
  { params: { serverId } }: { params: { serverId: string } }
) => {
  try {
    const profile = await currentProfile();

    if (!profile) {
      return new Response("Unauthorized", { status: 401 });
    }

    if (!serverId) {
      return new Response("Server Id Missing", { status: 400 });
    }

    const server = await db.server.update({
      where: {
        id: serverId,
        profileId: profile.id,
      },
      data: {
        inviteCode: uuid(),
      },
    });

    return NextResponse.json(server);
  } catch (error) {
    console.error(`[SERVER_INVITE_${serverId}]`, error);

    return new NextResponse("Internal Error", {
      status: 500,
    });
  }
};
