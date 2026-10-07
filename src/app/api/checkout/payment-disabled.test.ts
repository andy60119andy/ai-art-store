import { describe, it, expect } from "vitest";
import { POST as checkout } from "./route";
import { POST as callback } from "../payments/ecpay/return/route";
describe("payment boundaries", () => {
  it("does not create a checkout transaction", async () => {
    const r = await checkout();
    expect(r.status).toBe(503);
    expect(await r.json()).toEqual({ error: "PAYMENTS_DISABLED" });
  });
  it("does not accept callbacks that could mark orders paid", async () => {
    const r = await callback();
    expect(r.status).toBe(503);
    expect(await r.json()).toEqual({ error: "PAYMENTS_DISABLED" });
  });
});
