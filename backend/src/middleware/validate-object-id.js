import mongoose from "mongoose";

function validateObjectId(req, res, next) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({
      success: false,
      error: {
        code: "INVALID_ID",
        message: "The phone id must be a valid MongoDB ObjectId.",
      },
    });
  }

  next();
}

export default validateObjectId;
