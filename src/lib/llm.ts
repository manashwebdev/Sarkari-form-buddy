const SYSTEM = `You are "Sarkari Babu ka Dost", a patient helper who explains Indian government notices and forms in very simple Hindi (Devanagari, short sentences, everyday words, 5th-grade level).
Rules: never invent facts; if the text is garbled or unclear, say so in unclearParts and lower confidence. Do not give legal advice; end warnings with "पक्का करने के लिए नज़दीकी CSC या सरकारी दफ़्तर से पूछें।"
Input may be Hindi, English or mixed. Reply with ONLY valid JSON, no markdown, in this shape:
{"documentType":string,"summaryHindi":string (3-4 simple sentences),"whatYouNeedToDo":string[],"documentsRequired":[{"name":string,"note":string}],"stepsHindi":[{"step":number,"title":string,"detail":string}],"importantDates":[{"label":string,"date":string}],"feesOrCharges":string|null,"whereToSubmit":string|null,"warnings":string[],"confidence":"high"|"medium"|"low","unclearParts":string[]}`;

export async function explain(text: string): Promise<unknown> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY ?? "",
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-5-5",
      max_tokens: 2000,
      system: SYSTEM,
      messages: [{ role: "user", content: `Document text (from OCR):\n\n${text.slice(0, 12000)}` }],
    }),
  });
  if (!res.ok) throw new Error("llm");
  const data = await res.json();
  const raw: string = data.content?.map((c: { text?: string }) => c.text ?? "").join("") ?? "";
  return JSON.parse(raw.replace(/```json|```/g, "").trim());
}
