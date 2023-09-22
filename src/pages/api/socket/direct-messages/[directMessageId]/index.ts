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

    const { directMessageId, conversationId } = req.query;

    if (!directMessageId) {
      return res.status(400).json({ message: "Direct message Id Missing" });
    }

    if (!conversationId) {
      return res.status(400).json({ message: "Conversation Id Missing" });
    }

    const conversation = await db.conversation.findFirst({
      where: {
        id: conversationId as string,
        OR: [
          {
            memberOne: {
              profileId: profile.id,
            },
          },
          {
            memberTwo: {
              profileId: profile.id,
            },
          },
        ],
      },
      include: {
        memberOne: {
          include: {
            profile: true,
          },
        },
        memberTwo: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const member =
      conversation?.memberOne?.profileId === profile.id
        ? conversation.memberOne
        : conversation.memberTwo;

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    let directMessage = await db.directMessage.findFirst({
      where: {
        id: directMessageId as string,
        conversationId: conversation.id,
      },
      include: {
        member: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!directMessage || directMessage.deleted) {
      return res.status(404).json({ message: "Message not found" });
    }

    const isMessageOwner = directMessage.memberId === member.id;
    const isAdmin = member.role === MemberRole.ADMIN;
    const isModerator = member.role === MemberRole.MODERATOR;

    const canModifyMessage = isMessageOwner || isAdmin || isModerator;

    if (!canModifyMessage) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (req.method === "DELETE") {
      directMessage = await db.directMessage.update({
        where: {
          id: directMessage.id,
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

      directMessage = await db.directMessage.update({
        where: {
          id: directMessage.id,
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

    const updateKey = `chat:${conversationId}:messages:update`;

    res?.socket?.server?.io?.emit(updateKey, directMessage);

    return res.status(200).json(directMessage);
  } catch (error) {
    console.log("[DIRECT_MESSAGE_PATCH]", error);

    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 422 });
    }

    return new NextResponse("Internal Error", {
      status: 500,
    });
  }
};

export default handler;
