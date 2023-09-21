"use client";

import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/Dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/Form";
import { Button } from "@/components/ui/Button";
import { ImageValidator, ImageSchema } from "@/lib/validators/message";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { HydrationProvider } from "@/components/providers/HydrationProvider";
import { FileUpload } from "@/components/FileUpload";
import { useRouter } from "next/navigation";
import { useModal } from "@/hooks/useModalStore";
import axios from "axios";
import qs from "query-string";

export const MessageFileModal = () => {
  const { isOpen, type, onClose, apiUrl, query } = useModal((state) => ({
    isOpen: state.isOpen,
    type: state.type,
    onClose: state.onClose,
    query: state.data.query,
    apiUrl: state.data.apiUrl,
  }));
  const router = useRouter();
  const form = useForm({
    defaultValues: {
      fileUrl: "",
    },
    resolver: zodResolver(ImageSchema),
  });

  const isModalOpen = isOpen && type === "messageFile";

  const {
    reset,
    formState: { isSubmitting, isValid, isSubmitted, isSubmitSuccessful },
  } = form;

  const submitHandler = async (values: ImageValidator) => {
    try {
      const url = qs.stringifyUrl({
        url: apiUrl as string,
        query,
      });

      await axios.post(url, {
        ...values,
        content: values.fileUrl,
      });

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

  return (
    <HydrationProvider>
      <Dialog open={isModalOpen} onOpenChange={closeHandler}>
        <DialogContent className="bg-white text-black p-0 overflow-hidden">
          <DialogHeader className="pt-8 px-6">
            <DialogTitle className="text-2xl text-center font-bold">
              Add an attachment
            </DialogTitle>
            <DialogDescription className="text-center text-zinc-500">
              Send a file as a message
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(submitHandler)}
              className="space-y-8"
            >
              <div className="space-y-8 px-6">
                <div className="flex items-center justify-center text-center">
                  <FormField
                    control={form.control}
                    name="fileUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <FileUpload
                            disabled={isSubmitSuccessful}
                            endpoint="messageFile"
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <DialogFooter className="bg-gray-100 px-6 py-4">
                <Button
                  variant="primary"
                  isLoading={isSubmitting}
                  disabled={isSubmitted && !isValid}
                  type="submit"
                >
                  Send
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </HydrationProvider>
  );
};
