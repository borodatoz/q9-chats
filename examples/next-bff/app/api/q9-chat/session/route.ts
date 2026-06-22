import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SESSION_COOKIE = "q9_web_chat_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 365;

function createSessionId(): string {
  return `s_${randomUUID().replace(/-/g, "")}`;
}

export async function GET() {
  const cookieStore = await cookies();
  const existing = cookieStore.get(SESSION_COOKIE)?.value?.trim();

  if (existing && existing.length >= 8) {
    return NextResponse.json({ visitor_id: existing });
  }

  const visitorId = createSessionId();
  cookieStore.set(SESSION_COOKIE, visitorId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  return NextResponse.json({ visitor_id: visitorId });
}
