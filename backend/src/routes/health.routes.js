import express from "express";
import mongoose from "mongoose";

const router = express.Router();

router.get("/", (req, res) => {
  const databaseHealthy = mongoose.connection.readyState === 1;
  res.status(databaseHealthy ? 200 : 503).json({
    success: databaseHealthy,
    data: {
      status: databaseHealthy ? "ok" : "unavailable",
      database: databaseHealthy ? "connected" : "disconnected",
    },
  });
});

export default router;
