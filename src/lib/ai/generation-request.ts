import { createHash } from "node:crypto";
import { z } from "zod";
export const idempotencySchema = z.string().uuid();
export function generationHash(
  uploadIdentity: string,
  styleKey: string,
  prompt: string,
) {
  return createHash("sha256")
    .update(JSON.stringify([uploadIdentity, styleKey, prompt]))
    .digest("hex");
}
export function enqueueErrorStatus(message: string) {
  return /QUOTA|CONCURRENCY/.test(message)
    ? 429
    : /IDEMPOTENCY/.test(message)
      ? 409
      : /UPLOAD_NOT_VERIFIED/.test(message)
        ? 400
        : 500;
}
export function generationConfigured() {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.SUPABASE_SERVICE_ROLE_KEY &&
    (process.env.OPENAI_API_KEY || process.env.AI_PROVIDER_API_KEY) &&
    process.env.OPENAI_IMAGE_MODEL
  );
}
