import { z } from "zod";

export const ServerSchema = z.object({
  name: z.string().min(1, {
    message: "Server name is required",
  }),
  imageUrl: z.string().min(1, {
    message: "Server image is required",
  }),
});

export type ServerValidator = z.infer<typeof ServerSchema>;
