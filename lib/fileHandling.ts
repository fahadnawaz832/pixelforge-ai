import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import os from "os";
import path from "path";

export const ALLOWED_MIME = ["image/png", "image/jpeg", "image/webp"];
export const MAX_UPLOAD_BYTES = Number(process.env.MAX_UPLOAD_MB ?? 10) * 1024 * 1024;

/** Validates an incoming upload's type/size. Throws on failure. */
export function validateUpload(file: { type: string; size: number }) {
  if (!ALLOWED_MIME.includes(file.type)) {
    throw new Error("Unsupported file type. Use PNG, JPG or WebP.");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(`File too large. Max ${MAX_UPLOAD_BYTES / 1024 / 1024}MB.`);
  }
}

/** Writes a buffer to a fresh temp file and returns its path + a cleanup fn. */
export async function withTempFile<T>(
  buffer: Buffer,
  ext: string,
  fn: (filePath: string) => Promise<T>
): Promise<T> {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "pixelforge-"));
  const filePath = path.join(dir, `${randomUUID()}.${ext}`);
  await fs.writeFile(filePath, buffer);
  try {
    return await fn(filePath);
  } finally {
    await fs.rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}

/** Strips any path/extension trickery from a client-supplied filename. */
export function sanitizeFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
}
