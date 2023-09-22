import { MediaRoom } from "@/components/MediaRoom";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatMessages } from "@/components/chat/ChatMessages";
import { redirect } from "next/navigation";
import { getOrCreateConversation } from "@/lib/conversation";
import { currentProfile } from "@/lib/currentProfile";
import { db } from "@/lib/db";

type ConversationPageProps = {
  params: {
    serverId: string;
    memberId: string;
  };
  searchParams: {
    video?: boolean;
  };
};

const ConversationPage = async ({
  params: { serverId, memberId },
  searchParams: { video },
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
      {video ? (
        <MediaRoom chatId={conversation.id} video={true} audio={true} />
      ) : (
        <>
          <ChatMessages
            member={currentMember}
            name={name}
            chatId={conversation.id}
            type="conversation"
            apiUrl="/api/direct-messages"
            paramKey="conversationId"
            paramValue={conversation.id}
            socketUrl="/api/socket/direct-messages"
            socketQuery={{
              conversationId: conversation.id,
            }}
          />
          <ChatInput
            apiUrl="/api/socket/direct-messages"
            name={name}
            type="conversation"
            query={{
              conversationId: conversation.id,
            }}
          />
        </>
      )}
    </div>
  );
};

export default ConversationPage;
