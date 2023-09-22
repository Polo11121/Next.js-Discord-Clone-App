import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSocket } from "@/components/providers/SocketProvider";
import { Member, Message, Profile } from "@prisma/client";

type ChatSocketProps = {
  addKey: string;
  updateKey: string;
  queryKey: string;
};

type MessageWithMemberWithProfile = Message & {
  member: Member & {
    profile: Profile;
  };
};

export const useChatSocket = ({
  addKey,
  updateKey,
  queryKey,
}: ChatSocketProps) => {
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) return;
    socket.on(updateKey, (message: MessageWithMemberWithProfile) =>
      queryClient.setQueriesData([queryKey], (oldData: any) => {
        if (!oldData || !oldData.pages) {
          return oldData;
        }

        const newPages = oldData.pages.map((oldPage: any) => ({
          ...oldPage,
          messages: oldPage.messages.map((odlMessage: any) =>
            odlMessage.id === message.id ? message : odlMessage
          ),
        }));

        return {
          ...oldData,
          pages: newPages,
        };
      })
    );

    socket.on(addKey, (message: MessageWithMemberWithProfile) =>
      queryClient.setQueriesData([queryKey], (oldData: any) => {
        if (!oldData || !oldData.pages) {
          return oldData;
        }

        const newPages = [...oldData.pages];

        newPages[0] = {
          ...newPages[0],
          messages: [message, ...newPages[0].messages],
        };

        return {
          ...oldData,
          pages: newPages,
        };
      })
    );

    return () => {
      socket.off(addKey);
      socket.off(updateKey);
    };
  }, [socket, queryClient, addKey, updateKey, queryKey]);
};
