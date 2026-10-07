export function checkoutConfiguration() {
  const mode = process.env.ECPAY_MODE;
  const required = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "ECPAY_MERCHANT_ID",
    "ECPAY_HASH_KEY",
    "ECPAY_HASH_IV",
    "NEXT_PUBLIC_APP_URL",
  ];
  let validUrl = false;
  try {
    validUrl =
      new URL(process.env.NEXT_PUBLIC_APP_URL || "").protocol === "https:";
  } catch {}
  return {
    ready:
      (mode === "test" || mode === "production") &&
      required.every((k) => Boolean(process.env[k])) &&
      validUrl,
    mode,
  };
}
