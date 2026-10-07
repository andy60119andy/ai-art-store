import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/service";
const schema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().email(),
  topic: z.enum(["style", "production", "order", "other"]),
  orderReference: z.string().max(100).optional(),
  message: z.string().trim().min(10).max(5000),
});
export async function POST(request: Request) {
  if (
    !process.env.SUPABASE_SERVICE_ROLE_KEY ||
    !process.env.NEXT_PUBLIC_SUPABASE_URL
  )
    return NextResponse.json(
      { error: "SUPPORT_NOT_CONFIGURED" },
      { status: 503 },
    );
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  const db = createServiceClient();
  const { count } = await db
    .from("support_requests")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", new Date(Date.now() - 86400000).toISOString());
  if ((count ?? 0) >= 10)
    return NextResponse.json({ error: "SUPPORT_LIMIT" }, { status: 429 });
  const { data, error } = await db
    .from("support_requests")
    .insert({
      user_id: user.id,
      name: parsed.data.name,
      email: parsed.data.email,
      topic: parsed.data.topic,
      order_reference: parsed.data.orderReference || null,
      message: parsed.data.message,
    })
    .select("id")
    .single();
  if (error)
    return NextResponse.json({ error: "SUPPORT_SAVE_FAILED" }, { status: 500 });
  return NextResponse.json({ requestId: data.id }, { status: 201 });
}
