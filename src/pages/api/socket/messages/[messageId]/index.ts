import { currentProfile } from "@/lib/currentProfile";
import { db } from "@/lib/db";
import { MessageSchema } from "@/lib/validators/message";
import { NextApiResponseServerIO } from "@/types";
import { MemberRole } from "@prisma/client";
import { NextApiRequest } from "next";
import { NextResponse } from "next/server";
import { z } from "zod";

const handler = async (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (req.method !== "PATCH" && req.method !== "DELETE") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const profile = await currentProfile(req);

    if (!profile) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { messageId, serverId, channelId } = req.query;

    if (!messageId) {
      return res.status(400).json({ message: "Message Id Missing" });
    }

    if (!serverId) {
      return res.status(400).json({ message: "Server Id Missing" });
    }

    if (!channelId) {
      return res.status(400).json({ message: "Channel Id Missing" });
    }

    const server = await db.server.findFirst({
      where: {
        id: serverId as string,
        members: {
          some: {
            profileId: profile.id,
          },
        },
      },
      include: {
        members: true,
      },
    });

    if (!server) {
      return res.status(404).json({ message: "Server not found" });
    }

    const channel = await db.channel.findFirst({
      where: {
        id: channelId as string,
        serverId: server.id,
      },
    });

    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    const member = server.members.find(
      ({ profileId }) => profileId === profile.id
    );

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    let message = await db.message.findFirst({
      where: {
        id: messageId as string,
        channelId: channel.id,
      },
      include: {
        member: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!message || message.deleted) {
      return res.status(404).json({ message: "Message not found" });
    }

    const isMessageOwner = message.memberId === member.id;
    const isAdmin = member.role === MemberRole.ADMIN;
    const isModerator = member.role === MemberRole.MODERATOR;

    const canModifyMessage = isMessageOwner || isAdmin || isModerator;

    if (!canModifyMessage) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (req.method === "DELETE") {
      message = await db.message.update({
        where: {
          id: message.id,
        },
        data: {
          deleted: true,
          fileUrl: null,
          content: "This message has been deleted",
        },
        include: {
          member: {
            include: {
              profile: true,
            },
          },
        },
      });
    }

    if (req.method === "PATCH") {
      const body = req.body;

      const { content } = MessageSchema.parse(body);

      if (!content) {
        return res.status(422).json({
          message: "Content is required",
        });
      }

      if (!isMessageOwner) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      message = await db.message.update({
        where: {
          id: message.id,
        },
        data: {
          updatedAt: new Date(),
          content,
        },
        include: {
          member: {
            include: {
              profile: true,
            },
          },
        },
      });
    }

    const updateKey = `chat:${channel.id}:messages:update`;

    res?.socket?.server?.io?.emit(updateKey, message);

    return res.status(200).json(message);
  } catch (error) {
    console.log("[MESSAGE_PATCH]", error);

    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 422 });
    }

    return new NextResponse("Internal Error", {
      status: 500,
    });
  }
};

export default handler;
