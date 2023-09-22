"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import { LiveKitRoom, VideoConference } from "@livekit/components-react";
import axios from "axios";
import "@livekit/components-styles";

type MediaRoomProps = {
  chatId: string;
  video: boolean;
  audio: boolean;
};

export const MediaRoom = ({ chatId, video, audio }: MediaRoomProps) => {
  const { user } = useUser();
  const [token, setToken] = useState<string>("");

  useEffect(() => {
    if (!user?.firstName || !user?.lastName) {
      return;
    }

    const name = `${user.firstName} ${user.lastName}`;

    const fetchToken = async () => {
      try {
        const { data } = await axios.get(
          `/api/livekit?room=${chatId}&username=${name}`
        );

        setToken(data.token);
      } catch (error) {
        console.log(error);
      }
    };

    fetchToken();
  }, [user?.firstName, user?.lastName, chatId]);

  return token ? (
    <LiveKitRoom
      data-lk-theme="default"
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      token={token}
      connect={true}
      video={video}
      audio={audio}
    >
      <VideoConference />
    </LiveKitRoom>
  ) : (
    <div className="flex flex-col flex-1 justify-center items-center">
      <Loader2 className="h-7 w-7 text-zinc-500 animate-spin my-4" />
      <p className="text-xs text-zinc-500 dark:text-zinc-400">Loading...</p>
    </div>
  );
};
