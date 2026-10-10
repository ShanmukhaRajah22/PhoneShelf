import { z } from "zod";

const specificationsSchema = z
  .object({
    display: z.string().trim().min(1),
    processor: z.string().trim().min(1),
    RAM: z.string().trim().min(1),
    storage: z.string().trim().min(1),
    battery: z.string().trim().min(1),
    camera: z.string().trim().min(1),
    operatingSystem: z.string().trim().min(1),
  })
  .strict();

const phoneBodySchema = z
  .object({
    brand: z.string().trim().min(1),
    model: z.string().trim().min(1),
    price: z.number().finite().nonnegative(),
    specifications: specificationsSchema,
    imageKey: z.string().trim().min(1).nullable().optional(),
  })
  .strict();

const createPhoneSchema = phoneBodySchema;
const updatePhoneSchema = phoneBodySchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required for an update.",
  });

const paginationSchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
  })
  .strict();

export { createPhoneSchema, updatePhoneSchema, paginationSchema };
