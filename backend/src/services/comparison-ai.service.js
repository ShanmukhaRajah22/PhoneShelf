import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText, Output } from "ai";
import {
  aiTimeoutMs,
  openRouterApiKey,
  openRouterModel,
} from "../config/env.js";
import { comparisonOutputSchema } from "../schemas/comparison.schema.js";

const openrouter = createOpenRouter({
  apiKey: openRouterApiKey,
  headers: {
    "HTTP-Referer": process.env.APP_URL || "http://localhost:3000",
    "X-Title": "PhoneShelf",
  },
});

function phoneForPrompt(phone) {
  return {
    id: phone._id.toString(),
    brand: phone.brand,
    model: phone.model,
    price: phone.price,
    specifications: phone.specifications,
  };
}

function createComparisonPrompt(phoneA, phoneB) {
  return `Compare these two phone records using only the supplied data.

Rules:
- Do not invent specifications, measurements, benchmarks, or camera quality.
- Mark uncertainty in missingDataNotes.
- Battery capacity alone does not establish battery life.
- Megapixel count alone does not establish camera quality.
- Winners must be phoneA, phoneB, or tie. Use tie when evidence is insufficient.
- Keep each analysis concise and distinguish facts from reasonable inferences.

phoneA:
${JSON.stringify(phoneForPrompt(phoneA))}

phoneB:
${JSON.stringify(phoneForPrompt(phoneB))}`;
}

export async function generateComparison(phoneA, phoneB) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), aiTimeoutMs);

  try {
    const result = await generateText({
      model: openrouter(openRouterModel),
      output: Output.object({ schema: comparisonOutputSchema }),
      prompt: createComparisonPrompt(phoneA, phoneB),
      maxOutputTokens: 1200,
      abortSignal: controller.signal,
    });

    if (!result.output) {
      const error = new Error(
        "The model did not return structured comparison output.",
      );
      error.code = "INVALID_AI_OUTPUT";
      throw error;
    }

    try {
      return comparisonOutputSchema.parse(result.output);
    } catch (error) {
      const outputError = new Error(
        "The comparison provider returned invalid structured output.",
      );
      outputError.code = "INVALID_AI_OUTPUT";
      outputError.cause = error;
      throw outputError;
    }
  } catch (error) {
    if (error.name === "AbortError") {
      const timeoutError = new Error("The comparison model timed out.");
      timeoutError.code = "AI_TIMEOUT";
      throw timeoutError;
    }
    if (error.name === "NoOutputGeneratedError") {
      const outputError = new Error(
        "The comparison provider returned no structured output.",
      );
      outputError.code = "INVALID_AI_OUTPUT";
      throw outputError;
    }
    if (error.code === "AI_APICallError" || error.statusCode >= 400) {
      const providerError = new Error(
        "The comparison provider could not complete the request.",
      );
      providerError.code = "AI_PROVIDER_FAILURE";
      throw providerError;
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
