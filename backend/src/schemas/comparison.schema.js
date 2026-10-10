import { z } from "zod";

const winnerSchema = z.enum(["phoneA", "phoneB", "tie"]);

const categorySchema = z.object({
  analysis: z.string().min(1),
  winner: winnerSchema,
});

export const comparisonRequestSchema = z
  .object({
    phoneAId: z.string().min(1),
    phoneBId: z.string().min(1),
  })
  .strict();

export const comparisonOutputSchema = z
  .object({
    summary: z.string().min(1),
    performance: categorySchema,
    display: categorySchema,
    battery: categorySchema,
    camera: categorySchema,
    software: categorySchema,
    value: categorySchema,
    recommendations: z
      .object({
        gaming: z.string().min(1),
        photography: z.string().min(1),
        everydayUse: z.string().min(1),
      })
      .strict(),
    finalRecommendation: z.string().min(1),
    missingDataNotes: z.array(z.string()),
  })
  .strict();
