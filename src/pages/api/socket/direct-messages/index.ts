import { currentProfile } from "@/lib/currentProfile";
import { db } from "@/lib/db";
import { MessageSchema } from "@/lib/validators/message";
import { NextApiResponseServerIO } from "@/types";
import { NextApiRequest } from "next";
import { z } from "zod";

const handler = async (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const profile = await currentProfile(req);

    if (!profile) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { conversationId } = req.query;

    if (!conversationId) {
      return res.status(422).json({
        message: "Conversation Id is required",
      });
    }

    const { body } = req;

    const { fileUrl } = req.body;
    const { content } = MessageSchema.parse(body);

    if (!content) {
      return res.status(422).json({
        message: "Content is required",
      });
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
      return res.status(404).json({
        message: "Conversation not found",
      });
    }

    const member =
      conversation.memberOne.profileId === profile.id
        ? conversation.memberOne
        : conversation.memberTwo;

    if (!member) {
      return res.status(404).json({
        message: "Member not found",
      });
    }
    const message = await db.directMessage.create({
      data: {
        content,
        fileUrl,
        conversationId: conversation.id,
        memberId: member.id,
      },
      include: {
        member: {
          include: {
            profile: true,
          },
        },
      },
    });

    const channelKey = `chat:${conversation.id}:messages`;

    res?.socket?.server?.io?.emit(channelKey, message);

    return res.status(200).json(message);
  } catch (error) {
    console.log("[DIRECT_CHANNEL_UPDATE]", error);

    if (error instanceof z.ZodError) {
      return res.status(422).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Internal Error",
    });
  }
};
export default handler;
