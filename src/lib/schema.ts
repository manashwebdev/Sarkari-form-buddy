import { z } from "zod";

export const Explained = z.object({
  documentType: z.string(),
  summaryHindi: z.string(),
  whatYouNeedToDo: z.array(z.string()),
  documentsRequired: z.array(z.object({ name: z.string(), note: z.string() })),
  stepsHindi: z.array(z.object({ step: z.number(), title: z.string(), detail: z.string() })),
  importantDates: z.array(z.object({ label: z.string(), date: z.string() })),
  feesOrCharges: z.string().nullable(),
  whereToSubmit: z.string().nullable(),
  warnings: z.array(z.string()),
  confidence: z.enum(["high", "medium", "low"]),
  unclearParts: z.array(z.string()),
});
export type Explained = z.infer<typeof Explained>;
