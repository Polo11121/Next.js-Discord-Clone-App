"use client";

import { useEffect, useState } from "react";
import { Member, MemberRole, Profile } from "@prisma/client";
import { UserAvatar } from "@/components/UserAvatar";
import { ActionTooltip } from "@/components/ActionTooltip";
import { Edit, FileIcon, ShieldAlert, ShieldCheck, Trash } from "lucide-react";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { MessageSchema, MessageValidator } from "@/lib/validators/message";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/Form";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useModal } from "@/hooks/useModalStore";
import Image from "next/image";
import qs from "query-string";
import axios from "axios";

type ChatItemProps = {
  id: string;
  content: string;
  currentMember: Member;
  timestamp: string;
  fileUrl: string | null;
  deleted: boolean;
  member: Member & { profile: Profile };
  isUpdated: boolean;
  socketUrl: string;
  socketQuery: Record<string, string>;
};
const roleIconMap = {
  [MemberRole.GUEST]: null,
  [MemberRole.MODERATOR]: (
    <ShieldCheck className="ml-2 h-4 w-4 text-indigo-500" />
  ),
  [MemberRole.ADMIN]: <ShieldAlert className="ml-2 h-4 w-4 text-rose-500" />,
};

export const ChatItem = ({
  id,
  content,
  member,
  currentMember,
  timestamp,
  fileUrl,
  deleted,
  isUpdated,
  socketUrl,
  socketQuery,
}: ChatItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const { onOpen } = useModal((state) => ({
    onOpen: state.onOpen,
  }));
  const form = useForm<MessageValidator>({
    defaultValues: {
      content,
    },
    resolver: zodResolver(MessageSchema),
  });
  const {
    reset,
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = form;
  const router = useRouter();
  const params = useParams();

  const isCurrentMemberAdmin = currentMember.role === MemberRole.ADMIN;
  const isCurrentMemberModerator = currentMember.role === MemberRole.MODERATOR;
  const isOwner = currentMember.id === member.id;
  const canDeleteMessage =
    !deleted && (isOwner || isCurrentMemberAdmin || isCurrentMemberModerator);
  const canEditMessage = !deleted && isOwner && !fileUrl;
  const isPDF = fileUrl && fileUrl.endsWith(".pdf");
  const isImage = fileUrl && !isPDF;

  const deleteMessageHandler = () =>
    onOpen("deleteMessage", {
      apiUrl: `${socketUrl}/${id}`,
      query: socketQuery,
    });

  const openEditMessageHandler = () => setIsEditing(true);

  const editMessageHandler = async (values: MessageValidator) => {
    try {
      const url = qs.stringifyUrl({
        url: `${socketUrl}/${id}`,
        query: socketQuery,
      });

      await axios.patch(url, values);

      setIsEditing(false);
      reset();
    } catch (error) {
      console.log(error);
    }
  };

  const navigateToMemberHandler = () =>
    member.id !== currentMember.id &&
    router.push(`/servers/${params?.serverId}/conversations/${member.id}`);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsEditing(false);
        reset();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setIsEditing, reset]);

  useEffect(
    () =>
      reset({
        content,
      }),
    [content, reset]
  );

  return (
    <div className="relative group flex items-center hover:bg-black/5 p-4 transition w-full">
      <div className="group flex gap-x-2 items-start w-full">
        <div
          onClick={navigateToMemberHandler}
          className="cursor-pointer hover:drop-shadow-md transition"
        >
          <UserAvatar src={member.profile.imageUrl} />
        </div>
        <div className="flex flex-col w-full">
          <div className="flex items-center gap-x-2">
            <div className="flex items-center">
              <p
                onClick={navigateToMemberHandler}
                className="font-semibold text-sm hover:underline cursor-pointer"
              >
                {member.profile.name}
              </p>
              <ActionTooltip label={member.role}>
                {roleIconMap[member.role]}
              </ActionTooltip>
            </div>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              {timestamp}
            </span>
          </div>
          {isImage && (
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="relative aspect-square rounded-md mt-2 overflow-hidden border flex items-center bg-secondary h-48 w-48"
            >
              <Image
                src={fileUrl}
                alt={content}
                fill
                className="object-cover"
              />
            </a>
          )}
          {isPDF && (
            <div className="relative flex items-center p-2 mt-2 rounded-md bg-background/10">
              <FileIcon className="h-10 w-10 fill-indigo-200 stroke-indigo-400" />
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-sm text-indigo-500 dark:text-indigo-400 hover:underline"
              >
                PFD File
              </a>
            </div>
          )}
          {!fileUrl && !isEditing && (
            <p
              className={cn(
                "text-sm text-zinc-600 dark:text-zinc-300",
                deleted &&
                  "italic text-zinc-500 dark:text-zinc-400 text-xs mt-1"
              )}
            >
              {content}
              {isUpdated && !deleted && (
                <span className=" text-[10px] mx-2 text-zinc-500 dark:text-zinc-400">
                  (edited)
                </span>
              )}
            </p>
          )}
          {!fileUrl && isEditing && (
            <Form {...form}>
              <form
                className="flex items-center w-full gap-x-2 pt-2"
                onSubmit={handleSubmit(editMessageHandler)}
              >
                <FormField
                  control={control}
                  name="content"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <div className="relative w-full">
                          <Input
                            className="p-2 bg-zinc-200/90 dark:bg-zinc-700/75 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-zinc-600 dark:text-zinc-200"
                            disabled={isSubmitting}
                            placeholder="Edited Message"
                            {...field}
                          />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button disabled={isSubmitting} size="sm" variant="primary">
                  Save
                </Button>
              </form>
              <span className="text-[10px] mt-1 text-zinc-400">
                Press escape to cancel, enter to save
              </span>
            </Form>
          )}
        </div>
      </div>
      {canDeleteMessage && (
        <div className="hidden group-hover:flex items-center gap-x-2 absolute p-1 -top-2 right-5 bg-white dark:bg-zinc-800 border rounded-sm">
          {canEditMessage && (
            <ActionTooltip label="Edit">
              <Edit
                onClick={openEditMessageHandler}
                className="cursor-pointer ml-auto w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition"
              />
            </ActionTooltip>
          )}
          <ActionTooltip label="Delete">
            <Trash
              onClick={deleteMessageHandler}
              className="cursor-pointer ml-auto w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition"
            />
          </ActionTooltip>
        </div>
      )}
    </div>
  );
};
