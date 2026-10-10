import phoneService from "../services/phone.service.js";

function notFoundResponse(res) {
  return res.status(404).json({
    success: false,
    error: { code: "PHONE_NOT_FOUND", message: "Phone not found." },
  });
}

async function listPhones(req, res) {
  const result = await phoneService.listPhones(req.query);
  res
    .status(200)
    .json({
      success: true,
      data: result.phones,
      pagination: result.pagination,
    });
}

async function getPhone(req, res) {
  const phone = await phoneService.findPhoneById(req.params.id);
  if (!phone) return notFoundResponse(res);
  res.status(200).json({ success: true, data: phone });
}

async function createPhone(req, res) {
  const phone = await phoneService.createPhone(req.body);
  res.status(201).json({ success: true, data: phone });
}

async function updatePhone(req, res) {
  const phone = await phoneService.updatePhone(req.params.id, req.body);
  if (!phone) return notFoundResponse(res);
  res.status(200).json({ success: true, data: phone });
}

async function deletePhone(req, res) {
  const phone = await phoneService.deletePhone(req.params.id);
  if (!phone) return notFoundResponse(res);
  res.status(200).json({
    success: true,
    data: { message: "Phone deleted successfully." },
  });
}

export { listPhones, getPhone, createPhone, updatePhone, deletePhone };

export default {
  listPhones,
  getPhone,
  createPhone,
  updatePhone,
  deletePhone,
};
