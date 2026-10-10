import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { redisUrl, redisToken } from "../config/env.js";

export const redis = new Redis({ url: redisUrl, token: redisToken });
const limiters = {
  read: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, "1 m"),
    prefix: "phoneshelf:read",
  }),
  write: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "1 m"),
    prefix: "phoneshelf:write",
  }),
  upload: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "1 m"),
    prefix: "phoneshelf:upload",
  }),
  ai: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "1 m"),
    prefix: "phoneshelf:ai",
  }),
};

async function checkRateLimit(type, identifier) {
  const limiter = limiters[type];
  if (!limiter) throw new Error(`Unknown rate limit type: ${type}`);

  try {
    return await limiter.limit(identifier);
  } catch (error) {
    const rateLimitError = new Error("Rate limiting service is unavailable.");
    rateLimitError.code = "RATE_LIMIT_UNAVAILABLE";
    rateLimitError.cause = error;
    throw rateLimitError;
  }
}

export { checkRateLimit };
