import { redirect } from "next/navigation";
import { getCurrentProfile, getCurrentUser } from "@/lib/auth";

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const profile = await getCurrentProfile();
  return <main className="page"><section className="hero">
    <p className="eyebrow">MY ACCOUNT</p><h1>會員中心</h1>
    <p>Email：{user.email}</p><p>角色：{profile?.role ?? "customer"}</p>
  </section></main>;
}