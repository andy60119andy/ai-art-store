import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProductionStatusForm from "@/components/admin/ProductionStatusForm";

export default async function ProductionPage() {
  const supabase = await createClient();
  const { data: p } = await supabase.from("profiles").select("role").single();
  if (!p || !["admin", "production"].includes(p.role)) redirect("/");

  const { data } = await supabase
    .from("production_files")
    .select("id,production_status,updated_at,mockup_id,order_items(id,quantity,orders(order_number,total_twd)),mockups(id,storage_path)")
    .order("updated_at", { ascending: false });

  const rows = await Promise.all((data ?? []).map(async (x: any) => {
    const mockup = Array.isArray(x.mockups) ? x.mockups[0] : x.mockups;
    const signed = mockup?.storage_path
      ? await supabase.storage.from("artwork-uploads").createSignedUrl(mockup.storage_path, 3600)
      : null;
    return { ...x, mockupUrl: signed?.data?.signedUrl ?? null };
  }));

  return <main className="page"><section className="hero">
    <a href="/admin">← 後台</a>
    <h1>生產管理</h1>
    <p>付款成功後，系統會自動建立生產檔案；這裡管理印刷、裱框與包裝進度。</p>
    {rows.map((x: any) => <article key={x.id} style={{borderTop:"1px solid #eee",padding:"18px 0",display:"grid",gridTemplateColumns:"150px 1fr",gap:18,alignItems:"center"}}>
      {x.mockupUrl ? <img src={x.mockupUrl} alt="生產用畫框 Mockup" style={{width:"100%",borderRadius:10}}/> : <div style={{aspectRatio:"1",background:"#f2f2ef",borderRadius:10,display:"grid",placeItems:"center"}}>無 Mockup</div>}
      <div>
        <strong>訂單：{x.order_items?.orders?.order_number ?? "—"}</strong>
        <p>數量：{x.order_items?.quantity ?? 1}　單件：NT$ {(x.order_items?.unit_price_twd ?? 0).toLocaleString()}　訂單：NT$ {(x.order_items?.orders?.total_twd ?? 0).toLocaleString()}</p><p>尺寸：{x.order_items?.custom_width_mm&&x.order_items?.custom_height_mm?`${x.order_items.custom_width_mm} × ${x.order_items.custom_height_mm} mm`:(x.order_items?.product_sizes?.name ?? "—")}　畫框：{x.order_items?.frames?.name ?? "—"}　紙張：{x.order_items?.papers?.name ?? "—"}</p>
        <p>生產狀態：{x.production_status}</p>
        <ProductionStatusForm id={x.id} current={x.production_status}/>
      </div>
    </article>)}
    {!rows.length && <p>目前沒有待生產項目。</p>}
  </section></main>;
}
