import s3Service from "../services/s3.service.js";

async function createUploadUrl(req, res) {
  const result = await s3Service.createUploadUrl(req.body);
  res.status(201).json({ success: true, data: result });
}

async function createDownloadUrl(req, res) {
  const url = await s3Service.createDownloadUrl(req.query.key);
  res.status(200).json({ success: true, data: { url } });
}

export { createUploadUrl, createDownloadUrl };

export default { createUploadUrl, createDownloadUrl };
