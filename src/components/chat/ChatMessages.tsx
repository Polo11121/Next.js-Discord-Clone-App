"use client";

import { Member } from "@prisma/client";
import { ChatWelcome } from "@/components/chat/ChatWelcome";
import { useChatQuery } from "@/hooks/useChatQuery";
import { Loader2, ServerCrash } from "lucide-react";

type ChatMessagesProps = {
  name: string;
  member: Member;
  chatId: string;
  apiUrl: string;
  socketUrl: string;
  paramValue: string;
  socketQuery: Record<string, string>;
  paramKey: "channelId" | "conversationId";
  type: "channel" | "conversation";
};

export const ChatMessages = ({
  name,
  member,
  chatId,
  apiUrl,
  socketUrl,
  paramValue,
  socketQuery,
  paramKey,
  type,
}: ChatMessagesProps) => {
  const queryKey = `chat:${chatId}`;

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useChatQuery({
      apiUrl,
      paramKey,
      paramValue,
      queryKey,
    });

  if (status === "loading") {
    return (
      <div className="flex flex-col flex-1 justify-center items-center">
        <Loader2 className="w-7 h-7 text-zinc-500 animate-spin my-4" />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Loading messages...
        </p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-col flex-1 justify-center items-center">
        <ServerCrash className="w-7 h-7 text-zinc-500 my-4" />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Something went wrong...
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col py-4 overflow-y-auto">
      <div className="flex-1" />
      <ChatWelcome name={name} type={type} />
      <div className="flex flex-col-reverse mt-auto"></div>
    </div>
  );
};
