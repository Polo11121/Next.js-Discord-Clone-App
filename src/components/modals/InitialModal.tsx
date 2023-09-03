"use client";

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
  FormLabel,
  FormMessage,
} from "@/components/ui/Form";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ServerValidator, ServerSchema } from "@/lib/validators/server";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { HydrationProvider } from "@/components/providers/HydrationProvider";
import { FileUpload } from "@/components/FileUpload";
import { useRouter } from "next/navigation";
import axios from "axios";

export const InitialModal = () => {
  const router = useRouter();
  const form = useForm({
    defaultValues: {
      name: "",
      imageUrl: "",
    },
    resolver: zodResolver(ServerSchema),
  });

  const {
    formState: { isSubmitting, isValid, isSubmitted, isSubmitSuccessful },
  } = form;

  const submitHandler = async (values: ServerValidator) => {
    try {
      await axios.post("/api/servers", values);

      form.reset();
      router.refresh();
      window.location.reload();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <HydrationProvider>
      <Dialog open>
        <DialogContent
          showCloseButton={false}
          className="bg-white text-black p-0 overflow-hidden"
        >
          <DialogHeader className="pt-8 px-6">
            <DialogTitle className="text-2xl text-center font-bold">
              Customize your server
            </DialogTitle>
            <DialogDescription className="text-center text-zinc-500">
              Give your new server a personality with a name and an icon. You
              can always change it later.
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
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <FileUpload
                            disabled={isSubmitSuccessful}
                            endpoint="serverImage"
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
                        Server Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          disabled={isSubmitSuccessful}
                          className="bg-zinc-300/50 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0"
                          placeholder="Enter server name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter className="bg-gray-100 px-6 py-4">
                <Button
                  variant="primary"
                  isLoading={isSubmitting}
                  disabled={isSubmitted && !isValid}
                  type="submit"
                >
                  Create
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </HydrationProvider>
  );
};
