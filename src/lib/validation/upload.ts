import { z } from "zod";

export const uploadInputSchema = z.object({
  filename: z.string().min(1).max(255),
  contentType: z.enum(["image/jpeg", "image/png", "image/webp"]),
  sizeBytes: z.number().int().positive().max(20 * 1024 * 1024),
});

export type UploadInput = z.infer<typeof uploadInputSchema>;