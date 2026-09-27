/**
 * Pluggable AI provider interface. Swap the implementation below for
 * whichever vendor you choose (remove.bg, Replicate, Stability, OpenAI
 * images, a self-hosted model, etc.) without touching any route or UI
 * code. Only two AI calls exist in this whole app: removeBackground()
 * and transformToSuit() — everything else (convert/resize/crop/quality)
 * stays on Sharp.
 */

export interface AIProvider {
  /** Returns an RGBA PNG buffer with the background removed. */
  removeBackground(input: Buffer): Promise<Buffer>;
  /** Returns the subject re-rendered in a professional suit, identity preserved. */
  transformToSuit(input: Buffer, suitColor: string): Promise<Buffer>;
}

const CV_SUIT_PROMPT =
  "Transform the subject into a professional CV portrait wearing a realistic dark 3-piece suit " +
  "with dress shirt and tie. Preserve the person's identity, facial structure, face, skin texture, " +
  "hairstyle, eyes, expression and proportions exactly. Do not reshape or beautify the face. Use " +
  "realistic professional studio photography, natural lighting, sharp details, clean neutral " +
  "background and authentic appearance.";

/**
 * Example HTTP-based provider. Fill in AI_PROVIDER_BASE_URL / API key in
 * .env and adjust the two request bodies below to match your chosen
 * vendor's actual API — this is a thin, swappable adapter, not a working
 * integration out of the box.
 */
class HttpAIProvider implements AIProvider {
  private baseUrl = process.env.AI_PROVIDER_BASE_URL ?? "";
  private apiKey = process.env.AI_PROVIDER_API_KEY ?? "";

  private assertConfigured() {
    if (!this.baseUrl || !this.apiKey) {
      throw new Error(
        "AI provider not configured. Set AI_PROVIDER_BASE_URL and AI_PROVIDER_API_KEY in your environment."
      );
    }
  }

  async removeBackground(input: Buffer): Promise<Buffer> {
    this.assertConfigured();
    const res = await fetch(`${this.baseUrl}/remove-background`, {
      method: "POST",
      headers: { Authorization: `Bearer ${this.apiKey}`, "Content-Type": "application/octet-stream" },
      body: input
    });
    if (!res.ok) throw new Error(`Background removal failed (${res.status})`);
    return Buffer.from(await res.arrayBuffer());
  }

  async transformToSuit(input: Buffer, suitColor: string): Promise<Buffer> {
    this.assertConfigured();
    const prompt = `${CV_SUIT_PROMPT} Suit color: ${suitColor}.`;
    const res = await fetch(`${this.baseUrl}/image-transform`, {
      method: "POST",
      headers: { Authorization: `Bearer ${this.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ image: input.toString("base64"), prompt })
    });
    if (!res.ok) throw new Error(`Suit transformation failed (${res.status})`);
    const json = await res.json();
    return Buffer.from(json.image, "base64");
  }
}

let cached: AIProvider | null = null;

/** Returns the singleton AI provider. Swap HttpAIProvider for your own class here. */
export function getAIProvider(): AIProvider {
  if (!cached) cached = new HttpAIProvider();
  return cached;
}
