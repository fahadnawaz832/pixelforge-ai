// Minimal in-memory sliding-window rate limiter, keyed by client IP.
// Swap for Redis/Upstash in a multi-instance deployment.
const buckets = new Map<string, number[]>();
const LIMIT = Number(process.env.RATE_LIMIT_PER_MIN ?? 20);
const WINDOW_MS = 60_000;

export function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (hits.length >= LIMIT) {
    buckets.set(key, hits);
    return false;
  }
  hits.push(now);
  buckets.set(key, hits);
  return true;
}
