import crypto from "node:crypto";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  awsRegion,
  s3Bucket,
  maxUploadBytes,
  presignedUrlTtlSeconds,
} from "../config/env.js";
import { allowedImageTypes, imageKeySchema } from "../schemas/upload.schema.js";

const s3Client = new S3Client({ region: awsRegion });
const namespace = "phoneshelf/";
const extensionByContentType = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

function assertValidImageKey(imageKey) {
  if (!imageKeySchema.safeParse(imageKey).success) {
    const error = new Error(
      "The image key is not a valid PhoneShelf upload key.",
    );
    error.statusCode = 400;
    error.code = "INVALID_IMAGE_KEY";
    throw error;
  }
}

function createImageKey(contentType) {
  if (!allowedImageTypes.includes(contentType)) {
    const error = new Error(
      "Unsupported image type. Use JPEG, PNG, WebP, or GIF.",
    );
    error.statusCode = 400;
    error.code = "INVALID_IMAGE_TYPE";
    throw error;
  }

  return `${namespace}${crypto.randomUUID()}.${extensionByContentType[contentType]}`;
}

async function createUploadUrl({ contentType, contentLength }) {
  if (contentLength > maxUploadBytes) {
    const error = new Error(
      `Image must be ${Math.floor(maxUploadBytes / 1024 / 1024)} MB or smaller.`,
    );
    error.statusCode = 413;
    error.code = "IMAGE_TOO_LARGE";
    throw error;
  }

  const key = createImageKey(contentType);
  const command = new PutObjectCommand({
    Bucket: s3Bucket,
    Key: key,
    ContentType: contentType,
    ContentLength: contentLength,
  });
  const uploadUrl = await getSignedUrl(s3Client, command, {
    expiresIn: presignedUrlTtlSeconds,
  });
  return { key, uploadUrl, expiresIn: presignedUrlTtlSeconds };
}

async function createDownloadUrl(imageKey) {
  assertValidImageKey(imageKey);
  const command = new GetObjectCommand({ Bucket: s3Bucket, Key: imageKey });
  return getSignedUrl(s3Client, command, { expiresIn: presignedUrlTtlSeconds });
}

async function deleteImage(imageKey) {
  if (!imageKey) return;
  assertValidImageKey(imageKey);
  await s3Client.send(
    new DeleteObjectCommand({ Bucket: s3Bucket, Key: imageKey }),
  );
}

function isManagedImageKey(imageKey) {
  return typeof imageKey === "string" && imageKey.startsWith(namespace);
}

export {
  assertValidImageKey,
  createUploadUrl,
  createDownloadUrl,
  deleteImage,
  isManagedImageKey,
};

export default {
  assertValidImageKey,
  createUploadUrl,
  createDownloadUrl,
  deleteImage,
  isManagedImageKey,
};
