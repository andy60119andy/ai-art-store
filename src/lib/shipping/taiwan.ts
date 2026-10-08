import { z } from "zod";
export const MAINLAND_CITIES = [
  "臺北市",
  "新北市",
  "桃園市",
  "臺中市",
  "臺南市",
  "高雄市",
  "基隆市",
  "新竹市",
  "嘉義市",
  "新竹縣",
  "苗栗縣",
  "彰化縣",
  "南投縣",
  "雲林縣",
  "嘉義縣",
  "屏東縣",
  "宜蘭縣",
  "花蓮縣",
  "臺東縣",
] as const;
const offshoreDistricts = new Set(["綠島鄉", "蘭嶼鄉", "琉球鄉", "旗津區"]);
const offshorePrefixes = new Set([
  "290",
  "817",
  "819",
  "929",
  "951",
  "952",
  "805",
]);
export function isMainlandAddress(
  city: string,
  district: string,
  postalCode: string,
) {
  const normalized = city.trim().replaceAll("台", "臺");
  return (
    (MAINLAND_CITIES as readonly string[]).includes(normalized) &&
    !offshoreDistricts.has(district.trim()) &&
    !offshorePrefixes.has(postalCode.slice(0, 3)) &&
    !/^8[89]/.test(postalCode) &&
    !/^(209|210|211|212)/.test(postalCode)
  );
}
export const shippingAddressSchema = z
  .object({
    recipient_name: z.string().trim().min(2).max(50),
    phone: z.string().regex(/^09\d{8}$/),
    postal_code: z.string().regex(/^\d{3}(\d{2,3})?$/),
    city: z
      .string()
      .trim()
      .transform((s) => s.replaceAll("台", "臺")),
    district: z.string().trim().min(1).max(20),
    address_line: z.string().trim().min(3).max(200),
  })
  .refine((a) => isMainlandAddress(a.city, a.district, a.postal_code), {
    message: "目前僅配送台灣本島，不接受離島或海外地址。",
  });
