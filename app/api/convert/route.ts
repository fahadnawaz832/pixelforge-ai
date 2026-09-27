import { NextRequest, NextResponse } from "next/server";
import { convertImage, cropToAspect, type OutputFormat } from "@/lib/imageProcessing";
import { validateUpload } from "@/lib/fileHandling";
import { checkRateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";

// Pure Sharp pipeline: format conversion, resize, quality/compression, crop.
// No AI calls happen on this route, ever.
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "local";
  if (!checkRateLimit(`convert:${ip}`)) {
    return NextResponse.json({ error: "Too many requests. Slow down a little." }, { status: 429 });
  }

  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file provided." }, { status: 400 });

    validateUpload({ type: file.type, size: file.size });

    const format = (form.get("format") as OutputFormat) || "png";
    const quality = form.get("quality") ? Number(form.get("quality")) : undefined;
    const width = form.get("width") ? Number(form.get("width")) : undefined;
    const height = form.get("height") ? Number(form.get("height")) : undefined;
    const aspect = form.get("aspect") as string | null; // e.g. "3:4"

    let buffer = Buffer.from(await file.arrayBuffer());

    if (aspect) {
      const [w, h] = aspect.split(":").map(Number);
      if (w && h) buffer = await cropToAspect(buffer, w, h);
    }

    const output = await convertImage(buffer, { format, quality, width, height });

    return new NextResponse(output, {
      headers: {
        "Content-Type": `image/${format === "jpg" ? "jpeg" : format}`,
        "Cache-Control": "no-store"
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Conversion failed." }, { status: 400 });
  }
}
