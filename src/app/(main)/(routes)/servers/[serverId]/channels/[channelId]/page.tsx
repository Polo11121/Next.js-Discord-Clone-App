import { currentProfile } from "@/lib/currentProfile";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatMessages } from "@/components/chat/ChatMessages";
import { ChannelType } from "@prisma/client";
import { MediaRoom } from "@/components/MediaRoom";

type ChannelPageProps = {
  params: {
    serverId: string;
    channelId: string;
  };
};

const ChannelPage = async ({
  params: { serverId, channelId },
}: ChannelPageProps) => {
  const profile = await currentProfile();

  const channel = await db.channel.findUnique({
    where: {
      id: channelId,
      serverId: serverId,
    },
  });

  const member = await db.member.findFirst({
    where: {
      profileId: profile.id!,
      serverId: serverId,
    },
  });

  if (!channel || !member) {
    redirect("/");
  }

  return (
    <div className="bg-white dark:bg-[#313338] flex flex-col h-full">
      <ChatHeader type="channel" name={channel.name} serverId={serverId} />
      {channel.type === ChannelType.TEXT && (
        <>
          <ChatMessages
            member={member}
            name={channel.name}
            chatId={channelId}
            type="channel"
            apiUrl="/api/messages"
            socketUrl="/api/socket/messages"
            socketQuery={{ serverId, channelId }}
            paramKey="channelId"
            paramValue={channelId}
          />
          <ChatInput
            name={channel.name}
            type="channel"
            apiUrl="/api/socket/messages"
            query={{ serverId, channelId }}
          />
        </>
      )}
      {channel.type === ChannelType.AUDIO && (
        <MediaRoom chatId={channel.id} video={false} audio={true} />
      )}
      {channel.type === ChannelType.VIDEO && (
        <MediaRoom chatId={channel.id} video={true} audio={false} />
      )}
    </div>
  );
};

export default ChannelPage;
