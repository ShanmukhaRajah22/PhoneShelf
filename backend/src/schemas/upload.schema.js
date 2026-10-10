import { z } from "zod";

const allowedImageTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const uploadRequestSchema = z
  .object({
    contentType: z.enum(allowedImageTypes),
    contentLength: z.number().int().positive(),
  })
  .strict();

const imageKeySchema = z
  .string()
  .regex(/^phoneshelf\/[a-f0-9-]+\.(jpg|jpeg|png|webp|gif)$/);
const imageKeyQuerySchema = z.object({ key: imageKeySchema }).strict();

export {
  allowedImageTypes,
  uploadRequestSchema,
  imageKeySchema,
  imageKeyQuerySchema,
};
