import { z } from "zod";

export const MessageSchema = z.object({
  content: z.string().min(1),
});

export type MessageValidator = z.infer<typeof MessageSchema>;

export const ImageSchema = z.object({
  fileUrl: z.string().min(1, {
    message: "Attachment is required",
  }),
});

export type ImageValidator = z.infer<typeof ImageSchema>;
