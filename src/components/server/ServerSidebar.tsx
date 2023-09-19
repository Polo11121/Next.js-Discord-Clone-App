import { currentProfile } from "@/lib/currentProfile";
import { db } from "@/lib/db";
import { ChannelType, MemberRole } from "@prisma/client";
import { redirect } from "next/navigation";
import { ServerHeader } from "@/components/server/ServerHeader";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { ServerSearch } from "@/components/server/ServerSearch";
import { Hash, Mic, ShieldAlert, ShieldCheck, Video } from "lucide-react";
import { Separator } from "@/components/ui/Separator";
import { ServerSection } from "@/components/server/ServerSection";
import { ServerChannel } from "@/components/server/ServerChannel";
import { ServerMember } from "@/components/server/ServerMember";

type ServerSidebarProps = {
  serverId: string;
};

const iconMap = {
  [ChannelType.TEXT]: <Hash className="mr-2 h-4 w-4" />,
  [ChannelType.AUDIO]: <Mic className="mr-2 h-4 w-4" />,
  [ChannelType.VIDEO]: <Video className="mr-2 h-4 w-4" />,
};

const roleIconMap = {
  [MemberRole.GUEST]: null,
  [MemberRole.MODERATOR]: (
    <ShieldCheck className="mr-2 h-4 w-4 text-indigo-500" />
  ),
  [MemberRole.ADMIN]: <ShieldAlert className="mr-2 h-4 w-4 text-rose-500" />,
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

  const members = server?.members;
  const userRole = server?.members.find(
    ({ profileId }) => profile.id === profileId
  )?.role;

  if (!userRole) {
    return redirect("/");
  }

  const data = [
    {
      label: "Text Channels",
      type: "channel" as const,
      data: textChannels?.map(({ type, id, name }) => ({
        icon: iconMap[type],
        name,
        id,
      })),
    },
    {
      label: "Voice Channels",
      type: "channel" as const,
      data: audioChannels?.map(({ type, id, name }) => ({
        icon: iconMap[type],
        name,
        id,
      })),
    },
    {
      label: "Video Channels",
      type: "channel" as const,
      data: videoChannels?.map(({ type, id, name }) => ({
        icon: iconMap[type],
        name,
        id,
      })),
    },
    {
      label: "Members",
      type: "member" as const,
      data: members?.map(({ profile, id, role }) => ({
        icon: roleIconMap[role],
        name: profile.name,
        id,
      })),
    },
  ];

  return (
    <div className="flex flex-col h-full text-primary w-full dark:bg-[#2B2D31] bg-[#F2F3F5]">
      <ServerHeader userRole={userRole} server={server} />
      <ScrollArea className="flex-1 px-3">
        <div className="mt-2">
          <ServerSearch data={data} />
        </div>
        <Separator className="bg-zinc-200 dark:bg-zinc-700 rounded-md my-2" />
        {Boolean(textChannels?.length) && (
          <div className="mb-2">
            <ServerSection
              sectionType="channels"
              channelType={ChannelType.TEXT}
              role={userRole}
              label="Text Channels"
            />
            <div className="space-y-[2px]">
              {textChannels?.map((channel) => (
                <ServerChannel
                  key={channel.id}
                  channel={channel}
                  server={server}
                  role={userRole}
                />
              ))}
            </div>
          </div>
        )}
        {Boolean(audioChannels?.length) && (
          <div className="mb-2">
            <ServerSection
              sectionType="channels"
              channelType={ChannelType.AUDIO}
              role={userRole}
              label="Audio Channels"
            />
            <div className="space-y-[2px]">
              {audioChannels?.map((channel) => (
                <ServerChannel
                  key={channel.id}
                  channel={channel}
                  server={server}
                  role={userRole}
                />
              ))}
            </div>
          </div>
        )}
        {Boolean(videoChannels?.length) && (
          <div className="mb-2">
            <ServerSection
              sectionType="channels"
              channelType={ChannelType.VIDEO}
              role={userRole}
              label="Video Channels"
            />
            <div className="space-y-[2px]">
              {videoChannels?.map((channel) => (
                <ServerChannel
                  key={channel.id}
                  channel={channel}
                  server={server}
                  role={userRole}
                />
              ))}
            </div>
          </div>
        )}
        {Boolean(members?.length) && (
          <div className="mb-2">
            <ServerSection
              sectionType="members"
              role={userRole}
              label="Members"
              server={server}
            />
            <div className="space-y-[2px]">
              {members?.map((member) => (
                <ServerMember key={member.id} member={member} server={server} />
              ))}
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
