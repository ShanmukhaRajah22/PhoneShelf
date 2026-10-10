import express from "express";
import phoneController from "../controllers/phone.controller.js";
import asyncHandler from "../middleware/async-handler.js";
import validate from "../middleware/validate.js";
import validateObjectId from "../middleware/validate-object-id.js";
import rateLimit from "../middleware/rate-limit.js";
import {
  createPhoneSchema,
  updatePhoneSchema,
  paginationSchema,
} from "../schemas/phone.schema.js";

const router = express.Router();

router.get(
  "/",
  rateLimit("read"),
  validate(paginationSchema, "query"),
  asyncHandler(phoneController.listPhones),
);
router.get(
  "/:id",
  rateLimit("read"),
  validateObjectId,
  asyncHandler(phoneController.getPhone),
);
router.post(
  "/",
  rateLimit("write"),
  validate(createPhoneSchema),
  asyncHandler(phoneController.createPhone),
);
router.patch(
  "/:id",
  rateLimit("write"),
  validateObjectId,
  validate(updatePhoneSchema),
  asyncHandler(phoneController.updatePhone),
);
router.delete(
  "/:id",
  rateLimit("write"),
  validateObjectId,
  asyncHandler(phoneController.deletePhone),
);

export default router;
