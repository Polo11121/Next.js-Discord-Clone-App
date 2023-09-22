"use client";

import { Fragment, useRef, ElementRef } from "react";
import { format } from "date-fns";
import { Member } from "@prisma/client";
import { ChatWelcome } from "@/components/chat/ChatWelcome";
import { ChatItem } from "@/components/chat/ChatItem";
import { useChatQuery } from "@/hooks/useChatQuery";
import { Loader2, ServerCrash } from "lucide-react";
import { MessageWithMemberWithProfile } from "@/types";
import { useChatSocket } from "@/hooks/useChatSocket";
import { useChatScroll } from "@/hooks/useChatScroll";

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

const DATE_FORMAT = "d MMM yyyy 'at' HH:mm";

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
  const addKey = `chat:${chatId}:messages`;
  const updateKey = `chat:${chatId}:messages:update`;

  const chatRef = useRef<ElementRef<"div">>(null);
  const bottomRef = useRef<ElementRef<"div">>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useChatQuery({
      apiUrl,
      paramKey,
      paramValue,
      queryKey,
    });

  useChatSocket({
    addKey,
    updateKey,
    queryKey,
  });

  useChatScroll({
    chatRef,
    bottomRef,
    loadMore: fetchNextPage,
    shouldLoadMore: !!hasNextPage && !isFetchingNextPage,
    count: data?.pages[0]?.messages.length ?? 0,
  });

  const fetchPreviousMessagesHandler = () => fetchNextPage();

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
    <div ref={chatRef} className="flex-1 flex flex-col py-4 overflow-y-auto">
      {!hasNextPage && <div className="flex-1" />}
      {!hasNextPage && <ChatWelcome name={name} type={type} />}
      {hasNextPage && (
        <div className="flex justify-center">
          {isFetchingNextPage ? (
            <Loader2 />
          ) : (
            <button
              onClick={fetchPreviousMessagesHandler}
              className="text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 text-xs my-4 dark:hover:text-zinc-300 transition"
            >
              Load previous messages
            </button>
          )}
        </div>
      )}

      <div className="flex flex-col-reverse mt-auto">
        {data.pages.map((page, i) => (
          <Fragment key={i}>
            {page.messages.map(
              ({
                id,
                content,
                fileUrl,
                deleted,
                createdAt,
                updatedAt,
                member: messageMember,
              }: MessageWithMemberWithProfile) => (
                <ChatItem
                  currentMember={member}
                  member={messageMember}
                  key={id}
                  id={id}
                  deleted={deleted}
                  fileUrl={fileUrl}
                  content={content}
                  timestamp={format(new Date(createdAt), DATE_FORMAT)}
                  isUpdated={updatedAt !== createdAt}
                  socketUrl={socketUrl}
                  socketQuery={socketQuery}
                />
              )
            )}
          </Fragment>
        ))}
      </div>
      <div ref={bottomRef} />
    </div>
  );
};
