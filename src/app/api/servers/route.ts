import { v4 as uuid } from "uuid";
import { z } from "zod";
import { createServerSchema } from "@/lib/validators/server";
import { NextResponse } from "next/server";
import { currentProfile } from "@/lib/currentProfile";
import { db } from "@/lib/db";
import { MemberRole } from "@prisma/client";

export const POST = async (req: Request) => {
  try {
    const profile = await currentProfile();

    if (!profile) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();

    const { name, imageUrl } = createServerSchema.parse(body);

    const server = await db.server.create({
      data: {
        profileId: profile.id,
        name,
        imageUrl,
        inviteCode: uuid(),
        channels: {
          create: [
            {
              name: "general",
              profileId: profile.id,
            },
          ],
        },
        members: {
          create: [
            {
              profileId: profile.id,
              role: MemberRole.ADMIN,
            },
          ],
        },
      },
    });

    return new Response(JSON.stringify(server), { status: 201 });
  } catch (error) {
    console.log("[SERVERS_POST]", error);

    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 422 });
    }

    return new NextResponse("Internal Error", {
      status: 500,
    });
  }
};
