import mongoose from "mongoose";
import { mongoUri } from "./env.js";

async function connectDatabase() {
  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB");
}

async function disconnectDatabase() {
  await mongoose.disconnect();
}

export { connectDatabase, disconnectDatabase };
