import { NextRequest, NextResponse } from "next/server";
import { Explained } from "@/lib/schema";
import { ocr } from "@/lib/ocr";
import { explain } from "@/lib/llm";

export const runtime = "nodejs";

const hits = new Map<string, number[]>(); // best-effort limiter; use Redis/Upstash for multi-instance
const headers = { "Cache-Control": "no-store" };
const fail = (error: string, status: number) => NextResponse.json({ error }, { status, headers });

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "local";
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  if (recent.length >= 5) return fail("RATE_LIMITED", 429);
  hits.set(ip, [...recent, now]);

  try {
    const file = (await req.formData()).get("file");
    if (!(file instanceof File) || !["image/jpeg", "image/png", "image/webp"].includes(file.type))
      return fail("INVALID_FILE", 400);
    if (file.size > 8 * 1024 * 1024) return fail("FILE_TOO_LARGE", 413);

    // Everything stays in memory. Nothing is written to disk, database or logs.
    let text = "";
    try { text = await ocr.read(Buffer.from(await file.arrayBuffer())); } catch { return fail("OCR_FAILED", 502); }
    if (text.trim().length < 20) return fail("LOW_QUALITY_IMAGE", 422);

    try {
      return NextResponse.json(Explained.parse(await explain(text)), { headers });
    } catch { return fail("LLM_FAILED", 502); }
  } catch { return fail("INVALID_FILE", 400); }
}
