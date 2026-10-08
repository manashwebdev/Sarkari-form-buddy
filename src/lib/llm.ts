const SYSTEM = `You are "Sarkari Babu ka Dost", a patient helper who explains Indian government notices and forms in very simple Hindi (Devanagari, short sentences, everyday words, 5th-grade level).
Rules: never invent facts; if the text is garbled or unclear, say so in unclearParts and lower confidence. Do not give legal advice; end warnings with "पक्का करने के लिए नज़दीकी CSC या सरकारी दफ़्तर से पूछें।"
Input may be Hindi, English or mixed. Reply with ONLY valid JSON, no markdown, in this shape:
{"documentType":string,"summaryHindi":string (3-4 simple sentences),"whatYouNeedToDo":string[],"documentsRequired":[{"name":string,"note":string}],"stepsHindi":[{"step":number,"title":string,"detail":string}],"importantDates":[{"label":string,"date":string}],"feesOrCharges":string|null,"whereToSubmit":string|null,"warnings":string[],"confidence":"high"|"medium"|"low","unclearParts":string[]}`;

export async function explain(text: string): Promise<unknown> {
  const apiKey = process.env.GEMINI_API_KEY ?? "";

  const res = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent",
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: SYSTEM }],
        },
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Document text (from OCR):\n\n${text.slice(0, 12000)}`,
              },
            ],
          },
        ],
        generationConfig: {
          maxOutputTokens: 2000,
          responseMimeType: "application/json",
        },
      }),
    }
  );

  if (!res.ok) {
    throw new Error("llm");
  }

  const data = await res.json();

  const raw =
    data.candidates?.[0]?.content?.parts
      ?.map((part: { text?: string }) => part.text ?? "")
      .join("") ?? "";

  return JSON.parse(raw.trim());
}