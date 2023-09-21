import { currentProfile } from "@/lib/currentProfile";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { ChatHeader } from "@/components/chat/ChatHeader";

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
    </div>
  );
};

export default ChannelPage;
