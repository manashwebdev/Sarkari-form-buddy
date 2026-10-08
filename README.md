# Sarkari Form Buddy

Upload a photo of a government notice or form. Get a simple Hindi explanation with documents, steps, dates and warnings.

## Run
```bash
npm install
cp .env.example .env.local   # add ANTHROPIC_API_KEY and GOOGLE_VISION_API_KEY
npm run dev                  # http://localhost:3000
```
Deploy on Vercel: import the repo and add the same env variables.

## How it works
`photo → resize in browser → POST /api/analyze → Google Vision OCR → Claude → Zod-validated JSON → UI`

## Privacy design
- No database, no disk writes, no request-body logging. Everything lives in memory for one request.
- Responses carry `Cache-Control: no-store`. The browser clears results on "नया कागज़".
- Text is sent to Google Vision and Anthropic for processing; check their data policies.

## Structure
```
src/app/page.tsx            single-screen flow (upload → progress → result)
src/app/api/analyze/route.ts validation, rate limit, OCR, LLM
src/lib/{ocr,llm,schema}.ts  swappable OCR provider, prompt, Zod schema
```

## Not included yet
PDF input, PDF download, redaction/crop tool, language toggle, dark mode, PWA, tests.
The in-memory rate limiter is per-instance; use Upstash/Redis in production.
