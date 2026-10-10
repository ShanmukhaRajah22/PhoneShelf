import app from "./app.js";
import { port } from "./config/env.js";
import { connectDatabase, disconnectDatabase } from "./config/database.js";

async function startServer() {
  await connectDatabase();
  const server = app.listen(port, () => {
    console.log(`PhoneShelf API listening on port ${port}`);
  });

  const shutdown = async (signal) => {
    console.log(`${signal} received. Shutting down gracefully.`);
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

startServer().catch((error) => {
  console.error("Unable to start PhoneShelf API:", error.message);
  process.exit(1);
});
