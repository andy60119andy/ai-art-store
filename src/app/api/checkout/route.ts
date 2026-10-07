import { NextResponse } from "next/server";
// Real checkout is intentionally unavailable, including when credentials exist.
export async function POST() {
  return NextResponse.json({ error: "PAYMENTS_DISABLED" }, { status: 503 });
}
