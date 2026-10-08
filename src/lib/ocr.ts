/** Swap this provider (e.g. Tesseract) without touching the API route. */
export interface OcrProvider { read(image: Buffer): Promise<string>; }

export const ocr: OcrProvider = {
  async read(image) {
    const res = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_VISION_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requests: [{
          image: { content: image.toString("base64") },
          features: [{ type: "DOCUMENT_TEXT_DETECTION" }],
          imageContext: { languageHints: ["hi", "en"] },
        }] }),
      },
    );
    if (!res.ok) throw new Error("ocr");
    const json = await res.json();
    return json.responses?.[0]?.fullTextAnnotation?.text ?? "";
  },
};
