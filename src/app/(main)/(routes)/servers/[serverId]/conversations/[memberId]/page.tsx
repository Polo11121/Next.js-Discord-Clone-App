import { ChatHeader } from "@/components/chat/ChatHeader";
import { getOrCreateConversation } from "@/lib/conversation";
import { currentProfile } from "@/lib/currentProfile";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

type ConversationPageProps = {
  params: {
    serverId: string;
    memberId: string;
  };
};

const ConversationPage = async ({
  params: { serverId, memberId },
}: ConversationPageProps) => {
  const profile = await currentProfile();

  const currentMember = await db.member.findFirst({
    where: {
      profileId: profile.id!,
      serverId: serverId,
    },
  });

  if (!currentMember) {
    redirect("/");
  }

  const conversation = await getOrCreateConversation(
    memberId,
    currentMember.id
  );

  if (!conversation) {
    redirect(`/servers/${serverId}`);
  }

  const { memberOne, memberTwo } = conversation;

  const {
    profile: { name, imageUrl },
  } = memberOne.id === currentMember.id ? memberTwo : memberOne;

  return (
    <div className="bg-white dark:bg-[#313338] flex flex-col h-full">
      <ChatHeader
        imageUrl={imageUrl}
        name={name}
        serverId={serverId}
        type="conversation"
      />
    </div>
  );
};

export default ConversationPage;
