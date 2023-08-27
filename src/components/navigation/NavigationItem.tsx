"use client";

import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import { ActionTooltip } from "@/components/ActionTooltip";
import { cn } from "@/lib/utils";

type NavigationItemProps = {
  id: string;
  imageUrl: string;
  name: string;
};

export const NavigationItem = ({ id, imageUrl, name }: NavigationItemProps) => {
  const router = useRouter();
  const { serverId } = useParams();

  const isActive = serverId === id;

  const clickHandler = () => router.push(`/servers/${id}`);

  return (
    <ActionTooltip side="right" align="center" label={name}>
      <button
        onClick={clickHandler}
        className="group relative flex items-center"
      >
        <div
          className={cn(
            "absolute left-0 bg-primary rounded-r-full transition-all w-[4px]",
            isActive ? "h-[36px]" : "h-[8px] group-hover:h-[20px]"
          )}
        />
        <div
          className={cn(
            "relative group flex mx-3 h-[48px] w-[48px] rounded-[24px] group-hover:rounded-[16px] transition-all overflow-hidden",
            isActive && "bg-primary/10 text-primary rounded-[16px]"
          )}
        >
          <Image fill src={imageUrl} alt="Channel" />
        </div>
      </button>
    </ActionTooltip>
  );
};
