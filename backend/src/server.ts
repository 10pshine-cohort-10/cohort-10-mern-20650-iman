import type { Server } from "node:http";
import app from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./logger/index.js";

const server: Server = app.listen(env.port, () => {
  logger.info(
    `🚀 Server started on port ${env.port} in [${env.nodeEnv}] mode. Health check at http://localhost:${env.port}/api/health`,
  );
});

// Process-level uncaught exception handler
process.on("uncaughtException", (err: Error) => {
  logger.fatal({ err }, `Uncaught Exception thrown: ${err.message}. Shutting down...`);
  process.exit(1);
});

// Process-level unhandled promise rejection handler
process.on("unhandledRejection", (reason: unknown) => {
  logger.fatal(
    { reason },
    `Unhandled Promise Rejection: ${reason instanceof Error ? reason.message : String(reason)}. Shutting down...`,
  );
  server.close(() => {
    process.exit(1);
  });
});

// Graceful shutdown on termination signals
const handleGracefulShutdown = (signal: string): void => {
  logger.info(`Received ${signal}. Gracefully closing HTTP server...`);
  server.close(() => {
    logger.info("HTTP server closed. Exiting process.");
    process.exit(0);
  });

  // Force shutdown if connections do not close in time
  setTimeout(() => {
    logger.error("Could not close connections in time, forcefully shutting down");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => handleGracefulShutdown("SIGTERM"));
process.on("SIGINT", () => handleGracefulShutdown("SIGINT"));
