import dotenv from "dotenv";

dotenv.config();

const requiredEnvironmentVariables = [
  "MONGODB_URI",
  "AWS_REGION",
  "AWS_S3_BUCKET",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
  "OPENROUTER_API_KEY",
];

const missingVariables = requiredEnvironmentVariables.filter(
  (name) => !process.env[name] || process.env[name].trim() === "",
);

if (missingVariables.length > 0) {
  throw new Error(
    `Missing required environment variable(s): ${missingVariables.join(", ")}. Copy .env.example and configure it.`,
  );
}

const port = Number(process.env.PORT || 5000);
const maxUploadBytes = Number(process.env.MAX_UPLOAD_BYTES || 5 * 1024 * 1024);
const presignedUrlTtlSeconds = Number(
  process.env.PRESIGNED_URL_TTL_SECONDS || 900,
);
const comparisonCacheTtlSeconds = Number(
  process.env.COMPARISON_CACHE_TTL_SECONDS || 86400,
);
const aiTimeoutMs = Number(process.env.AI_TIMEOUT_MS || 30000);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT must be an integer between 1 and 65535.");
}
if (!Number.isInteger(maxUploadBytes) || maxUploadBytes < 1) {
  throw new Error("MAX_UPLOAD_BYTES must be a positive integer.");
}
if (
  !Number.isInteger(presignedUrlTtlSeconds) ||
  presignedUrlTtlSeconds < 60 ||
  presignedUrlTtlSeconds > 3600
) {
  throw new Error(
    "PRESIGNED_URL_TTL_SECONDS must be an integer between 60 and 3600.",
  );
}
if (
  !Number.isInteger(comparisonCacheTtlSeconds) ||
  comparisonCacheTtlSeconds < 60
) {
  throw new Error(
    "COMPARISON_CACHE_TTL_SECONDS must be an integer of at least 60.",
  );
}
if (
  !Number.isInteger(aiTimeoutMs) ||
  aiTimeoutMs < 1000 ||
  aiTimeoutMs > 120000
) {
  throw new Error("AI_TIMEOUT_MS must be an integer between 1000 and 120000.");
}

const trustProxyValue = process.env.TRUST_PROXY || "false";
const trustProxy =
  trustProxyValue === "true"
    ? true
    : trustProxyValue === "false"
      ? false
      : Number.isInteger(Number(trustProxyValue))
        ? Number(trustProxyValue)
        : trustProxyValue;

export const nodeEnv = process.env.NODE_ENV || "development";
export const mongoUri = process.env.MONGODB_URI;
export const clientOrigin =
  process.env.CLIENT_ORIGIN || "http://localhost:3000";
export const awsRegion = process.env.AWS_REGION;
export const s3Bucket = process.env.AWS_S3_BUCKET;
export const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
export const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
export const openRouterApiKey = process.env.OPENROUTER_API_KEY;
export const openRouterModel =
  process.env.OPENROUTER_MODEL || "openrouter/free";
export const comparisonCacheVersion =
  process.env.COMPARISON_CACHE_VERSION || "v1";
export {
  port,
  maxUploadBytes,
  presignedUrlTtlSeconds,
  comparisonCacheTtlSeconds,
  aiTimeoutMs,
  trustProxy,
};
