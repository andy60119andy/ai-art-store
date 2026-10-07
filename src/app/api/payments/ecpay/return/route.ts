import { NextResponse } from "next/server";
// A callback cannot mark orders paid or create production jobs during testing.
export async function POST() {
  return NextResponse.json({ error: "PAYMENTS_DISABLED" }, { status: 503 });
}
