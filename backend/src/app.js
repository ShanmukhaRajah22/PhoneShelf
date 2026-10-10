import express from "express";
import cors from "cors";
import helmet from "helmet";
import { clientOrigin, trustProxy } from "./config/env.js";
import phoneRoutes from "./routes/phone.routes.js";
import healthRoutes from "./routes/health.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import comparisonRoutes from "./routes/comparison.routes.js";
import errorHandler from "./middleware/error-handler.js";

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", trustProxy);
app.use(helmet());
app.use(
  cors({
    origin: clientOrigin,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  }),
);
app.use(express.json({ limit: "100kb" }));

app.use("/api/health", healthRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/phones/compare", comparisonRoutes);
app.use("/api/phones", phoneRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: { code: "ROUTE_NOT_FOUND", message: "Route not found." },
  });
});

app.use(errorHandler);

export default app;
