import {
  comparisonCacheTtlSeconds,
  comparisonCacheVersion,
  openRouterModel,
} from "../config/env.js";
import { redis } from "./rate-limit.service.js";

function phoneFingerprint(phone) {
  return `${phone._id.toString()}:${phone.updatedAt?.toISOString() || "unknown"}`;
}

export function createComparisonCacheKey(phoneA, phoneB) {
  const fingerprints = [
    phoneFingerprint(phoneA),
    phoneFingerprint(phoneB),
  ].sort();
  return `phoneshelf:comparison:${comparisonCacheVersion}:${openRouterModel}:${fingerprints.join("|")}`;
}

export async function getCachedComparison(key) {
  try {
    return await redis.get(key);
  } catch (error) {
    console.warn("Comparison cache read failed:", error.message);
    return null;
  }
}

export async function cacheComparison(key, value) {
  try {
    await redis.set(key, value, { ex: comparisonCacheTtlSeconds });
  } catch (error) {
    console.warn("Comparison cache write failed:", error.message);
  }
}
