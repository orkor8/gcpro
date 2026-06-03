import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { readFileSync } from "fs";
import { join } from "path";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

// Load course content once at startup
const GCP_CONTENT = readFileSync(join(process.cwd(), "src/content/gcp_content.txt"), "utf-8");
const CRA_CONTENT = readFileSync(join(process.cwd(), "src/content/cra_content.txt"), "utf-8");

function buildSystemPrompt(role: string) {
  const isGcp = role === "student_gcp";
  const courseContent = isGcp ? GCP_CONTENT : CRA_CONTENT;
  const courseName = isGcp ? "GCP" : "CRA";

  return `אתה בוט חכם של ClinHub — פלטפורמה לבוגרי מחקר קליני בישראל.
אתה עוזר לבוגרי קורס ${courseName} לחזור על החומר ולהבין אותו לעומק.

כללים חשובים:
- ענה תמיד בעברית תקנית וברורה
- השתמש רק במילים קיימות בשפה העברית — אל תמציא מילים
- אם אינך יודע מילה מדויקת, השתמש בביטוי מוכר או במילה באנגלית
- ענה אך ורק על בסיס חומר הקורס המצורף
- אם שאלה לא קשורה לחומר הקורס — אמור בנימוס: "שאלה זו לא מכוסה בחומר הקורס שלנו"
- צטט מהחומר כשאפשר (שם המצגה)
- היה ברור, ספציפי ומועיל

להלן חומר הקורס המלא:

${courseContent}`;
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("status, role")
    .eq("user_id", user.id)
    .single() as unknown as { data: { status: string; role: string } | null };

  if (!profile || profile.status !== "approved") {
    return NextResponse.json({ error: "Not approved" }, { status: 403 });
  }

  const { messages } = await req.json() as { messages: { role: "user" | "assistant"; content: string }[] };

  if (!messages?.length) {
    return NextResponse.json({ error: "No messages" }, { status: 400 });
  }

  const stream = await client.messages.stream({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 4096,
    system: [
      {
        type: "text",
        text: buildSystemPrompt(profile.role),
        cache_control: { type: "ephemeral" },
      },
    ],
    messages,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
          controller.enqueue(encoder.encode(chunk.delta.text));
        }
      }
      controller.close();
    },
  });

  return new NextResponse(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
