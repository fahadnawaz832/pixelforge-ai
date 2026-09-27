# PixelForge AI

Premium AI image toolkit: background removal, format conversion, and
professional CV photo generation. Next.js (App Router) + Tailwind + Sharp.

## Cost model (important)

Only **two** AI calls exist in the whole app, both in
`lib/providers/aiProvider.ts`:

- `removeBackground()` — used by the Background Remover and CV Photo Maker
- `transformToSuit()` — used only by the CV Photo Maker's clothing swap

Everything else — format conversion, resize, crop, compression, and
recoloring the background after removal — runs locally through
`lib/imageProcessing.ts` (Sharp). Changing crop, format, quality or
background color never re-triggers an AI call.

## Setup

```bash
npm install
cp .env.example .env
# fill in AI_PROVIDER_BASE_URL and AI_PROVIDER_API_KEY
npm run dev
```

`lib/providers/aiProvider.ts` ships a generic HTTP adapter — point it at
whichever vendor you choose (remove.bg, Replicate, Stability, OpenAI
images, or a self-hosted model) by editing the two request bodies to
match that vendor's actual API. No other file needs to change.

## Structure

```
app/
  page.tsx                 landing + tool selection + workflow
  api/convert/route.ts     Sharp-only: format/resize/quality
  api/remove-bg/route.ts   1 AI call + local background compositing
  api/cv-photo/route.ts    2 AI calls + local crop/compositing
components/                Uploader, ToolSelector, ImageEditor, etc.
lib/
  imageProcessing.ts       all Sharp logic
  providers/aiProvider.ts  swappable AI vendor adapter
  fileHandling.ts          upload validation, temp files, cleanup
  rateLimit.ts             in-memory rate limiter (swap for Redis in prod)
middleware.ts              security headers on API routes
```

## Security

- MIME + size validation on every upload (`lib/fileHandling.ts`)
- Per-IP rate limiting on every API route
- Uploads only ever touch OS temp dirs, auto-deleted after each request
- No arbitrary file execution; Sharp reads/writes buffers only

## Production notes

- Swap the in-memory rate limiter for Redis/Upstash behind a load balancer.
- Set `MAX_UPLOAD_MB` and `RATE_LIMIT_PER_MIN` in `.env` for your traffic.
- The AI provider adapter is intentionally thin — plug in your vendor and
  keep an eye on their per-image cost, since those two calls are the only
  metered operations in the app.
