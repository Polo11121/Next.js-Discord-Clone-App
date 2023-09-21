"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useSocket } from "@/components/providers/SocketProvider";
import qs from "query-string";
import axios from "axios";

type ChatQueryProps = {
  queryKey: string;
  apiUrl: string;
  paramKey: "channelId" | "conversationId";
  paramValue: string;
};

export const useChatQuery = ({
  queryKey,
  apiUrl,
  paramKey,
  paramValue,
}: ChatQueryProps) => {
  const { isConnected } = useSocket();

  const fetchMessages = async ({ pageParam = undefined }) => {
    const url = qs.stringifyUrl({
      url: apiUrl,
      query: {
        cursor: pageParam,
        [paramKey]: paramValue,
      },
    });
    const { data } = await axios.get(url);

    return data;
  };

  return useInfiniteQuery({
    queryKey: [queryKey],
    queryFn: fetchMessages,
    enabled: isConnected,
    refetchInterval: isConnected ? false : 1000,
    getNextPageParam: (lastPage) => lastPage?.nextCursor,
  });
};
