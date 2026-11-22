import type { Server } from "node:http";
import app from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./logger/index.js";

const server: Server = app.listen(env.port, () => {
  logger.info(
    `🚀 Server started on port ${env.port} in [${env.nodeEnv}] mode. Health check at http://localhost:${env.port}/api/health`,
  );
});

let isShuttingDown = false;

// Unified, idempotent graceful shutdown with forced timeout deadline
const shutdown = (trigger: string, exitCode: number): void => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  logger.info(`Shutting down initiated by ${trigger} (exit code ${exitCode}). Closing HTTP server...`);

  // Enforce 10-second deadline for in-flight requests
  const forceExitTimer = setTimeout(() => {
    logger.error("Could not close connections in time, forcefully shutting down");
    process.exit(exitCode !== 0 ? exitCode : 1);
  }, 10000);
  forceExitTimer.unref();

  server.close((err?: Error) => {
    if (err) {
      logger.error({ err }, "Error occurred while closing HTTP server");
      process.exit(1);
    }
    logger.info("HTTP server closed. Exiting process.");
    process.exit(exitCode);
  });
};

// Process-level uncaught exception handler
process.on("uncaughtException", (err: Error) => {
  logger.fatal({ err }, `Uncaught Exception thrown: ${err.message}. Shutting down...`);
  shutdown("uncaughtException", 1);
});

// Process-level unhandled promise rejection handler
process.on("unhandledRejection", (reason: unknown) => {
  logger.fatal(
    { reason },
    `Unhandled Promise Rejection: ${reason instanceof Error ? reason.message : String(reason)}. Shutting down...`,
  );
  shutdown("unhandledRejection", 1);
});

// Graceful shutdown on termination signals
process.on("SIGTERM", () => shutdown("SIGTERM", 0));
process.on("SIGINT", () => shutdown("SIGINT", 0));
