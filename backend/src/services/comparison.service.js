import mongoose from "mongoose";
import Phone from "../models/phone.model.js";
import {
  comparisonOutputSchema,
  comparisonRequestSchema,
} from "../schemas/comparison.schema.js";
import {
  cacheComparison,
  createComparisonCacheKey,
  getCachedComparison,
} from "./comparison-cache.service.js";
import { generateComparison } from "./comparison-ai.service.js";

function requestError(message, code = "INVALID_COMPARISON_REQUEST") {
  const error = new Error(message);
  error.statusCode = 400;
  error.code = code;
  return error;
}

function swapWinner(winner) {
  if (winner === "phoneA") return "phoneB";
  if (winner === "phoneB") return "phoneA";
  return winner;
}

function orientComparison(comparison, isReversed) {
  if (!isReversed) return comparison;

  const oriented = structuredClone(comparison);
  for (const key of [
    "performance",
    "display",
    "battery",
    "camera",
    "software",
    "value",
  ]) {
    oriented[key].winner = swapWinner(oriented[key].winner);
  }
  return oriented;
}

export async function comparePhones(input) {
  const { phoneAId, phoneBId } = comparisonRequestSchema.parse(input);

  if (
    !mongoose.isValidObjectId(phoneAId) ||
    !mongoose.isValidObjectId(phoneBId)
  ) {
    throw requestError(
      "Both phone IDs must be valid MongoDB ObjectIds.",
      "INVALID_ID",
    );
  }
  if (phoneAId === phoneBId) {
    throw requestError("Choose two different phones.", "IDENTICAL_PHONE_IDS");
  }

  const [phoneA, phoneB] = await Promise.all([
    Phone.findById(phoneAId).lean(),
    Phone.findById(phoneBId).lean(),
  ]);

  if (!phoneA || !phoneB) {
    const error = new Error("One or both phones were not found.");
    error.statusCode = 404;
    error.code = "PHONE_NOT_FOUND";
    throw error;
  }

  const canonicalPhones = [phoneA, phoneB].sort((left, right) =>
    left._id.toString().localeCompare(right._id.toString()),
  );
  const isReversed =
    canonicalPhones[0]._id.toString() !== phoneA._id.toString();
  const cacheKey = createComparisonCacheKey(
    canonicalPhones[0],
    canonicalPhones[1],
  );
  const cached = await getCachedComparison(cacheKey);
  if (cached) {
    const cachedResult = comparisonOutputSchema.safeParse(cached);
    if (cachedResult.success) {
      return {
        comparison: orientComparison(cachedResult.data, isReversed),
        cached: true,
      };
    }
  }

  const comparison = await generateComparison(
    canonicalPhones[0],
    canonicalPhones[1],
  );
  await cacheComparison(cacheKey, comparison);
  return {
    comparison: orientComparison(comparison, isReversed),
    cached: false,
  };
}
