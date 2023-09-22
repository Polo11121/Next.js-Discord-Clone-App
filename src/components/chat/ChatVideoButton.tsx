"use client";

import { Video, VideoOff } from "lucide-react";
import { ActionTooltip } from "@/components/ActionTooltip";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import qs from "query-string";

export const ChatVideoButton = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const isVideo = searchParams?.get("video");
  const Icon = isVideo ? VideoOff : Video;
  const tooltipLabel = isVideo ? "End video call" : "Start video call";

  const callHandler = () => {
    const url = qs.stringifyUrl(
      {
        url: pathname as string,
        query: { video: isVideo ? undefined : true },
      },
      { skipNull: true }
    );

    router.push(url);
  };

  return (
    <ActionTooltip side="bottom" label={tooltipLabel}>
      <button
        onClick={callHandler}
        className="hover:opacity-75 transition mr-4"
      >
        <Icon className=" h-6 w-6 text-zinc-500 dark:text-zinc-400" />
      </button>
    </ActionTooltip>
  );
};
