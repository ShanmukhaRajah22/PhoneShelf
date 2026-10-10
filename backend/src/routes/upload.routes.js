import express from "express";
import uploadController from "../controllers/upload.controller.js";
import asyncHandler from "../middleware/async-handler.js";
import validate from "../middleware/validate.js";
import rateLimit from "../middleware/rate-limit.js";
import {
  uploadRequestSchema,
  imageKeyQuerySchema,
} from "../schemas/upload.schema.js";

const router = express.Router();

router.post(
  "/presign",
  rateLimit("upload"),
  validate(uploadRequestSchema),
  asyncHandler(uploadController.createUploadUrl),
);
router.get(
  "/url",
  rateLimit("read"),
  validate(imageKeyQuerySchema, "query"),
  asyncHandler(uploadController.createDownloadUrl),
);

export default router;
