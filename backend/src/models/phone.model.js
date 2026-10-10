import mongoose from "mongoose";

const specificationsSchema = new mongoose.Schema(
  {
    display: { type: String, required: true, trim: true },
    processor: { type: String, required: true, trim: true },
    RAM: { type: String, required: true, trim: true },
    storage: { type: String, required: true, trim: true },
    battery: { type: String, required: true, trim: true },
    camera: { type: String, required: true, trim: true },
    operatingSystem: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const phoneSchema = new mongoose.Schema(
  {
    brand: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    specifications: { type: specificationsSchema, required: true },
    imageKey: { type: String, trim: true },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

phoneSchema.index({ brand: 1, model: 1 }, { unique: true });

export default mongoose.model("Phone", phoneSchema);
