import { NextResponse } from "next/server";
import { submissionSchema } from "@/lib/schema";
import { toRow, type Answers } from "@/lib/questions";
import { getSupabase } from "@/lib/supabase-server";

export async function POST(request: Request) {
  const raw = await request.text();
  if (raw.length > 10_000) return NextResponse.json({ error: "Payload too large" }, { status: 413 });

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = submissionSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid submission" }, { status: 400 });

  // Honeypot filled → pretend success, store nothing.
  if (parsed.data.website) return NextResponse.json({ ok: true });

  const { error } = await getSupabase().from("survey_responses").insert(toRow(parsed.data.answers as Answers));
  if (error) {
    console.error("insert failed", error.message);
    return NextResponse.json({ error: "Could not save response" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
