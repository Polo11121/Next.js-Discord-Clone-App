import { currentProfile } from "@/lib/currentProfile";
import { db } from "@/lib/db";
import { ChannelType } from "@prisma/client";
import { redirect } from "next/navigation";
import { ServerHeader } from "./ServerHeader";

type ServerSidebarProps = {
  serverId: string;
};

export const ServerSidebar = async ({ serverId }: ServerSidebarProps) => {
  const profile = await currentProfile();

  const server = await db.server.findUnique({
    where: {
      id: serverId,
    },
    include: {
      channels: {
        orderBy: {
          createdAt: "asc",
        },
      },
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

  if (!server) {
    return redirect("/");
  }

  const textChannels = server?.channels.filter(
    ({ type }) => type === ChannelType.TEXT
  );
  const audioChannels = server?.channels.filter(
    ({ type }) => type === ChannelType.AUDIO
  );
  const videoChannels = server?.channels.filter(
    ({ type }) => type === ChannelType.VIDEO
  );

  const members = server?.members.filter(
    ({ profileId }) => profile.id !== profileId
  );
  const userRole = server?.members.find(
    ({ profileId }) => profile.id === profileId
  )?.role;

  if (!userRole) {
    return redirect("/");
  }

  return (
    <div className="flex flex-col h-full text-primary w-full dark:bg-[#2B2D31] bg-[#F2F3F5]">
      <ServerHeader userRole={userRole} server={server} />
    </div>
  );
};
