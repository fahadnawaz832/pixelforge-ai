import { NextRequest, NextResponse } from "next/server";
import { getAIProvider } from "@/lib/providers/aiProvider";
import { flattenOntoBackground, cropToAspect } from "@/lib/imageProcessing";
import { validateUpload } from "@/lib/fileHandling";
import { checkRateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";

// Two AI calls, both required by the task itself:
//   1) removeBackground  — isolate the subject
//   2) transformToSuit   — the only step that changes pixels beyond a
//                           background swap, so it's the only place an
//                           identity-preserving generative model is used.
// Crop, background color and final format are all local Sharp work and
// never re-trigger either AI call — the client should only re-POST here
// when the source photo or suit color actually changes.
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "local";
  if (!checkRateLimit(`cv-photo:${ip}`)) {
    return NextResponse.json({ error: "Too many requests. Slow down a little." }, { status: 429 });
  }

  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file provided." }, { status: 400 });
    validateUpload({ type: file.type, size: file.size });

    const suitColor = (form.get("suitColor") as string) || "charcoal";
    const bgType = (form.get("background") as string) || "white";
    const hex = (form.get("hex") as string) || undefined;
    const aspect = (form.get("aspect") as string) || "3:4";

    const input = Buffer.from(await file.arrayBuffer());

    const provider = getAIProvider();
    const suited = await provider.transformToSuit(input, suitColor);
    const cutout = await provider.removeBackground(suited);

    let output = await flattenOntoBackground(cutout, { type: bgType as any, hex });

    const [w, h] = aspect.split(":").map(Number);
    if (w && h) output = await cropToAspect(output, w, h);

    return new NextResponse(output, {
      headers: { "Content-Type": "image/png", "Cache-Control": "no-store" }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "CV photo generation failed." }, { status: 400 });
  }
}
