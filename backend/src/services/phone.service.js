import Phone from "../models/phone.model.js";
import s3Service from "./s3.service.js";

async function listPhones({ page, limit }) {
  const skip = (page - 1) * limit;
  const [phones, total] = await Promise.all([
    Phone.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Phone.countDocuments(),
  ]);

  return {
    phones,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

async function findPhoneById(id) {
  return Phone.findById(id).lean();
}

async function createPhone(data) {
  if (data.imageKey) s3Service.assertValidImageKey(data.imageKey);
  try {
    return await Phone.create(data);
  } catch (error) {
    if (data.imageKey && s3Service.isManagedImageKey(data.imageKey)) {
      await deleteImageAfterMutationFailure(data.imageKey);
    }
    throw error;
  }
}

async function updatePhone(id, data) {
  if (data.imageKey) s3Service.assertValidImageKey(data.imageKey);
  const existingPhone = await Phone.findById(id).lean();
  if (!existingPhone) return null;

  const updatedPhone = await Phone.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).lean();
  if (
    updatedPhone &&
    existingPhone.imageKey &&
    existingPhone.imageKey !== updatedPhone.imageKey
  ) {
    await deleteImageAfterMutationFailure(existingPhone.imageKey);
  }
  return updatedPhone;
}

async function deletePhone(id) {
  const phone = await Phone.findByIdAndDelete(id).lean();
  if (phone?.imageKey) {
    await deleteImageAfterMutationFailure(phone.imageKey);
  }
  return phone;
}

async function deleteImageAfterMutationFailure(imageKey) {
  try {
    await s3Service.deleteImage(imageKey);
  } catch (error) {
    console.error("Unable to clean up S3 object:", {
      key: imageKey,
      message: error.message,
    });
  }
}

export { listPhones, findPhoneById, createPhone, updatePhone, deletePhone };

export default {
  listPhones,
  findPhoneById,
  createPhone,
  updatePhone,
  deletePhone,
};
