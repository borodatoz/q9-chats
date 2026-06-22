import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type InvokeBody = {
  method?: string;
  params?: unknown;
};

export async function POST(request: Request) {
  const adminUrl = process.env.Q9_ADMIN_URL?.replace(/\/$/, "");
  const apiKey = process.env.Q9_CHAT_API_KEY?.trim();

  if (!adminUrl || !apiKey) {
    return NextResponse.json(
      { ok: false, error: "bff_not_configured" },
      { status: 503 },
    );
  }

  const body = (await request.json().catch(() => null)) as InvokeBody | null;
  const method = body?.method?.trim();
  if (!method || !method.startsWith("communication.web-chat-")) {
    return NextResponse.json(
      { ok: false, error: "method_not_allowed" },
      { status: 400 },
    );
  }

  const upstream = await fetch(`${adminUrl}/api/integrations/q9/v1/invoke`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": apiKey,
    },
    body: JSON.stringify({
      method,
      params: body?.params ?? {},
    }),
  });

  const json = await upstream.json().catch(() => ({}));
  return NextResponse.json(json, { status: upstream.status });
}
