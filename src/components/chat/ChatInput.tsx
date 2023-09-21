"use client";

import { MessageSchema, MessageValidator } from "@/lib/validators/message";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/Form";
import { EmojiPicker } from "@/components/EmojiPicker";
import { Input } from "@/components/ui/Input";
import { useForm } from "react-hook-form";
import { Plus } from "lucide-react";
import { useModal } from "@/hooks/useModalStore";
import { useRouter } from "next/navigation";
import axios from "axios";
import qs from "query-string";

type ChatInputProps = {
  apiUrl: string;
  query: Record<string, string>;
  name: string;
  type: "conversation" | "channel";
};

export const ChatInput = ({ apiUrl, query, name, type }: ChatInputProps) => {
  const { onOpen } = useModal((state) => ({
    onOpen: state.onOpen,
  }));
  const form = useForm<MessageValidator>({
    defaultValues: {
      content: "",
    },
    resolver: zodResolver(MessageSchema),
  });
  const router = useRouter();

  const {
    reset,
    getValues,
    setValue,
    formState: { isSubmitting },
  } = form;

  const submitHandler = async (values: MessageValidator) => {
    try {
      const url = qs.stringifyUrl({
        url: apiUrl,
        query,
      });
      await axios.post(url, values);

      reset();
      router.refresh();
    } catch (error) {
      console.log(error);
    }
  };

  const openModalHandler = () =>
    onOpen("messageFile", {
      apiUrl,
      query,
    });

  const pickEmojiHandler = (emoji: any) =>
    setValue("content", `${getValues("content")}${emoji}`);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submitHandler)}>
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="relative p-4 pb-6">
                  <button
                    onClick={openModalHandler}
                    type="button"
                    className="absolute top-7 left-8 h-[24px] w-[24px] bg-zinc-500 dark:bg-zinc-400 hover:bg-zinc-600 dark:hover:bg-zinc-300 transition rounded-full p-1 flex items-center justify-center"
                  >
                    <Plus className="text-white dark:text-[#313338]" />
                  </button>
                  <Input
                    placeholder={`Message ${
                      type === "conversation" ? name : `#${name}`
                    }`}
                    disabled={isSubmitting}
                    className="px-14 py-6 bg-zinc-200/90 dark:bg-zinc-700/75 border-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-zinc-600 dark:text-zinc-200"
                    {...field}
                  />
                  <div className="absolute top-7 right-8">
                    <EmojiPicker onChange={pickEmojiHandler} />
                  </div>
                </div>
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};
