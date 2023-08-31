import { z } from "zod";
import { ServerSchema } from "@/lib/validators/server";
import { NextResponse } from "next/server";
import { currentProfile } from "@/lib/currentProfile";
import { db } from "@/lib/db";

export const PATCH = async (
  req: Request,
  { params: { serverId } }: { params: { serverId: string } }
) => {
  try {
    const profile = await currentProfile();

    if (!profile) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();

    const { name, imageUrl } = ServerSchema.parse(body);

    const updatedServer = await db.server.update({
      where: {
        id: serverId,
        profileId: profile.id,
      },
      data: {
        name,
        imageUrl,
      },
    });

    return new Response(JSON.stringify(updatedServer), { status: 200 });
  } catch (error) {
    console.log(`[SERVERS_PATCH_${serverId}]`, error);

    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 422 });
    }

    return new NextResponse("Internal Error", {
      status: 500,
    });
  }
};
