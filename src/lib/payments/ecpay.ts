import crypto from "node:crypto";
export type EcpayFields = Record<string, string | number>;
function required(name: string): string { const value = process.env[name]; if (!value) throw new Error(`Missing ${name}`); return value; }
function ecpayEncode(value: string): string { return encodeURIComponent(value).replace(/%20/g, "+").replace(/\x27/g, "%27"); }
export function generateCheckMacValue(fields: EcpayFields): string {
  const hashKey = required("ECPAY_HASH_KEY"); const hashIv = required("ECPAY_HASH_IV");
  const source = Object.entries(fields).filter(([key]) => key.toLowerCase() !== "checkmacvalue").sort(([a],[b]) => a.localeCompare(b,"en")).map(([key,value]) => `${key}=${value}`).join("&");
  const encoded = ecpayEncode(`HashKey=${hashKey}&${source}&HashIV=${hashIv}`).toLowerCase();
  return crypto.createHash("sha256").update(encoded).digest("hex").toUpperCase();
}
export function verifyCheckMacValue(fields: Record<string,string>): boolean { const received=fields.CheckMacValue; if(!received) return false; const expected=generateCheckMacValue(fields); const a=Buffer.from(received.toUpperCase()); const b=Buffer.from(expected); return a.length===b.length && crypto.timingSafeEqual(a,b); }
export function buildEcpayPayment(order:{orderNumber:string;totalTwd:number;itemName:string}) {
  const appUrl=required("NEXT_PUBLIC_APP_URL").replace(/\/$/,"");
  const fields:EcpayFields={MerchantID:required("ECPAY_MERCHANT_ID"),MerchantTradeNo:order.orderNumber,MerchantTradeDate:formatEcpayDate(new Date()),PaymentType:"aio",TotalAmount:order.totalTwd,TradeDesc:"AI Art Store 客製藝術作品",ItemName:order.itemName.slice(0,200),ReturnURL:`${appUrl}/api/payments/ecpay/return`,ClientBackURL:`${appUrl}/account`,ChoosePayment:"ALL",EncryptType:1};
  return {action:process.env.ECPAY_PAYMENT_URL || "https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5",fields:{...fields,CheckMacValue:generateCheckMacValue(fields)}};
}
function formatEcpayDate(date:Date):string { const p=(n:number)=>String(n).padStart(2,"0"); return `${date.getFullYear()}/${p(date.getMonth()+1)}/${p(date.getDate())} ${p(date.getHours())}:${p(date.getMinutes())}:${p(date.getSeconds())}`; }