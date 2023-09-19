"use client";

import { useState } from "react";
import qs from "query-string";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogDescription,
} from "@/components/ui/Dialog";
import { useModal } from "@/hooks/useModalStore";
import { ServerWithMembersWithProfiles } from "@/type";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { UserAvatar } from "@/components/UserAvatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuTrigger,
  DropdownMenuSubTrigger,
} from "@/components/ui/DropdownMenu";
import {
  Check,
  Gavel,
  Loader2,
  MoreVertical,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
} from "lucide-react";
import { MemberRole } from "@prisma/client";
import { useRouter } from "next/navigation";
import axios from "axios";

const roleIconMap = {
  [MemberRole.GUEST]: null,
  [MemberRole.MODERATOR]: (
    <ShieldCheck className="mr-2 h-4 w-4 text-indigo-500" />
  ),
  [MemberRole.ADMIN]: <ShieldAlert className="mr-2 h-4 w-4 text-rose-500" />,
};

export const MembersModal = () => {
  const [loadingId, setLoadingId] = useState("");
  const { isOpen, onClose, type, server, onOpen } = useModal((state) => ({
    isOpen: state.isOpen,
    onOpen: state.onOpen,
    onClose: state.onClose,
    type: state.type,
    server: state.data.server as ServerWithMembersWithProfiles,
  }));
  const router = useRouter();

  const isModalOpen = isOpen && type === "members";
  const membersCount = server?.members?.length;

  const kickMemberHandler = async (memberId: string) => {
    try {
      setLoadingId(memberId);

      const url = qs.stringifyUrl({
        url: `/api/members/${memberId}`,
        query: {
          serverId: server.id,
        },
      });
      const { data } = await axios.delete(url);

      router.refresh();
      onOpen("members", { server: data });
    } catch (error) {
    } finally {
      setLoadingId("");
    }
  };

  const changeRoleHandler = async (memberId: string, role: MemberRole) => {
    try {
      setLoadingId(memberId);

      const url = qs.stringifyUrl({
        url: `/api/members/${memberId}`,
        query: {
          serverId: server?.id,
        },
      });

      const { data } = await axios.patch(url, { role });

      router.refresh();
      onOpen("members", { server: data });
    } catch (error) {
    } finally {
      setLoadingId("");
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white text-black overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Manage Members
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-500">
            {membersCount}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="mt-8 max-h-[420px] pr-6">
          {server?.members?.map(
            ({ id, role, profileId, profile: { name, imageUrl, email } }) => (
              <div className="flex items-center gap-x-2 mb-6" key={id}>
                <UserAvatar src={imageUrl} />
                <div className="flex flex-col gap-y-1">
                  <div className="text-xs font-semibold flex items-center gap-x-1">
                    {name}
                    {roleIconMap[role]}
                  </div>
                  <p className="text-xs text-zinc-500">{email}</p>
                </div>
                {server.profileId !== profileId && loadingId !== id && (
                  <div className="ml-auto">
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <MoreVertical className="h-4 w-4 text-zinc-500" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent side="left">
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger className="flex items-center">
                            <ShieldQuestion className="w-4 h-4 mr-2" />
                            <span>Role</span>
                          </DropdownMenuSubTrigger>
                          <DropdownMenuPortal>
                            <DropdownMenuSubContent>
                              <DropdownMenuItem
                                onClick={() =>
                                  changeRoleHandler(id, MemberRole.GUEST)
                                }
                              >
                                <Shield className="h-4 w-4 mr-2" />
                                Guest
                                {role === MemberRole.GUEST && (
                                  <Check className="h-4 w-4 ml-auto" />
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  changeRoleHandler(id, MemberRole.MODERATOR)
                                }
                              >
                                <ShieldCheck className="h-4 w-4 mr-2" />
                                Moderator
                                {role === MemberRole.MODERATOR && (
                                  <Check className="h-4 w-4 ml-auto" />
                                )}
                              </DropdownMenuItem>
                            </DropdownMenuSubContent>
                          </DropdownMenuPortal>
                        </DropdownMenuSub>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => kickMemberHandler(id)}>
                          <Gavel className="h-4 w-4 mr-2" />
                          Kick
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
                {loadingId === id && (
                  <Loader2 className="animate-spin text-zinc-500 ml-auto w-4 h-4" />
                )}
              </div>
            )
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
