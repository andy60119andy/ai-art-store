import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";

export default async function AdminPage() {
  const profile = await getCurrentProfile();
  if (!profile || (profile.role !== "admin" && profile.role !== "production")) redirect("/");
  return <main className="page"><section className="hero">
    <p className="eyebrow">ADMIN</p><h1>管理後台</h1>
    <p>角色驗證已接入。後續將加入商品、訂單、生產與物流操作。</p>
  </section></main>;
}