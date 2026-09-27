import { NextRequest, NextResponse } from "next/server";
import { getAIProvider } from "@/lib/providers/aiProvider";
import { flattenOntoBackground } from "@/lib/imageProcessing";
import { validateUpload } from "@/lib/fileHandling";
import { checkRateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";

// The ONE AI call for this tool. Background compositing (white/blue/
// custom/transparent) happens locally with Sharp afterward, so changing
// the background color never triggers a second AI call.
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "local";
  if (!checkRateLimit(`remove-bg:${ip}`)) {
    return NextResponse.json({ error: "Too many requests. Slow down a little." }, { status: 429 });
  }

  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file provided." }, { status: 400 });
    validateUpload({ type: file.type, size: file.size });

    const bgType = (form.get("background") as string) || "transparent";
    const hex = (form.get("hex") as string) || undefined;

    const input = Buffer.from(await file.arrayBuffer());
    const cutout = await getAIProvider().removeBackground(input);
    const output = await flattenOntoBackground(cutout, { type: bgType as any, hex });

    return new NextResponse(output, {
      headers: { "Content-Type": "image/png", "Cache-Control": "no-store" }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Background removal failed." }, { status: 400 });
  }
}
