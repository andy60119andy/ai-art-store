import { hasSupabaseConfiguration } from "@/lib/service-availability";
import ServiceState from "@/components/site/ServiceState";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function AccountPage() {
  if (!hasSupabaseConfiguration())
    return (
      <ServiceState
        title="我的作品"
        eyebrow="MY PORTRAITS"
        description="將珍愛的照片，收藏成你的專屬藝術作品。"
      />
    );
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, role")
    .eq("id", user.id)
    .single();
  const { data: artworks } = await supabase
    .from("artworks")
    .select(
      "id, title, status, created_at, artwork_versions(id, storage_path, width_px, height_px, version_no)",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const cards = await Promise.all(
    (artworks ?? []).map(async (artwork) => {
      const latest = [...(artwork.artwork_versions ?? [])].sort(
        (a, b) => b.version_no - a.version_no,
      )[0];
      const signed = latest
        ? await supabase.storage
            .from("artwork-uploads")
            .createSignedUrl(latest.storage_path, 3600)
        : { data: null };
      return { ...artwork, latest, imageUrl: signed.data?.signedUrl ?? null };
    }),
  );

  return (
    <main className="page">
      <section className="hero">
        <p className="eyebrow">MY ACCOUNT</p>
        <h1>會員中心</h1>
        <p>Email：{user.email}</p>
        <p>角色：{profile?.role ?? "customer"}</p>
        <p>
          <Link href="/orders">查看我的訂單 →</Link>
        </p>
      </section>
      <section className="hero">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div>
            <p className="eyebrow">MY ARTWORKS</p>
            <h2>我的 AI 作品庫</h2>
          </div>
          <Link href="/upload">＋製作新作品</Link>
        </div>
        {cards.length === 0 ? (
          <p>目前還沒有作品。上傳圖片後開始第一次 AI 創作吧！</p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))",
              gap: 20,
            }}
          >
            {cards.map((artwork) => (
              <Link
                key={artwork.id}
                href={`/artworks/${artwork.id}`}
                style={{ textDecoration: "none" }}
              >
                <article
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: 16,
                    overflow: "hidden",
                    background: "#fff",
                  }}
                >
                  {artwork.imageUrl ? (
                    <img
                      src={artwork.imageUrl}
                      alt={artwork.title ?? "AI artwork"}
                      style={{
                        display: "block",
                        width: "100%",
                        aspectRatio: "1",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        aspectRatio: "1",
                        display: "grid",
                        placeItems: "center",
                        background: "#f2f2f2",
                      }}
                    >
                      尚無預覽
                    </div>
                  )}
                  <div style={{ padding: 14 }}>
                    <strong>{artwork.title ?? "AI 作品"}</strong>
                    <p style={{ margin: "6px 0 0", fontSize: 14 }}>
                      狀態：{artwork.status}
                    </p>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
