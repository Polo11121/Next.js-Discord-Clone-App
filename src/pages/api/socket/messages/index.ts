import { currentProfile } from "@/lib/currentProfile";
import { db } from "@/lib/db";
import { MessageSchema } from "@/lib/validators/message";
import { NextApiResponseServerIO } from "@/types";
import { NextApiRequest } from "next";
import { z } from "zod";

const handler = async (req: NextApiRequest, res: NextApiResponseServerIO) => {
  console.log("req.method", req.method);
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const profile = await currentProfile(req);

    if (!profile) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { serverId, channelId } = req.query;

    if (!serverId) {
      return res.status(422).json({
        message: "Server Id is required",
      });
    }

    if (!channelId) {
      return res.status(422).json({
        message: "Channel Id is required",
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
      return res.status(404).json({
        message: "Server not found",
      });
    }

    const channel = await db.channel.findFirst({
      where: {
        id: channelId as string,
        serverId: server.id,
      },
    });

    if (!channel) {
      return res.status(404).json({
        message: "Channel not found",
      });
    }

    const member = server.members.find(
      (member) => member.profileId === profile.id
    );

    if (!member) {
      return res.status(404).json({
        message: "Member not found",
      });
    }
    const message = await db.message.create({
      data: {
        content,
        fileUrl,
        channelId: channel.id,
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

    const channelKey = `chat:${channel.id}:messages`;

    res?.socket?.server?.io?.to(channelKey).emit(channelKey, message);

    return res.status(200).json(message);
  } catch (error) {
    console.log("[CHANNEL_UPDATE]", error);

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
