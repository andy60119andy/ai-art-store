import { describe, it, expect } from "vitest";
import {
  generationHash,
  idempotencySchema,
  enqueueErrorStatus,
} from "./generation-request";
describe("generation idempotency input", () => {
  it("detects changed image, style and edit prompt on a reused key", () => {
    const original = generationHash("image-one", "watercolor", "soft");
    expect(original).toBe(generationHash("image-one", "watercolor", "soft"));
    for (const input of [
      ["image-two", "watercolor", "soft"],
      ["image-one", "oil", "soft"],
      ["image-one", "watercolor", "dramatic"],
    ])
      expect(generationHash(...(input as [string, string, string]))).not.toBe(
        original,
      );
  });
  it("does not accept arbitrary request keys", () => {
    expect(idempotencySchema.safeParse("client-key").success).toBe(false);
    expect(
      idempotencySchema.safeParse("63fa34db-8ec1-4f4e-a01e-a4e10c4a6349")
        .success,
    ).toBe(true);
  });
  it("distinguishes quota and conflicting requests from service errors", () => {
    expect(enqueueErrorStatus("GENERATION_QUOTA_EXCEEDED")).toBe(429);
    expect(enqueueErrorStatus("GENERATION_CONCURRENCY_LIMIT")).toBe(429);
    expect(enqueueErrorStatus("IDEMPOTENCY_CONFLICT")).toBe(409);
    expect(enqueueErrorStatus("UPLOAD_NOT_VERIFIED")).toBe(400);
  });
});
