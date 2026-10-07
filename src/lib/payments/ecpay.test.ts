import {afterEach,describe,expect,it,vi} from 'vitest';
import {generateCheckMacValue,verifyCheckMacValue} from './ecpay';
afterEach(()=>vi.unstubAllEnvs());
describe('ECPay signatures',()=>{
 it('matches the published ECPay SHA256 example',()=>{
 vi.stubEnv('ECPAY_HASH_KEY','pwFHCqoQZGmho4w6');vi.stubEnv('ECPAY_HASH_IV','EkRm7iFT261dpevs');
 const fields={TradeDesc:'促銷方案',PaymentType:'aio',MerchantTradeDate:'2023/03/12 15:30:23',MerchantTradeNo:'ecpay20230312153023',MerchantID:'3002607',ReturnURL:'https://www.ecpay.com.tw/receive.php',ItemName:'Apple iphone 15',TotalAmount:30000,ChoosePayment:'ALL',EncryptType:1};
 expect(generateCheckMacValue(fields)).toBe('6C51C9E6888DE861FD62FB1DD17029FC742634498FD813DC43D4243B5685B840');
 const signed=Object.fromEntries(Object.entries({...fields,CheckMacValue:generateCheckMacValue(fields)}).map(([k,v])=>[k,String(v)]));
 expect(verifyCheckMacValue(signed)).toBe(true);expect(verifyCheckMacValue({...signed,TradeDesc:'altered'})).toBe(false);
 });
});
