import sharp from "sharp";

export type OutputFormat = "png" | "jpg" | "jpeg" | "webp";

export interface ConvertOptions {
  format: OutputFormat;
  quality?: number;
  width?: number;
  height?: number;
  fit?: keyof sharp.FitEnum;
}

/**
 * Local, non-AI conversion pipeline: format change, resize and
 * quality/compression, all via Sharp. This is the ONLY path used for
 * ordinary conversion/resize/crop/compress requests.
 */
export async function convertImage(input: Buffer, opts: ConvertOptions): Promise<Buffer> {
  let pipeline = sharp(input).rotate();

  if (opts.width || opts.height) {
    pipeline = pipeline.resize({
      width: opts.width,
      height: opts.height,
      fit: opts.fit ?? "cover",
      withoutEnlargement: true
    });
  }

  const quality = Math.min(100, Math.max(1, opts.quality ?? 85));

  switch (opts.format) {
    case "png":
      return pipeline.png({ quality, compressionLevel: 9 }).toBuffer();
    case "jpg":
    case "jpeg":
      return pipeline.jpeg({ quality, mozjpeg: true }).toBuffer();
    case "webp":
      return pipeline.webp({ quality }).toBuffer();
    default:
      throw new Error("Unsupported output format");
  }
}

/** Crop to a fixed aspect ratio (e.g. CV portrait 3:4) without any AI call. */
export async function cropToAspect(input: Buffer, ratioW: number, ratioH: number): Promise<Buffer> {
  const img = sharp(input).rotate();
  const meta = await img.metadata();
  const w = meta.width ?? 0;
  const h = meta.height ?? 0;
  if (!w || !h) return img.toBuffer();

  const targetRatio = ratioW / ratioH;
  const currentRatio = w / h;

  let cropW = w;
  let cropH = h;
  if (currentRatio > targetRatio) {
    cropW = Math.round(h * targetRatio);
  } else {
    cropH = Math.round(w / targetRatio);
  }
  const left = Math.round((w - cropW) / 2);
  const top = Math.round((h - cropH) / 3);

  return img.extract({ left, top: Math.max(0, top), width: cropW, height: cropH }).toBuffer();
}

/** Composite a (already background-removed, RGBA) subject onto a flat/custom background. */
export async function flattenOntoBackground(
  subjectRgba: Buffer,
  background: { type: "white" | "blue" | "transparent" | "custom"; hex?: string }
): Promise<Buffer> {
  if (background.type === "transparent") return sharp(subjectRgba).png().toBuffer();

  const color =
    background.type === "white" ? "#ffffff" : background.type === "blue" ? "#1e3a8a" : background.hex ?? "#ffffff";

  const meta = await sharp(subjectRgba).metadata();
  const base = sharp({
    create: { width: meta.width ?? 800, height: meta.height ?? 800, channels: 4, background: color }
  });

  return base.composite([{ input: subjectRgba }]).png().toBuffer();
}
