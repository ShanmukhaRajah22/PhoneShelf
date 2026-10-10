import express from "express";
import asyncHandler from "../middleware/async-handler.js";
import rateLimit from "../middleware/rate-limit.js";
import validate from "../middleware/validate.js";
import { comparisonRequestSchema } from "../schemas/comparison.schema.js";
import { compare } from "../controllers/comparison.controller.js";

const router = express.Router();

router.post(
  "/",
  rateLimit("ai"),
  validate(comparisonRequestSchema),
  asyncHandler(compare),
);

export default router;
