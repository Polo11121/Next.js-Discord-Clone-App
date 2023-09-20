"use client";

import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/Dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/Form";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ChannelSchema, ChannelValidator } from "@/lib/validators/channel";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useModal } from "@/hooks/useModalStore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { ChannelType } from "@prisma/client";
import axios from "axios";
import qs from "query-string";

export const EditChannelModal = () => {
  const { isOpen, onClose, type, channel, server } = useModal((state) => ({
    isOpen: state.isOpen,
    onClose: state.onClose,
    type: state.type,
    channel: state.data.channel,
    server: state.data.server,
  }));
  const form = useForm({
    defaultValues: {
      name: channel?.name || "",
      type: channel?.type || ChannelType.TEXT,
    },
    resolver: zodResolver(ChannelSchema),
  });
  const router = useRouter();

  const isModalOpen = isOpen && type === "editChannel";
  const {
    setValue,
    reset,
    watch,
    formState: { isSubmitting, isSubmitted, isSubmitSuccessful, isValid },
  } = form;

  const [name, channelType] = watch(["name", "type"]);

  const submitHandler = async (values: ChannelValidator) => {
    try {
      const url = qs.stringifyUrl({
        url: `/api/channels/${channel?.id}`,
        query: {
          serverId: server?.id,
        },
      });

      await axios.patch(url, values);

      router.refresh();
      onClose();
    } catch (error) {
      console.log(error);
    }
  };

  const closeHandler = () => {
    reset();
    onClose();
  };

  useEffect(() => {
    if (isSubmitSuccessful) {
      reset();
    }
  }, [isSubmitSuccessful, reset]);

  useEffect(() => {
    if (channel) {
      setValue("name", channel.name);
      setValue("type", channel.type);
    }
  }, [channel, setValue]);

  const isButtonDisabled =
    (isSubmitted && !isValid) ||
    (channel?.name === name && channel?.type === channelType);

  return (
    <Dialog open={isModalOpen} onOpenChange={closeHandler}>
      <DialogContent className="bg-white text-black p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Edit Channel
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(submitHandler)}
            className="space-y-8"
          >
            <div className="space-y-8 px-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
                      Channel Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={isSubmitting || isSubmitSuccessful}
                        className="bg-zinc-300/50 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0"
                        placeholder="Enter channel name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
                      Channel Type
                    </FormLabel>
                    <Select
                      disabled={isSubmitting || isSubmitSuccessful}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-zinc-300/50 border-0 focus:ring-0 text-black ring-offset-0 focus:ring-offset-0 capitalize outline-none">
                          <SelectValue placeholder="Select a channel type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(ChannelType).map((type) => (
                          <SelectItem
                            key={type}
                            value={type}
                            className="capitalize"
                          >
                            {type.toLowerCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="bg-gray-100 px-6 py-4">
              <Button
                variant="primary"
                isLoading={isSubmitting}
                disabled={isButtonDisabled}
                type="submit"
              >
                Save
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
