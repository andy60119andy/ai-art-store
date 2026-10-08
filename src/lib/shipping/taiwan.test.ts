import { describe, it, expect } from "vitest";
import { shippingAddressSchema, isMainlandAddress } from "./taiwan";
describe("mainland delivery", () => {
  it("accepts mainland addresses and normalizes 台", () => {
    expect(
      shippingAddressSchema.parse({
        recipient_name: "王小明",
        phone: "0912345678",
        postal_code: "106",
        city: "台北市",
        district: "大安區",
        address_line: "信義路一號",
      }).city,
    ).toBe("臺北市");
  });
  it.each([
    ["澎湖縣", "馬公市", "880"],
    ["金門縣", "金城鎮", "893"],
    ["連江縣", "南竿鄉", "209"],
    ["臺東縣", "綠島鄉", "951"],
    ["屏東縣", "琉球鄉", "929"],
    ["高雄市", "旗津區", "805"],
    ["臺北市", "大安區", "951001"],
    ["California", "LA", "90210"],
  ])("rejects %s %s %s", (city, district, postal) =>
    expect(isMainlandAddress(city, district, postal)).toBe(false),
  );
});
