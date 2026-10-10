import { comparePhones } from "../services/comparison.service.js";

export async function compare(req, res) {
  const result = await comparePhones(req.body);
  res.status(200).json({
    success: true,
    data: result.comparison,
    meta: { cached: result.cached },
  });
}
